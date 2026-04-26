import Link from "next/link";
import { ChevronLeft, Sparkles, Shield, Brain, Lock } from "lucide-react";

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-black text-white p-8 pt-32 md:p-20 md:pt-40">

      
      <div className="max-w-4xl space-y-12">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/5 px-4 py-2 text-xs font-semibold tracking-wide text-blue-400">
            <Sparkles className="h-3.5 w-3.5" />
            PLATFORM CAPABILITIES
          </div>
          <h1 className="text-5xl font-bold tracking-tight">Core Features</h1>
          <p className="text-xl text-zinc-400 leading-relaxed">
            MedChain provides a comprehensive suite of tools designed for the modern patient-provider relationship.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          <FeatureItem 
            icon={<Brain className="text-blue-500" />} 
            title="Explainable AI Analysis" 
            description="Our XAI models don't just categorize data; they provide clinical reasoning so patients can understand the 'why' behind medical insights." 
          />
          <FeatureItem 
            icon={<Shield className="text-indigo-500" />} 
            title="Blockchain Sovereignty" 
            description="Your medical data belongs to you. We use decentralized identity and smart contracts to ensure you hold the keys to your history." 
          />
          <FeatureItem 
            icon={<Lock className="text-emerald-500" />} 
            title="Zero-Knowledge Consensus" 
            description="Share specific data points with clinicians without exposing your entire profile, using state-of-the-art ZK proofs." 
          />
          <FeatureItem 
            icon={<Sparkles className="text-purple-500" />} 
            title="Automated Record Sync" 
            description="Seamlessly pull records from multiple hospital portals and normalize them into a single, unified longitudinal health record." 
          />
        </div>
      </div>
    </div>
  );
}

function FeatureItem({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="glass-card rounded-[32px] p-8 border border-white/5 bg-white/2 space-y-4">
      <div className="p-3 bg-white/5 rounded-2xl w-fit">{icon}</div>
      <h3 className="text-xl font-bold">{title}</h3>
      <p className="text-zinc-400 leading-relaxed">{description}</p>
    </div>
  );
}
