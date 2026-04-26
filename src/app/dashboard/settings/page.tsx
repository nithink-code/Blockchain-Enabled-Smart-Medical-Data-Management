import { User, Bell, Shield, Key, Fingerprint, Database, Lock } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="space-y-10 animate-fade-in pb-8 max-w-5xl">
      <div className="space-y-1.5">
        <h1 className="text-4xl font-bold tracking-tight text-white">System Settings</h1>
        <p className="text-zinc-500 text-lg font-medium">Manage your clinical identity, security parameters, and data governance.</p>
      </div>

      {/* Profile */}
      <section className="space-y-6">
        <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-600 px-1">Account & Preferences</h2>
        <div className="glass-card rounded-[32px] border border-white/5 divide-y divide-white/[0.03]">
          <SettingRow icon={<User size={20} />} label="Clinical Identity" value="Patient User" action="Modify Profile" />
          <SettingRow icon={<Bell size={20} />} label="Communication" value="Critical alerts + Transactional" action="Manage" />
          <SettingRow icon={<Key size={20} />} label="Access Credentials" value="Standard auth | Multi-factor inactive" action="Update" />
        </div>
      </section>

      {/* Patient ID */}
      <section className="space-y-6">
        <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-600 px-1">Identity Protocol</h2>
        <div className="glass-card rounded-[32px] border border-white/5 p-8 space-y-6 group">
          <div className="flex items-center gap-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/10 border border-blue-500/10 text-blue-400 group-hover:scale-110 transition-transform duration-500">
              <Fingerprint size={28} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">Global Medical Identity (HID)</p>
              <p className="font-mono text-2xl font-bold text-white tracking-tighter mt-1">MED-4F2A-9C1B-E37D</p>
              <p className="text-sm text-zinc-500 mt-1 font-medium italic">Required by institutions to initiate blockchain access requests.</p>
            </div>
          </div>
          <div className="flex items-center gap-4 pt-2">
            <button className="flex h-12 items-center gap-2.5 rounded-2xl border border-white/5 bg-white/[0.02] px-6 text-sm font-bold text-zinc-300 hover:bg-white/[0.05] hover:text-white transition-all">
              Copy Identifier
            </button>
            <button className="flex h-12 items-center gap-2.5 rounded-2xl border border-white/5 bg-white/[0.02] px-6 text-sm font-bold text-zinc-300 hover:bg-white/[0.05] hover:text-white transition-all">
              Generate QR Link
            </button>
          </div>
        </div>
      </section>

      {/* Privacy */}
      <section className="space-y-6">
        <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-600 px-1">Privacy & Security Engine</h2>
        <div className="glass-card rounded-[32px] border border-white/5 divide-y divide-white/[0.03]">
          <SettingRow icon={<Shield size={20} />} label="End-to-End Encryption" value="AES-256 GCM | Cryptographically Enforced" action={null} badge="ACTIVE" badgeColor="emerald" />
          <SettingRow icon={<Database size={20} />} label="IPFS Consensus" value="Distributed Storage | CID Pinning Active" action={null} badge="VERIFIED" badgeColor="blue" />
          <SettingRow icon={<Shield size={20} />} label="Automated Revocation" value="Permission auto-expiry protocol active" action="Policy" />
          <SettingRow icon={<Lock size={20} />} label="Institutional Shield" value="Anti-download & Watermarking enforced" action={null} badge="MANDATORY" badgeColor="orange" />
        </div>
      </section>

      {/* Danger Zone */}
      <section className="space-y-6">
        <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-rose-500/60 px-1">System Override</h2>
        <div className="glass-card rounded-[32px] border border-rose-500/10 p-8 flex flex-col md:flex-row md:items-center justify-between gap-8 group">
          <div className="space-y-1">
            <p className="text-lg font-bold text-white tracking-tight">Panic Protocol: Immediate Revocation</p>
            <p className="text-[15px] text-zinc-500 font-medium">Instantly terminate all active clinical sessions and rotate encryption keys.</p>
          </div>
          <button className="h-14 rounded-2xl border border-rose-500/20 bg-rose-500/5 px-8 text-sm font-bold text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/40 transition-all shadow-xl shadow-rose-500/5">
            Execute Global Revoke
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
    emerald: "text-emerald-400 bg-emerald-500/10 border-emerald-500/10",
    blue:    "text-blue-400    bg-blue-500/10    border-blue-500/10",
    orange:  "text-orange-400  bg-orange-500/10  border-orange-500/10",
  };

  return (
    <div className="flex items-center justify-between gap-6 p-7 hover:bg-white/[0.01] transition-colors group">
      <div className="flex items-center gap-5">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.03] border border-white/5 text-zinc-500 group-hover:text-white transition-colors">
          {icon}
        </div>
        <div>
          <p className="font-bold text-white text-[15px] tracking-tight">{label}</p>
          <p className="text-xs text-zinc-500 mt-1 font-medium tracking-tight leading-relaxed">{value}</p>
        </div>
      </div>
      <div className="flex items-center gap-4 shrink-0">
        {badge && badgeColor && (
          <span className={`text-[9px] font-bold border px-3 py-1.5 rounded-lg tracking-wider uppercase ${badgeColors[badgeColor]}`}>
            {badge}
          </span>
        )}
        {action && (
          <button className="text-[13px] font-bold text-blue-500 hover:text-blue-400 transition-colors px-2">
            {action}
          </button>
        )}
      </div>
    </div>
  );
}
