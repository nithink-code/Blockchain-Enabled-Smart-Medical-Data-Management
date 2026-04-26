"use client";

import { Upload, FileText, CheckCircle2, Clock, Trash2, ExternalLink, X, Loader, Activity, User, Info } from "lucide-react";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { saveRecentActivity } from "@/lib/recent-activity";

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [documents, setDocuments] = useState<any[]>([]);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const limeFigure = analysisResult ? buildLimeData(analysisResult) : null;

  const shapFigure = analysisResult ? buildShapData(analysisResult) : null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === "application/pdf") {
      setSelectedFile(file);
    } else {
      alert("Please upload only PDF documents.");
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
    data.append('name', formData.name);
    data.append('age', formData.age);
    data.append('gender', formData.gender);

    try {
      setUploadProgress(30);
      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: data,
      });

      setUploadProgress(70);

      if (response.ok) {
        const result = await response.json();
        console.log("Analysis Result:", result);
        const analysis = result.data.analysis;
        const patient = result.data.patient;
        
        // Add the new document to the list
        const newDoc = {
          id: `DOC-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
          name: selectedFile.name,
          date: new Date().toISOString().split('T')[0],
          type: result.category || "Clinical Report",
          status: "Verified",
          size: `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB`
        };
        
        setDocuments(prev => [newDoc, ...prev]);
        setAnalysisResult(analysis);

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
          cid: `Qm${Math.random().toString(36).slice(2, 18)}${Math.random().toString(36).slice(2, 10)}`,
          aiSummary: analysis?.prediction
            ? `${analysis.prediction} report with ${(Math.max(analysis.probability.benign, analysis.probability.malignant) * 100).toFixed(1)}% confidence.`
            : "AI analysis completed.",
          conditions: analysis?.explanation?.lime_local_impact
            ? analysis.explanation.lime_local_impact.slice(0, 3).map(([feature]: [string, number]) => feature)
            : [],
          confidence: analysis?.probability
            ? Math.round(Math.max(analysis.probability.benign, analysis.probability.malignant) * 100)
            : null,
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
        alert("Upload failed.");
        setIsUploading(false);
      }
    } catch (error) {
      console.error("Upload Error:", error);
      alert("An error occurred during upload.");
      setIsUploading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[calc(100vh-14rem)] w-full max-w-6xl flex-col justify-center space-y-14 px-6 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700 lg:px-8">
      <div
        className="mx-auto flex max-w-4xl flex-col items-center text-center"
        style={{ paddingTop: "24px", marginTop: "140px", marginLeft: "160px"}}
      >
        <div className="space-y-4 mb-10!">
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl mb-5!">
            My <span className="text-blue-500">Uploads</span>
          </h1>
          <p className="mx-auto max-w-3xl text-lg font-medium text-zinc-500 sm:text-xl">
            Securely manage and upload your medical documents to the MedChain network.
          </p>
        </div>

        <div className="mt-10 flex justify-center mb-10!">
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

      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 pt-0 ml-30! p-5!">
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0A0A0A]/80 p-7 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center justify-center gap-3 border-b border-white/5 pb-4 mb-6 text-center">
            <Activity className="text-blue-500" size={24} />
            <h3 className="text-xl font-bold text-white">Extracted Data</h3>
          </div>

          {analysisResult ? (
            <div className="space-y-3">
              {Object.entries(analysisResult.extracted_data).map(([key, value]: [string, any]) => (
                <div key={key} className="flex items-center justify-between rounded-lg border border-white/5 bg-white/5 px-4 py-4">
                  <span className="font-medium text-zinc-400">{key}</span>
                  <span className="font-bold text-white">
                    {typeof value === "number" ? value.toFixed(2).replace(/\.00$/, "") : value}
                  </span>
                </div>
              ))}
              <div className="mt-6 border-t border-white/5 pt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-zinc-400">Prediction</span>
                  <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${analysisResult.prediction === 'Malignant' ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                    {analysisResult.prediction}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-zinc-400">Confidence</span>
                  <span className="font-bold text-blue-400">
                    {(Math.max(analysisResult.probability.benign, analysisResult.probability.malignant) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-20 text-center">
              <Info className="mx-auto mb-4 text-zinc-700" size={48} />
              <p className="font-medium text-zinc-500">
                No analysis data yet.<br />Upload a report to see details.
              </p>
            </div>
          )}
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0A0A0A]/80 p-6 shadow-2xl backdrop-blur-xl min-h-[440px]">
          <div className="mb-6 flex items-center justify-center gap-3 border-b border-white/5 pb-4 text-center">
            <Activity className="text-blue-500" size={24} />
            <h3 className="text-xl font-bold text-white">LIME Local Impact (Waterfall Plot)</h3>
          </div>

          <div className="flex h-[340px] w-full items-center justify-center">
            {analysisResult ? (
              <Plot
                data={limeFigure?.data ?? []}
                layout={limeFigure?.layout as any}
                config={{ responsive: true, displayModeBar: false }}
                className="h-full w-full"
              />
            ) : (
              <div className="w-full text-center">
                <p className="text-sm font-medium italic text-zinc-600">
                  Upload a report to generate the LIME waterfall plot.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0A0A0A]/80 p-6 shadow-2xl backdrop-blur-xl min-h-[440px]">
          <div className="mb-6 flex items-center justify-center gap-3 border-b border-white/5 pb-4 text-center">
            <Activity className="text-blue-500" size={24} />
            <h3 className="text-xl font-bold text-white">SHAP Global Attribution</h3>
          </div>

          <div className="flex h-[340px] w-full items-center justify-center">
            {analysisResult?.explanation?.shap_global_contribution ? (
              <Plot
                data={shapFigure?.data ?? []}
                layout={shapFigure?.layout as any}
                config={{ responsive: true, displayModeBar: false }}
                className="h-full w-full"
              />
            ) : (
              <div className="w-full text-center">
                <p className="text-sm font-medium italic text-zinc-600">
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
            
            <div className="relative p-8 md:px-16 flex flex-col justify-center" style={{ height: "450px" }}>
              <div className="flex items-start justify-between mb-6 text-center">
                <div className="w-full">
                  <h2 className="text-3xl font-bold text-white tracking-tight">Upload Document</h2>
                  <p className="text-zinc-500 text-sm mt-1">Provide patient details and upload the medical report.</p>
                </div>
                <button 
                  onClick={() => setShowModal(false)}
                  disabled={isUploading}
                  className="absolute right-8 top-8 rounded-full p-2 text-zinc-600 hover:bg-white/5 hover:text-white transition-all cursor-pointer disabled:opacity-50"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleUpload} className="space-y-6 max-w-lg mx-auto w-full">
                <div className="space-y-4 ml-20! mt-4!">
                  <div className="space-y-3 mb-4!">
                    <label className="text-[13px] font-bold uppercase tracking-[0.2em] text-zinc-500 block text-left ml-1">Full Name</label>
                    <input 
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. John Doe"
                      className="w-full rounded-lg border border-white/10 bg-white/[0.02] px-6 py-4 text-white text-left placeholder:text-zinc-700 focus:border-blue-500/50 focus:bg-white/[0.05] focus:outline-none transition-all text-lg"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-3 mb-4!">
                      <label className="text-[13px] font-bold uppercase tracking-[0.2em] text-zinc-500 block text-left ml-1">Age</label>
                      <input 
                        type="number"
                        required
                        value={formData.age}
                        onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                        placeholder="Age"
                        className="w-full rounded-lg border border-white/10 bg-white/[0.02] px-6 py-4 text-white text-left placeholder:text-zinc-700 focus:border-blue-500/50 focus:bg-white/[0.05] focus:outline-none transition-all text-lg"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[13px] font-bold uppercase tracking-[0.2em] text-zinc-500 block text-left ml-1">Gender</label>
                      <div className="relative mb-4!">
                        <select 
                          value={formData.gender}
                          onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                          className="w-full rounded-lg border border-white/10 bg-white/[0.02] px-6 py-4 text-white text-left focus:border-blue-500/50 focus:bg-white/[0.05] focus:outline-none transition-all appearance-none cursor-pointer text-lg"
                        >
                          <option value="Male" className="bg-[#0A0A0A]">Male</option>
                          <option value="Female" className="bg-[#0A0A0A]">Female</option>
                          <option value="Other" className="bg-[#0A0A0A]">Other</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-zinc-600">
                          <ExternalLink size={16} className="rotate-90" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 pt-4">
                    <label className="text-[13px] font-bold uppercase tracking-[0.2em] text-zinc-500 block text-left ml-1">Medical Report (PDF Only)</label>
                    <div className="relative mb-4!">
                      <input 
                        type="file"
                        accept=".pdf"
                        required
                        onChange={handleFileChange}
                        className="hidden"
                        id="file-upload"
                      />
                      <label 
                        htmlFor="file-upload"
                        className={`flex w-full mt-5! cursor-pointer flex-col items-center justify-center gap-6 rounded-xl border border-dashed border-white/10 bg-white/[0.02] px-8 py-16 transition-all hover:bg-white/[0.04] ${selectedFile ? 'border-blue-500/30 bg-blue-500/5' : ''}`}
                      >
                        <div className={`rounded-full p-4 transition-colors ${selectedFile ? 'bg-blue-500/10 text-blue-400' : 'bg-zinc-900/50 text-zinc-600'}`}>
                          {selectedFile ? <FileText size={32} /> : <Upload size={32} />}
                        </div>
                        <div className="text-center">
                          <p className={`text-base font-medium ${selectedFile ? 'text-blue-400' : 'text-zinc-400'}`}>
                            {selectedFile ? selectedFile.name : 'Choose a file or drag here'}
                          </p>
                          {!selectedFile && <p className="text-sm text-zinc-600 mt-2">PDF documents only, max 10MB</p>}
                        </div>
                      </label>
                    </div>
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={isUploading || !selectedFile}
                  className="relative w-full overflow-hidden rounded-xl bg-blue-600 py-5 text-lg font-bold text-white transition-all hover:bg-blue-500 active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-4 cursor-pointer shadow-xl shadow-blue-600/20 mt-8 ml-12! h-12!"
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
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-zinc-900/90 p-4 backdrop-blur-xl shadow-2xl animate-in slide-in-from-bottom-8">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 animate-pulse rounded-full bg-blue-500" />
                <span className="text-sm font-medium text-white">Analyzing with MedGemma...</span>
              </div>
              <span className="text-xs text-zinc-400">{uploadProgress}%</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/5">
              <div className="h-full bg-blue-600 transition-all duration-500" style={{ width: `${uploadProgress}%` }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
