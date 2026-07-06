"use client";

import { useState, useEffect } from "react";
import { 
  ShieldCheck, 
  ShieldAlert,
  Clock, 
  Hospital,
  CheckCircle2,
  X,
  TimerOff,
  FileText,
  Lock,
  Unlock,
  Calendar,
  MessageSquare
} from "lucide-react";

type RequestStatus = "pending" | "approved" | "denied" | "expired";

interface AccessRequest {
  id: number;
  hospital: string;
  doctor: string;
  speciality: string;
  requestedAt: string;
  reason: string;
  requestedDuration: string; // e.g. "48 hours"
  status: RequestStatus;
  approvedAt?: string;
  expiresAt?: Date;
  reportScope: string;
}

const INITIAL_REQUESTS: AccessRequest[] = [
  {
    id: 1,
    hospital: "Apollo Hospitals",
    doctor: "Dr. Rajesh Kumar",
    speciality: "Cardiology",
    requestedAt: "2 hours ago",
    reason: "Patient referred for cardiac evaluation. Requires prior blood reports and ECG results for accurate diagnosis.",
    requestedDuration: "48 hours",
    status: "pending",
    reportScope: "Cardiovascular Panel, Metabolic Screening",
  },
  {
    id: 2,
    hospital: "AIIMS New Delhi",
    doctor: "Dr. Priya Sharma",
    speciality: "Neurology",
    requestedAt: "5 hours ago",
    reason: "Seeking second opinion on neurological assessment. Need access to imaging reports.",
    requestedDuration: "24 hours",
    status: "pending",
    reportScope: "Neurological Assessment, Radiology - Chest",
  },
  {
    id: 3,
    hospital: "Fortis Healthcare",
    doctor: "Dr. Anil Mehta",
    speciality: "General Medicine",
    requestedAt: "Yesterday",
    reason: "Annual follow-up consultation.",
    requestedDuration: "12 hours",
    status: "approved",
    approvedAt: "Yesterday 3:45 PM",
    expiresAt: new Date(Date.now() + 3 * 60 * 60 * 1000 + 22 * 60 * 1000), // 3h22m from now
    reportScope: "Annual Physical Examination, Blood Work",
  },
  {
    id: 4,
    hospital: "Max Super Speciality",
    doctor: "Dr. Suresh Patel",
    speciality: "Orthopaedics",
    requestedAt: "2 days ago",
    reason: "Pre-surgical assessment.",
    requestedDuration: "6 hours",
    status: "expired",
    reportScope: "Metabolic Screening",
  },
];

export default function ConsentPage() {
  const [requests, setRequests] = useState<AccessRequest[]>(INITIAL_REQUESTS);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  function approve(id: number) {
    setRequests(prev => prev.map(r => {
      if (r.id !== id) return r;
      const hours = parseInt(r.requestedDuration);
      return {
        ...r,
        status: "approved",
        approvedAt: "Just now",
        expiresAt: new Date(Date.now() + hours * 60 * 60 * 1000),
      };
    }));
  }

  function deny(id: number) {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status: "denied" } : r));
  }

  function revoke(id: number) {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status: "expired", expiresAt: undefined } : r));
  }

  function formatCountdown(expiresAt: Date) {
    const diff = expiresAt.getTime() - now.getTime();
    if (diff <= 0) return "Expired";
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    return `${h.toString().padStart(2,"0")}:${m.toString().padStart(2,"0")}:${s.toString().padStart(2,"0")}`;
  }

  const pending = requests.filter(r => r.status === "pending");
  const approved = requests.filter(r => r.status === "approved");
  const history = requests.filter(r => r.status === "denied" || r.status === "expired");

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
            <h2 className="text-2xl font-bold text-white tracking-tight">Pending Approval</h2>
          </div>
          <div className="mt-10 grid grid-cols-1 justify-items-center gap-10 md:grid-cols-2 md:gap-10 mt-8!">
            {pending.map(req => (
              <RequestCard
                key={req.id}
                req={req}
                onApprove={() => approve(req.id)}
                onDeny={() => deny(req.id)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Active Approved Accesses */}
      {approved.length > 0 && (
        <section className="flex flex-col">
          <div className="flex items-center justify-center gap-4">
            <h2 className="text-2xl font-bold text-white tracking-tight">Active Permissions</h2>
          </div>
          <div className="mt-10 grid grid-cols-1 justify-items-center gap-10 md:grid-cols-2 md:gap-10 mt-8!">
            {approved.map(req => (
              <ActiveAccessCard
                key={req.id}
                req={req}
                countdown={req.expiresAt ? formatCountdown(req.expiresAt) : "--"}
                nowMs={now.getTime()}
                onRevoke={() => revoke(req.id)}
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
                  <p className="text-base font-bold text-white group-hover:text-blue-400 transition-colors">{req.hospital}</p>
                  <div className="flex items-center gap-3 text-[13px] text-zinc-500 mt-1 font-medium">
                    <span className="tracking-tight">{req.doctor}</span>
                    <span className="text-zinc-700 opacity-50">|</span>
                    <span className="tracking-tight opacity-70">{req.requestedAt}</span>
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

      {/* Security Banner */}
      <div className="relative overflow-hidden rounded-[32px] border border-blue-500/10 bg-blue-500/[0.02] pl-28 pr-14 py-8! group">
        <div className="absolute -top-10 -right-10 p-10 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity">
          <Lock size={200} className="text-blue-500" />
        </div>
        <div className="relative flex items-start gap-8">
          <div className="p-4 bg-blue-500/10 ml-10! rounded-2xl border border-blue-500/10 text-blue-400 shrink-0">
            <Lock size={28} />
          </div>
          <div className="space-y-3">
            <h3 className="text-xl font-bold text-white">Immutable Governance Protocol</h3>
            <p className="text-[15px] text-zinc-400 leading-relaxed max-w-3xl">
              MedChain uses zero-knowledge framework and on-chain auditing. No institution can access your identity or full records without an active blockchain-verified consent token. Approved accesses auto-revoke on expiry, ensuring zero data persistence on institutional servers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function RequestCard({ req, onApprove, onDeny }: {
  req: AccessRequest;
  onApprove: () => void;
  onDeny: () => void;
}) {
  return (
    <div className="glass-card flex w-full max-w-[470px] min-h-[500px] flex-col overflow-hidden rounded-[28px] border border-orange-500/10 bg-orange-500/[0.01] transition-all group hover:bg-orange-500/[0.02]">
      <div className="flex flex-col gap-5 px-10 py-6 text-center items-center h-full justify-center">
        {/* Header */}
        <div className="flex flex-col items-center gap-3 pt-8">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-orange-500/10 bg-orange-500/5 text-orange-400 transition-transform duration-500 group-hover:scale-110">
            <Hospital size={22} />
          </div>
          <div className="space-y-0.5">
            <p className="text-base font-bold tracking-tight text-white">{req.hospital}</p>
            <p className="text-[13px] font-medium text-zinc-500">{req.doctor}</p>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-orange-400/70">{req.speciality}</p>
          </div>
          <span className="rounded-lg px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-orange-400">Verification Pending</span>
        </div>

        {/* Meta row */}
        <div className="flex items-center justify-center gap-8 border-t border-white/[0.03] pt-4 text-[13px] font-medium text-zinc-500">
          <span className="flex items-center gap-2"><Clock size={14} className="text-zinc-600" /> {req.requestedAt}</span>
          <span className="flex items-center gap-2"><Calendar size={14} className="text-zinc-600" /> {req.requestedDuration} session</span>
        </div>

        {/* Info boxes */}
        <div className="flex flex-col gap-3 items-center">
          <div className="w-[78%] rounded-2xl px-5 py-7 space-y-2">
            <p className="flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-600">
              <MessageSquare size={12} className="text-blue-400/50" /> Clinical Rationale
            </p>
            <p className="text-[15px] font-medium leading-6 text-zinc-300 whitespace-normal break-words text-center">{req.reason}</p>
          </div>

          <div className="w-[78%] rounded-2xl px-5 py-7 space-y-2">
            <p className="flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-600">
              <FileText size={12} className="text-blue-400/50" /> Requested Scope
            </p>
            <p className="text-[15px] font-semibold leading-6 text-zinc-300 whitespace-normal break-words text-center">{req.reportScope}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-center gap-3 pt-1 pb-4">
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
function ActiveAccessCard({ req, countdown, nowMs, onRevoke }: { req: AccessRequest; countdown: string; nowMs: number; onRevoke: () => void }) {
  const isExpiringSoon = req.expiresAt ? (req.expiresAt.getTime() - nowMs) < 3600000 : false;

  return (
    <div className="glass-card flex flex-col w-full max-w-[470px] min-h-[500px] overflow-hidden rounded-[28px] border border-emerald-500/10 bg-emerald-500/[0.01] transition-all group relative">
      {/* Countdown Timer - Top Right */}
      <div className="absolute top-4 right-4 flex flex-col items-center gap-1 z-10">
        <div className={`rounded-xl p-1.5 ${isExpiringSoon ? "bg-orange-500/10 text-orange-400 animate-pulse" : "bg-emerald-500/10 text-emerald-400"}`}>
          <Clock size={16} />
        </div>
        <p className={`text-[9px] font-bold uppercase tracking-widest ${isExpiringSoon ? "text-orange-400" : "text-emerald-400"}`}>
          Expiry
        </p>
        <p className={`font-mono text-base font-bold tracking-tight ${isExpiringSoon ? "text-orange-300" : "text-emerald-300"}`}>
          {countdown}
        </p>
        {isExpiringSoon && (
          <p className="flex items-center gap-0.5 text-[8px] font-bold uppercase text-orange-400/90 mt-1">
            <ShieldAlert size={9} />
          </p>
        )}
      </div>
      
      <div className="flex flex-1 flex-col items-center justify-center gap-8 px-10 py-12 text-center">
        {/* Header */}
        <div className="flex flex-col items-center gap-1.5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-emerald-500/10 bg-emerald-500/5 text-emerald-400 transition-transform duration-500 group-hover:scale-110">
            <Unlock size={18} />
          </div>
          <div className="space-y-0.5">
            <p className="text-base font-bold tracking-tight text-white">{req.hospital}</p>
            <p className="text-[12px] font-medium text-zinc-500">{req.doctor}</p>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-400/70">{req.speciality}</p>
          </div>
          <span className="rounded-lg px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.12em] text-emerald-400">Session Active</span>
        </div>

        {/* Granted Records */}
        <div className="w-[90%] rounded-2xl px-5 py-5 space-y-2 flex flex-col justify-center">
          <p className="flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-600">
            <FileText size={12} className="text-emerald-400/50" /> Granted Records
          </p>
          <p className="text-[13px] font-bold leading-relaxed text-zinc-200">{req.reportScope}</p>
        </div>

        {/* Footer */}
        <div className="flex flex-col gap-2 items-center text-center">
          <div className="flex flex-col items-center gap-1.5">
            <Lock size={14} className="shrink-0 text-zinc-600" />
            <p className="text-[12px] font-medium leading-5 text-zinc-500 whitespace-normal break-words max-w-[260px]">Identity Shielding active. Download permissions are permanently disabled for this session.</p>
          </div>
          <button
            onClick={onRevoke}
            className="flex h-11 items-center justify-center gap-2 rounded-2xl text-sm font-bold text-red-400/80 transition-all hover:text-red-400"
          >
            <TimerOff size={16} /> Terminate Access Session
          </button>
        </div>
      </div>
    </div>
  );
}
