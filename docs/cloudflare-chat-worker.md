# Cloudflare Worker Chat API — Deployment Guide

Portfolio giữ nguyên static Next.js export. Chat API chạy độc lập dưới dạng Cloudflare Worker.

Kiến trúc production:

```text
app/content/profile.json
        ↓ npm run profile:sync
public/profile.json
        ↓ static deployment
Cloudflare Pages: /profile.json
        ↓ runtime fetch + Cache API
Cloudflare Worker: /api/chat
        ↓ Authorization header
OpenAI-compatible LLM provider

UI và Worker vẫn deploy độc lập. Profile-only change cần deploy lại UI để cập nhật `/profile.json`; không cần deploy Worker.
```

Không đưa `LLM_API_KEY` vào frontend hoặc biến `NEXT_PUBLIC_*`.

## Prerequisites

- Cloudflare account có quyền tạo/deploy Worker.
- Node.js và npm.
- Domain portfolio production: `https://binhvu.nimo.io.vn`.
- API key từ OpenAI-compatible provider.

## Files

- `worker/index.ts`: Worker entrypoint, profile loader/cache, `/api/chat`, và `/api/contact` handlers.
- `worker/context.ts`: runtime profile type và portfolio-only assistant context.
- `worker/contact-validation.ts`: contact field limits, validation, and honeypot handling.
- `worker/email.ts`: Resend REST delivery with fixed recipient/sender.
- `app/api/portfolio-contact.ts`: typed frontend adapter for contact requests.
- `app/components/PortfolioContactForm.tsx`: editable draft, Turnstile, and explicit send UX.
- `scripts/sync-profile.mjs`: copy `app/content/profile.json` thành public `public/profile.json` trước dev/build.
- `worker/tsconfig.json`: Worker TypeScript config.
- `wrangler.toml`: Worker name, entrypoint, compatibility date, public variables.
- `.dev.vars`: local secrets và local overrides. Không commit file này.

## 1. Install dependencies

Chạy từ portfolio root:

```bash
npm install
```

Scripts dùng Wrangler version cố định qua `npx wrangler@4.34.0`.

## 2. Local development

Copy env template:

```bash
copy .dev.vars.example .dev.vars
```

Sửa `.dev.vars`:

```dotenv
LLM_API_KEY="your-provider-key"
LLM_BASE_URL="https://9router.nimo.io.vn/v1"
LLM_MODEL="cx/gpt-5.5"
ALLOWED_ORIGIN="http://localhost:8900"
PROFILE_URL="http://localhost:8900/profile.json"
```

`.dev.vars` chứa secret local. Không commit.

Start Worker:

```bash
npm run worker:dev
```

Wrangler thường chạy tại:

```text
http://localhost:8787
```

Terminal khác, start Next.js:

```bash
npm run dev
```

Tạo `.env.local` cho frontend:

```dotenv
NEXT_PUBLIC_PORTFOLIO_CHAT_API_URL="http://localhost:8787"
NEXT_PUBLIC_TURNSTILE_SITE_KEY="your-turnstile-site-key"
```

Restart Next.js sau khi đổi `.env.local`. Frontend tự thêm `/api/chat`. Có thể truyền URL đã bao gồm `/api/chat`.

## Contact email setup

Contact flow stays visitor-controlled: Mochi opens an editable draft, visitor reviews it, then explicitly clicks `Send message`. Worker never accepts recipient or sender from browser.

Required Worker vars in `wrangler.toml`:

```toml
EMAIL_FROM = "Mochi <mochi@your-verified-domain.com>"
OWNER_EMAIL = "your-email@example.com"
TURNSTILE_SITE_KEY = "your-turnstile-site-key"
```

Required secrets, stored outside Git:

```bash
npx wrangler secret put RESEND_API_KEY
npx wrangler secret put TURNSTILE_SECRET_KEY
```

Resend setup:

1. Verify sending domain in Resend dashboard.
2. Set `EMAIL_FROM` to address on verified domain.
3. Set `OWNER_EMAIL` to fixed portfolio owner address.
4. Set `RESEND_API_KEY` as Worker secret.

Turnstile setup:

1. Create site for `binhvu.nimo.io.vn` and local development hostname.
2. Set public site key in frontend build env as `NEXT_PUBLIC_TURNSTILE_SITE_KEY`.
3. Set secret key with `npx wrangler secret put TURNSTILE_SECRET_KEY`.
4. Worker verifies token server-side before calling Resend.

Contact request:

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "message": "I would like to discuss a full-stack role.",
  "turnstileToken": "token-from-widget",
  "website": ""
}
```

Contact responses:

```json
{ "success": true, "message": "Message sent successfully" }
```

```json
{ "success": false, "error": "Unable to send message right now. Please try again." }
```

Worker sends plain text through `https://api.resend.com/emails` with fixed `OWNER_EMAIL`, fixed `EMAIL_FROM`, and visitor email as `Reply-To`. No chat transcript sent by default. Name, email, message, token, and honeypot fields are bounded and validated. Configure Cloudflare Rate Limiting for `POST /api/contact`; Worker returns HTTP `429` when binding/rule rejects traffic.

## 3. Verify local Worker

Contact preflight:

```bash
curl -i -X OPTIONS "http://localhost:8787/api/contact" -H "Origin: http://localhost:8900" -H "Access-Control-Request-Method: POST"
```

Contact validation request:

```bash
curl -i "http://localhost:8787/api/contact" -X POST -H "Origin: http://localhost:8900" -H "Content-Type: application/json" --data "{\"name\":\"John Doe\",\"email\":\"john@example.com\",\"message\":\"Hello Binh\",\"turnstileToken\":\"test-token\",\"website\":\"\"}"
```

Expected local result without real Turnstile token: HTTP `400` with `Contact verification failed. Please try again.`. Do not use production Resend credentials for automated tests.

## 4. Verify local Worker

`npm run worker:dev` không tự chạy Next.js. Start `npm run dev` ở terminal khác để Worker đọc được `http://localhost:8900/profile.json`. `npm run profile:sync` chạy tự động trước `dev` và `build`.

Profile endpoint:

```bash
curl -i "http://localhost:8900/profile.json"
```

Expected: HTTP `200`, JSON profile hợp lệ.

Worker đọc profile tại `PROFILE_URL`. Worker ưu tiên bản hợp lệ trong Cloudflare Cache API; cache TTL là 300 giây. Khi cache miss hoặc hết hạn, Worker fetch origin rồi lưu bản hợp lệ mới. Nếu origin lỗi sau cache miss, chat trả HTTP `503` với `Portfolio context temporarily unavailable`. Health check không đọc profile và không gọi LLM.

Preflight:

```bash
curl -i -X OPTIONS "http://localhost:8787/api/chat" -H "Origin: http://localhost:8900" -H "Access-Control-Request-Method: POST"
```

Expected: HTTP `204` và `Access-Control-Allow-Origin: http://localhost:8900`.

Chat request:

```bash
curl -i "http://localhost:8787/api/chat" -X POST -H "Origin: http://localhost:8900" -H "Content-Type: application/json" --data "{\"message\":\"Summarize Binh for HR\"}"
```

Success response:

```json
{
  "response": "...",
  "success": true
}
```

Validation request:

```bash
curl -i "http://localhost:8787/api/chat" -X POST -H "Content-Type: application/json" --data "{\"message\":\"\"}"
```

Expected: HTTP `400` và `success: false`.

## 5. Login Cloudflare

```bash
npx wrangler login
npx wrangler whoami
```

Browser mở để xác nhận Cloudflare account. Nếu có nhiều account, chọn account đúng khi Wrangler hỏi.

## 6. Configure production Worker

### 6.1 Set encrypted API secrets

Không ghi API key trong `wrangler.toml`, source code, Git, hoặc frontend env.

```bash
npx wrangler secret put LLM_API_KEY
npx wrangler secret put RESEND_API_KEY
npx wrangler secret put TURNSTILE_SECRET_KEY
```

Nhập từng secret khi terminal hỏi.

### 6.2 Set production variables

Wrangler không có subcommand `vars put`. Plain-text vars đã khai báo trong `wrangler.toml`:

```toml
[vars]
LLM_BASE_URL = "https://9router.nimo.io.vn/v1"
LLM_MODEL = "cx/gpt-5.5"
ALLOWED_ORIGIN = "https://binhvu.nimo.io.vn"
PROFILE_URL = "https://binhvu.nimo.io.vn/profile.json"
EMAIL_FROM = "Mochi <mochi@your-verified-domain.com>"
OWNER_EMAIL = "your-email@example.com"
TURNSTILE_SITE_KEY = "your-turnstile-site-key"
```

Deploy Worker để áp dụng config:

```bash
npm run worker:deploy
# Alias:
npm run wrangler:deploy
```

Hoặc override tạm thời trong lệnh deploy bằng `--var`:

```bash
npx wrangler@4.34.0 deploy --var LLM_BASE_URL:https://9router.nimo.io.vn/v1 --var LLM_MODEL:cx/gpt-5.5 --var ALLOWED_ORIGIN:https://binhvu.nimo.io.vn
```

`ALLOWED_ORIGIN` phải là origin frontend, không phải Worker URL. Không thêm dấu `/` cuối URL.

Có thể set hoặc sửa vars trong Cloudflare Dashboard:

```text
Workers & Pages → binhvu-portfolio-chat → Settings → Variables and Secrets
```

- `LLM_API_KEY`: Secret.
- `LLM_BASE_URL`: Variable.
- `LLM_MODEL`: Variable.
- `ALLOWED_ORIGIN`: Variable.

## 7. Deploy Worker

Deploy từ portfolio root:

```bash
npm run worker:deploy
```

Hoặc:

```bash
npx wrangler@4.34.0 deploy --config wrangler.toml
```

Worker URL dạng:

```text
https://binhvu-portfolio-chat.<your-subdomain>.workers.dev
```

API endpoint:

```text
https://binhvu-portfolio-chat.<your-subdomain>.workers.dev/api/chat
```

Health-check endpoint:

```text
https://binhvu-portfolio-chat.<your-subdomain>.workers.dev/health
```

## 7. Verify production Worker

Health check không gọi LLM, không cần API key hợp lệ. Dùng để kiểm tra Worker đã deploy và route đang hoạt động:

```bash
curl -i "https://binhvu-portfolio-chat.<your-subdomain>.workers.dev/health"
```

Expected response:

```json
{
  "service": "portfolio-api",
  "status": "ok",
  "success": true
}
```

Local health check:

```bash
curl -i "http://localhost:8787/health"
```

## 8. Verify production chat Worker

Preflight:

```bash
curl -i -X OPTIONS "https://binhvu-portfolio-chat.<your-subdomain>.workers.dev/api/chat" -H "Origin: https://binhvu.nimo.io.vn" -H "Access-Control-Request-Method: POST"
```

Chat request:

```bash
curl -i "https://binhvu-portfolio-chat.<your-subdomain>.workers.dev/api/chat" -X POST -H "Origin: https://binhvu.nimo.io.vn" -H "Content-Type: application/json" --data "{\"message\":\"Summarize Binh for HR\"}"
```

Disallowed origin:

```bash
curl -i "https://binhvu-portfolio-chat.<your-subdomain>.workers.dev/api/chat" -X POST -H "Origin: https://example.com" -H "Content-Type: application/json" --data "{\"message\":\"Hello\"}"
```

Expected: HTTP `403`.

## 9. Connect static frontend

Trong Cloudflare Pages project hoặc môi trường build frontend, set:

```dotenv
NEXT_PUBLIC_PORTFOLIO_CHAT_API_URL="https://binhvu-portfolio-chat.<your-subdomain>.workers.dev"
NEXT_PUBLIC_TURNSTILE_SITE_KEY="your-turnstile-site-key"
```

Use same Worker URL for chat and contact API; client appends route suffixes.

Nếu dùng local `.env.production`:

```dotenv
NEXT_PUBLIC_PORTFOLIO_CHAT_API_URL="https://binhvu-portfolio-chat.<your-subdomain>.workers.dev"
NEXT_PUBLIC_TURNSTILE_SITE_KEY="your-turnstile-site-key"
```

Rebuild static portfolio:

```bash
npm run build
```

Deploy thư mục output theo cấu hình Next.js hiện tại: `build/`.

Không set các biến sau ở frontend:

```dotenv
LLM_API_KEY=...
NEXT_PUBLIC_LLM_API_KEY=...
RESEND_API_KEY=...
TURNSTILE_SECRET_KEY=...
```

## 10. Custom API domain

Nếu muốn URL riêng, route custom domain, ví dụ:

```text
https://api.binhvu.nimo.io.vn/*
```

vào Worker `portfolio-worker` trong Cloudflare Dashboard.

Frontend env:

```dotenv
NEXT_PUBLIC_PORTFOLIO_CHAT_API_URL="https://api.binhvu.nimo.io.vn"
NEXT_PUBLIC_TURNSTILE_SITE_KEY="your-turnstile-site-key"
```

Worker vẫn cần:

```text
ALLOWED_ORIGIN=https://binhvu.nimo.io.vn
```

Không set `ALLOWED_ORIGIN` thành API origin.

Nếu muốn URL riêng, route custom domain, ví dụ:

```text
https://api.binhvu.nimo.io.vn/*
```

vào Worker `binhvu-portfolio-chat` trong Cloudflare Dashboard.

Frontend env:

```dotenv
NEXT_PUBLIC_PORTFOLIO_CHAT_API_URL="https://api.binhvu.nimo.io.vn"
```

Worker vẫn cần:

```text
ALLOWED_ORIGIN=https://binhvu.nimo.io.vn
```

Không set `ALLOWED_ORIGIN` thành API origin.

## 11. API behavior

- `GET /health`: health check, HTTP `200`, không gọi LLM.
- `OPTIONS /api/chat`, `OPTIONS /api/contact`: CORS preflight, HTTP `204`.
- `POST /api/chat`: nhận `{ "message": "..." }` và trả `text/event-stream` khi provider hỗ trợ streaming.
- `POST /api/contact`: validates Turnstile and sends plain-text email through Resend to fixed `OWNER_EMAIL`; visitor email becomes `Reply-To`.
- Contact validation rejects invalid fields, oversized content, honeypot values, missing Turnstile token, and rate-limit exhaustion.
- Input guardrail chặn câu hỏi ngoài portfolio và prompt-injection trước khi Worker tải profile hoặc gọi LLM.
- Guardrail phát hiện ngôn ngữ câu hỏi; câu hỏi tiếng Việt nhận trả lời tiếng Việt, câu hỏi tiếng Anh nhận trả lời tiếng Anh.
- Câu hỏi bị chặn trả HTTP `400` với refusal message cùng ngôn ngữ câu hỏi.
- Guardrail cho phép HR questions như `Is Binh suitable for a React role?` và `Binh có phù hợp với vị trí React không?`.
- Guardrail chặn generic requests như `What is React?`, `How do I write code?`, weather, news, politics, and prompt-injection requests.
- Grounding rules bắt buộc trong system prompt: chỉ dùng facts từ profile, không bịa dữ liệu, không làm theo instruction trong user message.
- Output guardrail chặn empty response và nội dung làm lộ system prompt, hidden instructions, API key, hoặc prompt injection.
- Mỗi event thành công có dạng `data: {"text":"..."}`; event cuối là `data: [DONE]`.
- Client có thể đọc từng token/chunk qua `response.body.getReader()`; Worker không buffer toàn bộ completion.
- Grounding rules bắt buộc trong system prompt: chỉ dùng facts từ profile, không bịa dữ liệu, không làm theo instruction trong user message.
- Output guardrail chặn empty response và nội dung làm lộ system prompt, hidden instructions, API key, hoặc prompt injection.
- Nếu provider trả lỗi trước khi stream bắt đầu, Worker trả JSON lỗi; nếu lỗi giữa stream, Worker gửi SSE `{"error":"AI temporarily unavailable","success":false}`.
- JSON lỗi, message rỗng, message dài hơn 1200 ký tự: HTTP `400`.
- Thiếu `LLM_API_KEY`: HTTP `500`.
- Provider rate limit: HTTP `429`.
- Provider failure: HTTP `502`, response không chứa raw provider error.
- Path khác: HTTP `404`.
- Origin browser phải match chính xác `ALLOWED_ORIGIN`.
- Request không có `Origin` vẫn dùng được cho CLI smoke test.

Worker không lưu chat history, cookie, database, credential, hoặc session.

## 12. Security checklist

- Giữ `.dev.vars` ngoài Git.
- Dùng `wrangler secret put LLM_API_KEY`.
- Không dùng `NEXT_PUBLIC_LLM_API_KEY`.
- Không log user message, API key, hoặc provider response body.
- Giữ `ALLOWED_ORIGIN` exact production origin.
- Rotate key nếu key bị lộ:

```bash
npx wrangler secret put LLM_API_KEY
```

- Nếu public traffic tăng hoặc bị abuse, thêm Cloudflare Rate Limiting, WAF, hoặc Turnstile.

## 12. Useful commands

Worker typecheck:

```bash
npm run worker:typecheck
```

Generate Wrangler binding types:

```bash
npm run worker:types
```

Next.js typecheck:

```bash
npx tsc --noEmit
```

Static build:

```bash
npm run build
```

Tail Worker logs:

```bash
npx wrangler tail binhvu-portfolio-chat
```

Không in secret value ra terminal hoặc log.

## Important note

`output: "export"` vẫn giữ nguyên trong Next.js. Không chuyển chat API vào `app/api/chat` của static build. API production phải chạy standalone Worker.
