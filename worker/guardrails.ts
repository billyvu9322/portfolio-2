export type ResponseLanguage = "en" | "vi";

export type GuardrailResult = {
  allowed: boolean;
  language: ResponseLanguage;
  message?: string;
};

const PORTFOLIO_TERMS = [
  "portfolio",
  "profile",
  "binh",
  "skill",
  "skills",
  "technical",
  "stack",
  "technology",
  "technologies",
  "framework",
  "tool",
  "project",
  "projects",
  "work",
  "built",
  "experience",
  "background",
  "role",
  "fit",
  "suitable",
  "hire",
  "availability",
  "available",
  "contact",
  "email",
  "linkedin",
  "resume",
  "cv",
  "developer",
  "engineer",
  "frontend",
  "backend",
  "fullstack",
  "react",
  "next.js",
  "node.js",
  "postgresql",
  "shopify",
  "wix",
  "hanguru",
  "harness",
  "madgic",
  "swatchify",
  "kỹ năng",
  "ky nang",
  "công nghệ",
  "cong nghe",
  "dự án",
  "du an",
  "kinh nghiệm",
  "kinh nghiem",
  "giới thiệu",
  "gioi thieu",
  "phù hợp",
  "phu hop",
  "tuyển dụng",
  "tuyen dung",
  "liên hệ",
  "lien he",
  "sẵn sàng",
  "san sang",
  "ở đâu",
  "o dau",
  "làm việc",
  "lam viec",
  "ứng tuyển",
  "ung tuyen",
  "vai trò",
  "vai tro",
  "hồ sơ",
  "ho so",
];

const INJECTION_PATTERNS = [
  /\b(?:ignore|disregard|forget|override)\b[\s\S]{0,100}\b(?:previous|system|developer|instructions?|rules?|prompt)\b/i,
  /\b(?:reveal|show|print| disclose)\b[\s\S]{0,60}\b(?:system prompt|hidden prompt|instructions?|api key|secret)\b/i,
  /\b(?:jailbreak|developer message|system message|prompt injection)\b/i,
  /(?:bỏ qua|bo qua|bỏ quy tắc|bo quy tac|tiết lộ|tiet lo)[\s\S]{0,100}(?:hướng dẫn|huong dan|quy tắc|quy tac|system|prompt|api key|secret)/i,
];

const GENERIC_REQUEST_PATTERNS = [
  /\bwhat\s+is\s+(?:react|next\.?js|node\.?js|typescript|javascript|postgres(?:ql)?|shopify|wix)\b/i,
  /\bhow\s+to\s+(?:code|build|debug|program|use)\b/i,
  /\b(?:write|generate|fix|debug)\s+(?:code|a program|an app|this code)\b/i,
  /\b(?:weather|news|politics|recipe|translate|stock price|investment)\b/i,
  /\b(?:lời khuyên|loi khuyen|thời tiết|thoi tiet|tin tức|tin tuc|chính trị|chinh tri)\b/i,
];

function normalize(value: string) {
  return value.toLowerCase().normalize("NFC").trim();
}

export function detectLanguage(message: string): ResponseLanguage {
  const normalized = normalize(message);
  const vietnameseDiacritics = /[ăâđêôơưáàảãạấầẩẫậắằẳẵặéèẻẽẹếềểễệíìỉĩịóòỏõọốồổỗộớờởỡợúùủũụứừửữựýỳỷỹỵ]/i;
  if (vietnameseDiacritics.test(normalized)) return "vi";

  const vietnameseWords = normalized.match(
    /\b(?:tôi|toi|bạn|ban|có|co|về|ve|với|voi|của|cua|là|la|trong|cho|những|nhung|nào|nao|không|khong|đã|da|ứng|ung|việc|viec)\b/g,
  );
  return vietnameseWords && vietnameseWords.length >= 2 ? "vi" : "en";
}

function hasPortfolioTerm(message: string) {
  return PORTFOLIO_TERMS.some((term) => message.includes(term));
}

function hasInjection(message: string) {
  return INJECTION_PATTERNS.some((pattern) => pattern.test(message));
}

function isGenericRequest(message: string) {
  return GENERIC_REQUEST_PATTERNS.some((pattern) => pattern.test(message));
}

function hasPortfolioQualifier(message: string) {
  return /\b(?:binh|candidate|portfolio|profile|experience|skills?|projects?|role|fit)\b/i.test(message)
    || /(?:của binh|cua binh|hồ sơ|ho so|kinh nghiệm|kinh nghiem|kỹ năng|ky nang|dự án|du an|vai trò|vai tro)/i.test(message);
}

export function refusal(language: ResponseLanguage) {
  return language === "vi"
    ? "Tôi chỉ có thể trả lời về portfolio, kỹ năng, dự án, kinh nghiệm được nêu trong portfolio, khả năng làm việc, thông tin liên hệ và mức độ phù hợp với vị trí của Binh."
    : "I can only answer questions about Binh's portfolio, skills, projects, portfolio-listed experience, availability, contact details, and role fit.";
}

export function checkInputGuardrail(message: string): GuardrailResult {
  const language = detectLanguage(message);
  const normalized = normalize(message);
  const allowed = !hasInjection(normalized) && !isGenericRequest(normalized) && (hasPortfolioTerm(normalized) || hasPortfolioQualifier(normalized));

  return allowed
    ? { allowed: true, language }
    : { allowed: false, language, message: refusal(language) };
}

const UNSAFE_OUTPUT_PATTERNS = [
  /\b(?:system prompt|developer message|hidden instructions?|api key|secret key)\b/i,
  /\b(?:ignore|disregard|forget)\b[\s\S]{0,100}\b(?:rules?|instructions?|prompt)\b/i,
  /\b(?:as an ai|as a language model)\b[\s\S]{0,100}\b(?:cannot|don't|do not)\b/i,
];

export function checkOutputGuardrail(response: string, language: ResponseLanguage) {
  const normalized = response.trim();
  if (!normalized || UNSAFE_OUTPUT_PATTERNS.some((pattern) => pattern.test(normalized))) {
    return refusal(language);
  }
  return normalized;
}

export function isUnsafeOutput(response: string) {
  return UNSAFE_OUTPUT_PATTERNS.some((pattern) => pattern.test(response));
}
