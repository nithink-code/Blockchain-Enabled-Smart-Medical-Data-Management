"use client";

import Link from "next/link";
import { ArrowRight, Stethoscope, User } from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { useEffect, useState } from "react";

type Role = "patient" | "doctor" | null;

export function HomeCta() {
  const { isLoaded, isSignedIn } = useAuth();
  const [role, setRole] = useState<Role>(null);
  const [loadingRole, setLoadingRole] = useState(false);

  useEffect(() => {
    if (!isLoaded || !isSignedIn) {
      setRole(null);
      setLoadingRole(false);
      return;
    }

    let cancelled = false;
    setLoadingRole(true);

    const syncRole = async () => {
      try {
        const syncRes = await fetch("/api/user/sync", { method: "POST" });
        if (syncRes.ok) {
          const syncData = await syncRes.json();
          if (!cancelled) {
            setRole(syncData.role ?? "patient");
            setLoadingRole(false);
          }
          return;
        }

        const meRes = await fetch("/api/user/me");
        if (meRes.ok) {
          const meData = await meRes.json();
          if (!cancelled) setRole(meData.role ?? "patient");
        } else if (!cancelled) {
          setRole("patient");
        }
      } catch {
        if (!cancelled) setRole("patient");
      } finally {
        if (!cancelled) setLoadingRole(false);
      }
    };

    syncRole();

    return () => {
      cancelled = true;
    };
  }, [isLoaded, isSignedIn]);

  if (!isLoaded) {
    return null;
  }

  if (isSignedIn) {
    if (loadingRole || !role) {
      return null;
    }

    const isDoctor = role === "doctor";
    const href = isDoctor ? "/hospital" : "/dashboard";
    const label = isDoctor ? "Hospital Portal" : "Patient Dashboard";

    return (
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <Link href={href} className="w-full sm:w-auto">
          {isDoctor ? (
            <button className="inline-flex h-14 w-full min-w-44 cursor-pointer items-center justify-center gap-2 rounded-md border border-emerald-500/30 bg-emerald-500/5 px-12 text-sm font-semibold text-emerald-300 backdrop-blur-sm transition-all hover:bg-emerald-500/10 hover:scale-[1.02] active:scale-[0.98]">
              <Stethoscope className="h-4 w-4" />
              {label}
              <ArrowRight className="h-5 w-5 ml-1 opacity-50" />
            </button>
          ) : (
            <button className="inline-flex h-14 w-full min-w-44 cursor-pointer items-center justify-center gap-2 rounded-md bg-gradient-to-b from-zinc-800 to-black px-12 text-sm font-semibold text-white border border-white/10 shadow-2xl transition-all hover:from-zinc-700 hover:to-zinc-900 hover:scale-[1.02] active:scale-[0.98]">
              <User className="h-4 w-4" />
              {label}
              <ArrowRight className="h-5 w-5 ml-1" />
            </button>
          )}
        </Link>
      </div>
    );
  }

  return (
    <Link href="/sign-in" className="w-full sm:w-auto">
      <button className="inline-flex h-14 w-full min-w-44 cursor-pointer items-center justify-center gap-2 rounded-md bg-[#6674CC] px-12 text-sm font-semibold text-white shadow-2xl transition-all hover:scale-[1.02] hover:bg-[#5563bb] active:scale-[0.98]">
        Get Started
        <ArrowRight className="h-5 w-5 ml-1" />
      </button>
    </Link>
  );
}
