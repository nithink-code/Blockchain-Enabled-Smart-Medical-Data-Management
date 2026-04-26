"use client";

import { useState, ReactNode } from "react";
import {
  Users,
  FileText,
  Clock,
  ShieldCheck,
  ChevronRight,
  Eye,
  Filter,
  Activity,
  Thermometer,
  Droplets,
  Heart,
  Lock,
  AlertCircle
} from "lucide-react";
import Link from "next/link";
import { PATIENTS } from "@/lib/data";

type AccessStatus = "none" | "pending" | "approved" | "denied";

type Patient = typeof PATIENTS[0];

export default function HospitalDashboard() {
  const [requestModal, setRequestModal] = useState<string | null>(null);
  const [accessStatuses, setAccessStatuses] = useState<Record<string, AccessStatus>>(
    Object.fromEntries(PATIENTS.map(p => [p.id, p.accessStatus as AccessStatus]))
  );

  function submitRequest(patientId: string) {
    setAccessStatuses(prev => ({ ...prev, [patientId]: "pending" }));
    setRequestModal(null);
  }

  const modalPatient = PATIENTS.find(p => p.id === requestModal);

  return (
    <div className="space-y-12 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1.5">
          <h1 className="text-4xl font-bold tracking-tight text-white">Patient Registry</h1>
          <p className="text-zinc-500 text-lg font-medium">Request secure, blockchain-verified access to anonymized clinical summaries.</p>
        </div>
        <div className="flex items-center gap-4 px-6 py-3.5 rounded-2xl border border-orange-500/10 bg-orange-500/[0.02]">
          <Lock size={20} className="text-orange-400" />
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest leading-none mb-1">Security Status</span>
            <span className="text-sm font-bold text-orange-300">Identity Shielding Active</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <StatsCard 
          label="Total Registered" 
          value={PATIENTS.length.toString()} 
          icon={<Users size={22} />} 
          color="text-emerald-400 bg-emerald-500/10 border-emerald-500/10" 
        />
        <StatsCard 
          label="Pending Requests" 
          value={Object.values(accessStatuses).filter(s => s === "pending").length.toString()} 
          icon={<Clock size={22} />} 
          color="text-orange-400 bg-orange-500/10 border-orange-500/10" 
        />
        <StatsCard 
          label="Active Permissions" 
          value={Object.values(accessStatuses).filter(s => s === "approved").length.toString()} 
          icon={<ShieldCheck size={22} />} 
          color="text-blue-400 bg-blue-500/10 border-blue-500/10" 
        />
      </div>

      {/* Patient Cards */}
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-white tracking-tight">Clinical Summaries</h2>
            <span className="bg-white/5 border border-white/10 text-zinc-500 text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider">Blockchain Verified</span>
          </div>
          <button className="flex h-12 items-center gap-2.5 px-5 border border-white/5 bg-white/[0.02] rounded-2xl text-sm font-bold text-zinc-300 hover:bg-white/[0.05] hover:text-white transition-all">
            <Filter size={18} className="text-zinc-500" />
            Refine View
          </button>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {PATIENTS.map(patient => (
            <PatientCard
              key={patient.id}
              patient={patient}
              accessStatus={accessStatuses[patient.id]}
              onRequestAccess={() => setRequestModal(patient.id)}
            />
          ))}
        </div>
      </div>

      {/* Request Modal */}
      {requestModal && modalPatient && (
        <RequestAccessModal
          patient={modalPatient}
          onClose={() => setRequestModal(null)}
          onSubmit={() => submitRequest(requestModal)}
        />
      )}
    </div>
  );
}

function StatsCard({ label, value, icon, color }: { label: string, value: string, icon: ReactNode, color: string }) {
  return (
    <div className="glass-card rounded-[32px] border border-white/5 p-8 flex items-center gap-6 group">
      <div className={`flex h-14 w-14 items-center justify-center rounded-2xl border transition-all duration-500 group-hover:scale-110 ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">{label}</p>
        <p className="text-3xl font-bold text-white mt-1 tracking-tight">{value}</p>
      </div>
    </div>
  );
}

function PatientCard({
  patient,
  accessStatus,
  onRequestAccess,
}: {
  patient: Patient;
  accessStatus: AccessStatus;
  onRequestAccess: () => void;
}) {
  const statusBadge: Record<AccessStatus, ReactNode> = {
    none: null,
    pending: <span className="text-[10px] font-bold text-orange-400 bg-orange-500/10 border border-orange-500/10 px-3 py-1.5 rounded-lg uppercase tracking-wider">Review Pending</span>,
    approved: <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/10 px-3 py-1.5 rounded-lg uppercase tracking-wider">Access Granted</span>,
    denied: <span className="text-[10px] font-bold text-red-400 bg-red-500/10 border border-red-500/10 px-3 py-1.5 rounded-lg uppercase tracking-wider">Denied</span>,
  };

  return (
    <div className="glass-card rounded-[32px] border border-white/5 hover:border-white/10 transition-all group">
      <div className="p-8 space-y-7">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-5">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/[0.03] border border-white/5 text-white font-bold text-lg group-hover:bg-blue-500/10 group-hover:text-blue-400 transition-all duration-500">
              {patient.age}
            </div>
            <div>
              <p className="text-lg font-bold text-white tracking-tight">{patient.age}y {patient.gender} · <span className="text-blue-400/80">{patient.bloodGroup}</span></p>
              <p className="font-mono text-[11px] text-zinc-500 mt-1 opacity-60 tracking-wider">HID: {patient.displayId}</p>
            </div>
          </div>
          {statusBadge[accessStatus]}
        </div>

        {/* Anonymized Summary */}
        <div className="relative">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500/20 to-transparent rounded-full" />
          <p className="text-[15px] text-zinc-400 leading-relaxed pl-6 font-medium italic">
            &quot;{patient.summary}&quot;
          </p>
        </div>

        {/* Conditions */}
        <div className="flex flex-wrap gap-2.5">
          {patient.conditions.map(c => (
            <span key={c} className="rounded-xl border border-white/5 bg-white/[0.02] px-3.5 py-1.5 text-[11px] font-bold text-zinc-500 uppercase tracking-tight group-hover:text-zinc-300 transition-colors">
              {c}
            </span>
          ))}
        </div>

        {/* Vitals */}
        <div className="grid grid-cols-4 gap-3">
          <VitalChip icon={<Heart size={14} />} label="HR" value={patient.vitals.hr} color="text-rose-400" />
          <VitalChip icon={<Activity size={14} />} label="BP" value={patient.vitals.bp} color="text-blue-400" />
          <VitalChip icon={<Thermometer size={14} />} label="TEMP" value={patient.vitals.temp} color="text-orange-400" />
          <VitalChip icon={<Droplets size={14} />} label="SPO2" value={patient.vitals.spo2} color="text-emerald-400" />
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pt-6 border-t border-white/[0.03]">
          <div className="flex items-center gap-6 text-[13px] text-zinc-500 font-medium">
            <span className="flex items-center gap-2"><FileText size={16} className="text-zinc-600" /> {patient.reportCount} Reports</span>
            <span className="flex items-center gap-2"><Clock size={16} className="text-zinc-600" /> {patient.lastReport}</span>
          </div>

          {accessStatus === "none" && (
            <button
              onClick={onRequestAccess}
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-2xl bg-emerald-600/90 h-12 px-6 text-sm font-bold text-white transition-all hover:bg-emerald-500 hover:scale-[1.02] shadow-lg shadow-emerald-500/10"
            >
              Request Access <ChevronRight size={16} />
            </button>
          )}
          {accessStatus === "pending" && (
            <button disabled className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-2xl border border-orange-500/20 bg-orange-500/5 h-12 px-6 text-sm font-bold text-orange-400 cursor-not-allowed">
              <Clock size={16} className="animate-pulse" /> Awaiting Review
            </button>
          )}
          {accessStatus === "approved" && (
            <Link href="/hospital/active-access" className="w-full sm:w-auto">
              <button className="w-full flex items-center justify-center gap-2 rounded-2xl bg-blue-600 h-12 px-6 text-sm font-bold text-white transition-all hover:bg-blue-500 hover:scale-[1.02] shadow-lg shadow-blue-500/10">
                <Eye size={16} /> View Records
              </button>
            </Link>
          )}
          {accessStatus === "denied" && (
            <button disabled className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-2xl border border-white/5 bg-white/[0.02] h-12 px-6 text-sm font-bold text-zinc-600 cursor-not-allowed">
              Denied
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function VitalChip({ icon, label, value, color }: { icon: ReactNode; label: string; value: string; color: string }) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-white/5 bg-white/[0.01] py-4 px-2 text-center group-hover:bg-white/[0.02] transition-colors">
      <div className={`${color} mb-2`}>{icon}</div>
      <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-[0.1em]">{label}</p>
      <p className="text-[13px] font-bold text-zinc-300 mt-1 tracking-tight">{value}</p>
    </div>
  );
}

function RequestAccessModal({
  patient,
  onClose,
  onSubmit,
}: {
  patient: Patient;
  onClose: () => void;
  onSubmit: () => void;
}) {
  const [reason, setReason] = useState("");
  const [duration, setDuration] = useState("24");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-lg" onClick={onClose} />
      <div className="relative w-full max-w-xl glass-card rounded-[40px] border border-white/10 p-10 space-y-8 shadow-2xl animate-fade-in">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-white tracking-tight">Request Access Session</h2>
            <p className="text-[15px] text-zinc-500 font-medium">Define your clinical rationale and required duration.</p>
          </div>
          <button onClick={onClose} className="p-3 text-zinc-500 hover:text-white rounded-2xl hover:bg-white/10 transition-all font-mono">
            ✕
          </button>
        </div>

        {/* Patient summary chip */}
        <div className="rounded-3xl border border-white/5 bg-white/[0.02] p-6 flex items-center gap-6">
          <div className="h-14 w-14 rounded-2xl bg-blue-500/10 border border-blue-500/10 flex items-center justify-center text-blue-400 font-bold text-lg">
            {patient.age}
          </div>
          <div>
            <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-1">Target Patient Profile</p>
            <p className="text-lg font-bold text-white tracking-tight">{patient.age}y {patient.gender} · {patient.bloodGroup}</p>
            <p className="font-mono text-xs text-zinc-500 mt-0.5 opacity-60">{patient.displayId}</p>
          </div>
        </div>

        {/* Reason Field */}
        <div className="space-y-3">
          <label className="text-[13px] font-bold text-zinc-400 uppercase tracking-widest px-1">
            Clinical Rationale <span className="text-red-500/50">*</span>
          </label>
          <textarea
            value={reason}
            onChange={e => setReason(e.target.value)}
            placeholder="E.g., Seeking second opinion on neurological assessment. Need access to imaging reports for surgical planning..."
            rows={4}
            className="w-full rounded-[24px] border border-white/10 bg-white/[0.03] px-6 py-5 text-[15px] text-white placeholder:text-zinc-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:bg-white/[0.05] resize-none transition-all"
          />
        </div>

        {/* Duration Selector */}
        <div className="space-y-4">
          <label className="text-[13px] font-bold text-zinc-400 uppercase tracking-widest px-1">Requested Session Duration</label>
          <div className="grid grid-cols-4 gap-4">
            {["6", "12", "24", "48"].map(h => (
              <button
                key={h}
                onClick={() => setDuration(h)}
                className={`rounded-2xl border h-14 text-sm font-bold transition-all ${
                  duration === h
                    ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400 shadow-[0_0_20px_-5px_rgba(16,185,129,0.3)]"
                    : "border-white/5 bg-white/[0.02] text-zinc-500 hover:bg-white/[0.05] hover:text-zinc-300"
                }`}
              >
                {h} Hours
              </button>
            ))}
          </div>
        </div>

        {/* Compliance Notice */}
        <div className="flex items-start gap-4 rounded-3xl border border-blue-500/10 bg-blue-500/[0.02] p-6">
          <div className="p-2 bg-blue-500/10 rounded-xl text-blue-400">
            <AlertCircle size={20} />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-bold text-white">Compliance Protocol</p>
            <p className="text-xs text-zinc-500 leading-relaxed font-medium">
              This request will be cryptographically anchored. If approved, access will auto-revoke after {duration} hours. Identity shielding remains active.
            </p>
          </div>
        </div>

        <div className="flex gap-4 pt-2">
          <button
            onClick={onClose}
            className="flex-1 h-14 rounded-2xl border border-white/10 bg-white/[0.02] text-sm font-bold text-zinc-400 hover:bg-white/[0.05] hover:text-white transition-all"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            disabled={!reason.trim()}
            className="flex-1 h-14 rounded-2xl bg-emerald-600 text-sm font-bold text-white transition-all hover:bg-emerald-500 hover:scale-[1.02] disabled:opacity-30 disabled:cursor-not-allowed shadow-xl shadow-emerald-500/20"
          >
            Dispatch Request
          </button>
        </div>
      </div>
    </div>
  );
}
