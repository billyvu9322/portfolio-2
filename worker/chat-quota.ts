export type ChatQuotaNamespace = {
  idFromName(name: string): ChatQuotaId;
  get(id: ChatQuotaId): ChatQuotaStub;
};

type ChatQuotaId = object;
type ChatQuotaStub = {
  fetch(input: string): Promise<Response>;
};
type DurableObjectStorage = {
  get<T>(key: string): Promise<T | undefined>;
  put<T>(key: string, value: T): Promise<void>;
};
type DurableObjectState = {
  storage: DurableObjectStorage;
  blockConcurrencyWhile<T>(callback: () => Promise<T>): Promise<T>;
};

const DAILY_CHAT_LIMIT = 15;

type QuotaState = {
  date: string;
  count: number;
};

export type ChatQuotaResult = {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
};

function response(result: ChatQuotaResult) {
  return new Response(JSON.stringify(result), {
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
}

function utcDay() {
  return new Date().toISOString().slice(0, 10);
}

function nextUtcMidnight() {
  const now = new Date();
  return Math.floor(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1) / 1000,
  );
}

export class ChatQuota {
  constructor(private readonly state: DurableObjectState) {}

  async fetch(): Promise<Response> {
    return this.state.blockConcurrencyWhile(async () => {
      const date = utcDay();
      const resetAt = nextUtcMidnight();
      const stored = await this.state.storage.get<QuotaState>("daily");
      const current = stored?.date === date ? stored : { date, count: 0 };

      if (current.count >= DAILY_CHAT_LIMIT) {
        return response({
          allowed: false,
          limit: DAILY_CHAT_LIMIT,
          remaining: 0,
          resetAt,
        });
      }

      const count = current.count + 1;
      await this.state.storage.put("daily", { date, count });
      return response({
        allowed: true,
        limit: DAILY_CHAT_LIMIT,
        remaining: DAILY_CHAT_LIMIT - count,
        resetAt,
      });
    });
  }
}
