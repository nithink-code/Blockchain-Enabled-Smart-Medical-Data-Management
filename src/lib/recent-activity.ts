export type RecentActivityRecord = {
  id: string;
  title: string;
  date: string;
  provider: string;
  status: "Analyzed" | "Processing";
  type: string;
  cid: string;
  aiSummary: string | null;
  conditions: string[];
  confidence: number | null;
};

const STORAGE_KEY = "medchain:recent-activity";
const MAX_RECORDS = 20;

export function loadRecentActivity(): RecentActivityRecord[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter(Boolean)
      .map((item) => normalizeRecord(item))
      .filter((item): item is RecentActivityRecord => item !== null);
  } catch {
    return [];
  }
}

export function saveRecentActivity(record: RecentActivityRecord) {
  if (typeof window === "undefined") return;

  try {
    const existing = loadRecentActivity();
    const next = [record, ...existing.filter((item) => item.id !== record.id)].slice(0, MAX_RECORDS);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Ignore storage errors in the browser.
  }
}

function normalizeRecord(input: any): RecentActivityRecord | null {
  if (!input || typeof input !== "object") return null;

  const status = input.status === "Processing" ? "Processing" : "Analyzed";
  const confidence =
    typeof input.confidence === "number" && Number.isFinite(input.confidence)
      ? input.confidence
      : null;

  return {
    id: String(input.id ?? Date.now()),
    title: String(input.title ?? "Medical Report"),
    date: String(input.date ?? new Date().toLocaleDateString()),
    provider: String(input.provider ?? "Patient Upload"),
    status,
    type: String(input.type ?? "Report"),
    cid: String(input.cid ?? "Pending"),
    aiSummary: typeof input.aiSummary === "string" ? input.aiSummary : null,
    conditions: Array.isArray(input.conditions)
      ? input.conditions.map((item: unknown) => String(item))
      : [],
    confidence,
  };
}
