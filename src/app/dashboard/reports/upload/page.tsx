"use client";

import { useState } from "react";
import { 
  Upload, 
  FileText, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  Brain,
  Shield,
  Search,
  ArrowRight
} from "lucide-react";
import { performOCR } from "@/lib/ocr";
import { analyzeMedicalText, AIAnalysisResult } from "@/lib/ai";
import Link from "next/link";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle' | 'processing' | 'analyzing' | 'completed' | 'error'>('idle');
  const [result, setResult] = useState<AIAnalysisResult | null>(null);
  const [extractedText, setExtractedText] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setStatus('idle');
    }
  };

  const processFile = async () => {
    if (!file) return;

    try {
      setStatus('processing');
      const text = await performOCR(file);
      setExtractedText(text);

      setStatus('analyzing');
      const analysis = await analyzeMedicalText(text);
      setResult(analysis);

      setStatus('completed');
    } catch (error) {
      console.error(error);
      setStatus('error');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Upload Medical Report</h1>
        <p className="text-slate-500 text-sm">Upload a clinical report (Image/PDF) for AI analysis and secure blockchain storage.</p>
      </div>

      {status === 'idle' || status === 'error' ? (
        <div className="bg-white border-2 border-dashed border-slate-200 rounded-2xl p-12 flex flex-col items-center justify-center space-y-4 hover:border-blue-400 transition-colors group">
          <div className="p-4 bg-blue-50 text-blue-600 rounded-full group-hover:bg-blue-100 transition-colors">
            <Upload size={32} />
          </div>
          <div className="text-center">
            <p className="text-slate-900 font-bold">Click to upload or drag and drop</p>
            <p className="text-slate-500 text-sm">PNG, JPG, or PDF (MAX. 5MB)</p>
          </div>
          <input 
            type="file" 
            className="hidden" 
            id="file-upload" 
            onChange={handleFileChange}
            accept="image/*,application/pdf"
          />
          <button 
            onClick={() => document.getElementById('file-upload')?.click()}
            className="px-6 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all"
          >
            Select File
          </button>
          
          {file && (
            <div className="mt-4 p-3 bg-slate-50 rounded-xl flex items-center gap-3 border border-slate-100">
              <FileText className="text-blue-500" size={20} />
              <span className="text-sm font-medium text-slate-700">{file.name}</span>
            </div>
          )}

          {file && status !== 'processing' && (
            <button 
              onClick={processFile}
              className="mt-6 px-10 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all flex items-center gap-2"
            >
              <Brain size={18} />
              Start AI Analysis
            </button>
          )}

          {status === 'error' && (
            <div className="flex items-center gap-2 text-red-600 text-sm font-medium mt-4">
              <AlertCircle size={16} />
              Failed to process file. Please try a clearer image.
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl p-8 overflow-hidden">
          {status !== 'completed' ? (
            <div className="flex flex-col items-center py-10 space-y-6">
              <div className="relative">
                <div className="w-20 h-20 border-4 border-blue-50 rounded-full"></div>
                <div className="absolute top-0 left-0 w-20 h-20 border-4 border-t-blue-600 rounded-full animate-spin"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-600">
                  <Brain size={32} className="animate-pulse" />
                </div>
              </div>
              <div className="text-center">
                <h3 className="text-xl font-bold text-slate-900">
                  {status === 'processing' ? 'Extracting Text (OCR)...' : 'AI Analysis in Progress...'}
                </h3>
                <p className="text-slate-500 text-sm mt-2">
                  Our neural networks are processing your clinical data securely.
                </p>
              </div>
              
              <div className="w-full max-w-sm bg-slate-100 h-2 rounded-full overflow-hidden">
                <div 
                  className={`h-full bg-blue-600 transition-all duration-1000 ${status === 'processing' ? 'w-1/2' : 'w-full'}`}
                ></div>
              </div>
            </div>
          ) : (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                  <CheckCircle2 size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Analysis Complete</h3>
                  <p className="text-slate-500 text-sm">Medical data successfully structured and analyzed.</p>
                </div>
              </div>

              {/* AI Result Card */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-6">
                  <div className="space-y-2">
                    <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Clinical Summary</h4>
                    <p className="text-slate-900 leading-relaxed font-medium">{result?.summary}</p>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Detected Entities</h4>
                    <div className="space-y-3">
                      {result?.entities.map((entity, i) => (
                        <div key={i} className="p-4 bg-slate-50 rounded-xl border border-slate-100 group">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full uppercase tracking-tight">
                              {entity.type}
                            </span>
                            <span className="text-xs font-bold text-slate-400">
                              Confidence: {(entity.confidence * 100).toFixed(0)}%
                            </span>
                          </div>
                          <div className="font-bold text-slate-900">{entity.value}</div>
                          <div className="mt-2 text-xs text-slate-500 flex items-start gap-1.5">
                            <Brain size={12} className="mt-0.5 flex-shrink-0 text-purple-400" />
                            <span className="italic">XAI: {entity.explanation}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className={`p-6 rounded-2xl border-2 ${
                    result?.riskLevel === 'Low' ? 'bg-emerald-50 border-emerald-100' : 'bg-orange-50 border-orange-100'
                  }`}>
                    <h4 className="text-sm font-bold text-slate-500 mb-2 uppercase tracking-wider">Risk Assessment</h4>
                    <div className={`text-2xl font-black ${
                      result?.riskLevel === 'Low' ? 'text-emerald-700' : 'text-orange-700'
                    }`}>
                      {result?.riskLevel}
                    </div>
                  </div>

                  <div className="p-6 bg-slate-900 rounded-2xl text-white">
                    <h4 className="text-xs font-bold text-slate-400 mb-4 uppercase tracking-wider">Recommendations</h4>
                    <ul className="space-y-3">
                      {result?.recommendations.map((rec, i) => (
                        <li key={i} className="text-sm flex items-start gap-2">
                          <CheckCircle2 size={16} className="text-blue-400 mt-0.5 flex-shrink-0" />
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row gap-4 justify-between items-center">
                <div className="flex items-center gap-2 text-slate-400 text-xs">
                  <Shield size={14} />
                  Ready for immutable blockchain recording
                </div>
                <div className="flex gap-4">
                  <button 
                    onClick={() => setStatus('idle')}
                    className="px-6 py-2 text-slate-600 font-bold hover:text-slate-900 transition-colors"
                  >
                    Discard
                  </button>
                  <Link href="/dashboard">
                    <button className="px-8 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all flex items-center gap-2">
                      Save to MedChain
                      <ArrowRight size={18} />
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
