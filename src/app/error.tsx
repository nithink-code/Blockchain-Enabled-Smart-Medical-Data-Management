"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCcw, WifiOff } from "lucide-react";
import Link from "next/link";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("App Error:", error);
  }, [error]);

  const isNetworkError = 
    error.message.toLowerCase().includes("network") || 
    error.message.toLowerCase().includes("fetch") ||
    error.message.toLowerCase().includes("clerkjs: network error");

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 py-24 sm:px-6 lg:px-8 bg-black text-white relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 left-1/2 -translate-x-1/2 w-[800px] h-[800px] opacity-20 blur-[120px] rounded-full bg-red-900/40"></div>
      </div>

      <div className="relative z-10 w-full max-w-md mx-auto flex flex-col items-center text-center space-y-8">
        {/* Icon */}
        <div className="relative">
          <div className="absolute inset-0 bg-red-500/20 blur-xl rounded-full"></div>
          <div className="w-24 h-24 bg-zinc-900/80 border border-zinc-800 rounded-2xl flex items-center justify-center shadow-2xl relative z-10 backdrop-blur-sm">
            {isNetworkError ? (
              <WifiOff className="w-10 h-10 text-red-500" />
            ) : (
              <AlertTriangle className="w-10 h-10 text-red-500" />
            )}
          </div>
        </div>

        {/* Text content */}
        <div className="space-y-4">
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            {isNetworkError ? "Connection Lost" : "Something went wrong"}
          </h1>
          <p className="text-base text-zinc-400">
            {isNetworkError
              ? "We're having trouble connecting to our servers. Please check your internet connection or try again."
              : "An unexpected error occurred while loading this page. Our team has been notified."}
          </p>
          {process.env.NODE_ENV === "development" && (
            <div className="mt-4 p-4 bg-zinc-900/80 border border-zinc-800 rounded-lg text-left overflow-auto max-h-48 text-xs text-red-400 font-mono">
              <p className="font-semibold mb-1 break-words">{error.message}</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center mt-8">
          <button
            onClick={() => reset()}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-white text-black font-semibold rounded-full hover:bg-zinc-200 transition-all duration-200 w-full sm:w-auto shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.2)]"
          >
            <RefreshCcw className="w-4 h-4" />
            <span>Try Again</span>
          </button>
          <Link
            href="/"
            className="flex items-center justify-center gap-2 px-6 py-3 bg-zinc-900 text-white font-medium rounded-full border border-zinc-800 hover:bg-zinc-800 transition-colors duration-200 w-full sm:w-auto"
          >
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}
