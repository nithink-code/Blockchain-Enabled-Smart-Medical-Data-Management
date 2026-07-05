"use client";

import { useRouter } from "next/navigation";
import { useUserRole } from "@/lib/use-user-role";

/**
 * Smart Dashboard link for the main navbar.
 * - Not signed in  → clicking redirects to /sign-in (protected)
 * - Signed in as patient → /dashboard
 * - Signed in as doctor  → /hospital
 */
export function DashboardNavLink() {
  const router = useRouter();
  const { isSignedIn, role, roleKnown, isCheckingRole } = useUserRole();

  const handleClick = () => {
    window.dispatchEvent(new Event("page-navigation-started"));
    if (!isSignedIn) {
      router.push("/sign-in");
      return;
    }

    if (isCheckingRole || !roleKnown) {
      return;
    }

    router.push(role === "doctor" ? "/hospital" : "/dashboard");
  };

  return (
    <button
      onClick={handleClick}
      disabled={isCheckingRole || !roleKnown}
      className="flex items-center gap-2 text-sm font-medium text-zinc-400 transition-colors hover:text-white focus:outline-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
      title={
        !isSignedIn
          ? "Sign in to access your dashboard"
          : role === "doctor"
          ? "Hospital Dashboard"
          : "Patient Dashboard"
      }
    >
      Dashboard
    </button>
  );
}
