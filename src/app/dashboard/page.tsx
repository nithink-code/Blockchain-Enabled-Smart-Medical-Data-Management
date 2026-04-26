"use client";

import { useState, useEffect, ReactNode } from "react";
import {
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  FileText,
  ShieldCheck,
  Activity,
  Calendar,
  User,
  Brain,
  Database,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { REPORTS } from "@/lib/data";

export default function Dashboard() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) return null;

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

          <div className="hidden sm:flex sm:relative sm:right-4 sm:justify-self-end lg:right-6">
            <Link href="/dashboard/reports/upload">
              <button className="premium-button inline-flex h-10 min-w-[250px] items-center justify-center gap-2 whitespace-nowrap rounded-xl px-8 text-[13px] font-bold text-white shadow-lg shadow-blue-500/20 text-center">
                <Plus size={16} />
                Upload New Report
              </button>
            </Link>
          </div>
        </div>

        <p className="text-center text-zinc-500 text-lg font-medium">
          Your medical data is encrypted and stored on IPFS.
        </p>

        <div className="flex justify-center sm:hidden">
          <Link href="/dashboard/reports/upload">
            <button className="premium-button inline-flex h-10 min-w-[220px] items-center justify-center gap-2 whitespace-nowrap rounded-xl px-8 text-[13px] font-bold text-white shadow-lg shadow-blue-500/20 text-center">
              {/* <Plus size={15} /> */}
              Upload New Report
            </button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid w-full max-w-6xl grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4 ml-5!">
        <StatsCard
          title="Medical Reports"
          value="12"
          change="+2"
          trend="up"
          icon={<FileText className="text-blue-400" size={28} />}
        />
        <StatsCard
          title="Active Consents"
          value="3"
          change="+1"
          trend="up"
          icon={<ShieldCheck className="text-emerald-400" size={28} />}
        />
        <StatsCard
          title="Health Score"
          value="94"
          change="0"
          trend="neutral"
          icon={<Activity className="text-rose-400" size={28} />}
        />
        <StatsCard
          title="Data Points"
          value="1.2k"
          change="+124"
          trend="up"
          icon={<Database className="text-purple-400" size={28} />}
        />
      </div>

      <div className="grid grid-cols-1 gap-20 2xl:grid-cols-3  ml-5!">
        {/* Recent Reports */}
        <div
          className="2xl:col-span-2 space-y-14 pt-10 lg:pt-16 2xl:pt-20"
          style={{ marginTop: "60px" }}
        >
          <Link href="/dashboard/consent" className="block mt-6! w-sm mb-6!">
              <button className="w-full h-12 rounded-2xl border border-white/5 bg-white/[0.02] text-sm font-bold text-zinc-400 hover:bg-white/[0.04] hover:text-white transition-all" style={{marginLeft: "380px"}}>
                Manage Permissions
              </button>
            </Link>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 mb-8!">
              <h2 className="text-2xl font-bold text-white">Recent Activity</h2>
              <span className="bg-white/5 border border-white/10 text-zinc-500 text-[10px] font-bold px-2 py-0.5 rounded-lg uppercase tracking-wider">
                Updates
              </span>
            </div>
            <Link
              href="/dashboard/reports"
              className="text-xs font-bold text-blue-400 hover:text-blue-300 transition-all flex items-center gap-1.5 px-5 py-10 rounded-lg bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] hover:border-white/10 mr-8!"
            >
              Browse All <ArrowUpRight size={14} />
            </Link>
          </div>
          <div className="glass-card w-full max-w-[1160px] rounded-2xl border border-white/5 p-4 shadow-2xl shadow-black/50">
            <div className="space-y-4">
              {REPORTS.slice(0, 3).map((report) => (
                <ReportItem
                  key={report.id}
                  title={report.title}
                  date={report.date}
                  provider={report.provider}
                  status={report.status}
                  cid={
                    report.cid.length > 15
                      ? report.cid.slice(0, 8) + "..." + report.cid.slice(-5)
                      : report.cid
                  }
                />
              ))}
            </div>
          </div>
        </div>

        {/* Pending Consents */}
        <div className="space-y-6 mt-20 mb-25!">
          <h2 className="text-xl font-bold text-white flex items-center gap-5 pl-2">
            Access Requests
            {/* <span className="bg-orange-500/10 text-orange-400 text-[10px] px-2 py-0.5 rounded-full">2</span> */}
          </h2>
          <div className="glass-card w-full max-w-[1160px] rounded-2xl border border-white/5 p-4 shadow-2xl shadow-black/50 mt-8!">
            <div className="space-y-4">
              <AccessRequestItem
                hospital="Apollo Hospitals"
                reason="Cardiac evaluation"
                time="2h"
              />
              <AccessRequestItem
                hospital="AIIMS New Delhi"
                reason="Neurology opinion"
                time="5h"
              />
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
  change,
  trend,
  icon,
}: {
  title: string;
  value: string;
  change: string;
  trend: "up" | "down" | "neutral";
  icon: ReactNode;
}) {
  return (
    <div className="glass-card stat-card-glow relative h-full min-h-[150px] rounded-[24px] border border-white/5 p-5 group flex flex-col items-center justify-center gap-3 overflow-hidden text-center">
      <div
        className={`absolute right-4 top-4 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider ${
          trend === "up"
            ? "bg-emerald-500/10 text-emerald-400"
            : trend === "down"
              ? "bg-rose-500/10 text-rose-400"
              : "bg-zinc-500/10 text-zinc-400"
        }`}
      >
        {trend === "up" && <ArrowUpRight size={12} />}
        {trend === "down" && <ArrowDownRight size={12} />}
        {change}
      </div>
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
}: {
  title: string;
  date: string;
  provider: string;
  status: string;
  cid: string;
}) {
  return (
    <div className="flex min-h-[96px] items-center justify-between rounded-2xl border border-white/[0.03] bg-white/[0.01] px-10 py-6 hover:bg-white/[0.02] transition-all cursor-pointer group relative">
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
        <div className="h-10 w-10 flex items-center justify-center rounded-full bg-white/[0.02] border border-white/5 text-zinc-600 group-hover:text-blue-400 group-hover:border-blue-500/20 group-hover:bg-blue-500/5 transition-all">
          <ArrowUpRight size={18} />
        </div>
      </div>
    </div>
  );
}

function AccessRequestItem({
  hospital,
  reason,
  time,
}: {
  hospital: string;
  reason: string;
  time: string;
}) {
  return (
    <div className="flex min-h-[96px] items-center justify-between rounded-2xl border border-white/[0.03] bg-white/[0.01] px-8 py-6 hover:bg-white/[0.02] transition-all cursor-pointer group relative">
      <div className="flex items-center gap-5 pl-2">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.02] text-zinc-500 group-hover:bg-blue-500/10 group-hover:text-blue-500 transition-all duration-500">
          <ShieldCheck size={22} />
        </div>
        <div className="space-y-2 pr-6">
          <p className="text-[16px] font-bold text-white leading-tight group-hover:text-blue-400 transition-colors">
            {hospital}
          </p>
          <p className="text-xs text-zinc-500 font-medium">{reason}</p>
        </div>
      </div>
      <div className="flex items-center gap-3 pr-10 mr-2">
        <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">
          {time} ago
        </p>
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-orange-500"></span>
      </div>
    </div>
  );
}
