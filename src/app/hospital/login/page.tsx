"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Stethoscope, Shield, Eye, EyeOff, AlertCircle, Lock, CheckCircle2, Loader2, ArrowRight } from "lucide-react";
import Link from "next/link";

function GoogleIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.35 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.17 0 9.97 0 12s.45 3.83 1.25 5.42l4.03-3.15z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
      />
    </svg>
  );
}

export default function HospitalLoginPage() {
  const router = useRouter();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw]     = useState(false);
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email: email.trim().toLowerCase(),
        password,
        role: "hospital",
        callbackUrl: "/hospital",
      });

      if (res?.error) {
        setError(res.error || "Invalid hospital credentials. Please check your institutional email and password.");
        setLoading(false);
      } else {
        router.push("/hospital");
      }
    } catch (err: any) {
      setError(err?.message || "An error occurred during hospital authentication.");
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    setError("");
    setGoogleLoading(true);
    try {
      await signIn("google", { callbackUrl: "/hospital" });
    } catch {
      setError("Failed to initialize Google authentication.");
      setGoogleLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 selection:bg-emerald-500/30 pt-24 pb-12">
      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[45%] h-[45%] rounded-full bg-emerald-600/10 blur-[130px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[45%] h-[45%] rounded-full bg-teal-600/10 blur-[130px]" />
      </div>

      <div className="relative w-full max-w-md space-y-7 animate-fade-in">
        {/* Logo */}
        <div className="text-center space-y-2.5">
          <div className="inline-flex items-center justify-center gap-3 mb-1">
            <div className="relative">
              <div className="absolute inset-0 bg-emerald-600 blur-lg opacity-50" />
              <div className="relative bg-emerald-600 p-3 rounded-2xl shadow-xl shadow-emerald-500/20">
                <Stethoscope className="h-7 w-7 text-white" />
              </div>
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">MedChain</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Hospital Workspace</h1>
          <p className="text-sm text-zinc-400">Sign in with verified institutional credentials or Google</p>
        </div>

        {/* Demo Credentials Note */}
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 flex items-center gap-2">
            <CheckCircle2 size={12} /> Pre-configured Demo Access
          </p>
          <div className="space-y-1 text-xs text-zinc-400 font-mono">
            <p>Email: <span className="text-white">apollo@medchain.io</span></p>
            <p>Password: <span className="text-white">hospital123</span></p>
          </div>
        </div>

        {/* Card */}
        <div className="rounded-[32px] border border-white/10 bg-zinc-950/70 backdrop-blur-2xl p-6 sm:p-8 shadow-2xl space-y-6">
          {/* Google Sign-in for Hospitals */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={googleLoading || loading}
            className="w-full flex items-center justify-center gap-3 h-13 rounded-2xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] hover:border-white/20 text-sm font-semibold text-white transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 cursor-pointer shadow-lg"
          >
            {googleLoading ? (
              <Loader2 className="h-5 w-5 animate-spin text-zinc-400" />
            ) : (
              <GoogleIcon />
            )}
            <span>Continue with Google as Hospital</span>
          </button>

          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative px-4 bg-zinc-950/70 text-[11px] font-bold uppercase tracking-wider text-zinc-500">
              Or institutional password
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300">Hospital Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="apollo@medchain.io"
                required
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/30 transition-all"
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300">Password</label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 pr-11 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/30 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
                >
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-start gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 p-3.5 text-xs text-red-300">
                <AlertCircle size={16} className="text-red-400 mt-0.5 shrink-0" />
                <p>{error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || googleLoading}
              className="w-full flex items-center justify-center gap-2.5 h-13 rounded-2xl bg-emerald-600 text-sm font-bold text-white shadow-xl shadow-emerald-500/20 transition-all hover:bg-emerald-500 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-white" />
                  <span>Verifying credentials...</span>
                </>
              ) : (
                <>
                  <Lock size={16} />
                  <span>Sign In to Hospital Portal</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Security Note */}
          <div className="flex items-start gap-3 rounded-2xl border border-white/5 bg-white/[0.02] p-3.5">
            <Shield size={15} className="text-zinc-500 mt-0.5 shrink-0" />
            <p className="text-xs text-zinc-500 leading-relaxed">
              This portal is restricted to authenticated medical institutions. All access requests are cryptographically signed and audited.
            </p>
          </div>

          <div className="pt-2 text-center text-xs text-zinc-400 space-y-1.5">
            <p>
              New healthcare provider?{" "}
              <Link href="/sign-up?role=hospital" className="font-semibold text-emerald-400 hover:text-emerald-300 transition-colors">
                Register Hospital Account →
              </Link>
            </p>
            <p>
              Are you a patient?{" "}
              <Link href="/sign-in?role=user" className="font-semibold text-blue-400 hover:text-blue-300 transition-colors">
                Patient Login →
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
