import Link from "next/link";
import {
  Shield,
  Brain,
  Lock,
  Activity,
  FileSearch,
  ShieldCheck,
  ArrowRight,
  Clock3,
  Stethoscope
} from "lucide-react";
import { AuthNavbar } from "./auth-navbar";
import { FloatingNav } from "./floating-nav";

export default function Home() {
  const currentYear = new Date().getFullYear();

  return (
    <div className="relative min-h-screen bg-transparent text-white selection:bg-blue-500/30">
      {/* Fixed video background */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <video
          className="h-full w-full object-cover opacity-60"
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
        >
          <source src="/Cinematic_Dark_Themed_Web_App_Background.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-linear-to-b from-black/35 via-black/55 to-black/75" />
        <div className="absolute top-[-10%] left-[-10%] h-[40%] w-[40%] rounded-full bg-blue-500/20 blur-[130px]" />
        <div className="absolute bottom-[-10%] right-[-10%] h-[40%] w-[40%] rounded-full bg-pink-500/18 blur-[130px]" />
      </div>

      <div className="fixed left-4 top-4 z-50 sm:left-6 sm:top-5">
        <Link href="/" className="group flex items-center gap-3.5">
          <div className="relative rounded-xl border border-white/20 bg-black/25 p-2.5 backdrop-blur-md transition-all group-hover:border-blue-300/50">
            <Shield className="h-5 w-5 text-sky-300" />
          </div>
          <span className="text-lg font-bold tracking-tight text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.55)] sm:text-xl">
            Med<span className="text-blue-300">Chain</span>
          </span>
        </Link>
      </div>

      <div className="fixed right-4 top-4 z-50 sm:right-6 sm:top-5">
        <AuthNavbar />
      </div>

      <FloatingNav />

      <main className="relative z-10">
        <section className="relative flex min-h-[85vh] items-center justify-center py-20 lg:py-32">
          <div className="app-shell relative z-10 flex flex-col items-center text-center">
            <div className="max-w-5xl space-y-12">
              <div className="flex flex-col items-center justify-center space-y-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                <h1 className="mx-auto overflow-visible py-4 text-center text-4xl font-bold leading-[1.3] tracking-tight sm:text-6xl lg:text-[5.5rem]">
                  <span className="text-gradient-vivid block overflow-visible pb-4 drop-shadow-[0_4px_24px_rgba(0,0,0,0.6)]">Medical Data Management.</span>
                </h1>
                <p className="text-gradient-soft mx-auto max-w-3xl text-center text-lg leading-relaxed sm:text-xl">
                  MedChain utilizes explainable AI and blockchain technology to give patients full ownership and clear understanding of their medical history.
                </p>
              </div>

              <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-center animate-fade-in" style={{ animationDelay: '0.3s' }}>
                <Link href="/sign-up" className="w-full sm:w-auto">
                  <button className="inline-flex h-14 w-full min-w-55 items-center justify-center gap-2 rounded-2xl bg-linear-to-r from-sky-500 via-blue-500 to-pink-500 px-12 text-sm font-semibold text-white shadow-lg shadow-blue-500/35 transition-all hover:scale-[1.02] hover:shadow-pink-500/25 active:scale-[0.98]">
                    Get started
                    <ArrowRight className="h-5 w-5" />
                  </button>
                </Link>
                <Link href="/features" className="w-full sm:w-auto">
                  <button className="inline-flex h-14 w-full min-w-55 items-center justify-center rounded-2xl border border-pink-300/45 bg-linear-to-r from-blue-500/25 to-pink-500/25 px-12 text-sm font-semibold text-blue-100 backdrop-blur-sm transition-all hover:scale-[1.02] hover:border-pink-200/70 active:scale-[0.98]">
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


        <section id="workflow" className="section-pad relative overflow-hidden py-32 lg:py-48">
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

      <footer className="relative border-t border-white/5 bg-black/50 py-24 lg:py-28">
        <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-blue-500/10 to-transparent" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.08),transparent_60%)]" />

        <div className="app-shell relative z-10">
          <div className="grid items-start gap-14 border-b border-white/10 pb-12 text-left md:grid-cols-12 md:gap-x-10 md:gap-y-12 md:pb-14 lg:gap-x-16 lg:pb-16">
            <div className="flex flex-col gap-6 md:col-span-5 lg:pr-10">
              <Link href="/" className="group inline-flex items-center gap-3 self-start">
                <div className="rounded-xl border border-blue-500/20 bg-blue-600/10 p-2 text-blue-500 transition-colors group-hover:bg-blue-500/20">
                  <Shield className="h-5 w-5" />
                </div>
                <span className="text-xl font-bold tracking-tight text-white">
                  Med<span className="text-blue-500">Chain</span>
                </span>
              </Link>

              <p className="max-w-xl text-lg leading-relaxed text-zinc-300/90">
                Decentralized medical intelligence for secure patient data ownership, transparent sharing, and explainable AI-powered clinical insights.
              </p>
            </div>

            <div className="md:col-span-3">
              <h3 className="text-sm font-semibold uppercase tracking-[0.22em] text-zinc-500">Platform</h3>
              <ul className="mt-6 flex flex-col gap-4 text-lg text-zinc-200">
                <li>
                  <Link href="/features" className="transition-colors hover:text-white">Features</Link>
                </li>
                <li>
                  <Link href="/workflow" className="transition-colors hover:text-white">Workflow</Link>
                </li>
                <li>
                  <Link href="/security" className="transition-colors hover:text-white">Security</Link>
                </li>
                <li>
                  <Link href="/dashboard" className="transition-colors hover:text-white">Dashboard</Link>
                </li>
              </ul>
            </div>

            <div className="md:col-span-4">
              <h3 className="text-sm font-semibold uppercase tracking-[0.22em] text-zinc-500">Account</h3>
              <ul className="mt-6 flex flex-col gap-4 text-lg text-zinc-200">
                <li>
                  <Link href="/sign-in" className="transition-colors hover:text-white">Sign In</Link>
                </li>
                <li>
                  <Link href="/sign-up" className="transition-colors hover:text-white">Create Account</Link>
                </li>
                <li>
                  <Link href="/dashboard/consent" className="transition-colors hover:text-white">Consent Management</Link>
                </li>
                <li>
                  <Link href="/dashboard/reports" className="transition-colors hover:text-white">Medical Reports</Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col gap-6 pt-8 text-left md:flex-row md:items-center md:justify-between md:pt-9">
            <p className="text-sm text-zinc-400">
              © {currentYear} MedChain Labs. All rights reserved.
            </p>
            <div className="flex items-center gap-7 md:justify-end">
              <Link href="/security" className="text-zinc-400 transition-colors hover:text-white" aria-label="Security">
                <ShieldCheck className="h-5 w-5" />
              </Link>
              <Link href="/workflow" className="text-zinc-400 transition-colors hover:text-white" aria-label="Workflow">
                <Activity className="h-5 w-5" />
              </Link>
              <Link href="/dashboard/consent" className="text-zinc-400 transition-colors hover:text-white" aria-label="Consent and Privacy">
                <Lock className="h-5 w-5" />
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
    <div className="group relative flex aspect-square flex-col items-center justify-center gap-5 rounded-[3rem] border border-white/8 bg-zinc-900/35 p-10 transition-all duration-500 hover:-translate-y-3 hover:border-white/20 hover:bg-zinc-900/60 hover:shadow-[0_0_50px_-12px_rgba(255,255,255,0.18)]">
      <div className="absolute inset-0 rounded-[3rem] bg-linear-to-br from-white/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
      <div className="relative rounded-2xl bg-white/8 p-5 text-zinc-200 transition-all duration-500 group-hover:scale-110 group-hover:bg-white/12">
        {icon}
      </div>
      <span className="relative text-center text-xs font-bold tracking-[0.2em] uppercase text-zinc-500 group-hover:text-white transition-colors">
        {title}
      </span>
    </div>
  );
}


