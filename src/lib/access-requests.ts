export type AccessRequestStatus = "pending" | "approved" | "denied" | "expired";

export interface AccessRequest {
  id: string;
  recordId: string;
  cid: string;
  patientName: string;
  patientInfo: string;
  reportTitle: string;
  reportType: string;
  doctorName: string;
  hospitalName: string;
  speciality: string;
  reason: string;
  requestedDuration: string;
  requestedAt: string;
  status: AccessRequestStatus;
  approvedAt?: string;
  expiresAt?: string;
}

export interface NewAccessRequestInput {
  recordId: string;
  cid: string;
  patientName: string;
  patientInfo: string;
  reportTitle: string;
  reportType: string;
  hospitalName: string;
  reason: string;
}

const EVENT_NAME = "medchain:access-requests-updated";

function normalizeRequest(raw: Record<string, unknown>): AccessRequest {
  const status: AccessRequestStatus =
    raw.status === "approved" || raw.status === "denied" || raw.status === "expired"
      ? raw.status
      : "pending";

  return {
    id: String(raw._id ?? raw.id ?? ""),
    recordId: String(raw.recordId ?? ""),
    cid: String(raw.cid ?? "Pending"),
    patientName: String(raw.patientName ?? "Patient"),
    patientInfo: String(raw.patientInfo ?? ""),
    reportTitle: String(raw.reportTitle ?? "Medical Report"),
    reportType: String(raw.reportType ?? "Report"),
    doctorName: String(raw.doctorName ?? "Doctor"),
    hospitalName: String(raw.hospitalName ?? "Unspecified Hospital"),
    speciality: String(raw.speciality ?? "General Medicine"),
    reason: String(raw.reason ?? ""),
    requestedDuration: String(raw.requestedDuration ?? "24 hours"),
    requestedAt: String(raw.createdAt ?? raw.requestedAt ?? new Date().toISOString()),
    status,
    approvedAt: typeof raw.approvedAt === "string" ? raw.approvedAt : undefined,
    expiresAt: typeof raw.expiresAt === "string" ? raw.expiresAt : undefined,
  };
}

export async function loadAccessRequests(): Promise<AccessRequest[]> {
  const res = await fetch("/api/access-requests", { cache: "no-store" });
  if (!res.ok) return [];

  const data = await res.json().catch(() => null);
  const requests = Array.isArray(data?.requests) ? data.requests : [];
  return requests.map((item: Record<string, unknown>) => normalizeRequest(item));
}

export async function createAccessRequest(input: NewAccessRequestInput): Promise<AccessRequest | null> {
  const res = await fetch("/api/access-requests", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!res.ok) return null;

  const data = await res.json().catch(() => null);
  if (!data?.request) return null;

  notifyUpdated();
  return normalizeRequest(data.request);
}

export async function updateAccessRequestStatus(
  id: string,
  status: AccessRequestStatus
): Promise<AccessRequest | null> {
  const res = await fetch(`/api/access-requests/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });

  if (!res.ok) return null;

  const data = await res.json().catch(() => null);
  if (!data?.request) return null;

  notifyUpdated();
  return normalizeRequest(data.request);
}

function notifyUpdated() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(EVENT_NAME));
}

export function getAccessRequestEventName() {
  return EVENT_NAME;
}
