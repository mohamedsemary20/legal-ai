import { getStoredToken, clearStoredToken, DRAFT_KEY } from "@/lib/auth";

const API_BASE = (import.meta.env["VITE_API_URL"] as string | undefined) ?? "http://localhost:8000";

export type ChatRole = "user" | "assistant";

export interface UploadedDocument {
  document_id: string;
  filename: string;
  word_count: number;
}

export interface GeneratedContract {
  contract_id: string;
  filename: string;
  download_url: string;
}

export type ApiContractType = "rent" | "employment" | "nda";

export interface ApiMessage {
  role: ChatRole;
  content: string;
  created_at: string;
}

export interface ApiConversationSummary {
  id: string;
  title: string;
  preview: string;
  created_at: string;
  updated_at: string;
}

export interface ApiConversationDetail extends ApiConversationSummary {
  messages: ApiMessage[];
}

/** Thrown on any non-2xx; carries the status for callers that care (e.g. 401) */
export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

function handle401() {
  clearStoredToken();
  try {
    // Preserve whatever the user was typing before bouncing to sign-in
    const draftEl = document.querySelector<HTMLTextAreaElement>("textarea");
    if (draftEl?.value.trim()) sessionStorage.setItem(DRAFT_KEY, draftEl.value);
  } catch {
    /* ignore */
  }
  if (!window.location.pathname.startsWith("/signin")) {
    window.location.href = "/signin?expired=1";
  }
}

function authHeaders(extra?: Record<string, string>): Record<string, string> {
  const token = getStoredToken();
  return {
    ...(extra ?? {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function parseError(res: Response): Promise<never> {
  let detail = `فشل الاتصال بالخادم (${res.status})`;
  try {
    const json = await res.json();
    if (typeof json?.detail === "string") detail = json.detail;
  } catch {
    /* ignore */
  }
  throw new ApiError(res.status, detail);
}

async function fetchWithTimeout(url: string, init: RequestInit, timeoutMs: number) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

// --- Auth ---

export async function authWithGoogle(
  credential: string,
): Promise<{ access_token: string; user: unknown }> {
  const res = await fetch(`${API_BASE}/api/auth/google`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ credential }),
  });
  if (!res.ok) await parseError(res);
  return res.json();
}

export async function fetchMe(): Promise<unknown> {
  const res = await fetch(`${API_BASE}/api/auth/me`, { headers: authHeaders() });
  if (res.status === 401) handle401();
  if (!res.ok) await parseError(res);
  return res.json();
}

// --- Conversations ---

export async function listConversations(): Promise<ApiConversationSummary[]> {
  const res = await fetchWithTimeout(
    `${API_BASE}/api/conversations`,
    { headers: authHeaders() },
    30_000,
  );
  if (res.status === 401) handle401();
  if (!res.ok) await parseError(res);
  return res.json();
}

export async function getConversation(id: string): Promise<ApiConversationDetail> {
  const res = await fetchWithTimeout(
    `${API_BASE}/api/conversations/${id}`,
    { headers: authHeaders() },
    30_000,
  );
  if (res.status === 401) handle401();
  if (!res.ok) await parseError(res);
  return res.json();
}

export async function createConversation(title: string): Promise<ApiConversationDetail> {
  const res = await fetchWithTimeout(
    `${API_BASE}/api/conversations`,
    {
      method: "POST",
      headers: authHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({ title }),
    },
    30_000,
  );
  if (res.status === 401) handle401();
  if (!res.ok) await parseError(res);
  return res.json();
}

// --- Chat / documents ---

export async function sendChat(opts: {
  message: string;
  history: { role: ChatRole; content: string }[];
  documentId?: string | null;
  lang: "ar" | "en";
  conversationId: string;
}): Promise<string> {
  const res = await fetchWithTimeout(
    `${API_BASE}/api/chat`,
    {
      method: "POST",
      headers: authHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({
        message: opts.message,
        history: opts.history,
        language: opts.lang,
        conversation_id: opts.conversationId,
        ...(opts.documentId ? { document_id: opts.documentId } : {}),
      }),
    },
    120_000,
  );
  if (res.status === 401) handle401();
  if (!res.ok) await parseError(res);
  const json = await res.json();
  if (typeof json?.reply !== "string") throw new Error("رد غير صالح من الخادم");
  return json.reply;
}

export async function uploadDocument(file: File): Promise<UploadedDocument> {
  const form = new FormData();
  form.append("file", file);
  const res = await fetchWithTimeout(
    `${API_BASE}/api/documents/upload`,
    { method: "POST", headers: authHeaders(), body: form },
    60_000,
  );
  if (res.status === 401) handle401();
  if (!res.ok) await parseError(res);
  return res.json();
}

export async function generateContract(opts: {
  contractType: ApiContractType;
  party1Name: string;
  party2Name: string;
  terms: Record<string, string>;
  lang: "ar" | "en";
}): Promise<GeneratedContract> {
  const res = await fetchWithTimeout(
    `${API_BASE}/api/documents/generate-contract`,
    {
      method: "POST",
      headers: authHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({
        contract_type: opts.contractType,
        party1_name: opts.party1Name,
        party2_name: opts.party2Name,
        language: opts.lang,
        terms: opts.terms,
      }),
    },
    120_000,
  );
  if (res.status === 401) handle401();
  if (!res.ok) await parseError(res);
  return res.json();
}

export function contractDownloadUrl(contractId: string): string {
  const token = getStoredToken();
  // Browser navigations can't set Authorization headers — pass the JWT as a query param
  return `${API_BASE}/api/documents/download/${contractId}${token ? `?token=${encodeURIComponent(token)}` : ""}`;
}
