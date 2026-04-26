import { 
  Clock,
  ShieldCheck,
  Eye,
  FileText,
  Unlock,
  Lock,
  TimerOff,
  Database,
  Activity,
  User,
  ArrowUpRight
} from "lucide-react";

const AUDIT_LOGS = [
  {
    id: 1,
    type: "ACCESS_GRANTED",
    actor: "Fortis Healthcare",
    detail: "Access granted to Blood Work & Physical Exam reports",
    timestamp: "Today, 3:45 PM",
    duration: "12 hours",
    icon: Unlock,
    color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    dotColor: "bg-emerald-500",
  },
  {
    id: 2,
    type: "FILE_VIEWED",
    actor: "Fortis Healthcare - Dr. Anil Mehta",
    detail: "Annual Physical Examination report viewed",
    timestamp: "Today, 4:12 PM",
    icon: Eye,
    color: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    dotColor: "bg-blue-500",
  },
  {
    id: 3,
    type: "ACCESS_REVOKED",
    actor: "Apollo Hospitals",
    detail: "Access auto-revoked after 48h timer expired",
    timestamp: "Yesterday, 11:22 AM",
    icon: TimerOff,
    color: "text-orange-400 bg-orange-500/10 border-orange-500/20",
    dotColor: "bg-orange-500",
  },
  {
    id: 4,
    type: "REPORT_UPLOADED",
    actor: "You (Patient)",
    detail: "Neurological Assessment uploaded and anchored to IPFS",
    timestamp: "Oct 12, 2024",
    icon: FileText,
    color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
    dotColor: "bg-indigo-500",
  },
  {
    id: 5,
    type: "BLOCKCHAIN_SYNC",
    actor: "System",
    detail: "CID Qm4x9Kp...f8Ra2Lz anchored - Block #4,921,837",
    timestamp: "Oct 12, 2024",
    icon: Database,
    color: "text-purple-400 bg-purple-500/10 border-purple-500/20",
    dotColor: "bg-purple-500",
  },
  {
    id: 6,
    type: "ACCESS_DENIED",
    actor: "You (Patient)",
    detail: "Denied access request from Max Super Speciality",
    timestamp: "Oct 10, 2024",
    icon: Lock,
    color: "text-red-400 bg-red-500/10 border-red-500/20",
    dotColor: "bg-red-500",
  },
  {
    id: 7,
    type: "REPORT_UPLOADED",
    actor: "You (Patient)",
    detail: "Cardiovascular Panel uploaded and analyzed by MedGemma",
    timestamp: "Sep 28, 2024",
    icon: Activity,
    color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
    dotColor: "bg-indigo-500",
  },
  {
    id: 8,
    type: "ACCESS_GRANTED",
    actor: "City Labs Clinic",
    detail: "Access granted to Cardiovascular Panel report",
    timestamp: "Sep 25, 2024",
    duration: "24 hours",
    icon: Unlock,
    color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    dotColor: "bg-emerald-500",
  },
];

export default function AuditLogsPage() {
  return (
    <div className="space-y-10 animate-fade-in pb-8">
      <div className="space-y-1.5">
        <h1 className="text-4xl font-bold tracking-tight text-white">Security Audit</h1>
        <p className="text-zinc-500 text-lg font-medium">A cryptographically anchored, immutable record of every interaction with your health data.</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
        {[
          { label: "Uploads", count: 2, icon: FileText, color: "text-indigo-400 bg-indigo-500/10" },
          { label: "Accesses", count: 2, icon: Unlock, color: "text-emerald-400 bg-emerald-500/10" },
          { label: "Revocations", count: 2, icon: TimerOff, color: "text-orange-400 bg-orange-500/10" },
          { label: "Views", count: 1, icon: Eye, color: "text-blue-400 bg-blue-500/10" },
        ].map(({ label, count, icon: Icon, color }) => (
          <div key={label} className="glass-card rounded-[28px] border border-white/5 p-7 flex items-center gap-5 group">
            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl transition-all duration-500 group-hover:scale-110 ${color}`}>
              <Icon size={20} />
            </div>
            <div>
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">{label}</p>
              <p className="text-2xl font-bold text-white mt-0.5 tracking-tight">{count}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Blockchain integrity banner */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-[28px] border border-emerald-500/10 bg-emerald-500/[0.02] px-8 py-5 group">
        <div className="flex items-center gap-4">
          <div className="p-2.5 bg-emerald-500/10 rounded-xl">
            <ShieldCheck size={20} className="text-emerald-400" />
          </div>
          <div>
            <span className="text-sm font-bold text-white">Blockchain-Anchored Integrity</span>
            <p className="text-xs text-zinc-500 font-medium mt-0.5">All logs are cryptographically sealed and verified by the MedChain network.</p>
          </div>
        </div>
        <div className="flex items-center gap-2.5 bg-emerald-500/10 border border-emerald-500/10 px-4 py-1.5 rounded-full">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Live Sync</span>
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white tracking-tight">Activity Timeline</h2>
          <button className="text-xs font-bold text-zinc-500 hover:text-white transition-colors flex items-center gap-2">
            Export History <ArrowUpRight size={14} />
          </button>
        </div>
        
        <div className="glass-card rounded-[32px] border border-white/5 overflow-hidden">
          <div className="p-10 space-y-12">
            {AUDIT_LOGS.map((log, i) => {
              const Icon = log.icon;
              return (
                <div key={log.id} className="relative flex gap-8">
                  {/* Timeline connector */}
                  {i < AUDIT_LOGS.length - 1 && (
                    <div className="absolute left-7 top-14 w-px h-[calc(100%+3rem)] bg-gradient-to-b from-white/10 to-transparent" />
                  )}
                  {/* Icon */}
                  <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border z-10 transition-all duration-500 hover:scale-110 ${log.color}`}>
                    <Icon size={22} />
                  </div>
                  {/* Content */}
                  <div className="flex-1 min-w-0 pb-2">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${log.color.split(" ")[0]}`}>
                            {log.type.replace(/_/g, " ")}
                          </p>
                          <span className="h-1 w-1 rounded-full bg-zinc-800" />
                          <span className="text-xs text-zinc-500 font-mono tracking-tight">{log.timestamp}</span>
                        </div>
                        <p className="text-lg font-bold text-white tracking-tight leading-tight">{log.detail}</p>
                        <div className="flex items-center gap-4">
                          <p className="text-[13px] text-zinc-500 font-medium flex items-center gap-2">
                            <User size={14} className="text-zinc-600" /> {log.actor}
                          </p>
                          {log.duration && (
                            <p className="text-[13px] text-zinc-500 font-medium flex items-center gap-2 border-l border-white/5 pl-4">
                              <Clock size={14} className="text-zinc-600" /> Session: {log.duration}
                            </p>
                          )}
                        </div>
                      </div>
                      <button className="opacity-0 group-hover:opacity-100 transition-opacity p-2 text-zinc-600 hover:text-blue-400">
                        <ArrowUpRight size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
