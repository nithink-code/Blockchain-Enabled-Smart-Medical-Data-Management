"use client";

import { UserButton, useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { Menu } from "lucide-react";

/**
 * Shows UserButton when signed in, or Login button when signed out.
 * The Dashboard link is handled by DashboardNavLink in the main navbar.
 */
export function AuthNavbar() {
  const { isLoaded, isSignedIn } = useAuth();

  return (
    <div className="-translate-x-4 flex items-center gap-4">
      {isLoaded && isSignedIn ? (
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
      ) : (
        <>
          <Link href="/sign-in">
            <button className="mr-2 inline-flex h-10 min-w-28 cursor-pointer items-center justify-center rounded-full bg-[#6674CC] py-6 text-sm font-bold text-white shadow-xl transition-all hover:scale-[1.02] hover:bg-[#5563bb] active:scale-[0.98]">
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