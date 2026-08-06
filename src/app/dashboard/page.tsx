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
  Trash2,
} from "lucide-react";
import {
  loadRecentActivity,
  deleteRecentActivity,
  type RecentActivityRecord,
} from "@/lib/recent-activity";

export default function Dashboard() {
  const [mounted, setMounted] = useState(false);
  const [recentReports, setRecentReports] = useState<RecentActivityRecord[]>([]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    window.scrollTo(0, 0);
  }, [mounted]);

  useEffect(() => {
    if (!mounted) return;

    const refreshReports = () => {
      setRecentReports(loadRecentActivity());
    };

    refreshReports();
    window.addEventListener("storage", refreshReports);
    window.addEventListener("focus", refreshReports);
    window.addEventListener("medchain:recent-activity-updated", refreshReports as EventListener);

    return () => {
      window.removeEventListener("storage", refreshReports);
      window.removeEventListener("focus", refreshReports);
      window.removeEventListener("medchain:recent-activity-updated", refreshReports as EventListener);
    };
  }, [mounted]);

  if (!mounted) return null;

  // ── Dynamic stats derived from real uploaded reports ──────────────────────
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
          value={String(totalReports)}
          icon={<FileText className="text-blue-400" size={28} />}
        />
        <StatsCard
          title="Active Consents"
          value={String(activeConsents)}
          icon={<ShieldCheck className="text-emerald-400" size={28} />}
        />
        <StatsCard
          title="Health Score"
          value={totalReports > 0 ? `${avgConfidence}%` : "0%"}
          icon={<Activity className="text-rose-400" size={28} />}
        />
        <StatsCard
          title="Data Points"
          value={totalReports > 0 && dataPointsRaw > 0 ? dataPoints : "0"}
          icon={<Database className="text-purple-400" size={28} />}
        />
      </div>

      <div className="grid grid-cols-1 gap-20 2xl:grid-cols-3 ml-5!">
        {/* Recent Reports */}
        <div
          className="2xl:col-span-2 space-y-14 pt-10 lg:pt-16 2xl:pt-20"
          style={{ marginTop: "60px" }}
        >
          <div className="flex items-center justify-between" style={{ paddingLeft: "0.5rem", paddingRight: "0.5rem" }}>
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
                    cid={
                      report.cid.length > 15
                        ? `${report.cid.slice(0, 8)}...${report.cid.slice(-5)}`
                        : report.cid
                    }
                    summary={report.aiSummary}
                    confidence={report.confidence}
                    conditions={report.conditions}
                    type={report.type}
                    onDelete={() => {
                      deleteRecentActivity(report.id);
                      setRecentReports(loadRecentActivity());
                    }}
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
  onDelete,
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
  onDelete?: () => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-2xl border border-white/[0.03] bg-white/[0.01] transition-all group hover:bg-white/[0.02]">
      <div
        className="flex min-h-[96px] cursor-pointer items-center justify-between py-6"
        style={{ paddingLeft: "3rem", paddingRight: "3rem" }}
        onClick={() => setExpanded((value) => !value)}
        role="button"
        tabIndex={0}
        aria-expanded={expanded}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            setExpanded((value) => !value);
          }
        }}
      >
        <div className="flex items-center gap-3">
          <FileText size={16} className="shrink-0 text-zinc-500 group-hover:text-blue-400 transition-colors" />
          <h4 className="font-bold text-white text-[16px] leading-tight group-hover:text-blue-400 transition-colors">
            {title}
          </h4>
        </div>
        <div className="flex items-center gap-5 pl-4">
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onDelete?.();
            }}
            aria-label={`Delete ${title} record`}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/5 bg-white/[0.02] text-zinc-600 transition-all hover:border-red-500/20 hover:bg-red-500/10 hover:text-red-400"
            title="Delete record"
          >
            <Trash2 size={14} />
          </button>
          <span
            className={`text-[10px] font-bold px-4 py-1.5 rounded-full tracking-wider uppercase ${
              status === "Analyzed"
                ? "bg-emerald-500/5 text-emerald-400"
                : "bg-orange-500/5 text-orange-400"
            }`}
          >
            {status}
          </span>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              setExpanded((value) => !value);
            }}
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
        <div
          className="animate-fade-in border-t border-white/[0.03]"
          style={{ paddingLeft: "3rem", paddingRight: "3rem", paddingTop: "2rem", paddingBottom: "2rem" }}
        >
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            <DetailField label="Report Title" value={title} />
            <DetailField label="Date" value={date} />
            <DetailField label="Provider" value={provider} />
            <DetailField label="Status" value={status} hideLabel />
            <DetailField label="Document ID" value={cid} mono />
            <DetailField label="Type" value={type ?? "Report"} />
            <DetailField label="Confidence" value={typeof confidence === "number" ? `${confidence}%` : "�"} />
            <DetailField
              label="Summary"
              value={summary ?? "No summary available."}
              className="md:col-span-2 xl:col-span-3"
            />
            <DetailField
              label="Conditions"
              value={conditions && conditions.length > 0 ? conditions.join(", ") : "�"}
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
  hideLabel,
}: {
  label: string;
  value: string;
  mono?: boolean;
  className?: string;
  hideLabel?: boolean;
}) {
  return (
    <div
      className={`border border-white/[0.03] bg-white/[0.015] transition-colors hover:bg-white/[0.04] hover:border-white/10 ${className ?? ""}`}
      style={{ paddingLeft: "1.5rem", paddingRight: "1.5rem", paddingTop: "1rem", paddingBottom: "1rem" }}
    >
      {!hideLabel && (
        <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-zinc-500">
          {label}
        </p>
      )}
      <p
        className={`text-sm leading-relaxed text-white ${hideLabel ? "" : "mt-2"} ${mono ? "font-mono text-[12px] text-zinc-400" : ""}`}
      >
        {value}
      </p>
    </div>
  );
}

