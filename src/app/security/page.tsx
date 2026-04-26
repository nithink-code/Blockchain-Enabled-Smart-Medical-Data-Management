import Link from "next/link";
import { ChevronLeft, Lock, ShieldCheck, Database, Fingerprint } from "lucide-react";

export default function SecurityPage() {
  return (
    <div className="min-h-screen bg-black text-white p-8 pt-32 md:p-20 md:pt-40">

      
      <div className="max-w-4xl space-y-12">
        <div className="space-y-4">
          <div className="inline-block rounded-lg border border-white/10 bg-white/5 px-4 py-1 text-xs font-bold uppercase tracking-widest text-zinc-400">
            SECURITY PROTOCOLS
          </div>
          <h1 className="text-5xl font-bold tracking-tight">Zero-Trust Healthcare</h1>
          <p className="text-xl text-zinc-400 leading-relaxed">
            We employ industry-leading encryption and decentralized protocols to protect your most sensitive data.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <SecurityCard 
            icon={<Lock className="text-blue-400" />} 
            title="AES-256 Encryption" 
            description="All medical records are encrypted at rest using military-grade AES-256 standards with keys held only by the patient." 
          />
          <SecurityCard 
            icon={<ShieldCheck className="text-emerald-400" />} 
            title="On-Chain Consent" 
            description="Access permissions are stored as smart contracts on the blockchain, making them tamper-proof and fully auditable." 
          />
          <SecurityCard 
            icon={<Database className="text-indigo-400" />} 
            title="Distributed Storage" 
            description="Data is stored across a decentralized network (IPFS/Filecoin) to eliminate central points of failure and prevent mass leaks." 
          />
          <SecurityCard 
            icon={<Fingerprint className="text-purple-400" />} 
            title="Biometric DID" 
            description="We use Decentralized Identifiers (DID) linked to biometric hardware keys to ensure only you can authorize data requests." 
          />
        </div>
      </div>
    </div>
  );
}

function SecurityCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="glass-card rounded-[32px] p-8 border border-white/5 bg-white/2 space-y-4">
      <div className="p-3 bg-white/5 rounded-2xl w-fit">{icon}</div>
      <h3 className="text-xl font-bold">{title}</h3>
      <p className="text-zinc-400 leading-relaxed">{description}</p>
    </div>
  );
}
