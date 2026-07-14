"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function HospitalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/user/me")
      .then((r) => r.json())
      .then((data) => {
        if (data.role !== "doctor") {
          router.replace("/dashboard");
          return;
        }

        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [router]);

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-black gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-emerald-500" />
        <p className="text-sm font-medium text-zinc-500">Verifying doctor credentials...</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-black text-white">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute left-0 top-0 h-[420px] w-[420px] rounded-full bg-emerald-600/5 blur-[120px]" />
        <div className="absolute bottom-0 right-0 h-[420px] w-[420px] rounded-full bg-cyan-600/5 blur-[120px]" />
      </div>

      {/* Spacer to account for fixed navbar */}
      <div className="h-20" />

      <main className="relative flex justify-center w-full px-4 sm:px-6 py-10 sm:py-12">
        <div className="w-full max-w-6xl">
          {children}
        </div>
      </main>
    </div>
  );
}
