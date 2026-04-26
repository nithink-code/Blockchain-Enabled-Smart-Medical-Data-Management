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
    <div className="space-y-10 pb-12 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="space-y-1.5">
          <h1 className="text-4xl font-bold tracking-tight text-white">Access Governance</h1>
          <p className="text-zinc-500 text-lg font-medium">Control who can access your medical records on the blockchain.</p>
        </div>
        <div className="flex items-center gap-4 px-6 py-3.5 rounded-2xl border border-blue-500/10 bg-blue-500/[0.02]">
          <ShieldCheck size={20} className="text-blue-400" />
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest leading-none mb-1">Status</span>
            <span className="text-sm font-bold text-blue-300">Identity Shield Active</span>
          </div>
        </div>
      </div>

      {/* Pending Requests */}
      {pending.length > 0 && (
        <section className="space-y-8">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold text-white tracking-tight">Pending Approval</h2>
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-orange-500/10 border border-orange-500/10 text-[12px] font-bold text-orange-400">{pending.length}</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
        <section className="space-y-8">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold text-white tracking-tight">Active Permissions</h2>
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/10 text-[12px] font-bold text-emerald-400">{approved.length}</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
          <h2 className="text-2xl font-bold text-white tracking-tight">Audit Trail</h2>
          <div className="glass-card rounded-[32px] border border-white/5 overflow-hidden divide-y divide-white/[0.03]">
            {history.map(req => (
              <div key={req.id} className="flex items-center gap-7 p-8 group hover:bg-white/[0.01] transition-colors">
                <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border transition-all duration-500 ${
                  req.status === "denied" ? "bg-red-500/5 border-red-500/10 text-red-500" : "bg-white/[0.02] border-white/5 text-zinc-500"
                }`}>
                  {req.status === "denied" ? <ShieldAlert size={24} /> : <TimerOff size={24} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">{req.hospital}</p>
                  <div className="flex items-center gap-4 text-sm text-zinc-500 mt-1 font-medium">
                    <span className="flex items-center gap-2 tracking-tight">{req.doctor}</span>
                    <span className="text-zinc-700 opacity-50">|</span>
                    <span className="flex items-center gap-2 tracking-tight opacity-70">{req.requestedAt}</span>
                  </div>
                </div>
                <span className={`text-[10px] font-bold px-4 py-2 rounded-full border tracking-widest uppercase ${
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
      <div className="relative overflow-hidden rounded-[32px] border border-blue-500/10 bg-blue-500/[0.02] p-10 group">
        <div className="absolute -top-10 -right-10 p-10 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity">
          <Lock size={200} className="text-blue-500" />
        </div>
        <div className="relative flex items-start gap-8">
          <div className="p-4 bg-blue-500/10 rounded-2xl border border-blue-500/10 text-blue-400">
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
    <div className="glass-card rounded-[32px] border border-orange-500/10 bg-orange-500/[0.01] hover:bg-orange-500/[0.02] overflow-hidden transition-all group">
      <div className="p-8 space-y-7">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-5">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-orange-500/5 border border-orange-500/10 text-orange-400 group-hover:scale-110 transition-transform duration-500">
              <Hospital size={24} />
            </div>
            <div>
              <p className="text-lg font-bold text-white tracking-tight">{req.hospital}</p>
              <p className="text-[13px] text-zinc-500 font-medium">{req.doctor} | <span className="text-orange-400/70">{req.speciality}</span></p>
            </div>
          </div>
          <span className="text-[10px] font-bold text-orange-400 bg-orange-500/10 border border-orange-500/10 px-3 py-1.5 rounded-lg uppercase tracking-[0.1em]">Verification Pending</span>
        </div>

        <div className="flex items-center gap-8 text-[13px] text-zinc-500 font-medium border-t border-white/[0.03] pt-6">
          <span className="flex items-center gap-2.5"><Clock size={16} className="text-zinc-600" /> {req.requestedAt}</span>
          <span className="flex items-center gap-2.5"><Calendar size={16} className="text-zinc-600" /> {req.requestedDuration} session</span>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-white/[0.03] bg-white/[0.02] p-5 space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-600 flex items-center gap-2.5">
              <MessageSquare size={13} className="text-blue-400/50" /> Clinical Rationale
            </p>
            <p className="text-[14px] text-zinc-300 leading-relaxed font-medium">{req.reason}</p>
          </div>

          <div className="rounded-2xl border border-white/[0.03] bg-white/[0.02] p-5 space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-600 flex items-center gap-2.5">
              <FileText size={13} className="text-blue-400/50" /> Requested Scope
            </p>
            <p className="text-[14px] text-zinc-300 font-semibold">{req.reportScope}</p>
          </div>
        </div>

        <div className="flex gap-4 pt-2">
          <button
            onClick={onApprove}
            className="flex-1 flex items-center justify-center gap-3 h-14 rounded-2xl bg-emerald-600/90 text-sm font-bold text-white transition-all hover:bg-emerald-500 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-emerald-500/10"
          >
            <CheckCircle2 size={18} /> Approve Access
          </button>
          <button
            onClick={onDeny}
            className="flex-1 flex items-center justify-center gap-3 h-14 rounded-2xl border border-white/5 bg-white/[0.03] text-sm font-bold text-zinc-400 hover:bg-red-500/5 hover:text-red-400 hover:border-red-500/10 transition-all"
          >
            <X size={18} /> Deny
          </button>
        </div>
      </div>
    </div>
  );
}

function ActiveAccessCard({ req, countdown, nowMs, onRevoke }: { req: AccessRequest; countdown: string; nowMs: number; onRevoke: () => void }) {
  const isExpiringSoon = req.expiresAt ? (req.expiresAt.getTime() - nowMs) < 3600000 : false;

  return (
    <div className="glass-card rounded-[32px] border border-emerald-500/10 bg-emerald-500/[0.01] overflow-hidden group transition-all">
      <div className="p-8 space-y-8">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-5">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/5 border border-emerald-500/10 text-emerald-400 group-hover:scale-110 transition-transform duration-500">
              <Unlock size={24} />
            </div>
            <div>
              <p className="text-lg font-bold text-white tracking-tight">{req.hospital}</p>
              <p className="text-[13px] text-zinc-500 font-medium">{req.doctor} | <span className="text-emerald-400/70">{req.speciality}</span></p>
            </div>
          </div>
          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/10 px-3 py-1.5 rounded-lg uppercase tracking-[0.1em]">Session Active</span>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-white/[0.03] bg-white/[0.02] p-5 space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-600 flex items-center gap-2.5">
              <FileText size={13} className="text-emerald-400/50" /> Granted Records
            </p>
            <p className="text-[14px] text-zinc-200 font-bold">{req.reportScope}</p>
          </div>

          {/* Countdown Timer */}
          <div className={`relative overflow-hidden rounded-[24px] border p-6 transition-colors duration-500 ${isExpiringSoon ? "border-orange-500/20 bg-orange-500/[0.03]" : "border-emerald-500/10 bg-emerald-500/[0.03]"}`}>
            <div className="relative flex items-center justify-between">
              <div className="space-y-1">
                <p className={`text-[10px] font-bold uppercase tracking-[0.2em] ${isExpiringSoon ? "text-orange-400" : "text-emerald-400"}`}>
                  Access Expiry
                </p>
                <p className={`font-mono text-3xl font-bold tracking-tighter ${isExpiringSoon ? "text-orange-300" : "text-emerald-300"}`}>
                  {countdown}
                </p>
              </div>
              <div className={`p-3 rounded-xl ${isExpiringSoon ? "bg-orange-500/10 text-orange-400 animate-pulse" : "bg-emerald-500/10 text-emerald-400"}`}>
                <Clock size={24} />
              </div>
            </div>
            {isExpiringSoon && (
              <p className="mt-4 text-[11px] font-bold text-orange-400/80 flex items-center gap-2 uppercase tracking-wider">
                <ShieldAlert size={12} /> Critical: Access will auto-revoke soon
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3 px-5 py-4 rounded-2xl bg-white/[0.02] border border-white/[0.03]">
            <Lock size={15} className="text-zinc-600 shrink-0" />
            <p className="text-[12px] text-zinc-500 font-medium leading-tight">Identity Shielding active. Download permissions are permanently disabled for this session.</p>
          </div>

          <button
            onClick={onRevoke}
            className="w-full flex items-center justify-center gap-3 h-14 rounded-2xl border border-white/5 bg-white/[0.02] text-sm font-bold text-red-400/80 hover:bg-red-500/5 hover:text-red-400 hover:border-red-500/10 transition-all"
          >
            <TimerOff size={18} /> Terminate Access Session
          </button>
        </div>
      </div>
    </div>
  );
}
