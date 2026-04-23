"use client";

import Link from "next/link";
import { UserButton, useAuth } from "@clerk/nextjs";
import { Menu } from "lucide-react";

export function AuthNavbar() {
  const { isLoaded, isSignedIn } = useAuth();

  return (
    <div className="flex items-center gap-4">
      {isLoaded && isSignedIn ? (
        <>
          <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-white/5 shadow-xl shadow-black/20">
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "h-11 w-11",
                  userButtonPopoverCard: "border border-white/10 bg-zinc-950 text-white shadow-2xl",
                  userButtonPopoverActionButton: "text-zinc-300 hover:bg-white/5 hover:text-white",
                  userButtonPopoverActionButtonText: "text-sm font-medium",
                },
              }}
            />
          </div>
        </>
      ) : (
        <>
          <Link href="/sign-in">
            <button className="inline-flex h-12 items-center justify-center rounded-2xl bg-linear-to-r from-zinc-900 to-black min-w-35 px-10 text-sm font-bold text-white border border-white/5 shadow-xl transition-all hover:border-white/10 hover:scale-[1.02] active:scale-[0.98]">
              Login
            </button>
          </Link>
          <button className="inline-flex rounded-lg border border-white/10 p-2 text-zinc-400 md:hidden">
            <Menu className="h-5 w-5" />
          </button>
        </>
      )}
    </div>
  );
}