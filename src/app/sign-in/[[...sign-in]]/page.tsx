"use client";

import { useState, useEffect, Suspense } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { 
  User, 
  Building2, 
  Stethoscope, 
  Lock,
  Mail, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  ShieldCheck,
  ArrowRight,
  Loader2
} from "lucide-react";

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

function SignInContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();

  const initialRole = searchParams.get("role") === "hospital" ? "hospital" : "user";
  const [activeRole, setActiveRole] = useState<"user" | "hospital">(initialRole);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "authenticated") {
      const isHospital = session?.user?.role === "hospital" || session?.user?.role === "doctor";
      router.replace(isHospital ? "/hospital" : "/dashboard");
    }
  }, [status, session, router]);

  async function handleCredentialsLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const callbackUrl = activeRole === "hospital" ? "/hospital" : "/dashboard";
      const res = await signIn("credentials", {
        redirect: false,
        email: email.trim().toLowerCase(),
        password,
        role: activeRole,
        callbackUrl,
      });

      if (res?.error) {
        setError(res.error || "Invalid email or password. Please verify your credentials.");
        setLoading(false);
      } else {
        router.push(callbackUrl);
      }
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred during sign-in.");
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    setError("");
    setGoogleLoading(true);
    try {
      const callbackUrl = activeRole === "hospital" ? "/hospital" : "/dashboard";
      await signIn("google", { callbackUrl });
    } catch (err: any) {
      setError("Failed to initialize Google authentication.");
      setGoogleLoading(false);
    }
  }

  const isHospital = activeRole === "hospital";
  const accentColor = isHospital ? "emerald" : "blue";

  return (
    <div className="flex min-h-screen items-center justify-center bg-black p-4 selection:bg-blue-500/30 sm:p-6">
      {/* Background ambient lighting */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div 
          className={`absolute top-[-10%] left-[-10%] w-[45%] h-[45%] rounded-full blur-[130px] transition-colors duration-700 ${
            isHospital ? "bg-emerald-600/10" : "bg-blue-600/10"
          }`} 
        />
        <div 
          className={`absolute bottom-[-10%] right-[-10%] w-[45%] h-[45%] rounded-full blur-[130px] transition-colors duration-700 ${
            isHospital ? "bg-teal-600/10" : "bg-indigo-600/10"
          }`} 
        />
      </div>

      <div className="relative w-full max-w-lg">
        {/* Main Form */}
        <div className="relative top-6 mt-68 flex flex-col items-center gap-y-4 rounded-2xl border border-white/10 bg-zinc-950/80 p-6 pt-12 pb-12 shadow-2xl backdrop-blur-2xl sm:p-8 sm:pt-14 sm:pb-14">
          <div className="mt-2 mb-9 flex flex-col items-center gap-4 text-center">
            <div className={`relative top-4 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg shadow-xl transition-colors duration-500 ${
              isHospital ? "bg-emerald-600 shadow-emerald-500/20" : "bg-blue-600 shadow-blue-500/20"
            }`}>
              {isHospital ? <Stethoscope className="h-5 w-5 text-white" /> : <ShieldCheck className="h-5 w-5 text-white" />}
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white">
                {isHospital ? "Hospital Portal Login" : "Patient Portal Login"}
              </h1>
              <p className="mt-2 text-xs leading-5 text-zinc-400">
                {isHospital
                  ? "Access your institutional medical workspace"
                  : "Access your encrypted health records and consent"}
              </p>
            </div>
          </div>

          {/* Role Switcher Tabs */}
          <div className="mx-auto grid w-full max-w-sm grid-cols-2 gap-2 rounded-xl border border-white/10 bg-white/3 p-1.5">
          <button
            type="button"
            onClick={() => {
              setActiveRole("user");
              setError("");
            }}
            className={`flex h-10 items-center justify-center gap-2 rounded-lg px-2 text-[11px] font-bold transition-all cursor-pointer ${
              !isHospital 
                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/25 scale-[1.01]" 
                : "text-zinc-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <User size={14} />
            Patient / User
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveRole("hospital");
              setError("");
            }}
            className={`flex h-10 items-center justify-center gap-2 rounded-lg px-2 text-[11px] font-bold transition-all cursor-pointer ${
              isHospital 
                ? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/25 scale-[1.01]" 
                : "text-zinc-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Building2 size={14} />
            Hospital / Doctor
          </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mx-auto mt-5 flex w-full max-w-sm items-start gap-3 rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-[11px] font-medium text-rose-300 animate-in fade-in duration-200">
              <AlertCircle size={16} className="text-rose-400 shrink-0 mt-0.5" />
              <p className="leading-relaxed">{error}</p>
            </div>
          )}

          {/* Role Form */}
          <form onSubmit={handleCredentialsLogin} className="mx-auto w-full max-w-sm space-y-6">
            <div className="space-y-2">
              <label className="block text-[11px] font-semibold text-zinc-300">
                {isHospital ? "Hospital / Institutional Email" : "Email Address"}
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={isHospital ? "apollo@medchain.io" : "user@example.com"}
                  required
                  style={{ textIndent: "40px" }}
                  className="auth-input h-12 w-full rounded-xl border border-white/10 bg-white/3 px-4 pl-16 text-left text-xs text-white placeholder:text-zinc-600 transition-all focus:border-blue-500/30 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                />
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-[11px] font-semibold text-zinc-300">Password</label>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  style={{ textIndent: "40px" }}
                  className="auth-input h-12 w-full rounded-xl border border-white/10 bg-white/3 px-4 pl-12 pr-11 text-left text-xs text-white placeholder:text-zinc-600 transition-all focus:border-blue-500/30 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                />
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || googleLoading}
              className={`relative left-20 top-2 mx-auto flex h-10 w-full max-w-60 items-center justify-center gap-2 rounded-xl text-xs font-bold text-white shadow-xl transition-all hover:scale-[1.01] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 ${
                isHospital
                  ? "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/20"
                  : "bg-blue-600 hover:bg-blue-500 shadow-blue-500/20"
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-white" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign In as {isHospital ? "Hospital" : "Patient"}</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Google One-Click Login */}
          <div className="mx-auto flex w-full max-w-sm items-center gap-3">
            <div className="h-px flex-1 bg-white/10" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">or</span>
            <div className="h-px flex-1 bg-white/10" />
          </div>
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={googleLoading || loading}
            className="mx-auto flex h-11 w-full max-w-70 items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/4 px-4 text-xs font-semibold text-white transition-all hover:border-white/20 hover:bg-white/8 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {googleLoading ? (
              <Loader2 className="h-5 w-5 animate-spin text-zinc-400" />
            ) : (
              <GoogleIcon />
            )}
            <span>Continue with Google</span>
          </button>

          {/* Footer switch to sign-up */}
          <div className="mt-6 border-t border-white/10 pt-5 text-center text-xs text-zinc-400">
            Don&apos;t have an account?{" "}
            <Link
              href={`/sign-up?role=${activeRole}`}
              className={`font-semibold hover:underline transition-colors ${
                isHospital ? "text-emerald-400 hover:text-emerald-300" : "text-blue-400 hover:text-blue-300"
              }`}
            >
              Register as {isHospital ? "Hospital / Provider" : "Patient"} →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-black">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    }>
      <SignInContent />
    </Suspense>
  );
}
