import { Settings, Building2, Bell, Shield, Key, FileLock, Users, LogOut } from "lucide-react";

export default function HospitalSettingsPage() {
  return (
    <div className="space-y-10 animate-fade-in pb-10 max-w-3xl">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight text-white">Hospital Settings</h1>
        <p className="text-zinc-400">Manage institutional profile, staff access, and security protocols.</p>
      </div>

      {/* Institutional Profile */}
      <section className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-500">Institutional Profile</h2>
        <div className="glass-card rounded-[24px] border border-white/5 divide-y divide-white/5">
          <SettingRow icon={<Building2 size={18} />} label="Hospital Name" value="Apollo Hospitals" action="Edit" />
          <SettingRow icon={<Shield size={18} />} label="License Number" value="MED-LIC-2026-X88" action={null} badge="VERIFIED" badgeColor="emerald" />
          <SettingRow icon={<Bell size={18} />} label="Alert Preferences" value="Urgent requests only" action="Configure" />
        </div>
      </section>

      {/* Staff & Security */}
      <section className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-500">Staff & Security</h2>
        <div className="glass-card rounded-[24px] border border-white/5 divide-y divide-white/5">
          <SettingRow icon={<Users size={18} />} label="Manage Staff" value="12 active practitioners" action="Manage" />
          <SettingRow icon={<Key size={18} />} label="Auth Protocols" value="2FA Enforced" action={null} badge="SECURE" badgeColor="blue" />
          <SettingRow icon={<FileLock size={18} />} label="Data Usage Policy" value="View-only enforced" action={null} badge="LOCKED" badgeColor="orange" />
        </div>
      </section>

      {/* Account Identity */}
      <section className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-500">Identity</h2>
        <div className="glass-card rounded-[24px] border border-white/5 p-6 space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400">
              <Building2 size={22} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Institutional ID</p>
              <p className="font-mono text-lg font-bold text-white mt-0.5">HOSP-APL-7B3C-2F9A</p>
              <p className="text-xs text-zinc-500 mt-1">This ID is visible to patients during access requests</p>
            </div>
          </div>
        </div>
      </section>

      {/* Danger Zone */}
      <section className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-widest text-red-500/60">Danger Zone</h2>
        <div className="glass-card rounded-[24px] border border-red-500/10 p-6 flex items-center justify-between gap-6">
          <div>
            <p className="font-bold text-white">Deactivate Portal Access</p>
            <p className="text-sm text-zinc-500 mt-1">Temporarily disable your hospital's portal access</p>
          </div>
          <button className="rounded-2xl border border-red-500/30 bg-red-500/5 px-5 py-2.5 text-sm font-bold text-red-400 hover:bg-red-500/10 transition-all shrink-0">
            Deactivate
          </button>
        </div>
      </section>
    </div>
  );
}

function SettingRow({
  icon, label, value, action, badge, badgeColor
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  action?: string | null;
  badge?: string;
  badgeColor?: string;
}) {
  const badgeColors: Record<string, string> = {
    emerald: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    blue:    "text-blue-400    bg-blue-500/10    border-blue-500/20",
    orange:  "text-orange-400  bg-orange-500/10  border-orange-500/20",
  };

  return (
    <div className="flex items-center justify-between gap-4 p-5">
      <div className="flex items-center gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-zinc-400">
          {icon}
        </div>
        <div>
          <p className="font-semibold text-white text-sm">{label}</p>
          <p className="text-xs text-zinc-500 mt-0.5">{value}</p>
        </div>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        {badge && badgeColor && (
          <span className={`text-[10px] font-bold border px-2.5 py-1 rounded-lg ${badgeColors[badgeColor]}`}>
            {badge}
          </span>
        )}
        {action && (
          <button className="text-sm font-bold text-emerald-500 hover:text-emerald-400 transition-colors">
            {action}
          </button>
        )}
      </div>
    </div>
  );
}
