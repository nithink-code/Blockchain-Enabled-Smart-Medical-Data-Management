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
    window.dispatchEvent(new Event("medchain:recent-activity-updated"));
  } catch {
    // Ignore storage errors in the browser.
  }
}

export function deleteRecentActivity(recordId: string) {
  if (typeof window === "undefined") return;

  try {
    const existing = loadRecentActivity();
    const next = existing.filter((item) => item.id !== recordId);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event("medchain:recent-activity-updated"));
  } catch {
    // Ignore storage errors in the browser.
  }
}

function normalizeRecord(input: unknown): RecentActivityRecord | null {
  if (!input || typeof input !== "object") return null;
  const value = input as Record<string, unknown>;

  const status = value.status === "Processing" ? "Processing" : "Analyzed";
  const confidence =
    typeof value.confidence === "number" && Number.isFinite(value.confidence)
      ? value.confidence
      : null;

  return {
    id: String(value.id ?? Date.now()),
    title: String(value.title ?? "Medical Report"),
    date: String(value.date ?? new Date().toLocaleDateString()),
    provider: String(value.provider ?? "Patient Upload"),
    status,
    type: String(value.type ?? "Report"),
    cid: String(value.cid ?? "Pending"),
    aiSummary: typeof value.aiSummary === "string" ? value.aiSummary : null,
    conditions: Array.isArray(value.conditions)
      ? value.conditions.map((item: unknown) => String(item))
      : [],
    confidence,
  };
}
