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
  Loader2,
  FileCheck2,
  Phone
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

function SignUpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();

  const initialRole = searchParams.get("role") === "hospital" ? "hospital" : "user";
  const [activeRole, setActiveRole] = useState<"user" | "hospital">(initialRole);

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState("");

  // Hospital fields
  const [hospitalName, setHospitalName] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [department, setDepartment] = useState("");
  const [speciality, setSpeciality] = useState("");

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "authenticated") {
      const isHospital = session?.user?.role === "hospital" || session?.user?.role === "doctor";
      router.replace(isHospital ? "/hospital" : "/dashboard");
    }
  }, [status, session, router]);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const payload: any = {
        role: activeRole,
        email: email.trim().toLowerCase(),
        password,
        name: activeRole === "hospital" ? hospitalName.trim() : name.trim(),
      };

      if (activeRole === "hospital") {
        payload.hospitalName = hospitalName.trim();
        payload.licenseNumber = licenseNumber.trim();
        payload.department = department.trim();
        payload.speciality = speciality.trim();
      } else {
        payload.phone = phone.trim();
      }

      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to register account");
      }

      // Auto login with credentials
      const callbackUrl = activeRole === "hospital" ? "/hospital" : "/dashboard";
      const loginRes = await signIn("credentials", {
        redirect: false,
        email: email.trim().toLowerCase(),
        password,
        role: activeRole,
        callbackUrl,
      });

      if (loginRes?.error) {
        router.push(`/sign-in?role=${activeRole}`);
      } else {
        router.push(callbackUrl);
      }
    } catch (err: any) {
      setError(err?.message || "Registration failed. Please check your details.");
      setLoading(false);
    }
  }

  async function handleGoogleSignUp() {
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4 sm:p-6 pt-28 selection:bg-blue-500/30">
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

      <div className="relative w-full max-w-lg space-y-6">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center gap-2.5 mb-1">
            <div className={`p-2.5 rounded-2xl shadow-xl transition-colors duration-500 ${
              isHospital ? "bg-emerald-600 shadow-emerald-500/20" : "bg-blue-600 shadow-blue-500/20"
            }`}>
              {isHospital ? <Stethoscope className="h-6 w-6 text-white" /> : <ShieldCheck className="h-6 w-6 text-white" />}
            </div>
            <span className="text-2xl font-bold tracking-tight text-white">
              Med<span className={isHospital ? "text-emerald-400" : "text-blue-500"}>Chain</span>
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            {isHospital ? "Create Hospital Account" : "Create Patient Account"}
          </h1>
          <p className="text-sm text-zinc-400">
            {isHospital 
              ? "Join the blockchain medical network as a verified healthcare provider" 
              : "Register your patient identity for sovereign encrypted records"}
          </p>
        </div>

        {/* Role Switcher Tabs */}
        <div className="grid grid-cols-2 p-1.5 rounded-2xl bg-zinc-950/80 border border-white/10 backdrop-blur-xl">
          <button
            type="button"
            onClick={() => {
              setActiveRole("user");
              setError("");
            }}
            className={`flex items-center justify-center gap-2.5 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              !isHospital 
                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/25 scale-[1.01]" 
                : "text-zinc-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <User size={16} />
            Patient / User
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveRole("hospital");
              setError("");
            }}
            className={`flex items-center justify-center gap-2.5 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              isHospital 
                ? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/25 scale-[1.01]" 
                : "text-zinc-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Building2 size={16} />
            Hospital / Doctor
          </button>
        </div>

        {/* Main Card */}
        <div className="rounded-[32px] border border-white/10 bg-zinc-950/70 backdrop-blur-2xl p-6 sm:p-8 shadow-2xl space-y-6">
          
          {/* Google One-Click Register */}
          <button
            type="button"
            onClick={handleGoogleSignUp}
            disabled={googleLoading || loading}
            className="w-full flex items-center justify-center gap-3.5 h-13 rounded-2xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] hover:border-white/20 text-sm font-semibold text-white transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 cursor-pointer shadow-lg shadow-black/20"
          >
            {googleLoading ? (
              <Loader2 className="h-5 w-5 animate-spin text-zinc-400" />
            ) : (
              <GoogleIcon />
            )}
            <span>
              Sign Up with Google as {isHospital ? "Hospital" : "Patient"}
            </span>
          </button>

          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative px-4 bg-zinc-950/70 text-[11px] font-bold uppercase tracking-wider text-zinc-500">
              Or register with details
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-start gap-3 rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-xs font-medium text-rose-300 animate-in fade-in duration-200">
              <AlertCircle size={16} className="text-rose-400 shrink-0 mt-0.5" />
              <p className="leading-relaxed">{error}</p>
            </div>
          )}

          {/* Role-Specific Form */}
          <form onSubmit={handleRegister} className="space-y-4">
            {isHospital ? (
              <>
                {/* Hospital Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-300">Hospital / Facility Name</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={hospitalName}
                      onChange={(e) => setHospitalName(e.target.value)}
                      placeholder="e.g. Apollo Memorial Hospital"
                      required
                      className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3.5 pl-11 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/30 transition-all"
                    />
                    <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                  </div>
                </div>

                {/* License Number */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-300">License Number</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={licenseNumber}
                        onChange={(e) => setLicenseNumber(e.target.value)}
                        placeholder="MED-LIC-2026-X"
                        className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3.5 pl-11 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 transition-all"
                      />
                      <FileCheck2 className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-300">Primary Speciality</label>
                    <input
                      type="text"
                      value={speciality}
                      onChange={(e) => setSpeciality(e.target.value)}
                      placeholder="General Medicine / Oncology"
                      className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 transition-all"
                    />
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Full Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-300">Full Name</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Jane Doe"
                      required
                      className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3.5 pl-11 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/30 transition-all"
                    />
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                  </div>
                </div>

                {/* Optional Phone */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-300">Phone (Optional)</label>
                  <div className="relative">
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3.5 pl-11 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all"
                    />
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                  </div>
                </div>
              </>
            )}

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300">
                {isHospital ? "Institutional Email" : "Email Address"}
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={isHospital ? "admin@hospital.org" : "jane@example.com"}
                  required
                  className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3.5 pl-11 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/30 transition-all"
                />
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  required
                  minLength={6}
                  className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3.5 pl-11 pr-11 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/30 transition-all"
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
              className={`w-full flex items-center justify-center gap-2 h-13 rounded-2xl text-sm font-bold text-white shadow-xl transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 cursor-pointer ${
                isHospital
                  ? "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/20"
                  : "bg-blue-600 hover:bg-blue-500 shadow-blue-500/20"
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-white" />
                  <span>Registering...</span>
                </>
              ) : (
                <>
                  <span>Complete {isHospital ? "Hospital" : "Patient"} Registration</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Footer switch to sign-in */}
          <div className="pt-2 text-center text-xs text-zinc-400">
            Already have an account?{" "}
            <Link
              href={`/sign-in?role=${activeRole}`}
              className={`font-semibold hover:underline transition-colors ${
                isHospital ? "text-emerald-400 hover:text-emerald-300" : "text-blue-400 hover:text-blue-300"
              }`}
            >
              Sign In to {isHospital ? "Hospital Portal" : "Patient Portal"} →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-black">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    }>
      <SignUpContent />
    </Suspense>
  );
}
