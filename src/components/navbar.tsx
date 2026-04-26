"use client";

import Link from "next/link";
import { Shield } from "lucide-react";
import { AuthNavbar } from "./auth-navbar";
import { DashboardNavLink } from "./dashboard-nav-link";
import { usePathname } from "next/navigation";

export function Navbar() {
  const pathname = usePathname();
  
  // Safety check for pathname
  if (!pathname) return null;
  
  // Previously we were hiding the navbar on dashboard/hospital pages, 
  // but the user wants it visible everywhere.
  // const isDashboardPage = pathname.startsWith("/dashboard") || pathname.startsWith("/hospital");
  // if (isDashboardPage) return null;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex h-20 items-center justify-center bg-black/30 border-b border-white/[0.07] backdrop-blur-xl">
      <div className="flex w-full max-w-7xl items-center justify-between px-4 md:px-8 lg:px-12!">
        <Link href="/" className="flex items-center gap-3 group shrink-0 cursor-pointer">
          <div className="relative">
            <div className="absolute inset-0 bg-blue-600 blur-lg opacity-40 group-hover:opacity-70 transition-opacity" />
            <div className="relative rounded-xl bg-blue-600 p-2 shadow-xl shadow-blue-500/20">
              <Shield className="h-5 w-5 text-white" />
            </div>
          </div>
          <span className="text-xl font-bold tracking-tight text-white hidden sm:block">
            Med<span className="text-blue-500">Chain</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-medium text-zinc-400 md:flex">
          <Link 
            href="/" 
            className={`transition-colors hover:text-white cursor-pointer ${pathname === "/" ? "text-white" : ""}`}
          >
            Home
          </Link>
          <Link 
            href="/dashboard/uploads" 
            className={`transition-colors hover:text-white cursor-pointer ${pathname === "/dashboard/uploads" ? "text-white" : ""}`}
          >
            Uploads
          </Link>
          <DashboardNavLink />
        </nav>

        <div className="flex items-center shrink-0">
          <AuthNavbar />
        </div>
      </div>
    </header>
  );
}
