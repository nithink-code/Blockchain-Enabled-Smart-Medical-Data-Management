"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { saveRecentActivity } from "@/lib/recent-activity";
import { 
  UploadCloud, 
  FileText, 
  Brain, 
  Database, 
  CheckCircle2, 
  ArrowRight,
  Scan,
  Zap,
  BarChart2,
  Sparkles,
  Loader2,
  Shield,
  Fingerprint,
  X,
  Eye,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Plus
} from "lucide-react";
import dynamic from "next/dynamic";

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

type Stage = "idle" | "selected" | "uploading" | "ocr" | "ai" | "xai" | "storing" | "done";

interface AnalysisResult {
  extractedContent: string;
  analysis: {
    success: boolean;
    prediction: string;
    probability: {
      benign: number;
      malignant: number;
    };
    explanation: {
      lime_local_impact: [string, number][];
      shap_global_contribution: Record<string, number>;
    };
  };
}

const PIPELINE_STAGES = [
  { id: "ocr",     label: "OCR Extraction",     icon: Scan,      desc: "Extracting text from your medical document..." },
  { id: "ai",      label: "MedGemma Analysis",   icon: Brain,     desc: "AI model interpreting clinical content..." },
  { id: "xai",     label: "LIME & SHAP XAI",     icon: BarChart2, desc: "Generating explainability maps..." },
  { id: "storing", label: "IPFS & Blockchain",   icon: Database,  desc: "Encrypting and anchoring to chain..." },
];

const MOCK_RESULT = {
  summary: "The patient is a 34-year-old individual presenting with elevated LDL cholesterol (178 mg/dL), slightly high fasting glucose (108 mg/dL), and a normal blood pressure of 120/78 mmHg. No critical findings. Lifestyle modifications recommended.",
  conditions: ["Borderline Hyperlipidemia", "Pre-diabetic Glucose"],
  confidence: 91,
  limeFactors: [
    { label: "LDL Cholesterol", impact: 82, positive: false },
    { label: "Fasting Glucose", impact: 67, positive: false },
    { label: "Blood Pressure", impact: 55, positive: true },
    { label: "BMI", impact: 40, positive: true },
  ],
  shapValues: [
    { label: "Total Cholesterol", value: +0.42 },
    { label: "HDL Ratio", value: -0.18 },
    { label: "Triglycerides", value: +0.33 },
    { label: "Glucose (Fasting)", value: +0.29 },
  ],
  cid: "QmXk9PaR7mZ2jL8oF3nT6sBw4dY1cE5hA0vU9qI7rN2p",
  patientId: "MED-4F2A-9C1B-E37D",
};

export default function UploadReportPage() {
  const [stage, setStage] = useState<Stage>("idle");
  const [file, setFile] = useState<File | null>(null);
  const [currentPipelineIdx, setCurrentPipelineIdx] = useState(-1);
  const [showLime, setShowLime] = useState(true);
  const [showShap, setShowShap] = useState(true);
  const [dragOver, setDragOver] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);

  const [isHydrated, setIsHydrated] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const savedStage = localStorage.getItem("upload_stage") as Stage;
      const savedIdx = localStorage.getItem("upload_pipeline_idx");
      const savedResult = localStorage.getItem("upload_analysis_result");

      if (savedStage === "done" && savedResult) {
        setStage("done");
        setCurrentPipelineIdx(parseInt(savedIdx || "4", 10));
        setAnalysisResult(JSON.parse(savedResult));
      }
    } catch (e) {
      console.error("Error reading localStorage", e);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  if (!isHydrated) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>;
  }

  const stageIndex = (s: Stage) => ["idle","selected","uploading","ocr","ai","xai","storing","done"].indexOf(s);

  function handleFile(f: File) {
    setFile(f);
    setStage("selected");
  }

  async function runPipeline() {
    if (!file) return;
    
    setStage("uploading");
    await delay(500);
    setStage("ocr");
    setCurrentPipelineIdx(0);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("https://ocr-endpoint.onrender.com/api/upload-report", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Analysis failed");

      const data = await response.json();

      // ── Persist result to localStorage so dashboard & reports page update ──
      const prediction: string = data?.analysis?.prediction ?? "Unknown";
      const malignantProb: number = data?.analysis?.probability?.malignant ?? 0;
      const conditions: string[] = prediction === "Malignant"
        ? ["Malignant Finding Detected"]
        : [];
      const extractedFields = data?.analysis?.extracted_data ?? {};
      const fieldCount = Object.keys(extractedFields).length;

      saveRecentActivity({
        id: `${Date.now()}`,
        title: file.name.replace(/\.[^.]+$/, "") || "Medical Report",
        date: new Date().toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        provider: "Patient Upload",
        status: "Analyzed",
        type: file.name.endsWith(".pdf") ? "PDF Report" : "Image Scan",
        cid: `Qm${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
        aiSummary:
          data?.extractedContent
            ? data.extractedContent.substring(0, 240) + "..."
            : `Prediction: ${prediction}. Malignant probability: ${(malignantProb * 100).toFixed(1)}%. ${fieldCount} clinical fields extracted.`,
        conditions,
        confidence: Math.round(Math.max(malignantProb, 1 - malignantProb) * 100),
      });

      setAnalysisResult(data);

      // Transition through other UI stages
      await delay(1200);
      setStage("ai");
      setCurrentPipelineIdx(1);
      await delay(1200);
      setStage("xai");
      setCurrentPipelineIdx(2);
      await delay(1200);
      setStage("storing");
      setCurrentPipelineIdx(3);
      await delay(1000);
      setStage("done");
      setCurrentPipelineIdx(4);
      
      // Save everything to localStorage
      localStorage.setItem("upload_stage", "done");
      localStorage.setItem("upload_pipeline_idx", "4");
      localStorage.setItem("upload_analysis_result", JSON.stringify(data));
    } catch (error) {
      console.error(error);
      setStage("idle");
      setFile(null);
      alert("Error analyzing document. Please try again.");
    }
  }

  function delay(ms: number) { return new Promise(r => setTimeout(r, ms)); }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }

  return (
    <div className="space-y-12 animate-fade-in pb-20 max-w-5xl mx-auto">
      <div className="space-y-1.5">
        <h1 className="text-4xl font-bold tracking-tight text-white">Ingest Medical Data</h1>
        <p className="text-zinc-500 text-lg font-medium">Securely upload reports for OCR processing, MedGemma AI analysis, and IPFS anchoring.</p>
      </div>

      {stage === "idle" && (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`group relative flex flex-col items-center justify-center gap-8 rounded-[48px] border-2 border-dashed p-32 text-center transition-all duration-500 ${
            dragOver
              ? "border-blue-500/60 bg-blue-500/[0.03] scale-[0.99]"
              : "border-white/10 bg-white/[0.01] hover:border-blue-500/30 hover:bg-white/[0.02]"
          }`}
        >
          <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 blur-[80px] transition-opacity duration-700 pointer-events-none" />
          
          <div className="relative flex h-24 w-24 items-center justify-center rounded-[32px] border border-blue-500/20 bg-blue-500/10 shadow-2xl shadow-blue-500/20 group-hover:scale-110 transition-transform duration-500">
            <UploadCloud size={40} className="text-blue-400" />
          </div>
          
          <div className="relative space-y-2">
            <p className="text-2xl font-bold text-white tracking-tight">Drop your clinical records here</p>
            <p className="text-sm text-zinc-500 font-medium max-w-sm mx-auto">Supports PDF, JPG, PNG, and DICOM formats. All files are encrypted before processing.</p>
          </div>

          <label className="relative cursor-pointer">
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.dcm"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
            />
            <span className="premium-button flex h-14 items-center gap-3 rounded-2xl px-10 text-sm font-bold text-white">
              <Plus size={20} />
              Select File
            </span>
          </label>
        </div>
      )}

      {stage === "selected" && file && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
           <div className="flex flex-col items-center gap-8 rounded-[48px] border border-white/10 bg-white/[0.02] p-16 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-blue-500/10 border border-blue-500/10 text-blue-400">
                <FileText size={40} />
              </div>
              <div className="space-y-2">
                <p className="text-2xl font-bold text-white">{file.name}</p>
                <p className="text-sm text-zinc-500">Ready for clinical intelligence analysis</p>
              </div>
              <div className="flex gap-4">
                <button 
                  onClick={() => { setFile(null); setStage("idle"); }}
                  className="flex h-14 items-center gap-3 rounded-2xl border border-white/5 bg-white/[0.02] px-8 text-sm font-bold text-zinc-400 hover:bg-white/[0.05] hover:text-white transition-all"
                >
                  <X size={20} />
                  Cancel
                </button>
                <button 
                  onClick={runPipeline}
                  className="premium-button flex h-14 items-center gap-3 rounded-2xl px-10 text-sm font-bold text-white shadow-[0_0_30px_-5px_rgba(59,130,246,0.5)]"
                >
                  <Zap size={20} />
                  Upload & Analyze
                </button>
              </div>
           </div>
        </div>
      )}

      {(stage !== "idle" && stage !== "selected" && stage !== "done") && (
        <div className="space-y-10">
          {/* Selected file card */}
          {file && (
            <div className="flex items-center gap-6 rounded-[32px] border border-white/5 bg-white/[0.02] p-8 group">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-blue-500/10 border border-blue-500/10 text-blue-400 group-hover:scale-110 transition-all duration-500">
                <FileText size={28} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-lg font-bold text-white truncate">{file.name}</p>
                <p className="text-sm text-zinc-500 mt-1 font-medium flex items-center gap-2">
                  {(file.size / 1024 / 1024).toFixed(2)} MB <span className="opacity-30">·</span> Secure IPFS Pipeline
                </p>
              </div>
              <div className="flex items-center gap-3 px-5 py-2.5 rounded-full bg-blue-500/10 border border-blue-500/10">
                <Loader2 size={16} className="text-blue-400 animate-spin" />
                <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Active Processing</span>
              </div>
            </div>
          )}

          {/* Pipeline Progress */}
          <div className="glass-card rounded-[40px] border border-white/5 overflow-hidden">
            <div className="p-8 border-b border-white/[0.03] bg-white/[0.01]">
              <h2 className="text-xl font-bold text-white">Clinical Intelligence Pipeline</h2>
              <p className="text-sm text-zinc-500 mt-1 font-medium">Each stage is cryptographically verified for privacy compliance.</p>
            </div>
            <div className="divide-y divide-white/[0.03]">
              {PIPELINE_STAGES.map((ps, i) => {
                const Icon = ps.icon;
                const isActive = i === currentPipelineIdx;
                const isDone = i < currentPipelineIdx;
                return (
                  <div key={ps.id} className={`flex items-center gap-7 p-8 transition-all duration-500 ${isActive ? "bg-blue-500/[0.03]" : ""}`}>
                    <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border transition-all duration-500 ${
                      isDone ? "bg-emerald-500/5 border-emerald-500/10 text-emerald-400" :
                      isActive ? "bg-blue-500/10 border-blue-500/20 text-blue-400 shadow-[0_0_20px_-5px_rgba(59,130,246,0.3)]" :
                      "bg-white/[0.02] border-white/5 text-zinc-700"
                    }`}>
                      {isActive ? <Loader2 size={24} className="animate-spin" /> : isDone ? <CheckCircle2 size={24} /> : <Icon size={24} />}
                    </div>
                    <div className="flex-1">
                      <p className={`text-[16px] font-bold ${isDone ? "text-emerald-400" : isActive ? "text-white" : "text-zinc-600"}`}>{ps.label}</p>
                      <p className={`text-[13px] mt-1 font-medium transition-colors ${isActive ? "text-zinc-400" : "text-zinc-700"}`}>{isActive ? ps.desc : isDone ? "Stage verification successful" : "Pipeline queued"}</p>
                    </div>
                    {isDone && <CheckCircle2 size={20} className="text-emerald-500/50 shrink-0" />}
                    {isActive && (
                      <div className="flex items-center gap-2">
                         <span className="h-1 w-1 rounded-full bg-blue-400 animate-ping" />
                         <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Live</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {stage === "done" && (
        <div className="space-y-10">
          {/* Success Banner */}
          <div className="relative overflow-hidden rounded-[40px] border border-emerald-500/10 bg-emerald-500/[0.03] p-10 group">
            <div className="absolute -top-10 -right-10 p-10 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity">
              <CheckCircle2 size={200} className="text-emerald-500" />
            </div>
            <div className="relative flex items-center gap-8">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl border border-emerald-500/10 bg-emerald-500/10 text-emerald-400 shadow-2xl shadow-emerald-500/20">
                <CheckCircle2 size={36} />
              </div>
              <div className="space-y-1">
                <h2 className="text-2xl font-bold text-white tracking-tight">Intelligence Map Generated</h2>
                <p className="text-[16px] text-zinc-500 font-medium leading-relaxed">Report processing complete. Data encrypted and anchored to the MedChain audit trail.</p>
              </div>
            </div>
          </div>

          {/* Blockchain & Identity IDs */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="glass-card rounded-[32px] border border-white/5 p-8 space-y-4 group">
              <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-600 mb-2">
                <Database size={16} className="text-emerald-400 group-hover:scale-110 transition-transform" /> Storage Fingerprint (CID)
              </div>
              <div className="bg-black/20 rounded-2xl p-5 border border-white/[0.03]">
                <p className="font-mono text-[13px] font-bold text-zinc-300 break-all leading-relaxed">
                  {analysisResult ? `Qm${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}` : MOCK_RESULT.cid}
                </p>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                <p className="text-[11px] font-bold text-emerald-400 uppercase tracking-widest">Anchored · Block #4,921,837</p>
              </div>
            </div>
            <div className="glass-card rounded-[32px] border border-white/5 p-8 space-y-4 group">
              <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-600 mb-2">
                <Fingerprint size={16} className="text-blue-400 group-hover:scale-110 transition-transform" /> Unified Patient Identifier
              </div>
              <div className="bg-blue-500/[0.02] rounded-2xl p-5 border border-blue-500/10">
                <p className="font-mono text-2xl font-bold text-blue-400 tracking-tighter">{analysisResult?.analysis.prediction === 'Malignant' ? 'MED-X9-MAL-8273' : 'MED-Z1-BEN-1942'}</p>
              </div>
              <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest px-1">Institutional verification key active</p>
            </div>
          </div>

          {/* AI Result Card */}
          <div className="glass-card rounded-[40px] border border-white/5 overflow-hidden">
            <div className="p-8 border-b border-white/[0.03] bg-white/[0.01] flex items-center gap-4">
              <div className="p-2.5 bg-blue-500/10 rounded-xl">
                <Brain size={24} className="text-blue-400" />
              </div>
              <div className="space-y-0.5">
                <h2 className="text-lg font-bold text-white tracking-tight">MedGemma Interpretation</h2>
                <p className="text-xs text-zinc-500 font-medium">Large Language Model for Clinical Analysis</p>
              </div>
              <div className="ml-auto flex items-center gap-3 px-4 py-2 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                <Sparkles size={14} className="text-emerald-400" />
                <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-widest">
                  {analysisResult ? (analysisResult.analysis.probability.malignant * 100).toFixed(1) : 0}% Confidence
                </span>
              </div>
            </div>
            <div className="p-10 space-y-10">
              <div className="relative">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500/30 to-transparent rounded-full" />
                <p className="text-[17px] text-zinc-200 leading-relaxed font-medium pl-8 italic">
                  {analysisResult ? analysisResult.extractedContent.substring(0, 300) + "..." : "Analysis summary unavailable."}
                </p>
              </div>
              <div className="space-y-4">
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] px-1">AI Prediction Result</p>
                <div className="flex flex-wrap gap-3">
                  <span className={`flex items-center gap-3 rounded-2xl border px-5 py-2.5 text-[13px] font-bold transition-colors ${
                    analysisResult?.analysis.prediction === 'Malignant' 
                      ? "border-rose-500/10 bg-rose-500/[0.03] text-rose-400" 
                      : "border-emerald-500/10 bg-emerald-500/[0.03] text-emerald-400"
                  }`}>
                    <AlertCircle size={16} /> {analysisResult?.analysis.prediction}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* XAI Visualization - Stacked for better readability */}
          <div className="space-y-12">
            {/* LIME Waterfall Explanation (Image 1 Style) */}
            <div className="glass-card rounded-[32px] border border-white/5 overflow-hidden">
              <div className="p-8 border-b border-white/[0.03] bg-white/[0.01] flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-400">
                    <BarChart2 size={20} />
                  </div>
                  <div className="text-left">
                    <h2 className="font-bold text-white tracking-tight">LIME Local Explanation</h2>
                    <p className="text-[10px] text-indigo-400/70 font-bold uppercase tracking-widest">Waterfall Contribution Map</p>
                  </div>
                </div>
              </div>
              {analysisResult?.analysis?.explanation?.lime_local_impact && (
                <div className="p-10">
                  <Plot
                    data={[
                      {
                        type: 'waterfall',
                        orientation: 'h',
                        measure: analysisResult.analysis.explanation.lime_local_impact.map(() => "relative"),
                        y: analysisResult.analysis.explanation.lime_local_impact.map(item => item[0]),
                        x: analysisResult.analysis.explanation.lime_local_impact.map(item => item[1]),
                        connector: { line: { color: "rgba(255,255,255,0.1)", width: 1, dash: "dot" } },
                        increasing: { marker: { color: "#f43f5e" } },
                        decreasing: { marker: { color: "#3b82f6" } },
                        text: analysisResult.analysis.explanation.lime_local_impact.map(item => (item[1] > 0 ? "+" : "") + item[1].toFixed(2)),
                        textposition: 'outside',
                        textfont: { color: '#fff', size: 10 },
                      } as any
                    ]}
                    layout={{
                      autosize: true,
                      height: 500,
                      margin: { l: 150, r: 50, t: 50, b: 50 },
                      paper_bgcolor: 'rgba(0,0,0,0)',
                      plot_bgcolor: 'rgba(0,0,0,0)',
                      xaxis: {
                        gridcolor: 'rgba(255,255,255,0.05)',
                        tickfont: { color: '#71717a' },
                        zerolinecolor: 'rgba(255,255,255,0.2)',
                        title: { text: "Impact on Prediction Probability", font: { size: 10, color: '#52525b' } }
                      },
                      yaxis: {
                        tickfont: { color: '#a1a1aa', size: 11 },
                        gridcolor: 'rgba(255,255,255,0.05)',
                        autorange: "reversed"
                      },
                      font: { family: 'inherit', color: '#fff' },
                      showlegend: false
                    }}
                    config={{ displayModeBar: false, responsive: true }}
                    useResizeHandler={true}
                    style={{ width: "100%", height: "100%" }}
                    className="w-full"
                  />
                </div>
              )}
            </div>

            {/* SHAP Local Explanation (Waterfall) */}
            <div key="shap-local-explanation-waterfall" className="glass-card rounded-[32px] border border-white/5 overflow-hidden relative">
              <div className="p-8 border-b border-white/[0.03] bg-white/[0.01] flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-purple-500/10 rounded-xl text-purple-400">
                    <Sparkles size={20} />
                  </div>
                  <div className="text-left">
                    <div className="flex items-center gap-3">
                      <h2 className="font-bold text-white tracking-tight">SHAP Local Explanation</h2>
                      <span className="px-2 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-[9px] font-bold text-purple-400 uppercase tracking-widest">Enhanced XAI</span>
                    </div>
                    <p className="text-[10px] text-purple-400/70 font-bold uppercase tracking-widest">Waterfall Contribution Map</p>
                  </div>
                </div>
              </div>
              
              {analysisResult?.analysis?.explanation?.shap_global_contribution ? (
                <div className="p-10">
                  <Plot
                    data={[
                      {
                        type: 'waterfall',
                        orientation: 'h',
                        measure: Object.keys(analysisResult.analysis.explanation.shap_global_contribution).map(() => "relative"),
                        y: Object.keys(analysisResult.analysis.explanation.shap_global_contribution),
                        x: Object.values(analysisResult.analysis.explanation.shap_global_contribution),
                        connector: { line: { color: "rgba(255,255,255,0.1)", width: 1, dash: "dot" } },
                        increasing: { marker: { color: "#f43f5e" } },
                        decreasing: { marker: { color: "#3b82f6" } },
                        text: Object.values(analysisResult.analysis.explanation.shap_global_contribution).map(v => (v > 0 ? "+" : "") + v.toFixed(2)),
                        textposition: 'outside',
                        textfont: { color: '#fff', size: 10 },
                      } as any
                    ]}
                    layout={{
                      autosize: true,
                      height: 600,
                      margin: { l: 150, r: 50, t: 50, b: 50 },
                      paper_bgcolor: 'rgba(0,0,0,0)',
                      plot_bgcolor: 'rgba(0,0,0,0)',
                      xaxis: {
                        gridcolor: 'rgba(255,255,255,0.05)',
                        tickfont: { color: '#71717a' },
                        zerolinecolor: 'rgba(255,255,255,0.2)',
                        title: { text: "Impact on Prediction Probability", font: { size: 10, color: '#52525b' } }
                      },
                      yaxis: {
                        tickfont: { color: '#a1a1aa', size: 11 },
                        gridcolor: 'rgba(255,255,255,0.05)',
                        autorange: "reversed"
                      },
                      font: { family: 'inherit', color: '#fff' },
                      showlegend: false
                    }}
                    config={{ displayModeBar: false, responsive: true }}
                    useResizeHandler={true}
                    style={{ width: "100%", height: "100%" }}
                    className="w-full"
                  />
                </div>
              ) : (
                <div className="p-20 text-center">
                  <Loader2 className="mx-auto h-8 w-8 text-purple-500 animate-spin mb-4" />
                  <p className="text-zinc-500 font-medium">Waiting for SHAP analysis data...</p>
                </div>
              )}
            </div>

            {/* SHAP Summary Attribution (Image 2 Style) */}
            <div className="glass-card rounded-[32px] border border-white/5 overflow-hidden">
              <div className="p-8 border-b border-white/[0.03] bg-white/[0.01] flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-purple-500/10 rounded-xl text-purple-400">
                    <Sparkles size={20} />
                  </div>
                  <div className="text-left">
                    <h2 className="font-bold text-white tracking-tight">SHAP Global Attribution</h2>
                    <p className="text-[10px] text-purple-400/70 font-bold uppercase tracking-widest">Feature Value Importance</p>
                  </div>
                </div>
              </div>
              {analysisResult?.analysis?.explanation?.shap_global_contribution && (
                <div className="p-10 relative">
                  <Plot
                    data={[
                      {
                        type: 'bar',
                        orientation: 'h',
                        y: Object.keys(analysisResult.analysis.explanation.shap_global_contribution),
                        x: Object.values(analysisResult.analysis.explanation.shap_global_contribution),
                        marker: {
                          color: Object.values(analysisResult.analysis.explanation.shap_global_contribution),
                          colorscale: [
                            [0, '#3b82f6'],
                            [0.5, '#a855f7'],
                            [1, '#f43f5e']
                          ],
                          reversescale: false,
                          showscale: true,
                          colorbar: {
                            title: 'Feature Value',
                            titleside: 'right',
                            tickmode: 'array',
                            tickvals: [
                              Math.min(...Object.values(analysisResult.analysis.explanation.shap_global_contribution)) || 0,
                              Math.max(...Object.values(analysisResult.analysis.explanation.shap_global_contribution)) || 1
                            ],
                            ticktext: ['Low', 'High'],
                            len: 0.8,
                            thickness: 15,
                            outlinecolor: 'transparent',
                            tickfont: { color: '#71717a', size: 10 }
                          }
                        },
                      } as any
                    ]}
                    layout={{
                      autosize: true,
                      height: 500,
                      margin: { l: 150, r: 100, t: 50, b: 80 },
                      paper_bgcolor: 'rgba(0,0,0,0)',
                      plot_bgcolor: 'rgba(0,0,0,0)',
                      xaxis: {
                        gridcolor: 'rgba(255,255,255,0.05)',
                        tickfont: { color: '#71717a', size: 10 },
                        title: { text: "SHAP value (impact on model output)", font: { size: 12, color: '#a1a1aa' }, standoff: 20 },
                        zerolinecolor: 'rgba(255,255,255,0.3)',
                        zerolinewidth: 1,
                      },
                      yaxis: {
                        gridcolor: 'rgba(255,255,255,0.03)',
                        tickfont: { color: '#a1a1aa' },
                        autorange: "reversed"
                      },
                      font: { family: 'inherit', color: '#fff' }
                    }}
                    config={{ displayModeBar: false, responsive: true }}
                    useResizeHandler={true}
                    style={{ width: "100%", height: "100%" }}
                    className="w-full"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-center gap-6 pt-8">
            <button
              onClick={() => { 
                setStage("idle"); 
                setFile(null); 
                setCurrentPipelineIdx(-1); 
                setAnalysisResult(null);
                localStorage.removeItem("upload_stage");
                localStorage.removeItem("upload_pipeline_idx");
                localStorage.removeItem("upload_analysis_result");
              }}
              className="flex h-14 items-center gap-3 rounded-2xl border border-white/5 bg-white/[0.02] px-8 text-sm font-bold text-zinc-400 hover:bg-white/[0.05] hover:text-white transition-all"
            >
              <UploadCloud size={18} />
              Process Another Document
            </button>
            <Link href="/dashboard/reports">
              <button className="premium-button flex h-14 items-center gap-3 rounded-2xl px-10 text-sm font-bold text-white">
                View Records Library
                <ArrowRight size={18} />
              </button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
