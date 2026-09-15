"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { 
  LogOut, 
  Settings, 
  LayoutDashboard, 
  Stethoscope, 
  User as UserIcon,
  ChevronDown,
  Building2,
  Menu
} from "lucide-react";
import { useUserRole } from "@/lib/use-user-role";

export function AuthNavbar() {
  const { data: session, status } = useSession();
  const { role, isHospital } = useUserRole();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isLoaded = status !== "loading";
  const isSignedIn = status === "authenticated";

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const displayName = session?.user?.name || session?.user?.email?.split("@")[0] || "User";
  const userImage = session?.user?.image;
  const initial = displayName.charAt(0).toUpperCase();

  const portalHref = isHospital ? "/hospital" : "/dashboard";
  const portalLabel = isHospital ? "Hospital Portal" : "Patient Dashboard";
  const settingsHref = isHospital ? "/hospital/settings" : "/dashboard/settings";

  return (
    <div className="-translate-x-4 flex items-center gap-4">
      {isLoaded && isSignedIn ? (
        <div className="relative" ref={dropdownRef}>
          {/* User Avatar Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2.5 p-1 pr-3 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 transition-all cursor-pointer shadow-lg shadow-black/30"
          >
            <div className="h-9 w-9 rounded-full overflow-hidden flex items-center justify-center bg-gradient-to-tr from-blue-600 to-indigo-500 text-white font-bold text-sm shadow-inner">
              {userImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={userImage} alt={displayName} className="h-full w-full object-cover" />
              ) : (
                <span>{initial}</span>
              )}
            </div>
            <div className="hidden sm:flex flex-col items-start text-left text-xs">
              <span className="font-semibold text-white max-w-28 truncate leading-tight">
                {displayName}
              </span>
              <span className={`text-[10px] font-bold uppercase tracking-wider ${
                isHospital ? "text-emerald-400" : "text-blue-400"
              }`}>
                {isHospital ? "Hospital" : "Patient"}
              </span>
            </div>
            <ChevronDown size={14} className={`text-zinc-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
          </button>

          {/* Dropdown Menu */}
          {isOpen && (
            <div className="absolute right-0 mt-3 w-64 rounded-2xl border border-white/10 bg-zinc-950/95 backdrop-blur-2xl p-2 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-3 border-b border-white/5 space-y-1">
                <p className="text-xs text-zinc-400 font-medium">Signed in as</p>
                <p className="text-sm font-bold text-white truncate">{session?.user?.email}</p>
                <div className="pt-1">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${
                    isHospital 
                      ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                      : "bg-blue-500/10 border-blue-500/20 text-blue-400"
                  }`}>
                    {isHospital ? <Building2 size={10} /> : <UserIcon size={10} />}
                    {isHospital ? "Hospital Institution" : "Patient User"}
                  </span>
                </div>
              </div>

              <div className="py-2 space-y-1">
                <Link
                  href={portalHref}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 text-xs font-semibold text-zinc-300 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                >
                  {isHospital ? <Stethoscope size={16} className="text-emerald-400" /> : <LayoutDashboard size={16} className="text-blue-400" />}
                  {portalLabel}
                </Link>

                <Link
                  href={settingsHref}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 text-xs font-semibold text-zinc-300 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                >
                  <Settings size={16} className="text-zinc-400" />
                  Settings
                </Link>
              </div>

              <div className="pt-1 border-t border-white/5">
                <button
                  onClick={() => {
                    setIsOpen(false);
                    signOut({ callbackUrl: "/sign-in" });
                  }}
                  className="flex w-full items-center gap-3 px-3 py-2.5 text-xs font-semibold text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all cursor-pointer"
                >
                  <LogOut size={16} />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <>
          <Link href="/sign-in">
            <button className="mr-2 inline-flex h-10 min-w-28 cursor-pointer items-center justify-center rounded-full bg-[#6674CC] py-6 text-sm font-bold text-white shadow-xl transition-all hover:scale-[1.02] hover:bg-[#5563bb] active:scale-[0.98]">
              Login
            </button>
          </Link>
          <button className="inline-flex rounded-lg border border-white/10 p-2 text-zinc-400 md:hidden">
            <Menu className="h-5 w-5" />
          </button>
        </>
      )}
    </div>
  );
}