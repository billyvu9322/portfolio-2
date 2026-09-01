export type PortfolioContactPayload = {
  name: string;
  email: string;
  message: string;
  turnstileToken: string;
  website?: string;
};

type ContactResponse = {
  success?: unknown;
  message?: unknown;
  error?: unknown;
};

function contactEndpoint() {
  const configuredUrl = process.env.NEXT_PUBLIC_PORTFOLIO_CHAT_API_URL?.trim();
  if (!configuredUrl) throw new Error("Contact service is not configured");

  const normalizedUrl = configuredUrl.replace(/\/+$/, "");
  return normalizedUrl.endsWith("/api/contact")
    ? normalizedUrl
    : `${normalizedUrl}/api/contact`;
}

export async function sendPortfolioContact(payload: PortfolioContactPayload) {
  let response: Response;
  try {
    response = await fetch(contactEndpoint(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new Error("Unable to reach contact service. Please try again.");
  }

  const result = (await response.json().catch(() => null)) as ContactResponse | null;
  if (!response.ok || result?.success !== true) {
    throw new Error(
      typeof result?.error === "string"
        ? result.error
        : "Unable to send message right now. Please try again.",
    );
  }

  return typeof result.message === "string"
    ? result.message
    : "Message sent successfully";
}
