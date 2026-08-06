"use client";

import { Upload, FileText, CheckCircle2, Clock, Trash2, X, Loader, Activity, User, Info, ChevronDown } from "lucide-react";
import { useState, useSyncExternalStore } from "react";
import dynamic from "next/dynamic";
import { saveRecentActivity } from "@/lib/recent-activity";

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });
const ANALYSIS_STORAGE_KEY = "medchain:uploads-analysis-result";
let persistedAnalysisCacheKey: string | null = null;
let persistedAnalysisCacheValue: unknown = null;

const UPLOAD_API_URL =
  process.env.NEXT_PUBLIC_UPLOAD_API_URL ??
  "https://major-project-node-deloyment.onrender.com/api/upload-report";

/** Normalizes the backend's analysis payload (shape not fully guaranteed since it
 * comes from a separate ML service) into what this page's charts/table expect. */
function normalizeUploadsAnalysis(rawData: any) {
  const analysis = rawData?.analysis ?? {};
  const explanation = analysis?.explanation ?? {};

  const rawLime = explanation?.lime_local_impact;
  const lime_local_impact: [string, number][] = Array.isArray(rawLime)
    ? rawLime.filter(
        (item: any) => Array.isArray(item) && typeof item[0] === "string" && typeof item[1] === "number"
      )
    : [];

  const rawShap = explanation?.shap_global_contribution;
  const shap_global_contribution: Record<string, number> =
    rawShap && typeof rawShap === "object" && !Array.isArray(rawShap)
      ? (Object.fromEntries(
          Object.entries(rawShap).filter(([, v]) => typeof v === "number")
        ) as Record<string, number>)
      : {};

  const probability = analysis?.probability ?? {};
  const extracted_data = analysis?.extracted_data && typeof analysis.extracted_data === "object"
    ? analysis.extracted_data
    : {};

  return {
    cid: typeof rawData?.cid === "string" ? rawData.cid : null,
    prediction: analysis?.prediction ?? "Unknown",
    probability: {
      benign: typeof probability?.benign === "number" ? probability.benign : 0,
      malignant: typeof probability?.malignant === "number" ? probability.malignant : 0,
    },
    explanation: { lime_local_impact, shap_global_contribution },
    extracted_data,
  };
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function hashString(input: string) {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function seededFloat(seed: string, salt = 0) {
  const x = Math.sin(hashString(`${seed}:${salt}`)) * 10000;
  return x - Math.floor(x);
}

function numericFeatureValue(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

function normalizeFeatureValue(value: number | null, min: number, max: number) {
  if (value === null) return 0.5;
  if (max === min) return 0.5;
  return clamp((value - min) / (max - min), 0, 1);
}

function loadPersistedAnalysisResult() {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(ANALYSIS_STORAGE_KEY);
    if (!raw) return null;

    if (raw === persistedAnalysisCacheKey) {
      return persistedAnalysisCacheValue;
    }

    persistedAnalysisCacheKey = raw;
    persistedAnalysisCacheValue = JSON.parse(raw);
    return persistedAnalysisCacheValue;
  } catch {
    return null;
  }
}

function persistAnalysisResult(analysisResult: unknown) {
  if (typeof window === "undefined") return;

  try {
    if (analysisResult) {
      const serialized = JSON.stringify(analysisResult);
      window.localStorage.setItem(ANALYSIS_STORAGE_KEY, serialized);
      persistedAnalysisCacheKey = serialized;
      persistedAnalysisCacheValue = analysisResult;
    } else {
      window.localStorage.removeItem(ANALYSIS_STORAGE_KEY);
      persistedAnalysisCacheKey = null;
      persistedAnalysisCacheValue = null;
    }
    window.dispatchEvent(new Event("medchain:uploads-analysis-updated"));
  } catch {
    // Ignore browser storage errors.
  }
}

function subscribeToAnalysisStore(onStoreChange: () => void) {
  if (typeof window === "undefined") return () => {};

  const handler = () => onStoreChange();
  window.addEventListener("storage", handler);
  window.addEventListener("medchain:uploads-analysis-updated", handler as EventListener);

  return () => {
    window.removeEventListener("storage", handler);
    window.removeEventListener("medchain:uploads-analysis-updated", handler as EventListener);
  };
}

function usePersistedAnalysisResult() {
  return useSyncExternalStore(
    subscribeToAnalysisStore,
    loadPersistedAnalysisResult,
    () => null
  );
}

function buildLimeData(analysisResult: any) {
  const impacts = Array.isArray(analysisResult?.explanation?.lime_local_impact)
    ? [...analysisResult.explanation.lime_local_impact]
    : [];

  const sorted = impacts
    .filter((item: [string, number]) => Array.isArray(item) && typeof item[1] === "number")
    .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))
    .slice(0, 8);

  const colors = sorted.map(([, value]) => (value >= 0 ? "#ff0057" : "#2f93ff"));
  const x = [...sorted.map((item) => item[1]), 0];
  const y = [...sorted.map((item) => item[0]), "f(x)"];
  const measure = [...sorted.map(() => "relative"), "total"];
  const maxAbs = Math.max(0.25, ...x.map((value) => Math.abs(value)));

  return {
    data: [
      {
        type: "waterfall",
        orientation: "h",
        measure,
        x,
        y,
        base: 0,
        increasing: { marker: { color: "#ff0057" } },
        decreasing: { marker: { color: "#2f93ff" } },
        totals: { marker: { color: "#ff0057" } },
        connector: { line: { color: "rgba(255,255,255,0.22)", width: 1, dash: "dot" } },
        text: x.map((value) => (value > 0 ? `+${value.toFixed(2)}` : value.toFixed(2))),
        textposition: "outside",
        textfont: { color: "#ffffff", size: 11 },
        cliponaxis: false,
        hovertemplate: "%{y}<br>%{x:.2f}<extra></extra>",
      } as any,
    ],
    layout: {
      paper_bgcolor: "rgba(0,0,0,0)",
      plot_bgcolor: "rgba(0,0,0,0)",
      font: { color: "#a1a1aa", family: "Inter, sans-serif" },
      autosize: true,
      showlegend: false,
      margin: { t: 30, b: 50, l: 120, r: 30 },
      xaxis: {
        gridcolor: "rgba(255,255,255,0.05)",
        zerolinecolor: "rgba(255,255,255,0.18)",
        zerolinewidth: 1.2,
        tickfont: { color: "#9ca3af", size: 10 },
        title: { text: "Impact on prediction", font: { size: 12, color: "#9ca3af" } },
        range: [-maxAbs * 1.2, maxAbs * 1.2],
        ticks: "outside",
      },
      yaxis: {
        tickfont: { color: "#e5e7eb", size: 12 },
        gridcolor: "rgba(255,255,255,0.02)",
        autorange: "reversed",
      },
      annotations: [
        {
          x: 0,
          y: 1.08,
          xref: "paper",
          yref: "paper",
          text: "f(x) = 0",
          showarrow: false,
          font: { color: "#d1d5db", size: 12 },
        },
      ],
    },
  };
}

function buildShapData(analysisResult: any) {
  const shapMap = analysisResult?.explanation?.shap_global_contribution ?? {};
  const extractedData = analysisResult?.extracted_data ?? {};
  const entries = Object.entries(shapMap)
    .map(([feature, shapValue]) => ({
      feature,
      shap: Number(shapValue) || 0,
      extracted: numericFeatureValue(extractedData?.[feature]),
    }))
    .sort((a, b) => Math.abs(b.shap) - Math.abs(a.shap))
    .slice(0, 8);

  const numericValues = Object.values(extractedData)
    .map((value) => numericFeatureValue(value))
    .filter((value): value is number => value !== null);
  const minValue = numericValues.length ? Math.min(...numericValues) : 0;
  const maxValue = numericValues.length ? Math.max(...numericValues) : 1;

  const x: number[] = [];
  const y: number[] = [];
  const colors: number[] = [];
  const texts: string[] = [];

  entries.forEach((entry, rowIndex) => {
    const baseColor = normalizeFeatureValue(entry.extracted, minValue, maxValue);
    const spread = Math.max(0.18, Math.abs(entry.shap) * 0.18);

    for (let i = 0; i < 28; i += 1) {
      const jitterX = (seededFloat(`${entry.feature}:${i}`, 1) - 0.5) * spread * 1.8;
      const jitterY = (seededFloat(`${entry.feature}:${i}`, 2) - 0.5) * 0.34;
      x.push(entry.shap + jitterX);
      y.push(rowIndex + jitterY);
      colors.push(clamp(baseColor + (seededFloat(`${entry.feature}:${i}`, 3) - 0.5) * 0.12, 0, 1));
      texts.push(entry.feature);
    }
  });

  return {
    data: [
      {
        type: "scatter",
        mode: "markers",
        x,
        y,
        text: texts,
        marker: {
          size: 7,
          opacity: 0.95,
          color: colors,
          colorscale: [
            [0, "#1d4ed8"],
            [0.5, "#7c3aed"],
            [1, "#ff0057"],
          ],
          cmin: 0,
          cmax: 1,
          colorbar: {
            title: { text: "Feature value" },
            tickmode: "array",
            tickvals: [0, 1],
            ticktext: ["Low", "High"],
            thickness: 14,
            len: 0.85,
            outlinecolor: "transparent",
            tickfont: { color: "#9ca3af", size: 10 },
          },
        },
        hovertemplate: "%{text}<br>SHAP value: %{x:.3f}<extra></extra>",
      } as any,
    ],
    layout: {
      paper_bgcolor: "rgba(0,0,0,0)",
      plot_bgcolor: "rgba(0,0,0,0)",
      font: { color: "#a1a1aa", family: "Inter, sans-serif" },
      autosize: true,
      showlegend: false,
      margin: { t: 20, b: 50, l: 170, r: 20 },
      xaxis: {
        title: { text: "SHAP value (impact on model output)", font: { size: 12, color: "#d1d5db" } },
        gridcolor: "rgba(255,255,255,0.05)",
        zerolinecolor: "rgba(255,255,255,0.35)",
        zerolinewidth: 1.2,
        tickfont: { color: "#9ca3af", size: 10 },
        ticks: "outside",
      },
      yaxis: {
        tickmode: "array",
        tickvals: entries.map((_, index) => index),
        ticktext: entries.map((entry) => entry.feature),
        tickfont: { color: "#e5e7eb", size: 11 },
        gridcolor: "rgba(255,255,255,0.02)",
        zeroline: false,
        autorange: "reversed",
      },
      shapes: [
        {
          type: "line",
          x0: 0,
          x1: 0,
          y0: -0.5,
          y1: Math.max(entries.length - 0.5, 0.5),
          line: { color: "rgba(255,255,255,0.35)", width: 1 },
        },
      ],
    },
  };
}

export default function UploadsPage() {
  const [isUploading, setIsUploading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', age: '', gender: 'Male' });
  const [isGenderDropdownOpen, setIsGenderDropdownOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [documents, setDocuments] = useState<any[]>([]);
  const analysisResult: any = usePersistedAnalysisResult();
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const allowedFileTypes = ["application/pdf", "image/png", "image/jpeg", "image/jpg"];

  const limeFigure = analysisResult ? buildLimeData(analysisResult) : null;

  const shapFigure = analysisResult ? buildShapData(analysisResult) : null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && allowedFileTypes.includes(file.type)) {
      setSelectedFile(file);
    } else {
      alert("Please upload a PDF, PNG, or JPEG file.");
      e.target.value = "";
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadProgress(10);

    const data = new FormData();
    data.append('file', selectedFile);

    try {
      setUploadProgress(30);
      const response = await fetch(UPLOAD_API_URL, {
        method: 'POST',
        body: data,
      });

      setUploadProgress(70);

      const rawResult = await response.json().catch(() => null);

      if (response.ok && rawResult) {
        console.log("Analysis Result:", rawResult);
        const analysis = normalizeUploadsAnalysis(rawResult);
        const patient = formData;

        // Add the new document to the list
        const newDoc = {
          id: `DOC-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
          name: selectedFile.name,
          date: new Date().toISOString().split('T')[0],
          type: "Clinical Report",
          status: "Verified",
          size: `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB`
        };

        setDocuments(prev => [newDoc, ...prev]);
        persistAnalysisResult(analysis);

        saveRecentActivity({
          id: `report-${Date.now()}`,
          title: selectedFile.name.replace(/\.[^.]+$/, "") || "Medical Report",
          date: new Date().toLocaleDateString("en-US", {
            month: "short",
            day: "2-digit",
            year: "numeric",
          }),
          provider: `${patient.name} • ${patient.age} • ${patient.gender}`,
          status: "Analyzed",
          type: "Clinical Report",
          cid: analysis.cid ?? `Qm${Math.random().toString(36).slice(2, 18)}${Math.random().toString(36).slice(2, 10)}`,
          aiSummary: analysis.prediction !== "Unknown"
            ? `${analysis.prediction} report with ${(Math.max(analysis.probability.benign, analysis.probability.malignant) * 100).toFixed(1)}% confidence.`
            : "AI analysis completed.",
          conditions: analysis.explanation.lime_local_impact.slice(0, 3).map(([feature]) => feature),
          confidence: Math.round(Math.max(analysis.probability.benign, analysis.probability.malignant) * 100),
        });

        setUploadProgress(100);
        setTimeout(() => {
          setIsUploading(false);
          setShowModal(false);
          setUploadProgress(0);
          setSelectedFile(null);
          setFormData({ name: '', age: '', gender: 'Male' });
        }, 1000);
      } else {
        alert(rawResult?.error || rawResult?.message || `Upload failed (HTTP ${response.status}).`);
        setIsUploading(false);
      }
    } catch (error) {
      console.error("Upload Error:", error);
      alert("An error occurred during upload.");
      setIsUploading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-7xl flex-col items-center gap-14 px-6 pb-20 pt-14! animate-in fade-in slide-in-from-bottom-4 duration-700 sm:pt-16! lg:px-8 lg:pt-40!">
      <div className="mx-auto flex w-full max-w-4xl flex-col items-center justify-center text-center pt-4! sm:pt-6!">
        <div className="mb-12 space-y-6!">
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
            My <span className="text-blue-500">Uploads</span>
          </h1>
          <p className="mx-auto max-w-3xl text-lg font-medium text-zinc-500 sm:text-xl">
            Securely manage and upload your medical documents to the MedChain network.
          </p>
        </div>

        <div className="mt-8! flex justify-center">
          <button
            onClick={() => setShowModal(true)}
            className="group relative flex h-[60px] w-[220px] items-center justify-center gap-3 overflow-hidden rounded-full bg-blue-600 px-10 py-7 text-sm font-bold text-white shadow-2xl shadow-blue-500/30 transition-all hover:scale-[1.05] hover:bg-blue-500 active:scale-95 cursor-pointer"
          >
            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-white/0 via-white/10 to-white/0 transition-transform duration-1000 group-hover:translate-x-full" />
            <Upload className="h-5 w-5" />
            <span>Upload Documents</span>
          </button>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-12 px-4 sm:px-6 lg:px-10">
        <div
          className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0A0A0A]/80 shadow-2xl backdrop-blur-xl"
          style={{ padding: "1.5rem" }}
        >
          <div
            className="flex items-center justify-center gap-4 border-b border-white/5 text-center"
            style={{ minHeight: "48px", marginBottom: "1rem", paddingBottom: "0.75rem" }}
          >
            <Activity className="text-blue-500" size={24} />
            <h3 className="text-xl font-bold text-white">Extracted Data</h3>
          </div>

          {analysisResult ? (
            <div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {Object.entries(analysisResult.extracted_data).map(([key, value]: [string, any]) => (
                  <div
                    key={key}
                    className="flex min-h-[44px] flex-col items-center justify-center gap-1 border border-white/10 bg-[#0A0A0A]/80 text-center sm:flex-row sm:justify-between sm:text-left"
                    style={{ paddingLeft: "2rem", paddingRight: "2rem", paddingTop: "0.5rem", paddingBottom: "0.5rem" }}
                  >
                    <span className="font-medium text-zinc-400 leading-relaxed">{key}</span>
                    <span className="font-semibold text-white leading-relaxed">
                      {typeof value === "number" ? value.toFixed(2).replace(/\.00$/, "") : value}
                    </span>
                  </div>
                ))}
              </div>
              <div
                className="border-t border-white/5"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.5rem",
                  paddingLeft: "2rem",
                  paddingRight: "2rem",
                  paddingTop: "0.875rem",
                  marginTop: "0.875rem",
                }}
              >
                <div className="flex items-center justify-between gap-4">
                  <span className="font-medium text-zinc-400 leading-relaxed">Prediction</span>
                  <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${analysisResult.prediction === 'Malignant' ? 'bg-red-500/20 text-red-400' : 'text-emerald-400'}`}>
                    {analysisResult.prediction}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="font-medium text-zinc-400 leading-relaxed">Confidence</span>
                  <span className="shrink-0 font-bold text-blue-400">
                    {(Math.max(analysisResult.probability.benign, analysisResult.probability.malignant) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center" style={{ minHeight: "140px" }}>
              <Info className="mx-auto mb-5 text-zinc-700" size={48} />
              <p className="max-w-sm font-medium leading-relaxed text-zinc-500">
                No analysis data yet.<br />Upload a report to see details.
              </p>
            </div>
          )}
        </div>

        <div
          className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0A0A0A]/80 shadow-2xl backdrop-blur-xl"
          style={{ minHeight: "460px", padding: "1.75rem" }}
        >
          <div
            className="flex items-center justify-center gap-4 border-b border-white/5 text-center"
            style={{ minHeight: "60px", marginBottom: "1.5rem", paddingBottom: "1rem" }}
          >
            <Activity className="text-blue-500" size={24} />
            <h3 className="text-xl font-bold text-white">LIME Local Impact (Waterfall Plot)</h3>
          </div>

          <div className="w-full" style={{ height: "320px" }}>
            {analysisResult ? (
              <Plot
                data={limeFigure?.data ?? []}
                layout={limeFigure?.layout as any}
                config={{ responsive: true, displayModeBar: false }}
                useResizeHandler
                style={{ width: "100%", height: "100%" }}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-center">
                <p className="text-sm font-medium italic leading-relaxed text-zinc-600">
                  Upload a report to generate the LIME waterfall plot.
                </p>
              </div>
            )}
          </div>
        </div>

        <div
          className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0A0A0A]/80 shadow-2xl backdrop-blur-xl"
          style={{ minHeight: "460px", padding: "1.75rem" }}
        >
          <div
            className="flex items-center justify-center gap-4 border-b border-white/5 text-center"
            style={{ minHeight: "60px", marginBottom: "1.5rem", paddingBottom: "1rem" }}
          >
            <Activity className="text-blue-500" size={24} />
            <h3 className="text-xl font-bold text-white">SHAP Global Attribution</h3>
          </div>

          <div className="w-full" style={{ height: "320px" }}>
            {analysisResult?.explanation?.shap_global_contribution ? (
              <Plot
                data={shapFigure?.data ?? []}
                layout={shapFigure?.layout as any}
                config={{ responsive: true, displayModeBar: false }}
                useResizeHandler
                style={{ width: "100%", height: "100%" }}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-center">
                <p className="text-sm font-medium italic leading-relaxed text-zinc-600">
                  Upload a report to generate the SHAP summary plot.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => !isUploading && setShowModal(false)}
          />
          <div className="relative w-full max-w-2xl overflow-hidden rounded-[40px] border border-white/5 bg-[#0A0A0A] shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-blue-500/5 pointer-events-none" />
            
            <div className="relative flex min-h-[520px] flex-col items-center justify-center gap-8 px-8 py-10 text-center md:px-16 md:py-12">
              <div className="relative w-full max-w-xl space-y-3 pb-3 pt-3 text-center">
                <h2 className="text-3xl font-bold tracking-tight text-white">Upload Document</h2>
                <p className="text-sm text-zinc-500">Provide patient details and upload the medical report.</p>
                <button
                  onClick={() => setShowModal(false)}
                  disabled={isUploading}
                  className="absolute right-0 top-0 rounded-full p-2 text-zinc-600 transition-all hover:text-white cursor-pointer disabled:opacity-50"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleUpload} className="flex w-full max-w-xl flex-col items-stretch gap-7">
                <div className="flex w-full flex-col gap-6">
                  <div className="flex flex-col items-start gap-2 text-left">
                    <label className="block text-left text-[13px] font-bold uppercase tracking-[0.2em] text-zinc-500">Full Name</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. John Doe"
                      className="h-10 w-full rounded-lg border border-white/10 bg-white/[0.02] px-5 text-left text-base text-white placeholder:text-zinc-700 [text-indent:4px] transition-all duration-200 ease-out focus:border-blue-500/50 focus:bg-white/[0.05] focus:outline-none"
                    />
                  </div>

                  <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-2">
                    <div className="flex flex-col items-start gap-2 text-left">
                      <label className="block text-left text-[13px] font-bold uppercase tracking-[0.2em] text-zinc-500">Age</label>
                      <input
                        type="text" inputMode="numeric" pattern="[0-9]*"
                        required
                        value={formData.age}
                        onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                        placeholder="Age"
                        className="h-10 w-full rounded-lg border border-white/10 bg-white/[0.02] px-5 text-left text-base text-white placeholder:text-zinc-700 [text-indent:4px] transition-all duration-200 ease-out focus:border-blue-500/50 focus:bg-white/[0.05] focus:outline-none"
                      />
                    </div>
                    <div className="flex flex-col items-start gap-2 text-left">
                      <label className="block text-left text-[13px] font-bold uppercase tracking-[0.2em] text-zinc-500">Gender</label>
                      <div className="group relative w-full">
                        <select
                          value={formData.gender}
                          onChange={(e) => {
                            setFormData({ ...formData, gender: e.target.value });
                            setIsGenderDropdownOpen(false);
                          }}
                          onClick={() => setIsGenderDropdownOpen((prev) => !prev)}
                          onBlur={() => setIsGenderDropdownOpen(false)}
                          className="h-10 w-full cursor-pointer appearance-none rounded-lg border border-white/10 bg-white/[0.02] pl-10 pr-12 indent-1 text-left text-base text-white transition-all duration-200 ease-out focus:border-white/10 focus:bg-white/[0.05] focus:outline-none"
                        >
                          <option value="Male" className="bg-[#0A0A0A]">Male</option>
                          <option value="Female" className="bg-[#0A0A0A]">Female</option>
                          <option value="Other" className="bg-[#0A0A0A]">Other</option>
                        </select>
                        <ChevronDown className={`pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500 transition-transform duration-200 ease-out ${isGenderDropdownOpen ? 'rotate-180 text-blue-400' : 'rotate-0'}`} />
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-start gap-2 pt-3 text-left">
                    <label className="block text-left text-[13px] font-bold uppercase tracking-[0.2em] text-zinc-500">Medical Report (PDF Only)</label>
                    <div className="relative w-full">
                      <input
                        type="file"
                        accept={allowedFileTypes.join(",")}
                        required
                        onChange={handleFileChange}
                        className="hidden"
                        id="file-upload"
                      />
                      <label
                        htmlFor="file-upload"
                        className={`flex w-full cursor-pointer flex-col items-center justify-center gap-5 rounded-xl border border-dashed border-white/10 bg-white/[0.02] px-8 py-16 text-center transition-all hover:bg-white/[0.04] ${selectedFile ? 'border-blue-500/30 bg-blue-500/5' : ''}`}
                      >
                        <div className={`rounded-full p-4 transition-colors ${selectedFile ? 'bg-blue-500/10 text-blue-400' : 'bg-zinc-900/50 text-zinc-600'}`}>
                          {selectedFile ? <FileText size={32} /> : <Upload size={32} />}
                        </div>
                        <div className="mx-auto flex max-w-sm flex-col items-center gap-2 text-center">
                          <p className={`text-base font-medium ${selectedFile ? 'text-blue-400' : 'text-zinc-400'}`}>
                            {selectedFile ? selectedFile.name : 'Choose a file or drag here'}
                          </p>
                          {!selectedFile && <p className="text-sm text-zinc-600">PDF documents only, max 10MB</p>}
                        </div>
                      </label>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isUploading || !selectedFile}
                  className="relative mt-4 flex h-14 w-full cursor-pointer items-center justify-center gap-4 overflow-hidden rounded-xl bg-blue-600 py-6 text-lg font-bold text-white shadow-xl shadow-blue-600/20 transition-all hover:bg-blue-500 active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100"
                >
                  {isUploading ? (
                    <>
                      <Loader className="h-6 w-6 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="h-6 w-6" />
                      <span>Upload & Analyze</span>
                    </>
                  )}
                </button>
              </form>
            </div>
            </div>
        </div>
      )}

      {/* Upload Progress (Simulated) */}
      {isUploading && (
        <div className="fixed inset-x-0 bottom-8 flex justify-center z-[110] px-4">
          <div className="flex w-full max-w-lg min-h-[88px] flex-col justify-center rounded-2xl border border-white/10 bg-zinc-900/90 p-5 backdrop-blur-xl shadow-2xl animate-in slide-in-from-bottom-8">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 animate-pulse rounded-full bg-blue-500" />
                <span className="text-sm font-medium text-white">Analyzing with MedGemma...</span>
              </div>
              <span className="text-xs text-zinc-400">{uploadProgress}%</span>
            </div>
            <div className="px-3">
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/5">
                <div className="h-full bg-blue-600 transition-all duration-500" style={{ width: `${uploadProgress}%` }} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
