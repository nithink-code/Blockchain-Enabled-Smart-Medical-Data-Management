"use client";

import { useState, useEffect } from "react";
import { 
  FileText, Clock, Lock, Eye, Brain, Shield, AlertTriangle, 
  ChevronDown, ChevronUp, Activity, TimerOff, Download 
} from "lucide-react";
import { APPROVED_RECORDS } from "@/lib/data";

// Simulated expiry: 2h 44m from page load
const EXPIRY_MS = (2 * 60 + 44) * 60 * 1000;

export default function ActiveAccessPage() {
  const [expiresAt] = useState(() => new Date(Date.now() + EXPIRY_MS));
  const [now, setNow] = useState(new Date());
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [accessRevoked, setAccessRevoked] = useState(false);

  useEffect(() => {
    const t = setInterval(() => {
      const n = new Date();
      setNow(n);
      if (n >= expiresAt) setAccessRevoked(true);
    }, 1000);
    return () => clearInterval(t);
  }, [expiresAt]);

  const diff = expiresAt.getTime() - now.getTime();
  const h = Math.max(0, Math.floor(diff / 3600000));
  const m = Math.max(0, Math.floor((diff % 3600000) / 60000));
  const s = Math.max(0, Math.floor((diff % 60000) / 1000));
  const countdown = `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  const isExpiringSoon = diff < 30 * 60 * 1000;
  const progressPct = Math.max(0, (diff / EXPIRY_MS) * 100);

  if (accessRevoked) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center animate-fade-in">
        <div className="max-w-md text-center space-y-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-full border border-red-500/20 bg-red-500/10 mx-auto">
            <TimerOff size={36} className="text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-white">Access Expired</h1>
          <p className="text-zinc-400 leading-relaxed">
            The time-limited access to this patient&apos;s records has expired and been automatically revoked. Submit a new request if continued access is required.
          </p>
          <a href="/hospital" className="inline-flex h-12 items-center gap-2 rounded-2xl bg-emerald-600 px-6 text-sm font-bold text-white transition-all hover:bg-emerald-500">
            Return to Patient List
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-fade-in pb-10 max-w-4xl">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight text-white">Patient Records</h1>
        <p className="text-zinc-400">View-only access. Records will auto-revoke when the timer expires.</p>
      </div>

      {/* Access Timer Banner */}
      <div className={`rounded-[24px] border p-6 ${isExpiringSoon ? "border-orange-500/30 bg-orange-500/5" : "border-emerald-500/20 bg-emerald-500/5"}`}>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${isExpiringSoon ? "bg-orange-500/10 text-orange-400" : "bg-emerald-500/10 text-emerald-400"}`}>
              <Clock size={22} />
            </div>
            <div>
              <p className={`text-[10px] font-bold uppercase tracking-widest ${isExpiringSoon ? "text-orange-400" : "text-emerald-400"}`}>Access Expires In</p>
              <p className={`font-mono text-2xl font-bold ${isExpiringSoon ? "text-orange-300" : "text-emerald-300"}`}>{countdown}</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 rounded-2xl border border-white/5 bg-white/5 px-4 py-2.5">
              <Lock size={14} className="text-zinc-400" />
              <span className="text-xs font-bold text-zinc-300">View Only</span>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/5 px-4 py-2.5">
              <Download size={14} className="text-red-400" />
              <span className="text-xs font-bold text-red-400">Download Blocked</span>
            </div>
          </div>
        </div>
        {/* Progress bar */}
        <div className="mt-4 h-1.5 rounded-full bg-white/5 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-1000 ${isExpiringSoon ? "bg-orange-500" : "bg-emerald-500"}`}
            style={{ width: `${progressPct}%` }}
          />
        </div>
        {isExpiringSoon && (
          <p className="mt-3 text-xs text-orange-400 flex items-center gap-2">
            <AlertTriangle size={13} /> Access will auto-revoke soon
          </p>
        )}
      </div>

      {/* Privacy Notice */}
      <div className="flex items-start gap-3 rounded-2xl border border-blue-500/20 bg-blue-500/5 p-4">
        <Shield size={16} className="text-blue-400 mt-0.5 shrink-0" />
        <p className="text-xs text-zinc-400 leading-relaxed">
          <strong className="text-white">Privacy Protected:</strong> Patient identity has been redacted. You are viewing AI-summarized report content only. All file downloads are permanently disabled. This session is logged.
        </p>
      </div>

      {/* Records */}
      <div className="space-y-5">
        <h2 className="text-xl font-bold text-white">Approved Records</h2>
        <div className="space-y-4">
          {APPROVED_RECORDS.map(record => (
            <RecordViewCard
              key={record.id}
              record={record}
              isExpanded={expandedId === record.id}
              onToggle={() => setExpandedId(expandedId === record.id ? null : record.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function RecordViewCard({
  record,
  isExpanded,
  onToggle,
}: {
  record: typeof APPROVED_RECORDS[0];
  isExpanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="glass-card rounded-[24px] border border-white/5 overflow-hidden transition-all">
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-5 p-6 hover:bg-white/[0.02] transition-colors text-left"
      >
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400">
          <FileText size={20} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-white">{record.title}</p>
          <p className="text-xs text-zinc-500 mt-0.5">{record.type} · {record.date}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2.5 py-1 rounded-lg flex items-center gap-1.5">
            <Eye size={11} /> View Only
          </span>
          {isExpanded ? <ChevronUp size={18} className="text-zinc-400" /> : <ChevronDown size={18} className="text-zinc-400" />}
        </div>
      </button>

      {isExpanded && (
        <div className="border-t border-white/5 p-6 space-y-6 animate-fade-in">
          {/* AI Summary */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
              <Brain size={13} className="text-blue-400" /> MedGemma AI Summary
            </div>
            <p className="text-sm text-zinc-200 leading-relaxed">{record.aiSummary}</p>
          </div>

          {/* Conditions */}
          <div className="space-y-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Identified Conditions</p>
            <div className="flex flex-wrap gap-2">
              {record.conditions.map(c => (
                <span key={c} className="rounded-xl border border-orange-500/20 bg-orange-500/5 px-3 py-1.5 text-xs font-bold text-orange-400">
                  {c}
                </span>
              ))}
            </div>
          </div>

          {/* Key Findings */}
          <div className="space-y-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Key Findings</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {record.keyFindings.map(f => (
                <div key={f} className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3">
                  <Activity size={14} className="text-zinc-500 shrink-0" />
                  <span className="text-sm text-zinc-300">{f}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Download blocked */}
          <div className="flex items-center gap-3 rounded-2xl border border-red-500/10 bg-red-500/5 p-4">
            <Download size={16} className="text-red-400 shrink-0" />
            <p className="text-xs text-zinc-400">
              <strong className="text-red-400">Download disabled.</strong> This record is view-only. Patients retain full ownership of their data.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
