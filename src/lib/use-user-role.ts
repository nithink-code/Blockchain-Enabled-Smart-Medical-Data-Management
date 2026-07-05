"use client";

import { useAuth } from "@clerk/nextjs";
import { useEffect, useState } from "react";

export type UserRole = "patient" | "doctor" | null;

export function useUserRole() {
  const { isLoaded, isSignedIn } = useAuth();
  const [role, setRole] = useState<UserRole>(null);
  const [isCheckingRole, setIsCheckingRole] = useState(false);
  const [roleKnown, setRoleKnown] = useState(false);

  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn) {
      setRole(null);
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
        console.log(meData)
        if (meData?.role) {
          if (!cancelled) {
            setRole(meData.role);
            setRoleKnown(true);
          }
          return;
        }

        const syncRes = await fetch("/api/user/sync", { method: "POST" });
        const syncData = await syncRes.json().catch(() => null);
        if (syncData?.role) {
          if (!cancelled) {
            setRole(syncData.role);
            setRoleKnown(true);
          }
          return;
        }

        if (!cancelled) {
          setRole(null);
          setRoleKnown(false);
        }
      } catch {
        if (!cancelled) {
          setRole(null);
          setRoleKnown(false);
        }
      } finally {
        if (!cancelled) setIsCheckingRole(false);
      }
    };

    resolveRole();

    return () => {
      cancelled = true;
    };
  }, [isLoaded, isSignedIn]);

  return {
    isLoaded,
    isSignedIn,
    role,
    isCheckingRole,
    roleKnown,
  };
}
