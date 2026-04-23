import Link from "next/link";
import {
  Shield,
  Brain,
  Lock,
  Activity,
  FileSearch,
  Fingerprint,
  ShieldCheck,
  Database,
  Sparkles,
  ChevronRight,
  ArrowRight,
  Clock3,
  Stethoscope
} from "lucide-react";
import { AuthNavbar } from "./auth-navbar";

export default function Home() {
  return (
    <div className="min-h-screen bg-transparent text-white selection:bg-blue-500/30">
      {/* Dynamic Background Glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/10 blur-[120px]" />
      </div>

      <header className="sticky top-0 z-50 border-b border-white/5 bg-black/60 backdrop-blur-xl">
        <div className="app-shell flex h-20 items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-600 blur-lg opacity-40 group-hover:opacity-70 transition-opacity" />
              <div className="relative rounded-xl bg-blue-600 p-2.5 shadow-xl shadow-blue-500/20">
                <Shield className="h-5 w-5 text-white" />
              </div>
            </div>
            <span className="text-xl font-bold tracking-tight text-white">
              Med<span className="text-blue-500">Chain</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-10 text-sm font-medium text-zinc-400 md:flex">
            <Link href="/features" className="transition-colors hover:text-white">Features</Link>
            <Link href="/workflow" className="transition-colors hover:text-white">Workflow</Link>
            <Link href="/security" className="transition-colors hover:text-white">Security</Link>
          </nav>

          <AuthNavbar />
        </div>
      </header>

      <main className="relative z-10">
        <section className="relative flex min-h-[85vh] items-center justify-center py-20 lg:py-32">
          <div className="app-shell flex flex-col items-center text-center">
            <div className="max-w-5xl space-y-12">
              <div className="flex flex-col items-center justify-center space-y-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                <h1 className="mx-auto overflow-visible py-4 text-center text-4xl font-bold leading-[1.3] tracking-tight text-white sm:text-6xl lg:text-[5.5rem]">
                  <span className="block overflow-visible pb-4 text-gradient">Medical Data Management.</span>
                </h1>
                <p className="mx-auto max-w-3xl text-center text-lg leading-relaxed text-zinc-400 sm:text-xl">
                  MedChain utilizes explainable AI and blockchain technology to give patients full ownership and clear understanding of their medical history.
                </p>
              </div>

              <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-center animate-fade-in" style={{ animationDelay: '0.3s' }}>
                <Link href="/sign-up" className="w-full sm:w-auto">
                  <button className="inline-flex h-14 w-full min-w-55 items-center justify-center gap-2 rounded-2xl bg-white px-12 text-sm font-semibold text-black transition-all hover:bg-zinc-200 hover:scale-[1.02] active:scale-[0.98]">
                    Get started
                    <ArrowRight className="h-5 w-5" />
                  </button>
                </Link>
                <Link href="/features" className="w-full sm:w-auto">
                  <button className="inline-flex h-14 w-full min-w-55 items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-12 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/10 hover:border-white/20 hover:scale-[1.02] active:scale-[0.98]">
                    Explore more
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="section-pad border-t border-white/5">
          <div className="app-shell">
            <div className="mx-auto flex flex-col items-center justify-center space-y-8 text-center">
              <h2 className="mx-auto max-w-4xl text-center text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
                The Infrastructure of Trust
              </h2>
              <p className="mx-auto max-w-2xl text-center text-lg leading-relaxed text-zinc-400 sm:text-xl">
                A seamless integration of advanced AI and decentralized security protocol designed for clinical precision.
              </p>
            </div>
           
            <div className="mx-auto mt-80 grid w-full max-w-7xl gap-12 md:mt-74 md:grid-cols-3 lg:mt-82 info-cards">
              <FeatureCard
                icon={<FileSearch className="h-10 w-10" />}
                title="Intelligent OCR"
                description="Our proprietary AI parses complex medical reports and scans into structured, searchable data instantly."
                color="blue"
              />
              <FeatureCard
                icon={<Brain className="h-10 w-10" />}
                title="Explainable Insights"
                description="Receive clear, human-readable explanations of your clinical data, powered by state-of-the-art XAI."
                color="indigo"
              />
              <FeatureCard
                icon={<Lock className="h-10 w-10" />}
                title="On-Chain Consent"
                description="Full control over who sees your data. Grant and revoke access with an immutable audit trail."
                color="emerald"
              />
            </div>
          </div>
        </section>


        <section id="workflow" className="section-pad relative overflow-hidden bg-zinc-950 py-32 lg:py-48">
          <div className="absolute inset-0 bg-blue-600/5 blur-[120px] translate-y-1/2" />
          <div className="app-shell relative z-10 flex flex-col items-center text-center">
            <div className="mx-auto flex w-full max-w-6xl flex-col items-center">
              <div className="flex w-full flex-col items-center pt-32 detail-cards">
                <h2 className="w-full text-center text-4xl font-bold leading-[1.1] tracking-tight md:text-5xl lg:text-7xl mb-14">
                  Decentralized Health <br />
                  <span className="text-blue-500">Intelligence System</span>
                </h2>
                <p className="max-w-3xl text-center text-lg leading-relaxed text-zinc-400 md:text-xl mb-40">
                  A unified platform that bridges the gap between fragmented medical records and actionable insights through a zero-knowledge framework.
                </p>
              </div>

              <div className="mx-auto grid w-full max-w-6xl gap-12 sm:grid-cols-2 lg:grid-cols-4">
                <WorkflowPill icon={<Activity className="h-8 w-8" />} title="XAI Reasoning" />
                <WorkflowPill icon={<Clock3 className="h-8 w-8" />} title="Real-time Audit" />
                <WorkflowPill icon={<Stethoscope className="h-8 w-8" />} title="Clinician Portal" />
                <WorkflowPill icon={<Shield className="h-8 w-8" />} title="Encryption Mesh" />
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="relative border-t border-white/5 bg-black/40 py-20 lg:py-24">
        <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-blue-500/10 to-transparent" />
        
        <div className="app-shell flex flex-col items-center text-center">
          <Link href="/" className="flex items-center gap-3 group mb-6">
            <div className="rounded-xl bg-blue-600/10 p-2 text-blue-500 border border-blue-500/20 group-hover:bg-blue-500/20 transition-colors">
              <Shield className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">MedChain</span>
          </Link>
          
          <p className="max-w-md text-sm leading-relaxed text-zinc-400 mb-10">
            The world's first decentralized medical intelligence platform. Empowering patients with sovereign ownership.
          </p>

          <ul className="flex flex-wrap justify-center gap-8 text-sm text-zinc-400 mb-12">
            <li><Link href="#" className="hover:text-white transition-colors">About Us</Link></li>
            <li><Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link></li>
            <li><Link href="#" className="hover:text-white transition-colors">Terms of Service</Link></li>
            <li><Link href="#" className="hover:text-white transition-colors">Contact</Link></li>
          </ul>

          <div className="w-full max-w-2xl border-t border-white/5 pt-10 flex flex-col items-center gap-6 md:flex-row md:justify-between">
            <p className="text-xs text-zinc-500 order-2 md:order-1">
              © 2026 MedChain Labs. Sovereign Intelligence for Healthcare.
            </p>
            <div className="flex gap-6 order-1 md:order-2">
              <Link href="#" className="text-zinc-500 hover:text-white transition-colors">
                <Activity className="h-4 w-4" />
              </Link>
              <Link href="#" className="text-zinc-500 hover:text-white transition-colors">
                <ShieldCheck className="h-4 w-4" />
              </Link>
              <Link href="#" className="text-zinc-500 hover:text-white transition-colors">
                <Lock className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}



function FeatureCard({ icon, title, description, color }: { icon: React.ReactNode; title: string; description: string; color: string }) {
  const colorMap: Record<string, string> = {
    blue: "text-blue-500 bg-blue-500/10 border-blue-500/20",
    indigo: "text-indigo-500 bg-indigo-500/10 border-indigo-500/20",
    emerald: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
  };

  return (
    <div className="relative flex h-full flex-col items-center justify-center text-center rounded-4xl border border-white/5 bg-white/5 backdrop-blur-md px-14 py-20">
      <div className={`mb-10 inline-flex h-24 w-24 items-center justify-center rounded-4xl border-2 ${colorMap[color] || colorMap.blue} shadow-lg shadow-blue-500/5`}>
        {icon}
      </div>
      <div className="mt-4 space-y-4">
        <h3 className="text-2xl font-bold tracking-tight text-white md:text-[1.85rem]">
          {title}
        </h3>
        <p className="text-base leading-relaxed text-zinc-400 md:text-[1.05rem]">
          {description}
        </p>
      </div>
    </div>
  );
}

function WorkflowPill({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="group relative flex aspect-square flex-col items-center justify-center gap-5 rounded-[3rem] border border-white/5 bg-white/2 p-10 transition-all duration-500 hover:bg-white/5 hover:border-white/20 hover:shadow-[0_0_50px_-12px_rgba(59,130,246,0.3)] hover:-translate-y-3">
      <div className="absolute inset-0 rounded-[3rem] bg-linear-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="relative rounded-2xl bg-blue-500/10 p-5 text-blue-500 group-hover:scale-110 group-hover:bg-blue-500/20 transition-all duration-500">
        {icon}
      </div>
      <span className="relative text-center text-xs font-bold tracking-[0.2em] uppercase text-zinc-500 group-hover:text-white transition-colors">
        {title}
      </span>
    </div>
  );
}


