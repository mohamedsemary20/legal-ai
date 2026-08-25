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

async function parseError(res: Response): Promise<never> {
  let detail = `فشل الاتصال بالخادم (${res.status})`;
  try {
    const json = await res.json();
    if (typeof json?.detail === "string") detail = json.detail;
  } catch {
    /* ignore */
  }
  throw new Error(detail);
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

export async function sendChat(opts: {
  message: string;
  history: { role: ChatRole; content: string }[];
  documentId?: string | null;
  lang: "ar" | "en";
}): Promise<string> {
  const res = await fetchWithTimeout(
    `${API_BASE}/api/chat`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: opts.message,
        history: opts.history,
        language: opts.lang,
        ...(opts.documentId ? { document_id: opts.documentId } : {}),
      }),
    },
    120_000,
  );
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
    { method: "POST", body: form },
    60_000,
  );
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
      headers: { "Content-Type": "application/json" },
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
  if (!res.ok) await parseError(res);
  return res.json();
}

export function contractDownloadUrl(contractId: string): string {
  return `${API_BASE}/api/documents/download/${contractId}`;
}
