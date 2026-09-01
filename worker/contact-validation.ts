export const CONTACT_LIMITS = {
  name: 100,
  email: 254,
  message: 4000,
  turnstileToken: 2048,
  website: 200,
} as const;

export type ContactRequest = {
  name: string;
  email: string;
  message: string;
  turnstileToken: string;
  website: string;
};

export class ContactValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ContactValidationError";
  }
}

function stringField(value: unknown, field: keyof typeof CONTACT_LIMITS) {
  if (typeof value !== "string") {
    throw new ContactValidationError("Please complete all contact fields.");
  }

  const normalized = value.trim();
  if (!normalized) {
    throw new ContactValidationError("Please complete all contact fields.");
  }
  if (normalized.length > CONTACT_LIMITS[field]) {
    throw new ContactValidationError(`Contact ${field} is too long.`);
  }
  return normalized;
}

function normalizeEmail(value: string) {
  const email = value.toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new ContactValidationError("Please enter valid email address.");
  }
  return email;
}

function safeHeaderValue(value: string) {
  return value.replace(/[\r\n]+/g, " ").replace(/[^\p{L}\p{N} .,'-]/gu, "").trim();
}

export function parseContactRequest(value: unknown): ContactRequest {
  if (!value || typeof value !== "object") {
    throw new ContactValidationError("Invalid contact request.");
  }

  const body = value as Record<string, unknown>;
  const name = safeHeaderValue(stringField(body.name, "name"));
  const email = normalizeEmail(stringField(body.email, "email"));
  const message = stringField(body.message, "message");
  const turnstileToken = stringField(body.turnstileToken, "turnstileToken");
  const website = typeof body.website === "string" ? body.website.trim() : "";

  if (website.length > CONTACT_LIMITS.website) {
    throw new ContactValidationError("Invalid contact request.");
  }
  if (website) {
    throw new ContactValidationError("Invalid contact request.");
  }

  return { name, email, message, turnstileToken, website };
}
