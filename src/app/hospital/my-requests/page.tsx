"use client";

import { Clock, CheckCircle2, X, TimerOff, FileText, MessageSquare, Calendar } from "lucide-react";

const MY_REQUESTS = [
  {
    id: 1,
    patientId: "MED-4F2A-9C1B-E37D",
    ageGender: "34y Male",
    reason: "Cardiac evaluation. Requires prior blood reports and ECG results for accurate diagnosis.",
    duration: "48 hours",
    submittedAt: "2 hours ago",
    status: "pending" as const,
  },
  {
    id: 2,
    patientId: "MED-2C8A-6E4F-B1D7",
    ageGender: "28y Male",
    reason: "Respiratory infection follow-up. Need access to chest X-ray and pulmonary reports.",
    duration: "24 hours",
    submittedAt: "Yesterday",
    status: "approved" as const,
    approvedAt: "Yesterday 6:15 PM",
  },
  {
    id: 3,
    patientId: "MED-9B7C-3D2E-F5A1",
    ageGender: "52y Female",
    reason: "Hypertension management — need full cardiac history.",
    duration: "12 hours",
    submittedAt: "3 days ago",
    status: "denied" as const,
  },
  {
    id: 4,
    patientId: "MED-7F1D-4A9C-E2B8",
    ageGender: "67y Female",
    reason: "Diabetic retinopathy pre-screening.",
    duration: "6 hours",
    submittedAt: "4 days ago",
    status: "expired" as const,
  },
];

const STATUS_CONFIG = {
  pending:  { label: "Pending",  color: "text-orange-400  bg-orange-500/10  border-orange-500/20",  icon: Clock },
  approved: { label: "Approved", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20", icon: CheckCircle2 },
  denied:   { label: "Denied",   color: "text-red-400     bg-red-500/10     border-red-500/20",     icon: X },
  expired:  { label: "Expired",  color: "text-zinc-500    bg-zinc-800       border-zinc-700",        icon: TimerOff },
};

export default function MyRequestsPage() {
  return (
    <div className="space-y-10 animate-fade-in pb-10">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight text-white">My Access Requests</h1>
        <p className="text-zinc-400">Track all access requests submitted to patients.</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {(Object.entries(STATUS_CONFIG) as [keyof typeof STATUS_CONFIG, typeof STATUS_CONFIG[keyof typeof STATUS_CONFIG]][]).map(([key, cfg]) => {
          const Icon = cfg.icon;
          const count = MY_REQUESTS.filter(r => r.status === key).length;
          return (
            <div key={key} className="glass-card rounded-[20px] border border-white/5 p-5 flex items-center gap-4">
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${cfg.color}`}>
                <Icon size={18} />
              </div>
              <div>
                <p className="text-xs text-zinc-500 font-semibold">{cfg.label}</p>
                <p className="text-xl font-bold text-white">{count}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Request List */}
      <div className="glass-card rounded-[28px] border border-white/5 overflow-hidden">
        <div className="divide-y divide-white/5">
          {MY_REQUESTS.map(req => {
            const cfg = STATUS_CONFIG[req.status];
            const Icon = cfg.icon;
            return (
              <div key={req.id} className="p-6 hover:bg-white/[0.02] transition-colors">
                <div className="flex items-start gap-5">
                  <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border ${cfg.color}`}>
                    <Icon size={18} />
                  </div>
                  <div className="flex-1 min-w-0 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-bold text-white">{req.ageGender}</p>
                        <p className="font-mono text-[11px] text-zinc-500 mt-0.5">{req.patientId}</p>
                      </div>
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border shrink-0 ${cfg.color}`}>
                        {cfg.label.toUpperCase()}
                      </span>
                    </div>

                    <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1 flex items-center gap-1.5">
                        <MessageSquare size={11} /> Reason submitted
                      </p>
                      <p className="text-sm text-zinc-300">{req.reason}</p>
                    </div>

                    <div className="flex items-center gap-5 text-xs text-zinc-500">
                      <span className="flex items-center gap-1.5"><Clock size={13} /> {req.submittedAt}</span>
                      <span className="flex items-center gap-1.5"><Calendar size={13} /> Requested: {req.duration}</span>
                      {req.status === "approved" && req.approvedAt && (
                        <span className="flex items-center gap-1.5 text-emerald-400"><CheckCircle2 size={13} /> Approved: {req.approvedAt}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
