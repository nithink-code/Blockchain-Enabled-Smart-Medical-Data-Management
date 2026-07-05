"use client";

import { useState, useEffect } from "react";
import {
  FileText, Search, Filter, ArrowUpRight, Calendar, User,
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
    <div className="space-y-10 animate-fade-in pb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="space-y-1.5">
          <h1 className="text-4xl font-bold tracking-tight text-white">Medical Reports</h1>
          <p className="text-zinc-500 text-lg font-medium">All your clinical records, secured by IPFS and analyzed by XAI.</p>
        </div>
        <div className="flex gap-4">
          <button className="flex h-14 items-center gap-2.5 px-6 border border-white/5 bg-white/[0.02] rounded-2xl text-sm font-bold text-zinc-300 hover:bg-white/[0.05] hover:text-white transition-all">
            <Filter size={18} className="text-zinc-500" />
            Refine
          </button>
          <Link href="/dashboard/reports/upload">
            <button className="premium-button flex h-14 items-center gap-3 rounded-2xl px-8 text-sm font-bold text-white">
              <Plus size={20} />
              New Report
            </button>
          </Link>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="relative group">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-600 group-focus-within:text-blue-400 transition-colors" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by diagnosis, doctor, or record type..."
          className="w-full pl-14 pr-6 py-4 bg-white/[0.02] border border-white/5 rounded-[24px] text-base text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:bg-white/[0.04] transition-all"
        />
      </div>

      {/* Report Cards */}
      <div className="space-y-6">
        {filtered.length > 0 ? (
          filtered.map((report) => (
            <div key={report.id} className="glass-card rounded-[32px] border border-white/5 overflow-hidden">
              {/* Header Row */}
              <div
                className={`flex items-center gap-7 p-8 cursor-pointer transition-colors ${
                  expandedId === report.id ? "bg-white/[0.02]" : "hover:bg-white/[0.01]"
                }`}
                onClick={() =>
                  report.status === "Analyzed" &&
                  setExpandedId(expandedId === report.id ? null : report.id)
                }
              >
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/[0.02] border border-white/5 text-zinc-500 group-hover:bg-blue-500/10 group-hover:text-blue-400 transition-all duration-500">
                  <FileText size={24} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-white tracking-tight">{report.title}</h3>
                    {report.conditions.length > 0 && (
                      <span className="flex items-center gap-1.5 text-[10px] font-bold text-orange-400 bg-orange-500/10 border border-orange-500/10 px-2.5 py-1 rounded-lg uppercase tracking-wider">
                        <AlertCircle size={12} /> {report.conditions.length} Findings
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-6 text-[13px] text-zinc-500 font-medium">
                    <span className="flex items-center gap-2"><Calendar size={15} className="text-zinc-600" /> {report.date}</span>
                    <span className="flex items-center gap-2"><User size={15} className="text-zinc-600" /> {report.provider}</span>
                    <span className="hidden sm:inline font-mono text-[11px] text-zinc-600 opacity-60">
                      CID: {report.cid.length > 16 ? report.cid.slice(0, 16) + "..." : report.cid}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-6 shrink-0">
                  <span className="hidden lg:block text-[11px] font-bold text-zinc-500 bg-white/[0.03] border border-white/5 px-3 py-1.5 rounded-xl uppercase tracking-widest">
                    {report.type}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-4 py-2 rounded-full border tracking-widest uppercase ${
                      report.status === "Analyzed"
                        ? "bg-emerald-500/5 border-emerald-500/10 text-emerald-400"
                        : "bg-orange-500/5 border-orange-500/10 text-orange-400"
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
                <div className="border-t border-white/5 p-8 bg-blue-500/[0.01] space-y-8 animate-fade-in">
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    <div className="lg:col-span-3 space-y-4">
                      <div className="flex items-center gap-2.5 text-[10px] font-bold uppercase tracking-[0.2em] text-blue-400">
                        <Brain size={14} /> MedGemma Intelligence Breakdown
                      </div>
                      <p className="text-[15px] text-zinc-300 leading-relaxed font-medium">{report.aiSummary}</p>
                    </div>
                    <div className="space-y-4 lg:border-l lg:border-white/5 lg:pl-8">
                      {typeof report.confidence === "number" && (
                        <div className="space-y-1">
                          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Diagnostic Confidence</p>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                              <div className="h-full bg-emerald-500" style={{ width: `${report.confidence}%` }} />
                            </div>
                            <span className="text-sm font-bold text-emerald-400">{report.confidence}%</span>
                          </div>
                        </div>
                      )}
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">XAI Models</p>
                        <div className="flex flex-wrap gap-2 pt-1">
                          {["LIME", "SHAP", "Attention"].map((tag) => (
                            <span key={tag} className="px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/10 text-[10px] font-bold text-indigo-400">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pt-6 border-t border-white/5">
                    <div className="flex flex-wrap gap-3">
                      {report.conditions.map((c) => (
                        <span key={c} className="rounded-xl border border-orange-500/20 bg-orange-500/5 px-4 py-2 text-xs font-bold text-orange-400 flex items-center gap-2">
                          <AlertCircle size={14} /> {c}
                        </span>
                      ))}
                      {report.conditions.length === 0 && (
                        <span className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-2 text-xs font-bold text-emerald-400 flex items-center gap-2">
                          <CheckCircle2 size={14} /> Systemic Health Normal
                        </span>
                      )}
                    </div>
                    <Link href="/dashboard/reports/upload" className="w-full sm:w-auto">
                      <button className="w-full sm:w-auto inline-flex items-center justify-center gap-2 text-xs font-bold text-blue-400 hover:text-white bg-blue-500/5 hover:bg-blue-500/10 border border-blue-500/10 px-5 py-2.5 rounded-xl transition-all">
                        View Clinical Explanation <ArrowUpRight size={14} />
                      </button>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="p-6 bg-white/[0.02] border border-white/5 rounded-full mb-6">
              {search ? (
                <Search size={32} className="text-zinc-700" />
              ) : (
                <FileText size={32} className="text-zinc-700" />
              )}
            </div>
            {search ? (
              <>
                <h3 className="text-xl font-bold text-white mb-2">No results found</h3>
                <p className="text-zinc-500 max-w-sm mx-auto">
                  We could not find any reports matching your search. Try adjusting your keywords.
                </p>
              </>
            ) : (
              <>
                <h3 className="text-xl font-bold text-white mb-2">No reports yet</h3>
                <p className="text-zinc-500 max-w-sm mx-auto mb-6">
                  Upload your first medical document to get AI-powered analysis and XAI insights.
                </p>
                <Link href="/dashboard/reports/upload">
                  <button className="premium-button flex h-12 items-center gap-3 rounded-2xl px-8 text-sm font-bold text-white">
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
