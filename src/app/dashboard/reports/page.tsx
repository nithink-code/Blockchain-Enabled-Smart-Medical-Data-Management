"use client";

import { useState, useEffect } from "react";
import {
  FileText, Search, Filter,
  Brain, ChevronDown, AlertCircle, CheckCircle2, Plus
} from "lucide-react";
import Link from "next/link";
import { loadRecentActivity, type RecentActivityRecord } from "@/lib/recent-activity";

export default function ReportsPage() {
  const [reports, setReports] = useState<RecentActivityRecord[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    window.scrollTo(0, 0);
  }, [mounted]);

  useEffect(() => {
    if (!mounted) return;

    const refresh = () => setReports(loadRecentActivity());
    refresh();
    window.addEventListener("storage", refresh);
    window.addEventListener("focus", refresh);
    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener("focus", refresh);
    };
  }, [mounted]);

  if (!mounted) return null;

  const filtered = reports.filter((r) =>
    r.title.toLowerCase().includes(search.toLowerCase()) ||
    r.provider.toLowerCase().includes(search.toLowerCase()) ||
    r.type.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div
      className="flex w-full flex-col items-center animate-fade-in"
      style={{
        maxWidth: "1120px",
        margin: "0 auto",
        paddingTop: "9rem",
        paddingBottom: "4rem",
        paddingLeft: "1.5rem",
        paddingRight: "1.5rem",
        gap: "3.5rem",
      }}
    >
      <div className="flex w-full flex-col items-center text-center" style={{ gap: "2.5rem" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <h1 className="text-4xl font-bold tracking-tight text-white">Medical Reports</h1>
          <p className="text-zinc-500 text-lg font-medium">All your clinical records, secured by IPFS and analyzed by XAI.</p>
        </div>
        <div className="flex justify-center gap-4">
          <button
            className="flex h-14 items-center gap-2.5 border border-white/5 bg-white/[0.02] rounded-2xl text-sm font-bold text-zinc-300 hover:bg-white/[0.05] hover:text-white transition-all"
            style={{ paddingLeft: "2rem", paddingRight: "2rem" }}
          >
            <Filter size={18} className="text-zinc-500" />
            Refine
          </button>
          <Link href="/dashboard/reports/upload">
            <button
              className="premium-button flex h-14 items-center gap-3 rounded-2xl text-sm font-bold text-white"
              style={{ paddingLeft: "2.5rem", paddingRight: "2.5rem" }}
            >
              <Plus size={20} />
              New Report
            </button>
          </Link>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="relative group" style={{ width: "100%", maxWidth: "560px", margin: "0 auto" }}>
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-600 group-focus-within:text-blue-400 transition-colors" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by diagnosis, doctor, or record type..."
          className="w-full bg-white/[0.02] border border-white/5 rounded-[24px] text-base text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:bg-white/[0.04] transition-all"
          style={{ height: "4rem", paddingLeft: "3.5rem", paddingRight: "1.5rem" }}
        />
      </div>

      {/* Report Cards */}
      <div className="w-full space-y-8">
        {filtered.length > 0 ? (
          filtered.map((report) => (
            <div key={report.id} className="glass-card rounded-[32px] border border-white/5 overflow-hidden">
              {/* Header Row */}
              <div
                className={`flex items-center gap-7 cursor-pointer transition-colors ${
                  expandedId === report.id ? "bg-white/[0.02]" : "hover:bg-white/[0.01]"
                }`}
                style={{ minHeight: "108px", paddingLeft: "2rem", paddingRight: "2rem", paddingTop: "1.75rem", paddingBottom: "1.75rem" }}
                onClick={() =>
                  report.status === "Analyzed" &&
                  setExpandedId(expandedId === report.id ? null : report.id)
                }
              >
                <div className="flex flex-1 min-w-0 items-center gap-3">
                  <FileText size={16} className="shrink-0 text-zinc-500 group-hover:text-blue-400 transition-colors" />
                  <h3 className="text-lg font-bold text-white tracking-tight">{report.title}</h3>
                </div>
                <div className="flex items-center gap-6 shrink-0">
                  <span className="hidden lg:block text-[11px] font-bold text-zinc-500 px-3 py-1.5 rounded-xl uppercase tracking-widest">
                    {report.type}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-4 py-2 rounded-full tracking-widest uppercase ${
                      report.status === "Analyzed"
                        ? "text-emerald-400"
                        : "text-orange-400"
                    }`}
                  >
                    {report.status}
                  </span>
                  {report.status === "Analyzed" && (
                    <div
                      className={`p-2 rounded-full bg-white/[0.02] border border-white/5 text-zinc-500 transition-transform duration-300 ${
                        expandedId === report.id ? "rotate-180" : ""
                      }`}
                    >
                      <ChevronDown size={18} />
                    </div>
                  )}
                </div>
              </div>

              {/* AI Insights Panel */}
              {expandedId === report.id && report.aiSummary && (
                <div
                  className="border-t border-white/5 bg-blue-500/[0.01] animate-fade-in"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "2rem",
                    paddingLeft: "2rem",
                    paddingRight: "2rem",
                    paddingTop: "2rem",
                    paddingBottom: "2rem",
                  }}
                >
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <ReportDetailField label="Date" value={report.date} />
                    <ReportDetailField label="Provider" value={report.provider} />
                    <ReportDetailField label="Document ID" value={report.cid} mono />
                    <ReportDetailField label="Type" value={report.type} />
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-4" style={{ gap: "2.5rem", marginTop: "0.5rem" }}>
                    <div
                      className="lg:col-span-3"
                      style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
                    >
                      <div className="flex items-center gap-2.5 text-[10px] font-bold uppercase tracking-[0.2em] text-blue-400">
                        <Brain size={14} /> MedGemma Intelligence Breakdown
                      </div>
                      <p className="text-[15px] text-zinc-300 leading-relaxed font-medium">{report.aiSummary}</p>
                    </div>
                    <div
                      className="lg:border-l lg:border-white/5"
                      style={{ display: "flex", flexDirection: "column", gap: "1.25rem", paddingLeft: "2rem" }}
                    >
                      {typeof report.confidence === "number" && (
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Diagnostic Confidence</p>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                              <div className="h-full bg-emerald-500" style={{ width: `${report.confidence}%` }} />
                            </div>
                            <span className="text-sm font-bold text-emerald-400">{report.confidence}%</span>
                          </div>
                        </div>
                      )}
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">XAI Models</p>
                        <div className="flex flex-wrap gap-2 pt-1">
                          {["LIME", "SHAP", "Attention"].map((tag) => (
                            <span key={tag} className="px-2 py-0.5 rounded text-[10px] font-bold text-indigo-400">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-white/5">
                    <div className="flex flex-wrap gap-3">
                      {report.conditions.map((c) => (
                        <span key={c} className="rounded-xl px-4 py-2 text-xs font-bold text-orange-400 flex items-center gap-2">
                          <AlertCircle size={14} /> {c}
                        </span>
                      ))}
                      {report.conditions.length === 0 && (
                        <span className="rounded-xl px-4 py-2 text-xs font-bold text-emerald-400 flex items-center gap-2">
                          <CheckCircle2 size={14} /> Systemic Health Normal
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div
            className="flex flex-col items-center justify-center text-center"
            style={{ paddingTop: "8rem", paddingBottom: "8rem", gap: "1.5rem" }}
          >
            <div className="bg-white/[0.02] border border-white/5 rounded-full" style={{ padding: "1.5rem" }}>
              {search ? (
                <Search size={32} className="text-zinc-700" />
              ) : (
                <FileText size={32} className="text-zinc-700" />
              )}
            </div>
            {search ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <h3 className="text-xl font-bold text-white">No results found</h3>
                <p className="text-zinc-500" style={{ maxWidth: "24rem", margin: "0 auto" }}>
                  We could not find any reports matching your search. Try adjusting your keywords.
                </p>
              </div>
            ) : (
              <>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  <h3 className="text-xl font-bold text-white">No reports yet</h3>
                  <p className="text-zinc-500" style={{ maxWidth: "24rem", margin: "0 auto" }}>
                    Upload your first medical document to get AI-powered analysis and XAI insights.
                  </p>
                </div>
                <Link href="/dashboard/reports/upload">
                  <button
                    className="premium-button flex h-12 items-center gap-3 rounded-2xl text-sm font-bold text-white"
                    style={{ paddingLeft: "2.75rem", paddingRight: "2.75rem" }}
                  >
                    <Plus size={18} /> Upload First Report
                  </button>
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function ReportDetailField({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div
      className="border border-white/[0.03] bg-white/[0.015] transition-colors hover:bg-white/[0.04] hover:border-white/10"
      style={{ paddingLeft: "1.5rem", paddingRight: "1.5rem", paddingTop: "1rem", paddingBottom: "1rem" }}
    >
      <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-zinc-500">{label}</p>
      <p className={`mt-2 text-sm leading-relaxed text-white ${mono ? "font-mono text-[12px] text-zinc-400" : ""}`}>
        {value}
      </p>
    </div>
  );
}
