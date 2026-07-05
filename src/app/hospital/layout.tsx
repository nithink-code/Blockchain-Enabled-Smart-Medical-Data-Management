"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, LogOut, Shield, Stethoscope } from "lucide-react";

export default function HospitalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [doctorName, setDoctorName] = useState("Doctor");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/user/me")
      .then((r) => r.json())
      .then((data) => {
        if (data.role !== "doctor") {
          router.replace("/dashboard");
          return;
        }

        setDoctorName(data.name || "Doctor");
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [router]);

  function handleSignOut() {
    window.location.href = "/sign-in";
  }

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-black gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-emerald-500" />
        <p className="text-sm font-medium text-zinc-500">Verifying doctor credentials...</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-black text-white pt-28">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute left-0 top-0 h-[420px] w-[420px] rounded-full bg-emerald-600/5 blur-[120px]" />
        <div className="absolute bottom-0 right-0 h-[420px] w-[420px] rounded-full bg-cyan-600/5 blur-[120px]" />
      </div>

      <header className="sticky top-0 z-40 border-b border-white/5 bg-black/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-500/10 bg-emerald-500/10 text-emerald-400">
              <Stethoscope size={22} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-zinc-500">Hospital portal</p>
              <h1 className="text-lg font-bold text-white">Patient records workspace</h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden rounded-2xl border border-white/5 bg-white/[0.03] px-4 py-2.5 text-right sm:block">
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Signed in as</p>
              <p className="text-sm font-semibold text-white">{doctorName}</p>
            </div>
            <div className="flex items-center gap-2 rounded-2xl border border-emerald-500/10 bg-emerald-500/5 px-4 py-2.5 text-sm font-semibold text-emerald-300">
              <Shield size={16} />
              Secure access
            </div>
            <button
              onClick={handleSignOut}
              className="inline-flex h-11 items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-4 text-sm font-semibold text-zinc-300 transition-colors hover:bg-white/[0.06] hover:text-white"
            >
              <LogOut size={16} />
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="relative mx-auto w-full max-w-7xl px-6 py-10 sm:py-12">
        {children}
      </main>
    </div>
  );
}
