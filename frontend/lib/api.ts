export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export type HistoryMessage = { role: "user" | "assistant"; content: string };

export type QueryRequest = {
  question: string;
  thread_id: string | null;
  history: HistoryMessage[];
};

export type QueryResponse = { answer: string; thread_id: string };

export async function sendQuery(body: QueryRequest): Promise<QueryResponse> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}/query`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error(`Can't reach the trip planner backend at ${API_URL}. Is it running?`);
  }

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(data?.error ?? `The agent failed to respond (HTTP ${res.status}).`);
  }
  return data as QueryResponse;
}

export async function checkHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${API_URL}/health`, { cache: "no-store" });
    return res.ok;
  } catch {
    return false;
  }
}
