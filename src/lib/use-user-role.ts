"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { RoleType } from "./models/User";

export type UserRole = "patient" | "doctor" | "user" | "hospital" | null;

export function useUserRole() {
  const { data: session, status } = useSession();
  const [dbRole, setDbRole] = useState<string | null>(null);
  const [isCheckingRole, setIsCheckingRole] = useState(false);
  const [roleKnown, setRoleKnown] = useState(false);

  const isLoaded = status !== "loading";
  const isSignedIn = status === "authenticated";

  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn) {
      setDbRole(null);
      setIsCheckingRole(false);
      setRoleKnown(true);
      return;
    }

    // If role is already in session, use it directly
    if (session?.user?.role) {
      setDbRole(session.user.role);
      setIsCheckingRole(false);
      setRoleKnown(true);
      return;
    }

    let cancelled = false;
    const resolveRole = async () => {
      setIsCheckingRole(true);
      setRoleKnown(false);

      try {
        const meRes = await fetch("/api/user/me");
        const meData = await meRes.json().catch(() => null);
        if (meData?.role) {
          if (!cancelled) {
            setDbRole(meData.role);
            setRoleKnown(true);
          }
          return;
        }

        const syncRes = await fetch("/api/user/sync", { method: "POST" });
        const syncData = await syncRes.json().catch(() => null);
        if (syncData?.role) {
          if (!cancelled) {
            setDbRole(syncData.role);
            setRoleKnown(true);
          }
          return;
        }

        if (!cancelled) {
          setDbRole(null);
          setRoleKnown(true);
        }
      } catch {
        if (!cancelled) {
          setDbRole(null);
          setRoleKnown(true);
        }
      } finally {
        if (!cancelled) setIsCheckingRole(false);
      }
    };

    resolveRole();

    return () => {
      cancelled = true;
    };
  }, [isLoaded, isSignedIn, session]);

  const rawRole = (session?.user?.role as string) || dbRole;
  
  // Normalization ensures full backward compatibility with checks like `role === "doctor"` and `role === "patient"`
  const normalizedRole: UserRole =
    rawRole === "hospital" || rawRole === "doctor"
      ? "doctor"
      : rawRole === "user" || rawRole === "patient"
        ? "patient"
        : null;

  return {
    isLoaded,
    isSignedIn,
    role: normalizedRole,
    rawRole: rawRole as RoleType | null,
    isHospital: rawRole === "hospital" || rawRole === "doctor",
    isPatient: rawRole === "user" || rawRole === "patient",
    isCheckingRole,
    roleKnown: roleKnown || !!session?.user?.role,
    user: session?.user ?? null,
  };
}
