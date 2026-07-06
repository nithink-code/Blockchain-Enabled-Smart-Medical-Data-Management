"use client";

import Link from "next/link";
import { ArrowRight, Stethoscope, User } from "lucide-react";
import { useUserRole } from "@/lib/use-user-role";

export function HomeCta() {
  const { isLoaded, isSignedIn, role, roleKnown, isCheckingRole } = useUserRole();

  if (!isLoaded) {
    return null;
  }

  if (isSignedIn) {
    if (isCheckingRole || !roleKnown || !role) {
      return null;
    }

    const isDoctor = role === "doctor";
    const href = isDoctor ? "/hospital" : "/dashboard";
    const label = isDoctor ? "Hospital Portal" : "Patient Dashboard";

    return (
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <Link href={href} className="w-full sm:w-auto">
          {isDoctor ? (
            <button className="inline-flex h-14 w-full min-w-48 cursor-pointer items-center justify-center gap-2 rounded-md border border-emerald-500/30 bg-emerald-500/5 px-12 text-sm font-semibold text-emerald-300 backdrop-blur-sm transition-all hover:bg-emerald-500/10 hover:scale-[1.02] active:scale-[0.98]">
              <Stethoscope className="h-4 w-4" />
              {label}
              <ArrowRight className="h-5 w-5 ml-1 opacity-50" />
            </button>
          ) : (
            <button className="inline-flex h-14 w-full min-w-48 cursor-pointer items-center justify-center gap-2 rounded-md border border-white/10 bg-gradient-to-b from-zinc-800 to-black px-8 text-sm font-semibold text-white shadow-2xl transition-all hover:from-zinc-700 hover:to-zinc-900 hover:scale-[1.02] active:scale-[0.98]">
              <User className="h-4 w-4 shrink-0" />
              <span className="whitespace-nowrap leading-none">
                {label}
              </span>
              <ArrowRight className="h-5 w-5 shrink-0" />
            </button>
          )}
        </Link>
      </div>
    );
  }

  return (
    <Link href="/sign-in" className="w-full sm:w-auto">
      <button className="inline-flex h-14 w-full min-w-48 cursor-pointer items-center justify-center gap-2 rounded-md bg-[#6674CC] px-12 text-sm font-semibold text-white shadow-2xl transition-all hover:scale-[1.02] hover:bg-[#5563bb] active:scale-[0.98]">
        Get Started
        <ArrowRight className="h-5 w-5 ml-1" />
      </button>
    </Link>
  );
}



