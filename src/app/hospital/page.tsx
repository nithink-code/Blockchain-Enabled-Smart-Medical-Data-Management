"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Hourglass,
  Lock,
  ShieldCheck,
  Sparkles,
  User,
  X,
} from "lucide-react";
import { loadRecentActivity, parseProviderLabel, type RecentActivityRecord } from "@/lib/recent-activity";
import {
  loadAccessRequests,
  createAccessRequest,
  getAccessRequestEventName,
  type AccessRequest,
} from "@/lib/access-requests";
import { showToast } from "@/components/toast";

const ACCESS_REQUESTS_POLL_MS = 8000;

type RecordView = RecentActivityRecord & {
  patientLabel: string;
  ageGender: string;
  statusClass: string;
};

function toRecordView(record: RecentActivityRecord): RecordView {
  const parsed = parseProviderLabel(record.provider);
  const ageGender = [parsed.age, parsed.gender].filter(Boolean).join(" ");
  const patientLabel = parsed.name || "Patient";
  const confidence =
    typeof record.confidence === "number" ? record.confidence : null;
  const statusClass =
    record.status === "Processing"
      ? "text-orange-300 bg-orange-500/10 border-orange-500/10"
      : confidence !== null && confidence >= 80
        ? "text-emerald-300 bg-emerald-500/10 border-emerald-500/10"
        : "text-blue-300 bg-blue-500/10 border-blue-500/10";

  return {
    ...record,
    patientLabel,
    ageGender,
    statusClass,
  };
}

export default function HospitalDashboard() {
  const [records, setRecords] = useState<RecordView[]>([]);
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [doctorName, setDoctorName] = useState("Doctor");
  const [requestModalRecord, setRequestModalRecord] = useState<RecordView | null>(null);
  const router = useRouter();

  useEffect(() => {
    const syncRecords = () => {
      const next = loadRecentActivity().map(toRecordView);
      setRecords(next);
    };
    const syncRequests = () => {
      loadAccessRequests().then(setRequests);
    };

    syncRecords();
    syncRequests();

    fetch("/api/user/me")
      .then((r) => r.json())
      .then((data) => setDoctorName(data.name || "Doctor"))
      .catch(() => setDoctorName("Doctor"));

    const eventName = getAccessRequestEventName();
    window.addEventListener("storage", syncRecords);
    window.addEventListener("medchain:recent-activity-updated", syncRecords as EventListener);
    window.addEventListener(eventName, syncRequests as EventListener);
    window.addEventListener("focus", syncRequests);

    const pollId = window.setInterval(syncRequests, ACCESS_REQUESTS_POLL_MS);

    return () => {
      window.removeEventListener("storage", syncRecords);
      window.removeEventListener("medchain:recent-activity-updated", syncRecords as EventListener);
      window.removeEventListener(eventName, syncRequests as EventListener);
      window.removeEventListener("focus", syncRequests);
      window.clearInterval(pollId);
    };
  }, []);

  const latestStatusByRecordId = useMemo(() => {
    const map = new Map<string, AccessRequest>();
    for (const req of requests) {
      const existing = map.get(req.recordId);
      if (!existing || req.requestedAt >= existing.requestedAt) {
        map.set(req.recordId, req);
      }
    }
    return map;
  }, [requests]);

  async function handleSubmitRequest(reason: string, hospitalName: string) {
    if (!requestModalRecord) return;

    const created = await createAccessRequest({
      recordId: requestModalRecord.id,
      cid: requestModalRecord.cid,
      patientName: requestModalRecord.patientLabel,
      patientInfo: requestModalRecord.ageGender,
      reportTitle: requestModalRecord.title,
      reportType: requestModalRecord.type,
      hospitalName: hospitalName.trim() || "Unspecified Hospital",
      reason: reason.trim(),
    });

    if (!created) {
      showToast("Failed to send access request", "error");
      return;
    }

    setRequests((prev) => [created, ...prev]);
    setRequestModalRecord(null);
    showToast("Access request sent to patient", "success");
  }

  return (
    <div className="space-y-8 pb-10 animate-fade-in mt-20!">
      <div className="space-y-2 text-center">
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-emerald-400 mb-10!">
          Medical dashboard
        </p>
        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
          Recent Patient Records
        </h1>
        <p className="mx-auto max-w-3xl text-base text-zinc-400 sm:text-lg mt-5! ml-60! mb-8!">
          Patient records appear here immediately after upload and are centered for a clean
          dashboard view.
        </p>
      </div>

      <div className="mx-auto w-full max-w-[1120px] space-y-4">
        <div className="flex items-end justify-between gap-4 px-1 ml-10! mb-8!">
          <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-500 ml-130! mb-10! mt-6!">
              Patient Reports
            </p>
            <h2 className="ml-6! text-2xl font-bold tracking-tight text-white">
              Uploaded patient Reports
            </h2>
          </div>
        </div>

        {records.length === 0 ? (
          <div className="flex min-h-[300px] w-full flex-col items-center justify-center rounded-[28px] border border-dashed border-white/10 bg-white/[0.02] px-6 text-center">
            <Sparkles size={28} className="text-zinc-500" />
            <h3 className="mt-4 text-xl font-bold text-white">No patient records yet</h3>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-zinc-500">
              Upload a medical report from the patient dashboard and the latest record card
              will show up here automatically.
            </p>
          </div>
        ) : (
          <div className="grid w-full auto-rows-fr gap-8 sm:grid-cols-2 justify-items-stretch lg:translate-x-8 xl:translate-x-12">
            {records.map((record) => (
              <PatientRecordCard
                key={record.id}
                record={record}
                accessRequest={latestStatusByRecordId.get(record.id) ?? null}
                onRequestAccess={() => setRequestModalRecord(record)}
                onViewDetails={() => router.push(`/hospital/records/${record.id}`)}
              />
            ))}
          </div>
        )}
      </div>

      {requestModalRecord && (
        <RequestAccessModal
          record={requestModalRecord}
          doctorName={doctorName}
          onClose={() => setRequestModalRecord(null)}
          onSubmit={handleSubmitRequest}
        />
      )}
    </div>
  );
}

function PatientRecordCard({
  record,
  accessRequest,
  onRequestAccess,
  onViewDetails,
}: {
  record: RecordView;
  accessRequest: AccessRequest | null;
  onRequestAccess: () => void;
  onViewDetails: () => void;
}) {
  const status = accessRequest?.status ?? "none";
  const requestStatusLabel =
    status === "approved"
      ? "Approved"
      : status === "pending"
        ? "Pending"
        : status === "denied"
          ? "Denied"
          : "Not Requested";
  const requestStatusClass =
    status === "approved"
      ? "text-emerald-400"
      : status === "pending"
        ? "text-orange-300"
        : status === "denied"
          ? "text-red-400"
          : "text-zinc-500";

  return (
    <div className="glass-card flex h-full min-h-[420px]! w-full flex-col rounded-[28px] border border-white/5 px-16! pb-5! pt-20! transition-all duration-300 hover:border-white/10">
      <div className="flex items-center justify-between gap-6">
        <div className="min-w-0 space-y-2 pr-4!">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-500">
            {record.type}
          </p>
          <h3 className="text-lg font-bold tracking-tight text-white line-clamp-1 md:text-xl">
            {record.title}
          </h3>
        </div>

        <span className={`shrink-0 pl-4! text-[10px] font-bold uppercase tracking-widest ${requestStatusClass}`}>
          {requestStatusLabel}
        </span>
      </div>

      <div className="mt-8! flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-500">
        <User size={14} className="text-blue-400" />
        Basic details
      </div>

      <div className="mt-6 flex flex-col gap-6">
        <DetailRow plain label="Patient" value={record.patientLabel} />
        <DetailRow plain label="Age" value={record.ageGender || "Not provided"} />
        <DetailRow plain label="Report" value={record.title} />
        <DetailRow plain label="Uploaded" value={record.date} />
      </div>

      <div className="mt-14! flex justify-center">
        {status === "approved" ? (
          <button
            onClick={onViewDetails}
            className="flex h-11 w-48 items-center justify-center gap-2 rounded-2xl bg-emerald-600 text-sm font-bold text-white shadow-lg shadow-emerald-500/10 transition-all hover:scale-[1.02] hover:bg-emerald-500 active:scale-[0.98]"
          >
            <ShieldCheck size={16} /> View Full Details
          </button>
        ) : status === "pending" ? (
          <button
            disabled
            className="flex h-11 w-48 cursor-not-allowed items-center justify-center gap-2 rounded-2xl border border-orange-500/10 bg-orange-500/5 text-sm font-bold text-orange-300"
          >
            <Hourglass size={16} /> Request Pending
          </button>
        ) : (
          <button
            onClick={onRequestAccess}
            className="flex h-11 w-48 items-center justify-center gap-2 rounded-2xl bg-emerald-600 text-sm font-bold text-white shadow-lg shadow-emerald-500/10 transition-all hover:scale-[1.02] hover:bg-emerald-500 active:scale-[0.98]"
          >
            <Lock size={16} /> {status === "denied" ? "Request Again" : "Request Access"}
          </button>
        )}
      </div>
    </div>
  );
}

function RequestAccessModal({
  record,
  doctorName,
  onClose,
  onSubmit,
}: {
  record: RecordView;
  doctorName: string;
  onClose: () => void;
  onSubmit: (reason: string, hospitalName: string) => void;
}) {
  const [reason, setReason] = useState("");
  const [hospitalName, setHospitalName] = useState("");

  const canSubmit = reason.trim().length > 0 && hospitalName.trim().length > 0;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in">
      <div className="w-full max-w-lg min-h-[300px]! rounded-[28px] border border-white/10 bg-zinc-950 shadow-2xl shadow-black/60 px-14! py-4! sm:px-16!">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-emerald-400">
              Request Patient Access
            </p>
            <h3 className="mt-2 text-xl font-bold text-white">{record.patientLabel}</h3>
            <p className="mt-1 text-sm text-zinc-500">{record.title}</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-full p-2 text-zinc-500 transition-colors hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-6! space-y-4!">
          <div className="space-y-3!">
            <DetailRow plain label="Patient" value={record.patientLabel} />
            <DetailRow plain label="Age" value={record.ageGender || "Not provided"} />
            <DetailRow plain label="Requesting Doctor" value={doctorName} />
          </div>

          <div className="space-y-1.5!">
            <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">
              Hospital / Clinic Name
            </label>
            <input
              type="text"
              value={hospitalName}
              onChange={(e) => setHospitalName(e.target.value)}
              placeholder="e.g. Apollo Hospitals"
              className="w-full rounded-xl border border-white/10 bg-black/30 px-5! py-3! text-sm text-white placeholder:text-zinc-600 outline-none transition-colors focus:border-emerald-500/30"
            />
          </div>

          <div className="space-y-1.5!">
            <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">
              Reason for Access
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Explain why you need access to this patient's full record..."
              rows={3}
              className="w-full resize-none rounded-xl border border-white/10 bg-black/30 px-5! py-3! text-sm text-white placeholder:text-zinc-600 outline-none transition-colors focus:border-emerald-500/30"
            />
          </div>
        </div>

        <div className="mt-6! flex justify-end gap-3 pr-6!">
          <button
            onClick={onClose}
            className="flex h-11 w-32 items-center justify-center gap-2 rounded-xl border border-white/5 bg-white/[0.03] text-sm font-bold text-zinc-400 transition-all hover:border-red-500/10 hover:bg-red-500/5 hover:text-red-400"
          >
            Cancel
          </button>
          <button
            disabled={!canSubmit}
            onClick={() => onSubmit(reason, hospitalName)}
            className="flex h-11 w-52 items-center justify-center gap-2 rounded-xl bg-emerald-600/90 text-sm font-bold text-white shadow-lg shadow-emerald-500/10 transition-all enabled:hover:scale-[1.02] enabled:hover:bg-emerald-500 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Lock size={16} /> Request Access
          </button>
        </div>
      </div>
    </div>
  );
}

function DetailRow({
  label,
  value,
  mono = false,
  plain = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
  plain?: boolean;
}) {
  if (plain) {
    return (
      <div className="flex items-center justify-between gap-5">
        <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">{label}</p>
        <p className={`max-w-[58%] truncate text-sm font-semibold text-zinc-200 ${mono ? "font-mono text-[11px]" : ""}`}>
          {value}
        </p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between gap-5 rounded-2xl border border-white/5 bg-black/20 px-4 py-3">
      <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">{label}</p>
      <p className={`max-w-[58%] truncate text-sm font-semibold text-zinc-200 ${mono ? "font-mono text-[11px]" : ""}`}>
        {value}
      </p>
    </div>
  );
}

