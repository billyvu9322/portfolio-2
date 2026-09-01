type StreamEvent = {
  text?: unknown;
  error?: unknown;
  success?: unknown;
};

export async function askPortfolioAI(
  question: string,
  onChunk: (chunk: string) => void,
) {
  const configuredUrl = process.env.NEXT_PUBLIC_PORTFOLIO_CHAT_API_URL?.trim();
  if (!configuredUrl) throw new Error("AI chat is not configured");

  const normalizedUrl = configuredUrl.replace(/\/+$/, "");
  const endpoint = normalizedUrl.endsWith("/api/chat")
    ? normalizedUrl
    : `${normalizedUrl}/api/chat`;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: question }),
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as {
      error?: unknown;
    } | null;
    throw new Error(
      typeof payload?.error === "string"
        ? payload.error
        : "AI temporarily unavailable",
    );
  }

  const contentType = response.headers.get("Content-Type") ?? "";
  if (!contentType.includes("text/event-stream")) {
    const payload = (await response.json().catch(() => null)) as {
      response?: unknown;
      error?: unknown;
      success?: unknown;
    } | null;
    if (payload?.success !== true || typeof payload.response !== "string") {
      throw new Error(
        typeof payload?.error === "string"
          ? payload.error
          : "AI temporarily unavailable",
      );
    }
    onChunk(payload.response);
    return payload.response;
  }

  if (!response.body) throw new Error("AI stream unavailable");

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let answer = "";
  let streamEnded = false;

  const processEvent = (event: string) => {
    const data = event
      .split(/\r?\n/)
      .filter((line) => line.startsWith("data:"))
      .map((line) => line.slice(5).trim())
      .join("\n")
      .trim();

    if (!data || data === "[DONE]") {
      if (data === "[DONE]") streamEnded = true;
      return;
    }

    const payload = JSON.parse(data) as StreamEvent;
    if (typeof payload.error === "string") throw new Error(payload.error);
    if (typeof payload.text === "string") {
      answer += payload.text;
      onChunk(answer);
    }
  };

  try {
    while (!streamEnded) {
      const result = await reader.read();
      if (result.done) break;
      buffer += decoder.decode(result.value, { stream: true });
      const events = buffer.split(/\r?\n\r?\n/);
      buffer = events.pop() ?? "";
      events.forEach(processEvent);
    }
    buffer += decoder.decode();
    if (buffer.trim()) processEvent(buffer);
  } finally {
    reader.releaseLock();
  }

  if (!answer.trim()) throw new Error("AI returned an empty response");
  return answer;
}
