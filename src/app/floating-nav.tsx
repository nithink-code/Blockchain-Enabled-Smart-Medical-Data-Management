"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/features", label: "Features" },
  { href: "/security", label: "Security" },
];

export function FloatingNav() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const activeHref = useMemo(() => {
    if (pathname === "/") return "/";
    if (pathname.startsWith("/features")) return "/features";
    if (pathname.startsWith("/security")) return "/security";
    return "";
  }, [pathname]);

  return (
    <div
      className={`fixed left-1/2 z-50 -translate-x-1/2 transition-all duration-300 ${
        isScrolled ? "top-8" : "top-6"
      }`}
    >
      <nav className="flex min-w-120 items-center justify-center gap-3 rounded-full border border-white/40 bg-black/40 px-3.5 py-6 shadow-[0_14px_40px_rgba(0,0,0,0.38)] backdrop-blur-lg md:min-h-15 md:min-w-110 md:gap-3.5 md:px-6 md:py-8">
        {navLinks.map((link) => {
          const isActive = activeHref === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`whitespace-nowrap rounded-full px-5 py-5 text-lg font-semibold tracking-wide transition-all md:px-8 md:py-6 md:text-xl ${
                isActive
                  ? "bg-linear-to-r from-sky-500/95 to-indigo-500/95 text-white shadow-lg shadow-blue-500/35"
                  : "text-zinc-100 hover:bg-white/15 hover:text-white"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
