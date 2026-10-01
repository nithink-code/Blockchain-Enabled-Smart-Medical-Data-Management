export interface MedicalRecordItem {
  id: string;
  patientId: string;
  patientName: string;
  patientEmail: string;
  title: string;
  type: string;
  cid: string;
  extractedContent: string;
  aiSummary: string;
  prediction: string;
  probability: {
    benign: number;
    malignant: number;
  };
  explanation: {
    lime_local_impact: [string, number][];
    shap_global_contribution: Record<string, number>;
  };
  conditions: string[];
  confidence: number;
  reportDate: string;
  createdAt: string;
}

function normalizeRecord(raw: Record<string, unknown>): MedicalRecordItem {
  const prob = (raw.probability ?? {}) as Record<string, unknown>;
  const expl = (raw.explanation ?? {}) as Record<string, unknown>;
  const lime = Array.isArray(expl.lime_local_impact)
    ? (expl.lime_local_impact as unknown[]).filter(
        (item): item is [string, number] =>
          Array.isArray(item) && typeof item[0] === "string" && typeof item[1] === "number"
      )
    : [];
  const shapRaw = expl.shap_global_contribution;
  const shap: Record<string, number> =
    shapRaw && typeof shapRaw === "object" && !Array.isArray(shapRaw)
      ? Object.fromEntries(
          Object.entries(shapRaw as Record<string, unknown>).filter(
            ([, v]) => typeof v === "number"
          ) as [string, number][]
        )
      : {};

  return {
    id: String(raw._id ?? raw.id ?? ""),
    patientId: String(raw.patientId ?? ""),
    patientName: String(raw.patientName ?? "Patient"),
    patientEmail: String(raw.patientEmail ?? ""),
    title: String(raw.title ?? "Medical Report"),
    type: String(raw.type ?? "Report"),
    cid: String(raw.cid ?? "Pending"),
    extractedContent: String(raw.extractedContent ?? ""),
    aiSummary: String(raw.aiSummary ?? ""),
    prediction: String(raw.prediction ?? "Unknown"),
    probability: {
      benign: typeof prob.benign === "number" ? prob.benign : 0,
      malignant: typeof prob.malignant === "number" ? prob.malignant : 0,
    },
    explanation: { lime_local_impact: lime, shap_global_contribution: shap },
    conditions: Array.isArray(raw.conditions)
      ? (raw.conditions as unknown[]).map((c) => String(c))
      : [],
    confidence: typeof raw.confidence === "number" ? raw.confidence : 0,
    reportDate: String(raw.reportDate ?? new Date().toISOString()),
    createdAt: String(raw.createdAt ?? new Date().toISOString()),
  };
}

export async function loadMedicalRecords(): Promise<MedicalRecordItem[]> {
  const res = await fetch("/api/medical-records", { cache: "no-store" });
  if (!res.ok) return [];
  const data = await res.json().catch(() => null);
  const records = Array.isArray(data?.records) ? data.records : [];
  return records.map((item: Record<string, unknown>) => normalizeRecord(item));
}

export async function createMedicalRecord(
  input: Record<string, unknown>
): Promise<MedicalRecordItem | null> {
  const res = await fetch("/api/medical-records", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) return null;
  const data = await res.json().catch(() => null);
  if (!data?.record) return null;
  return normalizeRecord(data.record);
}
