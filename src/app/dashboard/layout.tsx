"use client";

import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  FileText, 
  ShieldCheck, 
  Clock, 
  Settings, 
  Bell,
  Search,
  Menu,
  Shield
} from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-black text-white selection:bg-blue-500/30">
      {/* Background Glows */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-600/5 blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-indigo-600/5 blur-[120px]" />
      </div>

      {/* Sidebar */}
      <aside className="hidden w-72 flex-col border-r border-white/5 bg-zinc-950/50 backdrop-blur-xl md:flex">
        <div className="p-8 pb-10 flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 bg-blue-600 blur-md opacity-40" />
            <div className="relative bg-blue-600 p-2 rounded-xl">
              <Shield className="h-5 w-5 text-white" />
            </div>
          </div>
          <span className="text-xl font-bold tracking-tight text-white">MedChain</span>
        </div>
        
        <nav className="flex-1 px-4 space-y-2">
          <div className="px-4 mb-4 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Main Menu</div>
          <SidebarLink href="/dashboard" icon={<LayoutDashboard size={20} />} label="Overview" active={pathname === "/dashboard"} />
          <SidebarLink href="/dashboard/reports" icon={<FileText size={20} />} label="Medical Reports" active={pathname.startsWith("/dashboard/reports")} />
          <SidebarLink href="/dashboard/consent" icon={<ShieldCheck size={20} />} label="Consent Manager" active={pathname.startsWith("/dashboard/consent")} />
          <SidebarLink href="/dashboard/audit" icon={<Clock size={20} />} label="Audit Logs" active={pathname.startsWith("/dashboard/audit")} />
        </nav>

        <div className="p-6 mt-auto border-t border-white/5">
          <SidebarLink href="/dashboard/settings" icon={<Settings size={20} />} label="Settings" active={pathname.startsWith("/dashboard/settings")} />
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex min-w-0 flex-1 flex-col relative z-10">
        {/* Top Header */}
        <header className="flex h-20 items-center justify-between gap-4 border-b border-white/5 bg-black/40 backdrop-blur-md px-8">
          <button className="inline-flex rounded-xl border border-white/10 bg-white/5 p-2.5 text-zinc-400 md:hidden hover:bg-white/10 transition-colors">
            <Menu size={20} />
          </button>

          <div className="relative hidden w-full max-w-md md:block">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <input 
              type="text" 
              placeholder="Search reports or logs..." 
              className="w-full pl-12 pr-4 py-2.5 bg-white/5 border border-white/5 rounded-2xl text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:bg-white/10 transition-all"
            />
          </div>
          
          <div className="flex items-center gap-6">
            <button className="p-2.5 text-zinc-400 hover:text-white hover:bg-white/5 rounded-xl transition-all relative">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full ring-4 ring-black"></span>
            </button>
            <div className="h-8 w-px bg-white/5"></div>
            <UserButton 
              appearance={{
                elements: {
                  userButtonAvatarBox: "w-9 h-9 border border-white/10 shadow-lg"
                }
              }}
              afterSignOutUrl="/" 
            />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {children}
        </main>
      </div>
    </div>
  );
}

function SidebarLink({ href, icon, label, active = false }: { href: string, icon: React.ReactNode, label: string, active?: boolean }) {
  return (
    <Link 
      href={href} 
      className={`flex items-center gap-4 px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-200 ${
        active 
          ? "bg-white/10 text-white shadow-[0_0_20px_rgba(255,255,255,0.05)] border border-white/10" 
          : "text-zinc-400 hover:bg-white/5 hover:text-white"
      }`}
    >
      <span className={active ? "text-blue-500" : "text-zinc-500 group-hover:text-zinc-300"}>{icon}</span>
      {label}
    </Link>
  );
}
