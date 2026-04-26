"use client";

import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, 
  Users,
  Clock,
  Settings,
  Bell,
  Search,
  Menu,
  Stethoscope,
  Shield,
  Loader2,
  PanelLeft,
  PanelLeftClose,
  LogOut
} from "lucide-react";
import { useState, useEffect } from "react";

export default function HospitalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [doctorName, setDoctorName] = useState<string>("Doctor");
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("hospital-sidebar-collapsed");
    if (saved === "true") setIsCollapsed(true);
  }, []);

  // ── Role guard: only doctors allowed ─────────────────────────────────────
  useEffect(() => {
    if (!mounted) return;
    fetch("/api/user/me")
      .then((r) => r.json())
      .then((data) => {
        if (data.role !== "doctor") {
          router.replace("/dashboard");
        } else {
          setDoctorName(data.name || "Doctor");
          setLoading(false);
        }
      })
      .catch(() => setLoading(false));
  }, [mounted, router]);

  const toggleSidebar = () => {
    const next = !isCollapsed;
    setIsCollapsed(next);
    localStorage.setItem("hospital-sidebar-collapsed", String(next));
  };

  function handleSignOut() {
    // Clerk's UserButton handles sign-out, but we keep this as fallback
    window.location.href = "/sign-in";
  }

  if (!mounted || loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-black gap-4">
        <Loader2 className="h-10 w-10 text-emerald-500 animate-spin" />
        <p className="text-zinc-500 text-sm font-medium animate-pulse">Verifying doctor credentials...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen pt-32 bg-black text-white selection:bg-emerald-500/30 transition-all duration-300">
      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-emerald-600/[0.03] blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-teal-600/[0.03] blur-[120px]" />
      </div>

      {/* Sidebar */}
      <aside 
        className={`hidden flex-col border-r border-white/5 bg-zinc-950/40 backdrop-blur-3xl md:flex fixed top-32 left-0 h-[calc(100vh-128px)] z-40 transition-all duration-500 ease-in-out ${
          isCollapsed ? "w-24" : "w-[320px]"
        }`}
      >
        {/* Logo Section (Logo removed) */}
        <div className={`flex items-center justify-between pt-16 pb-8 transition-all duration-500 ${isCollapsed ? "px-0 flex-col gap-6" : "px-8"}`}>
          <button 
            onClick={toggleSidebar}
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-zinc-400 hover:text-white hover:bg-white/[0.08] hover:border-white/20 transition-all duration-300 ${isCollapsed ? "mx-auto" : ""}`}
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isCollapsed ? <PanelLeft size={20} /> : <PanelLeftClose size={20} />}
          </button>
        </div>

        {/* Institutional ID Chip */}
        <div className={`mb-8 transition-all duration-500 ${isCollapsed ? "px-4" : "px-8"}`}>
          <div className={`flex items-center gap-4 rounded-[24px] border border-emerald-500/10 bg-emerald-500/[0.03] transition-all duration-500 ${isCollapsed ? "p-3 justify-center" : "p-5"}`}>
            <div className={`shrink-0 bg-emerald-500/10 rounded-xl transition-all duration-500 ${isCollapsed ? "p-3" : "p-3.5"}`}>
              <Shield size={isCollapsed ? 24 : 20} className="text-emerald-400" />
            </div>
            {!isCollapsed && (
              <div className="min-w-0 animate-in fade-in slide-in-from-left-4 space-y-1.5">
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-500 leading-none">Institutional Key</p>
                <p className="font-mono text-[13px] font-bold text-emerald-300 truncate">HOSP-MED-{doctorName.slice(0,3).toUpperCase()}-7B3C</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className={`flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-3 py-2 ${isCollapsed ? "px-4" : "px-8"}`}>
          {!isCollapsed && (
            <div className="px-2 mb-4 mt-2 text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-500 opacity-50">Clinical Data</div>
          )}
          <SidebarLink href="/hospital"               icon={<LayoutDashboard size={22} />} label="Patient Overview" active={pathname === "/hospital"} collapsed={isCollapsed} color="emerald" />
          <SidebarLink href="/hospital/my-requests"   icon={<Clock size={22} />}           label="Access Requests"  active={pathname.startsWith("/hospital/my-requests")} collapsed={isCollapsed} color="emerald" />
          <SidebarLink href="/hospital/active-access" icon={<Users size={22} />}           label="Active Permissions" active={pathname.startsWith("/hospital/active-access")} collapsed={isCollapsed} color="emerald" />
        </nav>

        {/* Settings & Sign Out */}
        <div className={`pb-10 pt-6 mt-auto border-t border-white/[0.03] shrink-0 flex flex-col gap-3 transition-all duration-500 ${isCollapsed ? "px-4 items-center" : "px-8"}`}>
          <SidebarLink href="/hospital/settings" icon={<Settings size={22} />} label="Preferences" active={pathname.startsWith("/hospital/settings")} collapsed={isCollapsed} color="emerald" />
          <button
            onClick={handleSignOut}
            className={`flex items-center gap-5 rounded-[20px] text-[15px] font-bold text-zinc-500 hover:bg-rose-500/10 hover:text-rose-400 transition-all duration-500 group relative ${
              isCollapsed ? "justify-center h-16 w-16 mx-auto p-0" : "px-5 py-4 w-full"
            }`}
          >
            <span className="shrink-0 group-hover:scale-110 transition-transform"><LogOut size={22} /></span>
            {!isCollapsed && <span className="animate-in fade-in slide-in-from-left-4">Sign Out</span>}
            
            {isCollapsed && (
              <div className="absolute left-24 px-4 py-2.5 bg-zinc-900 border border-white/10 rounded-xl text-white text-sm font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-300 translate-x-[-10px] group-hover:translate-x-0 z-50 shadow-2xl">
                Sign Out
                <div className="absolute top-1/2 -left-1.5 -translate-y-1/2 w-3 h-3 bg-zinc-900 border-l border-b border-white/10 rotate-45" />
              </div>
            )}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div 
        className={`flex min-w-0 flex-1 flex-col relative z-10 transition-all duration-500 ease-in-out ${
          isCollapsed ? "md:ml-24" : "md:ml-[300px]"
        }`}
      >

        <main className="flex-1 overflow-y-auto p-12 scroll-smooth">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

function SidebarLink({ 
  href, 
  icon, 
  label, 
  active = false, 
  collapsed = false,
  color = "blue"
}: { 
  href: string, 
  icon: React.ReactNode, 
  label: string, 
  active?: boolean,
  collapsed?: boolean,
  color?: "blue" | "emerald"
}) {
  const activeStyles = {
    blue: "bg-blue-600/10 text-white border-blue-500/10 shadow-[0_8px_30px_-12px_rgba(59,130,246,0.5)]",
    emerald: "bg-emerald-600/10 text-white border-emerald-500/10 shadow-[0_8px_30px_-12px_rgba(16,185,129,0.5)]"
  };
  
  const iconStyles = {
    blue: active ? "text-blue-400" : "group-hover:text-zinc-300",
    emerald: active ? "text-emerald-400" : "group-hover:text-zinc-300"
  };

  return (
    <Link 
      href={href} 
      className={`flex items-center gap-5 rounded-[20px] text-[15px] font-bold transition-all duration-500 group relative ${
        collapsed ? "justify-center h-16 w-16 mx-auto p-0" : "px-5 py-4 w-full"
      } ${
        active 
          ? `${activeStyles[color]} border` 
          : "text-zinc-500 hover:bg-white/[0.03] hover:text-zinc-200 border border-transparent"
      }`}
    >
      <span className={`shrink-0 transition-all duration-500 ${iconStyles[color]} group-hover:scale-110`}>
        {icon}
      </span>
      {!collapsed && (
        <span className="truncate transition-all duration-500 animate-in fade-in slide-in-from-left-4">
          {label}
        </span>
      )}
      
      {collapsed && (
        <div className="absolute left-24 px-4 py-2.5 bg-zinc-900 border border-white/10 rounded-xl text-white text-sm font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-300 translate-x-[-10px] group-hover:translate-x-0 z-50 shadow-2xl">
          {label}
          <div className="absolute top-1/2 -left-1.5 -translate-y-1/2 w-3 h-3 bg-zinc-900 border-l border-b border-white/10 rotate-45" />
        </div>
      )}
      
      {collapsed && active && (
        <div className={`absolute -left-1 top-1/2 -translate-y-1/2 w-1.5 h-8 rounded-r-full ${
          color === "blue" ? "bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.8)]" : "bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.8)]"
        }`} />
      )}
    </Link>
  );
}
