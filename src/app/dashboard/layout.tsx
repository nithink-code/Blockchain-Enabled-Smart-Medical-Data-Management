"use client";

import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, 
  FileText, 
  ShieldCheck, 
  Clock, 
  Settings, 
  Bell,
  Search,
  Menu,
  Shield,
  Fingerprint,
  PanelLeftClose,
  PanelLeft,
  Loader2,
  Upload
} from "lucide-react";
import { useEffect, useState } from "react";
import { useUserRole } from "@/lib/use-user-role";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router   = useRouter();
  const [mounted, setMounted]       = useState(false);
  const { isLoaded, isSignedIn, role, roleKnown, isCheckingRole } = useUserRole();

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setMounted(true);
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  // ── Role guard & User Sync ────────────────────────────────────────────────
  useEffect(() => {
    if (!mounted || !isLoaded || !isSignedIn) return;
    if (!roleKnown || isCheckingRole) return;

    if (role === "doctor") {
      router.replace("/hospital");
    }
  }, [mounted, isLoaded, isSignedIn, roleKnown, isCheckingRole, role, router]);

  const roleResolved = !isSignedIn || (roleKnown && !isCheckingRole);


  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050505]">
        <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 bg-[#050505] text-white selection:bg-blue-500/30 font-sans transition-all duration-300">
      {/* Sync Status Indicator (Optional, subtle) */}
      {!roleResolved && (
        <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-full bg-zinc-900/80 px-4 py-2 text-[10px] font-bold text-zinc-500 backdrop-blur-md border border-white/5 shadow-2xl">
          <Loader2 size={12} className="animate-spin text-blue-500" />
          Synchronizing Security Keys...
        </div>
      )}

      {/* Page Content */}
      <main className="w-full overflow-y-auto scroll-smooth">
        <div className="app-shell py-10">
          {children}
        </div>
      </main>
    </div>
  );
}

function SidebarLink({ 
  href, 
  icon, 
  label, 
  active = false, 
  collapsed = false 
}: { 
  href: string, 
  icon: React.ReactNode, 
  label: string, 
  active?: boolean,
  collapsed?: boolean
}) {
  return (
    <Link 
      href={href} 
      className={`flex items-center gap-3 rounded-2xl text-[13px] font-semibold transition-all duration-300 group relative ${
        collapsed ? "justify-center h-12 w-12 mx-auto p-0" : "min-h-12 px-3 py-2.5 w-59 mx-auto justify-start text-left"
      } ${
        active 
          ? "bg-blue-500/12 text-white border border-blue-500/25 shadow-[0_10px_24px_-16px_rgba(59,130,246,0.55)]" 
          : "text-zinc-400 hover:bg-white/4 hover:text-zinc-100 border border-white/0 hover:border-white/10"
      }`}
    >
      <span className={`shrink-0 transition-all duration-500 ${active ? "text-blue-400 scale-110" : "group-hover:text-zinc-300 group-hover:scale-110"}`}>
        {icon}
      </span>
      {!collapsed && (
        <span className="truncate transition-all duration-500 animate-in fade-in slide-in-from-left-4">
          {label}
        </span>
      )}
      
      {/* Tooltip for collapsed state */}
      {collapsed && (
        <div className="absolute left-24 px-4 py-2.5 bg-zinc-900 border border-white/10 rounded-xl text-white text-sm font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-300 -translate-x-2.5 group-hover:translate-x-0 z-50 shadow-2xl">
          {label}
          <div className="absolute top-1/2 -left-1.5 -translate-y-1/2 w-3 h-3 bg-zinc-900 border-l border-b border-white/10 rotate-45" />
        </div>
      )}
      
      {/* Active Indicator Dot for collapsed */}
      {collapsed && active && (
        <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-blue-500 rounded-r-full shadow-[0_0_12px_rgba(59,130,246,0.8)]" />
      )}
    </Link>
  );
}
