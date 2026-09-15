"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { showToast } from "./toast";

const STORAGE_KEY = "medchain:auth-toast-state";

export function AuthToastWatcher() {
  const { status } = useSession();
  const isLoaded = status !== "loading";
  const isSignedIn = status === "authenticated";

  useEffect(() => {
    if (!isLoaded) return;

    const current = isSignedIn ? "signed-in" : "signed-out";
    const previous = sessionStorage.getItem(STORAGE_KEY);

    if (previous === null) {
      sessionStorage.setItem(STORAGE_KEY, current);
      return;
    }

    if (previous !== current) {
      sessionStorage.setItem(STORAGE_KEY, current);
      showToast(
        current === "signed-in" ? "Logged in successfully" : "Logged out successfully",
        "success"
      );
    }
  }, [isLoaded, isSignedIn]);

  return null;
}
