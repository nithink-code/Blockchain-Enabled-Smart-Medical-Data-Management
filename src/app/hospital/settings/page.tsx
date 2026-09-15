"use client";

import { useState } from "react";
import { 
  Building2, 
  Bell, 
  Shield, 
  Key, 
  FileLock, 
  Users, 
  Copy, 
  Check, 
  AlertTriangle 
} from "lucide-react";

export default function HospitalSettingsPage() {
  const [copied, setCopied] = useState(false);
  const institutionalId = "HOSP-APL-7B3C-2F9A";

  const handleCopy = () => {
    navigator.clipboard.writeText(institutionalId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-3xl space-y-8 pb-12 animate-fade-in">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight text-white">Hospital Settings</h1>
        <p className="text-sm text-zinc-400">
          Manage institutional profile, staff access, and security protocols.
        </p>
      </div>

      {/* Institutional Profile */}
      <section className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
          Institutional Profile
        </h2>
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/40 backdrop-blur-xl divide-y divide-white/5 shadow-xl shadow-black/20">
          <SettingRow 
            icon={<Building2 size={18} />} 
            label="Hospital Name" 
            value="Apollo Hospitals" 
            action="Edit" 
          />
          <SettingRow 
            icon={<Shield size={18} />} 
            label="License Number" 
            value="MED-LIC-2026-X88" 
            badge="VERIFIED" 
            badgeColor="emerald" 
          />
          <SettingRow 
            icon={<Bell size={18} />} 
            label="Alert Preferences" 
            value="Urgent requests only" 
            action="Configure" 
          />
        </div>
      </section>

      {/* Staff & Security */}
      <section className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
          Staff & Security
        </h2>
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/40 backdrop-blur-xl divide-y divide-white/5 shadow-xl shadow-black/20">
          <SettingRow 
            icon={<Users size={18} />} 
            label="Manage Staff" 
            value="12 active practitioners" 
            action="Manage" 
          />
          <SettingRow 
            icon={<Key size={18} />} 
            label="Auth Protocols" 
            value="2FA Enforced" 
            badge="SECURE" 
            badgeColor="blue" 
          />
          <SettingRow 
            icon={<FileLock size={18} />} 
            label="Data Usage Policy" 
            value="View-only enforced" 
            badge="LOCKED" 
            badgeColor="orange" 
          />
        </div>
      </section>

      {/* Identity Card */}
      <section className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
          Identity
        </h2>
        <div className="rounded-2xl border border-white/10 bg-zinc-900/40 backdrop-blur-xl p-5 shadow-xl shadow-black/20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Building2 size={22} />
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                  Institutional ID
                </p>
                <p className="font-mono text-base font-bold text-white tracking-wide mt-0.5">
                  {institutionalId}
                </p>
                <p className="text-xs text-zinc-500 mt-0.5">
                  This ID is visible to patients during access requests
                </p>
              </div>
            </div>

            <button
              onClick={handleCopy}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-zinc-300 hover:bg-white/10 hover:text-white transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/50 shrink-0"
            >
              {copied ? (
                <>
                  <Check size={14} className="text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy size={14} />
                  <span>Copy ID</span>
                </>
              )}
            </button>
          </div>
        </div>
      </section>

      {/* Danger Zone */}
      <section className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-red-400/80">
          Danger Zone
        </h2>
        <div className="rounded-2xl border border-red-500/20 bg-red-950/10 backdrop-blur-xl p-5 shadow-xl shadow-black/20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-500/10 text-red-400">
                <AlertTriangle size={18} />
              </div>
              <div>
                <p className="font-semibold text-white text-sm">Deactivate Portal Access</p>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Temporarily disable your hospital's portal access and revoke active sessions.
                </p>
              </div>
            </div>
            <button className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-xs font-bold text-red-400 hover:bg-red-500/20 hover:border-red-500/50 transition-all focus:outline-none focus:ring-2 focus:ring-red-500/50 shrink-0">
              Deactivate Portal
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

interface SettingRowProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  action?: string | null;
  badge?: string;
  badgeColor?: "emerald" | "blue" | "orange";
}

function SettingRow({ icon, label, value, action, badge, badgeColor }: SettingRowProps) {
  const badgeColors = {
    emerald: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
    blue: "text-blue-400 bg-blue-500/10 border-blue-500/30",
    orange: "text-orange-400 bg-orange-500/10 border-orange-500/30",
  };

  return (
    <div className="flex items-center justify-between gap-4 p-4 hover:bg-white/[0.02] transition-colors">
      <div className="flex items-center gap-3.5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/5 text-zinc-400 border border-white/5">
          {icon}
        </div>
        <div>
          <p className="font-semibold text-white text-sm">{label}</p>
          <p className="text-xs text-zinc-400 mt-0.5">{value}</p>
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        {badge && badgeColor && (
          <span className={`text-[10px] font-bold tracking-wider border px-2.5 py-0.5 rounded-full ${badgeColors[badgeColor]}`}>
            {badge}
          </span>
        )}
        {action && (
          <button className="text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors focus:outline-none focus:underline">
            {action}
          </button>
        )}
      </div>
    </div>
  );
}