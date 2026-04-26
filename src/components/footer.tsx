"use client";

import Link from "next/link";
import { Shield } from "lucide-react";
import { usePathname } from "next/navigation";

export function Footer() {
  const pathname = usePathname();

  if (!pathname) return null;

  // Previously we were hiding the footer on dashboard/hospital pages,
  // but the user wants global visibility.
  // const isDashboardPage = pathname.startsWith("/dashboard") || pathname.startsWith("/hospital");
  // if (isDashboardPage) return null;

  return (
    <footer className="relative mt-24 flex min-h-[260px] items-center border-t border-white/5 bg-black/40 py-14 lg:mt-32! lg:min-h-[300px] lg:py-16">
      <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-blue-500/10 to-transparent" />

      <div className="app-shell w-full px-6">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-12 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-xl text-left">
            <Link href="/" className="inline-flex items-center gap-3 group">
              <div className="rounded-xl border border-blue-500/20 bg-blue-600/10 p-2 text-blue-500 transition-colors group-hover:bg-blue-500/20">
                <Shield className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">MedChain</span>
            </Link>

            <p className="mt-5 max-w-lg text-sm leading-relaxed text-zinc-400">
              The world&apos;s first decentralized medical intelligence platform.
            </p>
          </div>

          <div className="text-right">
            <ul className="flex flex-col gap-4 text-sm text-zinc-400 sm:flex-row sm:flex-wrap sm:justify-end sm:gap-x-10 sm:gap-y-4">
              <li>
                <Link href="/" className="transition-colors hover:text-white">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/dashboard/uploads" className="transition-colors hover:text-white">
                  Uploads
                </Link>
              </li>
              <li>
                <Link href="/#workflow" className="transition-colors hover:text-white">
                  Workflow
                </Link>
              </li>
              <li>
                <Link href="#" className="transition-colors hover:text-white">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-white/5 pt-8 text-center">
          <p className="text-xs text-zinc-500">
            © 2026 MedChain. Sovereign Intelligence for Healthcare.
          </p>
        </div>
      </div>
    </footer>
  );
}
