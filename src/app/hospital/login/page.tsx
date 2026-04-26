"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Stethoscope, Shield, Eye, EyeOff, AlertCircle, Lock, CheckCircle2 } from "lucide-react";
import Link from "next/link";

// Mock hospital credentials
const VALID_HOSPITALS = [
  { id: "HOSP-APL-7B3C-2F9A", name: "Apollo Hospitals", email: "apollo@medchain.io", password: "hospital123" },
  { id: "HOSP-AIM-4C1D-8E2B", name: "AIIMS New Delhi",  email: "aiims@medchain.io",  password: "hospital123" },
  { id: "HOSP-FRT-9A2E-5F3C", name: "Fortis Healthcare", email: "fortis@medchain.io", password: "hospital123" },
];

export default function HospitalLoginPage() {
  const router = useRouter();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw]     = useState(false);
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    await new Promise(r => setTimeout(r, 900)); // simulate network

    const match = VALID_HOSPITALS.find(
      h => h.email === email.trim().toLowerCase() && h.password === password
    );

    if (match) {
      // Store hospital session in sessionStorage
      sessionStorage.setItem("hospital_session", JSON.stringify({
        id: match.id,
        name: match.name,
        email: match.email,
      }));
      router.push("/hospital");
    } else {
      setError("Invalid hospital credentials. Please check your email and password.");
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 selection:bg-emerald-500/30">
      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-600/8 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-teal-600/8 blur-[120px]" />
      </div>

      <div className="relative w-full max-w-md space-y-8 animate-fade-in">
        {/* Logo */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center gap-3 mb-2">
            <div className="relative">
              <div className="absolute inset-0 bg-emerald-600 blur-lg opacity-50" />
              <div className="relative bg-emerald-600 p-3 rounded-2xl">
                <Stethoscope className="h-7 w-7 text-white" />
              </div>
            </div>
            <span className="text-2xl font-bold text-white">MedChain</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Hospital Portal</h1>
          <p className="text-zinc-400">Sign in with your verified hospital credentials</p>
        </div>

        {/* Demo Credentials Note */}
        <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-4 space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-blue-400 flex items-center gap-2">
            <CheckCircle2 size={12} /> Demo Credentials
          </p>
          <div className="space-y-1 text-xs text-zinc-400 font-mono">
            <p>Email: <span className="text-white">apollo@medchain.io</span></p>
            <p>Password: <span className="text-white">hospital123</span></p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-zinc-300">Hospital Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="hospital@medchain.io"
              required
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/30 transition-all"
            />
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-zinc-300">Password</label>
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 pr-12 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/30 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
              >
                {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-3 rounded-2xl border border-red-500/20 bg-red-500/5 p-4">
              <AlertCircle size={16} className="text-red-400 mt-0.5 shrink-0" />
              <p className="text-sm text-red-300">{error}</p>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 h-14 rounded-2xl bg-emerald-600 text-sm font-bold text-white shadow-xl shadow-emerald-500/20 transition-all hover:bg-emerald-500 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="h-4 w-4 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                Verifying credentials...
              </>
            ) : (
              <>
                <Lock size={16} />
                Sign In to Hospital Portal
              </>
            )}
          </button>
        </form>

        {/* Security Note */}
        <div className="flex items-start gap-3 rounded-2xl border border-white/5 bg-white/[0.02] p-4">
          <Shield size={15} className="text-zinc-500 mt-0.5 shrink-0" />
          <p className="text-xs text-zinc-500 leading-relaxed">
            This portal is for verified healthcare institutions only. All access is logged and audited. Patient identities are anonymized.
          </p>
        </div>

        <p className="text-center text-sm text-zinc-500">
          Are you a patient?{" "}
          <Link href="/sign-in" className="font-semibold text-blue-400 hover:text-blue-300 transition-colors">
            Patient Login →
          </Link>
        </p>
      </div>
    </div>
  );
}
