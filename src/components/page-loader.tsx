"use client";

import { useEffect, useState, useTransition } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

export function PageLoader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Hide loader when pathname or searchParams change
    setIsLoading(false);
  }, [pathname, searchParams]);

  useEffect(() => {
    const handleAnchorClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const anchor = target.closest("a");

      if (
        anchor &&
        anchor.href &&
        anchor.target !== "_blank" &&
        !event.ctrlKey &&
        !event.metaKey &&
        !event.shiftKey &&
        !event.altKey
      ) {
        const url = new URL(anchor.href);
        const currentUrl = new URL(window.location.href);

        // Only show loader if it's an internal link and not a hash link
        if (
          url.origin === currentUrl.origin &&
          (url.pathname !== currentUrl.pathname || url.search !== currentUrl.search) &&
          !url.hash
        ) {
          setIsLoading(true);
        }
      }
    };

    window.addEventListener("click", handleAnchorClick);
    
    const handleCustomEvent = () => setIsLoading(true);
    window.addEventListener("page-navigation-started", handleCustomEvent);
    
    // Hide loader if user navigates back/forward or page is shown from cache
    const hideLoader = () => setIsLoading(false);
    window.addEventListener("popstate", hideLoader);
    window.addEventListener("pageshow", hideLoader);

    return () => {
      window.removeEventListener("click", handleAnchorClick);
      window.removeEventListener("page-navigation-started", handleCustomEvent);
      window.removeEventListener("popstate", hideLoader);
      window.removeEventListener("pageshow", hideLoader);
    };
  }, []);

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm transition-all duration-300 animate-in fade-in">
      <div className="relative">
        {/* Outer glow for premium feel */}
        <div className="absolute inset-0 bg-blue-500/20 blur-2xl rounded-full scale-150 animate-pulse" />
        
        {/* Large, fast rotating spinner */}
        <Loader2 
          className="relative h-16 w-16 text-blue-500 animate-[spin_0.6s_linear_infinite]" 
          strokeWidth={2} 
        />
      </div>
    </div>
  );
}
