"use client";

import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Role = "patient" | "doctor" | null;

/**
 * Smart Dashboard link for the main navbar.
 * - Not signed in  → clicking redirects to /sign-in (protected)
 * - Signed in as patient → /dashboard
 * - Signed in as doctor  → /hospital
 */
export function DashboardNavLink() {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  const [role, setRole] = useState<Role>(null);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    setFetching(true);
    // Sync user to MongoDB first (creates doc with role=patient if new user)
    fetch("/api/user/sync", { method: "POST" })
      .then((r) => r.json())
      .then((data) => {
        setRole(data.role ?? "patient");
        setFetching(false);
      })
      .catch(() => {
        // Fallback: try GET if POST failed
        fetch("/api/user/me")
          .then((r) => r.json())
          .then((data) => setRole(data.role ?? "patient"))
          .catch(() => setRole("patient"))
          .finally(() => setFetching(false));
      });
  }, [isLoaded, isSignedIn]);

  const handleClick = () => {
    window.dispatchEvent(new Event("page-navigation-started"));
    if (!isSignedIn) {
      router.push("/sign-in");
      return;
    }
    router.push(role === "doctor" ? "/hospital" : "/dashboard");
  };

  return (
    <button
      onClick={handleClick}
      className="flex items-center gap-2 text-sm font-medium text-zinc-400 transition-colors hover:text-white focus:outline-none cursor-pointer"
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
