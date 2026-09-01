import type { ContactRequest } from "./contact-validation";

type EmailEnv = {
  RESEND_API_KEY?: string;
  EMAIL_FROM?: string;
  OWNER_EMAIL?: string;
};

const RESEND_URL = "https://api.resend.com/emails";

export class EmailDeliveryError extends Error {
  constructor() {
    super("Unable to send message right now. Please try again.");
    this.name = "EmailDeliveryError";
  }
}

function emailText(contact: ContactRequest) {
  return [
    "New portfolio message",
    "",
    `Name: ${contact.name}`,
    `Email: ${contact.email}`,
    "",
    "Message:",
    contact.message,
  ].join("\n");
}

export async function sendContactEmail(contact: ContactRequest, env: EmailEnv) {
  if (!env.RESEND_API_KEY || !env.EMAIL_FROM || !env.OWNER_EMAIL) {
    throw new EmailDeliveryError();
  }

  const response = await fetch(RESEND_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      from: env.EMAIL_FROM,
      to: [env.OWNER_EMAIL],
      reply_to: contact.email,
      subject: `Portfolio message from ${contact.name}`,
      text: emailText(contact),
    }),
  }).catch(() => null);

  if (!response?.ok) {
    if (response?.body) {
      const reader = response.body.getReader();
      let total = 0;
      try {
        while (total < 8_000) {
          const chunk = await reader.read();
          if (chunk.done) break;
          total += chunk.value.byteLength;
        }
      } finally {
        reader.releaseLock();
      }
    }
    throw new EmailDeliveryError();
  }

  const result = (await response.json().catch(() => null)) as { id?: unknown } | null;
  if (typeof result?.id !== "string" || !result.id) {
    throw new EmailDeliveryError();
  }

  return true;
}
