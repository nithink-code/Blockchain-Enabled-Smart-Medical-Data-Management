"use client";

import { useState, useEffect, type ReactNode } from "react";
import {
  ShieldCheck,
  ShieldAlert,
  Clock,
  CheckCircle2,
  X,
  TimerOff,
  FileText,
  Calendar,
  MessageSquare
} from "lucide-react";
import {
  loadAccessRequests,
  updateAccessRequestStatus,
  getAccessRequestEventName,
  type AccessRequest,
} from "@/lib/access-requests";

const ACCESS_REQUESTS_POLL_MS = 8000;

function formatRequestedAt(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function ConsentPage() {
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  function dismiss(id: string) {
    setDismissedIds((prev) => new Set(prev).add(id));
  }

  useEffect(() => {
    const sync = () => {
      loadAccessRequests().then(setRequests);
    };
    sync();

    const eventName = getAccessRequestEventName();
    window.addEventListener("storage", sync);
    window.addEventListener(eventName, sync as EventListener);
    window.addEventListener("focus", sync);

    const pollId = window.setInterval(sync, ACCESS_REQUESTS_POLL_MS);

    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener(eventName, sync as EventListener);
      window.removeEventListener("focus", sync);
      window.clearInterval(pollId);
    };
  }, []);

  async function applyStatus(id: string, status: "approved" | "denied" | "expired") {
    const updated = await updateAccessRequestStatus(id, status);
    if (!updated) return;
    setRequests((prev) => prev.map((r) => (r.id === id ? updated : r)));
  }

  function approve(id: string) {
    applyStatus(id, "approved");
  }

  function deny(id: string) {
    applyStatus(id, "denied");
  }

  function revoke(id: string) {
    applyStatus(id, "expired");
  }

  const visibleRequests = requests.filter(r => !dismissedIds.has(r.id));
  const pending = visibleRequests.filter(r => r.status === "pending");
  const approved = visibleRequests.filter(r => r.status === "approved" || r.status === "expired");
  const history = visibleRequests.filter(r => r.status === "denied");

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-14 px-6 pb-16 pt-20 animate-fade-in lg:px-8 lg:pt-24">
      <div className="flex flex-col items-center justify-between gap-8 pb-6 text-center md:flex-row md:items-center md:text-left">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight text-white">Access Governance</h1>
          <p className="text-zinc-500 text-lg font-medium">Control who can access your medical records on the blockchain.</p>
        </div>
        <div className="flex items-center gap-4 rounded-2xl border border-blue-500/10 bg-blue-500/[0.02] px-6 py-3.5">
          <ShieldCheck size={20} className="text-blue-400" />
          <div className="flex flex-col">
            <span className="mb-1 text-[10px] font-bold uppercase leading-none tracking-widest text-zinc-500">Status</span>
            <span className="text-sm font-bold text-blue-300">Identity Shield Active</span>
          </div>
        </div>
      </div>

      {/* Pending Requests */}
      {/* Pending Requests */}
      {pending.length > 0 && (
        <section className="flex flex-col">
          <div className="flex items-center justify-center gap-4">
            <h2 className="text-2xl font-bold text-white tracking-tight">Manage Request Access</h2>
          </div>
          <div className="mt-10 grid grid-cols-1 justify-items-center gap-10 md:grid-cols-2 md:gap-10 mt-8!">
            {pending.map(req => (
              <RequestCard
                key={req.id}
                req={req}
                onApprove={() => approve(req.id)}
                onDeny={() => deny(req.id)}
                onDismiss={() => dismiss(req.id)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Active Approved Accesses */}
      {approved.length > 0 && (
        <section className="flex flex-col">
          <div className="flex items-center justify-center gap-4">
            <h2 className="text-2xl font-bold text-white tracking-tight">Manage Request Access</h2>
          </div>
          <div className="mt-10 grid grid-cols-1 justify-items-center gap-10 md:grid-cols-2 md:gap-10 mt-8!">
            {approved.map(req => (
              <ActiveAccessCard
                key={req.id}
                req={req}
                onRevoke={() => revoke(req.id)}
                onDismiss={() => dismiss(req.id)}
              />
            ))}
          </div>
        </section>
      )}

      {/* History */}
      {history.length > 0 && (
        <section className="space-y-8">
          <h2 className="text-2xl font-bold text-white tracking-tight text-center">Audit Trail</h2>
          <div className="glass-card rounded-[32px] mt-8! border border-white/5 overflow-hidden divide-y divide-white/[0.03]">
            {history.map(req => (
              <div key={req.id} className="flex items-center gap-6 pl-24 pr-10 py-8! group hover:bg-white/[0.01] transition-colors">
                <div className={`flex h-12 w-12 ml-8! shrink-0 items-center justify-center rounded-2xl border transition-all duration-500 ${
                  req.status === "denied" ? "bg-red-500/5 border-red-500/10 text-red-500" : "bg-white/[0.02] border-white/5 text-zinc-500"
                }`}>
                  {req.status === "denied" ? <ShieldAlert size={22} /> : <TimerOff size={22} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-base font-bold text-white group-hover:text-blue-400 transition-colors">{req.hospitalName}</p>
                  <div className="flex items-center gap-3 text-[13px] text-zinc-500 mt-1 font-medium">
                    <span className="tracking-tight">{req.doctorName}</span>
                    <span className="text-zinc-700 opacity-50">|</span>
                    <span className="tracking-tight opacity-70">{formatRequestedAt(req.requestedAt)}</span>
                  </div>
                </div>
                <span className={`text-[10px] mr-8! font-bold px-4 py-2 rounded-full border tracking-widest uppercase whitespace-nowrap ${
                  req.status === "denied"
                    ? "bg-red-500/5 border-red-500/10 text-red-400"
                    : "bg-white/[0.02] border-white/5 text-zinc-500"
                }`}>
                  {req.status === "denied" ? "Access Denied" : "Expired"}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex w-36 shrink-0 items-center gap-2 pt-0.5 text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-600">
        {icon}
        {label}
      </div>
      <p className="flex-1 text-left text-[15px] font-medium leading-6 text-zinc-300">{value}</p>
    </div>
  );
}

function RequestCard({ req, onApprove, onDeny, onDismiss }: {
  req: AccessRequest;
  onApprove: () => void;
  onDeny: () => void;
  onDismiss: () => void;
}) {
  return (
    <div className="glass-card relative flex w-full max-w-[470px] min-h-[420px] flex-col overflow-hidden rounded-[28px] border border-orange-500/10 bg-orange-500/[0.01] transition-all hover:bg-orange-500/[0.02]">
      <button
        onClick={onDismiss}
        aria-label="Dismiss card"
        className="absolute top-4 right-4 z-10 rounded-full p-1.5 text-zinc-500 transition-colors hover:text-white"
      >
        <X size={16} />
      </button>
      <div className="mx-auto flex w-[86%] flex-col gap-6 px-3! pt-12! pb-4!">
        {/* Header */}
        <div className="space-y-2">
          <p className="mb-3! pl-14! text-center text-lg font-bold tracking-tight text-white">{req.hospitalName}</p>
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-1 pl-14!">
              <p className="text-sm font-medium text-zinc-500">{req.doctorName}</p>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-400/70">{req.speciality}</p>
            </div>
            <span className="shrink-0 rounded-lg px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-orange-400">
              Pending
            </span>
          </div>
        </div>

        {/* Meta row */}
        <div className="flex items-center gap-6 border-t border-white/[0.03] pt-4 pl-14! text-sm font-medium text-zinc-500">
          <span className="flex items-center gap-2"><Clock size={14} className="text-zinc-600" /> {formatRequestedAt(req.requestedAt)}</span>
          <span className="flex items-center gap-2"><Calendar size={14} className="text-zinc-600" /> {req.requestedDuration} session</span>
        </div>

        {/* Info rows */}
        <div className="space-y-6! pl-14!">
          <InfoRow
            icon={<MessageSquare size={12} className="text-blue-400/50" />}
            label="Clinical Rationale"
            value={req.reason || "No reason provided."}
          />
          <InfoRow
            icon={<FileText size={12} className="text-blue-400/50" />}
            label="Requested Scope"
            value={req.reportTitle}
          />
        </div>

        {/* Actions */}
        <div className="flex justify-center gap-3 pt-1">
          <button
            onClick={onApprove}
            className="flex h-10 w-36 items-center justify-center gap-2 rounded-xl bg-emerald-600/90 text-xs font-bold text-white shadow-lg shadow-emerald-500/10 transition-all hover:scale-[1.02] hover:bg-emerald-500 active:scale-[0.98]"
          >
            <CheckCircle2 size={14} /> Approve Access
          </button>
          <button
            onClick={onDeny}
            className="flex h-10 w-28 items-center justify-center gap-2 rounded-xl border border-white/5 bg-white/[0.03] text-xs font-bold text-zinc-400 transition-all hover:border-red-500/10 hover:bg-red-500/5 hover:text-red-400"
          >
            <X size={14} /> Deny
          </button>
        </div>
      </div>
    </div>
  );
}
function ActiveAccessCard({ req, onRevoke, onDismiss }: { req: AccessRequest; onRevoke: () => void; onDismiss: () => void }) {
  const isRevoked = req.status === "expired";

  return (
    <div className="glass-card relative flex w-full max-w-[470px] min-h-[420px] flex-col overflow-hidden rounded-[28px] border border-emerald-500/10 bg-emerald-500/[0.01] transition-all hover:bg-emerald-500/[0.02]">
      <button
        onClick={onDismiss}
        aria-label="Dismiss card"
        className="absolute top-4 right-4 z-10 rounded-full p-1.5 text-zinc-500 transition-colors hover:text-white"
      >
        <X size={16} />
      </button>
      <div className="mx-auto flex w-[86%] flex-col gap-6 px-3! pt-12! pb-4!">
        {/* Header */}
        <div className="space-y-2">
          <p className="mb-3! pl-14! text-center text-lg font-bold tracking-tight text-white">{req.hospitalName}</p>
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-1 pl-14!">
              <p className="text-sm font-medium text-zinc-500">{req.doctorName}</p>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-400/70">{req.speciality}</p>
            </div>
            <span
              className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] ${
                isRevoked ? "text-red-400" : "text-emerald-400"
              }`}
            >
              {isRevoked ? <TimerOff size={14} /> : <CheckCircle2 size={14} />} {isRevoked ? "Revoked" : "Approved"}
            </span>
          </div>
        </div>

        {/* Meta row */}
        <div className="flex items-center gap-6 border-t border-white/[0.03] pt-4 pl-14! text-sm font-medium text-zinc-500">
          <span className="flex items-center gap-2"><Clock size={14} className="text-zinc-600" /> {formatRequestedAt(req.requestedAt)}</span>
          <span className="flex items-center gap-2"><Calendar size={14} className="text-zinc-600" /> {req.requestedDuration} session</span>
        </div>

        {/* Info rows */}
        <div className="space-y-6! pl-14!">
          <InfoRow
            icon={<MessageSquare size={12} className="text-blue-400/50" />}
            label="Clinical Rationale"
            value={req.reason || "No reason provided."}
          />
          <InfoRow
            icon={<FileText size={12} className="text-blue-400/50" />}
            label="Requested Scope"
            value={req.reportTitle}
          />
        </div>

        {/* Actions */}
        {!isRevoked && (
          <div className="flex justify-center gap-3 pt-1">
            <button
              onClick={onRevoke}
              className="flex h-10 w-44 items-center justify-center gap-2 rounded-xl border border-white/5 bg-white/[0.03] text-xs font-bold text-red-400/80 transition-all hover:border-red-500/10 hover:bg-red-500/5 hover:text-red-400"
            >
              <TimerOff size={16} /> Revoke Access
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
