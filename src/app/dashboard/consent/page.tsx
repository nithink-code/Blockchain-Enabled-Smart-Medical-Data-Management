"use client";

import { useState } from "react";
import { 
  ShieldCheck, 
  ShieldAlert, 
  Clock, 
  User, 
  Plus, 
  Trash2, 
  History,
  CheckCircle2,
  Lock,
  ArrowRight,
  Database
} from "lucide-react";
import { format } from "date-fns";

// Sample active consents
const INITIAL_CONSENTS = [
  { id: 1, doctor: "Dr. Sarah Johnson", hospital: "General Cardiology", access: "Full Records", expires: "Oct 22, 2024", status: "Active" },
  { id: 2, doctor: "Dr. Mike Ross", hospital: "City Labs", access: "Blood Reports", expires: "Oct 20, 2024", status: "Active" },
];

export default function ConsentPage() {
  const [consents, setConsents] = useState(INITIAL_CONSENTS);
  const [showHistory, setShowHistory] = useState(false);

  return (
    <div className="space-y-10 pb-20 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-white">Access Orchestration</h1>
          <p className="text-zinc-400">Control your digital perimeter. All permissions are cryptographically enforced.</p>
        </div>
        <button className="flex h-12 items-center gap-2 px-6 bg-blue-600 text-white text-sm font-bold rounded-2xl hover:bg-blue-500 shadow-xl shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]">
          <Plus size={18} />
          Grant Permission
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Active Consents */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Active Clearances</h2>
            <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-500 bg-emerald-500/5 border border-emerald-500/10 px-3 py-1.5 rounded-xl uppercase tracking-widest">
              <ShieldCheck size={14} />
              Verified
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {consents.map((consent) => (
              <div key={consent.id} className="glass-card rounded-[32px] p-8 border border-white/5 hover:border-white/10 transition-all group">
                <div className="flex justify-between items-start mb-6">
                  <div className="p-3 bg-white/5 text-blue-500 rounded-2xl group-hover:bg-blue-600/10 transition-colors">
                    <User size={22} />
                  </div>
                  <button className="p-2 text-zinc-600 hover:text-red-500 transition-colors">
                    <Trash2 size={20} />
                  </button>
                </div>
                <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">{consent.doctor}</h3>
                <p className="text-sm text-zinc-500 font-medium mb-6">{consent.hospital}</p>
                
                <div className="space-y-4 pt-6 border-t border-white/5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-500 font-medium">Scope</span>
                    <span className="px-3 py-1 bg-white/5 text-zinc-300 rounded-lg font-bold uppercase tracking-tight text-[10px] border border-white/5">{consent.access}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-500 flex items-center gap-2 font-medium">
                      <Clock size={14} className="text-zinc-600" /> Expiry
                    </span>
                    <span className="text-white font-bold">{consent.expires}</span>
                  </div>
                </div>
                
                <button className="w-full mt-8 py-3 bg-white/5 hover:bg-white/10 rounded-2xl text-xs font-bold text-zinc-300 hover:text-white border border-white/5 transition-all">
                  Modify Clearances
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Blockchain Audit Log */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Audit Trail</h2>
            <button className="text-xs font-bold text-blue-500 hover:text-blue-400 transition-colors">Integrity Check</button>
          </div>
          
          <div className="glass-card rounded-[32px] overflow-hidden border border-white/5 bg-zinc-950/40">
            <div className="p-5 bg-white/[0.02] flex items-center justify-between border-b border-white/5">
              <div className="flex items-center gap-3">
                <Database size={16} className="text-blue-500" />
                <span className="text-[10px] font-bold font-mono tracking-widest text-zinc-400 uppercase">Secure Ledger</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-emerald-500">SYNCED</span>
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              </div>
            </div>
            
            <div className="p-6 space-y-8 max-h-[600px] overflow-y-auto custom-scrollbar">
              <BlockchainLogItem 
                action="REVOKE_SUCCESS"
                details="Access terminated for Dr. Aris"
                hash="0x4d5a...f3a2"
                time="10:45 AM"
              />
              <BlockchainLogItem 
                action="GRANT_SUCCESS"
                details="Clearance issued to Dr. Johnson"
                hash="0xa19b...b2c1"
                time="09:12 AM"
                isGrant
              />
              <BlockchainLogItem 
                action="READ_ACCESS"
                details="Imaging module accessed by Dr. Ross"
                hash="0x3e8c...c81d"
                time="Yesterday"
              />
              <BlockchainLogItem 
                action="BLOCK_COMMITTED"
                details="Protocol update: Medical Data Synced"
                hash="0x72a1...1e4b"
                time="Yesterday"
              />
            </div>
            
            <div className="p-6 bg-white/[0.02] border-t border-white/5">
              <button className="w-full py-4 bg-zinc-900 hover:bg-zinc-800 text-white rounded-2xl text-xs font-bold transition-all border border-white/5 flex items-center justify-center gap-3">
                <History size={16} className="text-blue-500" />
                Export Cryptographic Proof
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function BlockchainLogItem({ action, details, hash, time, isGrant = false }: { action: string, details: string, hash: string, time: string, isGrant?: boolean }) {
  return (
    <div className="relative pl-6 border-l border-white/5 pb-1 last:pb-0">
      <div className={`absolute -left-1 top-0 w-2 h-2 rounded-full ring-4 ring-zinc-950 ${
        isGrant ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]'
      }`}></div>
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className={`text-[9px] font-black tracking-[0.2em] uppercase ${
            isGrant ? 'text-emerald-500' : 'text-blue-500'
          }`}>{action}</span>
          <span className="text-[9px] text-zinc-600 font-mono">{time}</span>
        </div>
        <p className="text-xs text-zinc-300 font-medium leading-relaxed">{details}</p>
        <div className="text-[9px] text-zinc-600 font-mono truncate max-w-full block hover:text-zinc-500 cursor-help transition-colors">
          TXID: {hash}
        </div>
      </div>
    </div>
  );
}
