"use client";

import { useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { showToast } from "./toast";

const STORAGE_KEY = "medchain:auth-toast-state";

export function AuthToastWatcher() {
  const { isLoaded, isSignedIn } = useAuth();

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
