import Link from "next/link";
import { ChevronLeft, Activity, Clock3, Stethoscope, Shield } from "lucide-react";

export default function WorkflowPage() {
  return (
    <div className="min-h-screen bg-black text-white p-8 md:p-20">
      <Link href="/" className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-12">
        <ChevronLeft size={20} />
        Back to Home
      </Link>
      
      <div className="max-w-4xl space-y-12">
        <div className="space-y-4">
          <div className="inline-block rounded-lg border border-white/10 bg-white/5 px-4 py-1 text-xs font-bold uppercase tracking-widest text-zinc-400">
            HOW IT WORKS
          </div>
          <h1 className="text-5xl font-bold tracking-tight text-blue-500">The MedChain Pipeline</h1>
          <p className="text-xl text-zinc-400 leading-relaxed">
            From raw paper reports to actionable, secure on-chain intelligence.
          </p>
        </div>

        <div className="space-y-8">
          <Step num="01" title="Data Ingestion" description="Upload your medical scans or PDFs. Our high-precision OCR pipeline digitizes the content while preserving metadata." />
          <Step num="02" title="Neural Processing" description="State-of-the-art XAI models analyze the structured data to identify clinical flags, trends, and risk factors." />
          <Step num="03" title="Blockchain Commit" description="Anonymized hashes of the processing event are written to the ledger, creating an immutable audit trail of your health state." />
          <Step num="04" title="Dynamic Consent" description="Decide who can view the resulting insights. Grant time-bound access to specialists with a single click." />
        </div>
      </div>
    </div>
  );
}

function Step({ num, title, description }: { num: string, title: string, description: string }) {
  return (
    <div className="glass-card rounded-[32px] p-8 border border-white/5 bg-white/2 flex gap-8 items-start">
      <div className="text-4xl font-black text-blue-600/20">{num}</div>
      <div className="space-y-2">
        <h3 className="text-xl font-bold">{title}</h3>
        <p className="text-zinc-400 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}
