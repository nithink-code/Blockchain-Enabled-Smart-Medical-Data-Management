"use client";

import { useState, useEffect, ReactNode } from "react";
import {
  ChevronDown,
  FileText,
  ShieldCheck,
  Activity,
  Calendar,
  User,
  Database,
} from "lucide-react";
import { loadRecentActivity, type RecentActivityRecord } from "@/lib/recent-activity";

export default function Dashboard() {
  const [mounted, setMounted] = useState(false);
  const [recentReports, setRecentReports] = useState<RecentActivityRecord[]>([]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const refreshReports = () => {
      setRecentReports(loadRecentActivity());
    };

    refreshReports();
    window.addEventListener("storage", refreshReports);
    window.addEventListener("focus", refreshReports);

    return () => {
      window.removeEventListener("storage", refreshReports);
      window.removeEventListener("focus", refreshReports);
    };
  }, [mounted]);

  if (!mounted) return null;

  // â”€â”€ Dynamic stats derived from real uploaded reports â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const totalReports = recentReports.length;
  const analyzedReports = recentReports.filter((r) => r.status === "Analyzed");
  const activeConsents = analyzedReports.length;
  const avgConfidence =
    analyzedReports.length > 0
      ? Math.round(
          analyzedReports.reduce((sum, r) => sum + (r.confidence ?? 0), 0) /
            analyzedReports.length
        )
      : 0;
  // Estimate data-points: each report contributes ~40 fields on average
  const dataPointsRaw = totalReports * 40;
  const dataPoints =
    dataPointsRaw >= 1000
      ? `${(dataPointsRaw / 1000).toFixed(1)}k`
      : String(dataPointsRaw);
  return (
    <div className="space-y-24 animate-fade-in pb-16">
      {/* Header */}
      <div
        className="w-full space-y-3"
        style={{ marginTop: "132px", marginBottom: "60px" }}
      >
        <div className="flex flex-col items-center gap-4 sm:grid sm:grid-cols-[1fr_auto_1fr] sm:items-center">
          <div className="hidden sm:block" />

          <h1 className="text-4xl font-bold tracking-tight text-white sm:justify-self-center">
            Patient Dashboard
          </h1>
        </div>

        <p className="text-center text-zinc-500 text-lg font-medium">
          Your medical data is encrypted and stored on IPFS.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid w-full max-w-6xl grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4 ml-5!">
        <StatsCard
          title="Medical Reports"
          value={totalReports > 0 ? String(totalReports) : "—"}
          icon={<FileText className="text-blue-400" size={28} />}
        />
        <StatsCard
          title="Active Consents"
          value={activeConsents > 0 ? String(activeConsents) : "—"}
          icon={<ShieldCheck className="text-emerald-400" size={28} />}
        />
        <StatsCard
          title="Health Score"
          value={totalReports > 0 ? `${avgConfidence}%` : "—"}
          icon={<Activity className="text-rose-400" size={28} />}
        />
        <StatsCard
          title="Data Points"
          value={totalReports > 0 && dataPointsRaw > 0 ? dataPoints : "—"}
          icon={<Database className="text-purple-400" size={28} />}
        />
      </div>

      <div className="grid grid-cols-1 gap-20 2xl:grid-cols-3 ml-5!">
        {/* Recent Reports */}
        <div
          className="2xl:col-span-2 space-y-14 pt-10 lg:pt-16 2xl:pt-20"
          style={{ marginTop: "60px" }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 mb-8!">
              <h2 className="text-2xl font-bold text-white">Recent Activity</h2>
            </div>
          </div>
          <div className="glass-card w-full max-w-[1160px] rounded-2xl border border-white/5 p-4 shadow-2xl shadow-black/50 min-h-[360px]">
            <div className="space-y-4">
              {recentReports.length > 0 ? (
                recentReports.map((report) => (
                  <ReportItem
                    key={report.id}
                    title={report.title}
                    date={report.date}
                    provider={report.provider}
                    status={report.status}
                    cid={report.cid.length > 15 ? report.cid.slice(0, 8) + "..." + report.cid.slice(-5) : report.cid}
                    summary={report.aiSummary}
                    confidence={report.confidence}
                    conditions={report.conditions}
                    type={report.type}
                  />
                ))
              ) : (
                <div className="flex min-h-[300px] items-center justify-center rounded-2xl border border-white/[0.03] bg-white/[0.01] px-10 py-10 text-center">
                  <div className="flex flex-col items-center justify-center text-center">
                    <p className="whitespace-nowrap text-base font-semibold text-white">
                      No recent uploads yet
                    </p>
                    <p className="mt-2 max-w-xl text-sm text-zinc-500">
                    Upload a medical report to see the latest AI analysis here.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatsCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: string;
  icon: ReactNode;
}) {
  return (
    <div className="glass-card stat-card-glow relative h-full min-h-[150px] rounded-[24px] border border-white/5 p-5 group flex flex-col items-center justify-center gap-3 overflow-hidden text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/[0.03] transition-all duration-500 group-hover:bg-blue-500/10 group-hover:scale-110">
        {icon}
      </div>
      <div className="flex flex-col items-center justify-center gap-1 text-center px-2">
        <p className="text-zinc-500 text-[11px] font-bold uppercase tracking-[0.18em] leading-none">
          {title}
        </p>
        <h3 className="text-3xl font-bold text-white tracking-tighter leading-none">
          {value}
        </h3>
      </div>
    </div>
  );
}

function ReportItem({
  title,
  date,
  provider,
  status,
  cid,
  summary,
  confidence,
  conditions,
  type,
}: {
  title: string;
  date: string;
  provider: string;
  status: string;
  cid: string;
  summary?: string | null;
  confidence?: number | null;
  conditions?: string[];
  type?: string;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-2xl border border-white/[0.03] bg-white/[0.01] transition-all group hover:bg-white/[0.02]">
      <div className="flex min-h-[96px] items-center justify-between px-10 py-6">
        <div className="flex items-center gap-6">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.02] text-zinc-500 group-hover:bg-blue-500/10 group-hover:text-blue-500 transition-all duration-500">
            <FileText size={22} />
          </div>
          <div className="space-y-2.5 pr-4">
            <h4 className="font-bold text-white text-[16px] leading-tight group-hover:text-blue-400 transition-colors">
              {title}
            </h4>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-zinc-500 font-medium">
              <span className="flex items-center gap-2">
                <Calendar size={14} className="text-zinc-600" /> {date}
              </span>
              <span className="flex items-center gap-2">
                <User size={14} className="text-zinc-600" /> {provider}
              </span>
              <span className="hidden sm:inline text-zinc-700">|</span>
              <span className="hidden sm:inline font-mono text-[10px] text-zinc-600">
                ID: {cid}
              </span>
            </div>
            {summary && (
              <p className="max-w-3xl text-sm leading-relaxed text-zinc-500">
                {summary}
              </p>
            )}
            {(type || confidence !== null || (conditions && conditions.length > 0)) && (
              <div className="flex flex-wrap items-center gap-2 pt-1">
                {type && (
                  <span className="rounded-full border border-white/5 bg-white/[0.03] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                    {type}
                  </span>
                )}
                {typeof confidence === "number" && (
                  <span className="rounded-full border border-blue-500/10 bg-blue-500/5 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-blue-400">
                    {confidence}% Confidence
                  </span>
                )}
                {conditions?.slice(0, 2).map((condition) => (
                  <span key={condition} className="rounded-full border border-orange-500/10 bg-orange-500/5 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-orange-400">
                    {condition}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-5 pl-4">
          <span
            className={`text-[10px] font-bold px-4 py-1.5 rounded-full border tracking-wider uppercase ${
              status === "Analyzed"
                ? "bg-emerald-500/5 border-emerald-500/10 text-emerald-400"
                : "bg-orange-500/5 border-orange-500/10 text-orange-400"
            }`}
          >
            {status}
          </span>
          <button
            type="button"
            onClick={() => setExpanded((value) => !value)}
            aria-expanded={expanded}
            aria-label={expanded ? "Collapse report details" : "Expand report details"}
            className="h-10 w-10 flex items-center justify-center rounded-full bg-white/[0.02] border border-white/5 text-zinc-600 transition-all hover:text-blue-400 hover:border-blue-500/20 hover:bg-blue-500/5"
          >
            <ChevronDown
              size={18}
              className={`transition-transform duration-300 ${expanded ? "rotate-180" : ""}`}
            />
          </button>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-white/[0.03] px-10 py-8">
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            <DetailField label="Report Title" value={title} />
            <DetailField label="Date" value={date} />
            <DetailField label="Provider" value={provider} />
            <DetailField label="Status" value={status} />
            <DetailField label="Document ID" value={cid} mono />
            <DetailField label="Type" value={type ?? "Report"} />
            <DetailField label="Confidence" value={typeof confidence === "number" ? `${confidence}%` : "—"} />
            <DetailField
              label="Summary"
              value={summary ?? "No summary available."}
              className="md:col-span-2 xl:col-span-3"
            />
            <DetailField
              label="Conditions"
              value={conditions && conditions.length > 0 ? conditions.join(", ") : "—"}
              className="md:col-span-2 xl:col-span-3"
            />
          </div>
        </div>
      )}
    </div>
  );
}

function DetailField({
  label,
  value,
  mono,
  className,
}: {
  label: string;
  value: string;
  mono?: boolean;
  className?: string;
}) {
  return (
    <div className={`rounded-2xl border border-white/[0.03] bg-white/[0.015] px-5 py-4 ${className ?? ""}`}>
      <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-zinc-500">
        {label}
      </p>
      <p className={`mt-2 text-sm leading-relaxed text-white ${mono ? "font-mono text-[12px] text-zinc-400" : ""}`}>
        {value}
      </p>
    </div>
  );
}
