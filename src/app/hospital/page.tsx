"use client";

import { useEffect, useState, type ReactNode } from "react";
import {
  Activity,
  Clock3,
  FileText,
  Sparkles,
  Brain,
  BadgeInfo,
} from "lucide-react";
import { loadRecentActivity, type RecentActivityRecord } from "@/lib/recent-activity";

type RecordView = RecentActivityRecord & {
  patientLabel: string;
  ageGender: string;
  statusClass: string;
};

function parseProvider(provider: string) {
  const parts = provider.includes("â€¢")
    ? provider.split("â€¢")
    : provider.split(/[\u2022\u00B7]/);
  const [name = "Patient", age = "", gender = ""] = parts.map((part) => part.trim()).filter(Boolean);

  return {
    name,
    age,
    gender,
  };
}

function toRecordView(record: RecentActivityRecord): RecordView {
  const parsed = parseProvider(record.provider);
  const ageGender = [parsed.age, parsed.gender].filter(Boolean).join(" ");
  const patientLabel = parsed.name || "Patient";
  const confidence =
    typeof record.confidence === "number" ? record.confidence : null;
  const statusClass =
    record.status === "Processing"
      ? "text-orange-300 bg-orange-500/10 border-orange-500/10"
      : confidence !== null && confidence >= 80
        ? "text-emerald-300 bg-emerald-500/10 border-emerald-500/10"
        : "text-blue-300 bg-blue-500/10 border-blue-500/10";

  return {
    ...record,
    patientLabel,
    ageGender,
    statusClass,
  };
}

export default function HospitalDashboard() {
  const [records, setRecords] = useState<RecordView[]>([]);

  useEffect(() => {
    const syncRecords = () => {
      const next = loadRecentActivity().map(toRecordView);
      setRecords(next);
    };

    syncRecords();
    window.addEventListener("storage", syncRecords);
    window.addEventListener("medchain:recent-activity-updated", syncRecords as EventListener);

    return () => {
      window.removeEventListener("storage", syncRecords);
      window.removeEventListener("medchain:recent-activity-updated", syncRecords as EventListener);
    };
  }, []);

  return (
    <div className="space-y-8 pb-10 animate-fade-in mt-20!">
      <div className="space-y-2 text-center">
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-emerald-400 mb-10!">
          Medical dashboard
        </p>
        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
          Recent Patient Records
        </h1>
        <p className="mx-auto max-w-3xl text-base text-zinc-400 sm:text-lg mt-5! ml-60! mb-8!">
          Patient records appear here immediately after upload and are centered for a clean
          dashboard view.
        </p>
      </div>

      <div className="mx-auto w-full max-w-[1120px] space-y-4">
        <div className="flex items-end justify-between gap-4 px-1 ml-10! mb-8!">
          <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-500 ml-130! mb-10! mt-6!">
              Patient Reports
            </p>
            <h2 className="text-2xl font-bold tracking-tight text-white">
              Uploaded patient Reports
            </h2>
          </div>
        </div>

        {records.length === 0 ? (
          <div className="flex min-h-[300px] w-full flex-col items-center justify-center rounded-[28px] border border-dashed border-white/10 bg-white/[0.02] px-6 text-center">
            <Sparkles size={28} className="text-zinc-500" />
            <h3 className="mt-4 text-xl font-bold text-white">No patient records yet</h3>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-zinc-500">
              Upload a medical report from the patient dashboard and the latest record card
              will show up here automatically.
            </p>
          </div>
        ) : (
          <div className="grid w-full auto-rows-fr gap-8 sm:grid-cols-2 justify-items-stretch lg:translate-x-8 xl:translate-x-12">
            {records.map((record) => (
              <PatientRecordCard key={record.id} record={record} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function PatientRecordCard({ record }: { record: RecordView }) {
  const confidence = record.confidence;

  return (
    <div className="glass-card flex h-full min-h-[390px] w-full flex-col rounded-[28px] border border-white/5 p-5 transition-all duration-300 hover:border-white/10 md:p-6 p-5!">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 space-y-1 ">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-500 p-2!">
            {record.type}
          </p>
          <h3 className="text-lg font-bold tracking-tight text-white line-clamp-1 md:text-xl p-2!">
            {record.title}
          </h3>
          <p className="text-sm text-zinc-500 p-2!">{record.date}</p>
        </div>

        <span
          className={`rounded-full border p-3! px-3 py-1 text-[10px] font-bold uppercase tracking-widest ${record.statusClass}`}
        >
          {record.status}
        </span>
      </div>

      <div className="mt-5 rounded-2xl border border-white/5 bg-white/[0.02] p-4!">
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-500">
          <BadgeInfo size={14} className="text-blue-400" />
          Patient details
        </div>
        <div className="mt-3 space-y-2.5 p-4!">
          <DetailRow label="Patient" value={record.patientLabel} />
          <DetailRow label="Info" value={record.ageGender || "Not provided"} />
          <DetailRow label="CID" value={record.cid} mono />
        </div>
      </div>

      <p className="mt-4 text-sm leading-6 text-zinc-400 p-4!">
        {record.aiSummary || "AI analysis in progress."}
      </p>

      <div className="mt-4 flex flex-wrap gap-2 p-4!">
        {record.conditions.length > 0 ? (
          record.conditions.map((condition) => (
            <span
              key={condition}
              className="rounded-xl border border-white/5 bg-black/20 px-3 py-1.5 text-[11px] font-semibold text-zinc-400"
            >
              {condition}
            </span>
          ))
        ) : (
          <span className="rounded-xl border border-white/5 bg-black/20 px-3 py-1.5 text-[11px] font-semibold text-zinc-500">
            No extracted conditions
          </span>
        )}
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 rounded-[24px] border border-white/[0.04] bg-white/[0.02] p-4">
        <Metric
          label="Confidence"
          value={confidence !== null ? `${confidence}%` : "Pending"}
          icon={<Brain size={14} />}
          accent="text-emerald-400"
        />
        <Metric
          label="Files"
          value="1 upload"
          icon={<FileText size={14} />}
          accent="text-blue-400"
        />
        <Metric
          label="Summary"
          value={record.aiSummary ? "Ready" : "Processing"}
          icon={<Activity size={14} />}
          accent="text-orange-400"
        />
        <Metric
          label="Updated"
          value={record.date}
          icon={<Clock3 size={14} />}
          accent="text-zinc-300"
        />
      </div>
    </div>
  );
}

function DetailRow({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-5 rounded-2xl border border-white/5 bg-black/20 px-4 py-3">
      <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">{label}</p>
      <p className={`max-w-[58%] truncate text-sm font-semibold text-zinc-200 ${mono ? "font-mono text-[11px]" : ""}`}>
        {value}
      </p>
    </div>
  );
}

function Metric({
  label,
  value,
  icon,
  accent,
}: {
  label: string;
  value: string;
  icon: ReactNode;
  accent: string;
}) {
  return (
    <div className="rounded-2xl border border-white/5 bg-black/20 p-3.5">
      <div className={`mb-2.5 flex items-center gap-2 text-xs font-bold uppercase tracking-widest ${accent}`}>
        {icon}
        {label}
      </div>
      <p className="text-sm font-semibold text-white">{value}</p>
    </div>
  );
}
