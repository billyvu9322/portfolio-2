import { getRelevantContext, type Profile } from "./context";
import { checkInputGuardrail, checkOutputGuardrail, isUnsafeOutput, refusal } from "./guardrails";
import { ContactValidationError, parseContactRequest, type ContactRequest } from "./contact-validation";
import { EmailDeliveryError, sendContactEmail } from "./email";

type RateLimiter = {
  limit(options: { key: string }): Promise<{ success: boolean }>;
};

type Env = {
  LLM_API_KEY?: string;
  LLM_BASE_URL?: string;
  LLM_MODEL?: string;
  ALLOWED_ORIGIN?: string;
  PROFILE_URL?: string;
  RESEND_API_KEY?: string;
  EMAIL_FROM?: string;
  OWNER_EMAIL?: string;
  TURNSTILE_SECRET_KEY?: string;
  TURNSTILE_SITE_KEY?: string;
  RATE_LIMITER?: RateLimiter;
};

type ContactTurnstileResponse = {
  success?: unknown;
};

type ContactBody = ContactRequest;

type ChatRequest = {
  message?: unknown;
};

type ProviderStreamChunk = {
  choices?: Array<{
    delta?: {
      content?: unknown;
    };
  }>;
};

type ProviderCompletion = {
  choices?: Array<{
    message?: {
      content?: unknown;
    };
  }>;
};

function providerText(completion: ProviderCompletion) {
  const content = completion.choices?.[0]?.message?.content;
  return typeof content === "string" ? content.trim() : "";
}

const MAX_MESSAGE_LENGTH = 1200;
const MAX_PROFILE_SIZE = 256_000;
const MAX_PROVIDER_ERROR_SIZE = 32_000;
const PROFILE_CACHE_TTL_SECONDS = 300;
const DEFAULT_BASE_URL = "https://9router.nimo.io.vn/v1";
const DEFAULT_MODEL = "cx/gpt-5.5";
const encoder = new TextEncoder();
const decoder = new TextDecoder();

type CacheStorageWithDefault = CacheStorage & { default: Cache };

function json(data: Record<string, unknown>, status: number, headers: HeadersInit = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...headers,
    },
  });
}

function streamEvent(data: Record<string, unknown> | "[DONE]") {
  return encoder.encode(`data: ${typeof data === "string" ? data : JSON.stringify(data)}\n\n`);
}

function getCorsHeaders(request: Request, env: Env) {
  const requestOrigin = request.headers.get("Origin");
  const allowedOrigin = env.ALLOWED_ORIGIN?.trim();
  const origin = allowedOrigin === "*" ? "*" : requestOrigin === allowedOrigin ? requestOrigin : allowedOrigin;

  return {
    "Access-Control-Allow-Origin": origin || "null",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}

function hasAllowedOrigin(request: Request, env: Env) {
  const requestOrigin = request.headers.get("Origin");
  const allowedOrigin = env.ALLOWED_ORIGIN?.trim();

  if (!requestOrigin || !allowedOrigin) return true;
  return allowedOrigin === "*" || requestOrigin === allowedOrigin;
}

function isRateLimitError(status: number, message: string) {
  const normalizedMessage = message.toLowerCase();
  return status === 429 || normalizedMessage.includes("too many requests") || normalizedMessage.includes("rate limit") || normalizedMessage.includes("quota");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function requiredString(value: unknown, field: string) {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`Invalid profile field: ${field}`);
  }
  return value;
}

function stringArray(value: unknown, field: string) {
  if (!Array.isArray(value) || value.some((item) => typeof item !== "string")) {
    throw new Error(`Invalid profile field: ${field}`);
  }
  return value as string[];
}

function parseProfile(value: unknown): Profile {
  if (!isRecord(value)) throw new Error("Invalid profile document");

  const meta = value.meta;
  const hero = value.hero;
  const works = value.works;
  const about = value.about;
  const skills = value.skills;
  const contact = value.contact;

  if (!isRecord(meta) || !isRecord(hero) || !isRecord(works) || !isRecord(about) || !isRecord(skills) || !isRecord(contact)) {
    throw new Error("Invalid profile structure");
  }
  if (!Array.isArray(works.projects) || !Array.isArray(about.skills) || !Array.isArray(skills.matrix) || !Array.isArray(contact.socials)) {
    throw new Error("Invalid profile collections");
  }

  return {
    meta: { url: requiredString(meta.url, "meta.url") },
    hero: {
      name: requiredString(hero.name, "hero.name"),
      role: requiredString(hero.role, "hero.role"),
      description: requiredString(hero.description, "hero.description"),
      location: requiredString(hero.location, "hero.location"),
    },
    works: {
      projects: works.projects.map((item, index) => {
        if (!isRecord(item)) throw new Error(`Invalid project at index ${index}`);
        return {
          title: requiredString(item.title, `works.projects[${index}].title`),
          description: requiredString(item.description, `works.projects[${index}].description`),
          tags: stringArray(item.tags, `works.projects[${index}].tags`),
          ...(typeof item.liveSite === "string" && item.liveSite.length > 0 ? { liveSite: item.liveSite } : {}),
        };
      }),
    },
    about: {
      bio: requiredString(about.bio, "about.bio"),
      proof: requiredString(about.proof, "about.proof"),
      skills: about.skills.map((item, index) => {
        if (!isRecord(item)) throw new Error(`Invalid about skill at index ${index}`);
        return {
          title: requiredString(item.title, `about.skills[${index}].title`),
          description: requiredString(item.description, `about.skills[${index}].description`),
        };
      }),
    },
    skills: {
      matrix: skills.matrix.map((item, index) => {
        if (!isRecord(item)) throw new Error(`Invalid skill group at index ${index}`);
        return {
          title: requiredString(item.title, `skills.matrix[${index}].title`),
          items: stringArray(item.items, `skills.matrix[${index}].items`),
        };
      }),
      availability: requiredString(skills.availability, "skills.availability"),
    },
    contact: {
      email: requiredString(contact.email, "contact.email"),
      socials: contact.socials.map((item, index) => {
        if (!isRecord(item)) throw new Error(`Invalid social at index ${index}`);
        return {
          label: requiredString(item.label, `contact.socials[${index}].label`),
          href: requiredString(item.href, `contact.socials[${index}].href`),
        };
      }),
    },
  };
}

async function readLimitedBody(response: Response, limit: number) {
  const contentLength = Number(response.headers.get("Content-Length"));
  if (Number.isFinite(contentLength) && contentLength > limit) {
    throw new Error("Response body is too large");
  }
  if (!response.body) throw new Error("Response has no body");

  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    while (true) {
      const result = await reader.read();
      if (result.done) break;
      total += result.value.byteLength;
      if (total > limit) throw new Error("Response body is too large");
      chunks.push(result.value);
    }
  } finally {
    reader.releaseLock();
  }

  const body = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return decoder.decode(body);
}

async function parseProfileResponse(response: Response) {
  if (!response.ok) throw new Error(`Profile request failed with status ${response.status}`);
  return parseProfile(JSON.parse(await readLimitedBody(response, MAX_PROFILE_SIZE)) as unknown);
}

async function loadProfile(profileUrl: string) {
  if (!profileUrl) throw new Error("PROFILE_URL is not configured");

  const cacheKey = new Request(profileUrl, { method: "GET" });
  const cache = (caches as CacheStorageWithDefault).default;
  const cached = await cache.match(cacheKey);
  if (cached) {
    try {
      return await parseProfileResponse(cached);
    } catch {
      await cache.delete(cacheKey);
    }
  }

  const originRequest = new Request(profileUrl, {
    method: "GET",
    headers: { Accept: "application/json" },
  });

  try {
    const profile = await parseProfileResponse(await fetch(originRequest));
    await cache.put(
      cacheKey,
      new Response(JSON.stringify(profile), {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Cache-Control": `public, max-age=${PROFILE_CACHE_TTL_SECONDS}`,
        },
      }),
    );
    return profile;
  } catch (originError) {
    throw originError;
  }
}

function providerMessages(context: string, message: string) {
  return [
    { role: "system", content: context },
    { role: "user", content: message },
  ];
}

async function requestStreamingProvider(baseUrl: string, model: string, apiKey: string, context: string, message: string) {
  return fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      Accept: "text/event-stream",
      "Content-Type": "application/json",
      "User-Agent": "portfolio-chat-worker/1.0.0",
    },
    body: JSON.stringify({
      model,
      temperature: 0.4,
      max_tokens: 220,
      stream: true,
      messages: providerMessages(context, message),
    }),
  });
}

async function streamProviderResponse(providerResponse: Response, corsHeaders: Record<string, string>, language: "en" | "vi") {
  const contentType = providerResponse.headers.get("Content-Type") ?? "";
  if (!contentType.includes("text/event-stream")) {
    try {
      const completion = JSON.parse(await readLimitedBody(providerResponse, MAX_PROVIDER_ERROR_SIZE)) as ProviderCompletion;
      const rawResponse = providerText(completion);
      if (!rawResponse) {
        return json({ error: "AI temporarily unavailable", success: false }, 502, corsHeaders);
      }
      return json({ response: checkOutputGuardrail(rawResponse, language), success: true }, 200, corsHeaders);
    } catch {
      return json({ error: "AI temporarily unavailable", success: false }, 502, corsHeaders);
    }
  }

  if (!providerResponse.body) {
    return json({ error: "AI temporarily unavailable", success: false }, 502, corsHeaders);
  }

  const readable = new ReadableStream<Uint8Array>({
    async start(controller) {
      const reader = providerResponse.body!.getReader();
      let buffer = "";
      let answer = "";
      let ended = false;

      const close = () => {
        if (ended) return;
        ended = true;
        controller.close();
      };

      const emitLine = (line: string) => {
        if (ended) return;
        const trimmedLine = line.trim();
        if (!trimmedLine.startsWith("data:")) return;

        const data = trimmedLine.slice(5).trim();
        if (data === "[DONE]") {
          controller.enqueue(streamEvent("[DONE]"));
          close();
          return;
        }

        try {
          const chunk = JSON.parse(data) as ProviderStreamChunk;
          const text = chunk.choices?.[0]?.delta?.content;
          if (typeof text === "string" && text.length > 0) {
            answer += text;
            if (isUnsafeOutput(answer)) {
              controller.enqueue(streamEvent({ error: refusal(language), success: false }));
              close();
              return;
            }
            controller.enqueue(streamEvent({ text }));
          }
        } catch {
          // Ignore malformed provider events. Never expose raw provider data.
        }
      };

      try {
        while (!ended) {
          const result = await reader.read();
          if (result.done) break;
          buffer += decoder.decode(result.value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";
          lines.forEach(emitLine);
        }
        if (!ended) {
          buffer += decoder.decode();
          if (buffer) emitLine(buffer);
        }
        if (!ended) {
          controller.enqueue(streamEvent("[DONE]"));
          close();
        }
      } catch {
        if (!ended) {
          controller.enqueue(streamEvent({ error: "AI temporarily unavailable", success: false }));
          close();
        }
      } finally {
        reader.releaseLock();
      }
    },
  });

  return new Response(readable, {
    status: 200,
    headers: {
      ...corsHeaders,
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      "X-Accel-Buffering": "no",
    },
  });
}

const MAX_CONTACT_BODY_LENGTH = 8_000;
const TURNSTILE_VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

async function verifyTurnstile(request: Request, token: string, secret: string) {
  const form = new URLSearchParams({ secret, response: token });
  const remoteIp = request.headers.get("CF-Connecting-IP");
  if (remoteIp) form.set("remoteip", remoteIp);

  const response = await fetch(TURNSTILE_VERIFY_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: form,
  }).catch(() => null);

  if (!response?.ok) return false;
  const result = (await response.json().catch(() => null)) as ContactTurnstileResponse | null;
  return result?.success === true;
}

async function handleContact(request: Request, env: Env, corsHeaders: Record<string, string>) {
  if (!env.RESEND_API_KEY || !env.EMAIL_FROM || !env.OWNER_EMAIL) {
    return json({ error: "Contact service is not configured", success: false }, 503, corsHeaders);
  }
  if (!env.TURNSTILE_SECRET_KEY) {
    return json({ error: "Contact verification is not configured", success: false }, 503, corsHeaders);
  }

  const contentLength = Number(request.headers.get("Content-Length"));
  if (Number.isFinite(contentLength) && contentLength > MAX_CONTACT_BODY_LENGTH) {
    return json({ error: "Contact request is too large", success: false }, 413, corsHeaders);
  }

  let body: ContactBody;
  try {
    const rawBody = await request.text();
    if (new TextEncoder().encode(rawBody).byteLength > MAX_CONTACT_BODY_LENGTH) {
      return json({ error: "Contact request is too large", success: false }, 413, corsHeaders);
    }
    body = JSON.parse(rawBody) as ContactBody;
  } catch {
    return json({ error: "Invalid JSON body", success: false }, 400, corsHeaders);
  }

  let contact: ContactRequest;
  try {
    contact = parseContactRequest(body);
  } catch (error) {
    if (error instanceof ContactValidationError) {
      return json({ error: error.message, success: false }, 400, corsHeaders);
    }
    return json({ error: "Invalid contact request", success: false }, 400, corsHeaders);
  }

  const verified = await verifyTurnstile(request, contact.turnstileToken, env.TURNSTILE_SECRET_KEY);
  if (!verified) {
    return json({ error: "Contact verification failed. Please try again.", success: false }, 400, corsHeaders);
  }

  if (env.RATE_LIMITER) {
    const ip = request.headers.get("CF-Connecting-IP") || "unknown";
    const rateLimit = await env.RATE_LIMITER.limit({ key: `contact:${ip}` }).catch(() => null);
    if (rateLimit && !rateLimit.success) {
      return json({ error: "Too many messages. Please try again later.", success: false }, 429, corsHeaders);
    }
  }

  try {
    await sendContactEmail(contact, env);
    return json({ message: "Message sent successfully", success: true }, 200, corsHeaders);
  } catch (error) {
    if (!(error instanceof EmailDeliveryError)) {
      console.error("Contact email request failed", "unknown_error");
    }
    return json({ error: "Unable to send message right now. Please try again.", success: false }, 502, corsHeaders);
  }
}

async function handleChat(request: Request, env: Env, corsHeaders: Record<string, string>) {
  if (!env.LLM_API_KEY) {
    return json({ error: "API key not configured", success: false }, 500);
  }

  let body: ChatRequest;
  try {
    body = (await request.json()) as ChatRequest;
  } catch {
    return json({ error: "Invalid JSON body", success: false }, 400);
  }

  if (typeof body.message !== "string" || body.message.trim().length === 0) {
    return json({ error: "No message provided", success: false }, 400);
  }

  const message = body.message.trim();
  if (message.length > MAX_MESSAGE_LENGTH) {
    return json({ error: `Message must be ${MAX_MESSAGE_LENGTH} characters or fewer`, success: false }, 400);
  }

  const guardrail = checkInputGuardrail(message);
  if (!guardrail.allowed) {
    return json({ error: guardrail.message, success: false }, 400);
  }

  let context: string;
  try {
    const profile = await loadProfile(env.PROFILE_URL?.trim() || "");
    context = getRelevantContext(message, profile, guardrail.language);
  } catch (error) {
    console.error("Portfolio profile unavailable", error instanceof Error ? error.name : "unknown_error");
    return json({ error: "Portfolio context temporarily unavailable", success: false }, 503);
  }

  const baseUrl = (env.LLM_BASE_URL || DEFAULT_BASE_URL).replace(/\/$/, "");
  const model = env.LLM_MODEL || DEFAULT_MODEL;

  try {
    const providerResponse = await requestStreamingProvider(baseUrl, model, env.LLM_API_KEY, context, message);
    if (!providerResponse.ok) {
      const providerMessage = await readLimitedBody(providerResponse, MAX_PROVIDER_ERROR_SIZE).catch(() => "");
      if (isRateLimitError(providerResponse.status, providerMessage)) {
        return json({ error: "Rate limit reached. Please try again in a few minutes.", success: false }, 429);
      }
      return json({ error: "AI temporarily unavailable", success: false }, 502);
    }
    return await streamProviderResponse(providerResponse, corsHeaders, guardrail.language);
  } catch (error) {
    console.error("Chat provider request failed", error instanceof Error ? error.name : "unknown_error");
    return json({ error: "AI temporarily unavailable", success: false }, 502);
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const corsHeaders = getCorsHeaders(request, env);

    if (!hasAllowedOrigin(request, env)) {
      return json({ error: "Origin not allowed", success: false }, 403, corsHeaders);
    }

    if (url.pathname === "/health") {
      if (request.method !== "GET") {
        return json({ error: "Method not allowed", success: false }, 405, {
          ...corsHeaders,
          Allow: "GET",
        });
      }

      return json(
        {
          service: "portfolio-api",
          status: "ok",
          success: true,
        },
        200,
        corsHeaders,
      );
    }

    if (url.pathname !== "/api/chat" && url.pathname !== "/api/contact") {
      return json({ error: "Not found", success: false }, 404, corsHeaders);
    }

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    if (request.method !== "POST") {
      return json({ error: "Method not allowed", success: false }, 405, { ...corsHeaders, Allow: "POST, OPTIONS" });
    }

    const response = url.pathname === "/api/contact"
      ? await handleContact(request, env, corsHeaders)
      : await handleChat(request, env, corsHeaders);
    Object.entries(corsHeaders).forEach(([key, value]) => response.headers.set(key, value));
    return response;
  },
};
