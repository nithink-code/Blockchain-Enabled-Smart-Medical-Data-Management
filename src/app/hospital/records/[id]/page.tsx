"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2, ShieldAlert } from "lucide-react";
import { loadRecentActivity, parseProviderLabel, type RecentActivityRecord } from "@/lib/recent-activity";
import { loadAccessRequests } from "@/lib/access-requests";

type ViewState = "loading" | "not-found" | "no-access" | "ready";

function buildRecordPdfUrl(record: RecentActivityRecord): Promise<string> {
  return import("jspdf").then(({ default: jsPDF }) => {
    const parsed = parseProviderLabel(record.provider);
    const patientLabel = parsed.name || "Patient";
    const ageGender = [parsed.age, parsed.gender].filter(Boolean).join(" ") || "Not provided";

    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const marginX = 56;
    let y = 64;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(16, 150, 100);
    doc.text("MEDCHAIN · CONFIDENTIAL MEDICAL RECORD", marginX, y);

    y += 26;
    doc.setFontSize(18);
    doc.setTextColor(20, 20, 20);
    doc.text(record.title, marginX, y);

    y += 30;
    doc.setDrawColor(220, 220, 220);
    doc.line(marginX, y, 539, y);

    const field = (label: string, value: string) => {
      y += 26;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(120, 120, 120);
      doc.text(label.toUpperCase(), marginX, y);
      y += 14;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);
      doc.setTextColor(20, 20, 20);
      doc.text(value, marginX, y);
    };

    y += 10;
    field("Patient Name", patientLabel);
    field("Age / Gender", ageGender);
    field("Report Type", record.type);
    field("Uploaded", record.date);
    field("Status", record.status);
    field("Storage CID", record.cid);

    y += 30;
    doc.line(marginX, y, 539, y);
    y += 26;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(120, 120, 120);
    doc.text("AI CLINICAL SUMMARY", marginX, y);
    y += 16;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(40, 40, 40);
    const summaryLines = doc.splitTextToSize(
      record.aiSummary || "AI analysis in progress.",
      539 - marginX
    );
    doc.text(summaryLines, marginX, y);
    y += summaryLines.length * 14 + 20;

    doc.line(marginX, y, 539, y);
    y += 26;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(120, 120, 120);
    doc.text("EXTRACTED CONDITIONS", marginX, y);
    y += 16;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(40, 40, 40);
    const conditionsText =
      record.conditions.length > 0 ? record.conditions.join(", ") : "No extracted conditions";
    doc.text(doc.splitTextToSize(conditionsText, 539 - marginX), marginX, y);

    y += 40;
    doc.line(marginX, y, 539, y);
    y += 26;
    field("Confidence", record.confidence !== null ? `${record.confidence}%` : "Pending");
    field("Summary Status", record.aiSummary ? "Ready" : "Processing");

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(160, 160, 160);
    doc.text(
      "Generated for authorized clinical review only. This document cannot be downloaded or exported.",
      marginX,
      780
    );

    const blob = doc.output("blob");
    return URL.createObjectURL(blob);
  });
}

export default function RecordDocumentPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const recordId = params.id;

  const [state, setState] = useState<ViewState>("loading");
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let objectUrl: string | null = null;

    async function load() {
      const found = loadRecentActivity().find((r) => r.id === recordId) ?? null;
      if (!found) {
        if (!cancelled) setState("not-found");
        return;
      }

      const requests = await loadAccessRequests();
      const hasApprovedAccess = requests.some(
        (r) => r.recordId === recordId && r.status === "approved"
      );

      if (cancelled) return;

      if (!hasApprovedAccess) {
        setState("no-access");
        return;
      }

      const url = await buildRecordPdfUrl(found);
      if (cancelled) {
        URL.revokeObjectURL(url);
        return;
      }

      objectUrl = url;
      setPdfUrl(url);
      setState("ready");
    }

    load();
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [recordId]);

  if (state === "loading") {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-zinc-500">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
        <p className="text-sm font-medium">Verifying access permissions...</p>
      </div>
    );
  }

  if (state === "not-found") {
    return (
      <StatusScreen
        icon={<ShieldAlert size={28} className="text-zinc-500" />}
        title="Record not found"
        message="This patient record no longer exists or has been removed."
        router={router}
      />
    );
  }

  if (state === "no-access" || !pdfUrl) {
    return (
      <StatusScreen
        icon={<ShieldAlert size={28} className="text-red-400" />}
        title="Access not granted"
        message="The patient has not approved your access request for this record yet."
        router={router}
      />
    );
  }

  return (
    <div
      className="mx-auto mt-20! flex h-[calc(100vh-180px)]! w-full max-w-[840px] translate-x-52 flex-col items-center gap-4 animate-fade-in"
      onContextMenu={(e) => e.preventDefault()}
    >
      <button
        onClick={() => router.push("/hospital")}
        className="inline-flex w-fit items-center gap-2 self-start text-sm font-semibold text-zinc-400 transition-colors hover:text-white"
      >
        <ArrowLeft size={16} /> Back to dashboard
      </button>

      <h1 className="text-2xl font-bold tracking-tight text-white">Patient Record</h1>

      <iframe
        src={`${pdfUrl}#toolbar=0&navpanes=0&scrollbar=1`}
        title="Patient record document"
        className="w-full flex-1 rounded-2xl border border-white/10 bg-white shadow-2xl shadow-black/40"
      />
    </div>
  );
}

function StatusScreen({
  icon,
  title,
  message,
  router,
}: {
  icon: React.ReactNode;
  title: string;
  message: string;
  router: ReturnType<typeof useRouter>;
}) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center animate-fade-in">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03]">
        {icon}
      </div>
      <h2 className="text-xl font-bold text-white">{title}</h2>
      <p className="max-w-sm text-sm text-zinc-500">{message}</p>
      <button
        onClick={() => router.push("/hospital")}
        className="mt-2 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm font-semibold text-zinc-300 transition-colors hover:bg-white/[0.06] hover:text-white"
      >
        <ArrowLeft size={16} /> Back to dashboard
      </button>
    </div>
  );
}
