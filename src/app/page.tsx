import {
  LayoutDashboard,
  UploadCloud,
  ScanText,
  FileCheck2,
  Users,
  ShieldPlus
} from "lucide-react";
import { HomeCta } from "./home-cta";

export default async function Home() {
  // We remove the auto-redirect to allow users to view the landing page even if logged in.
  // The Navbar will handle showing the appropriate 'Dashboard' link instead.

  return (
    <div className="min-h-screen bg-transparent text-white selection:bg-blue-500/30">
      {/* Dynamic Background Glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/10 blur-[120px]" />
      </div>

      <main className="relative z-10">
        <div className="h-28 md:h-32" aria-hidden="true" />
        <section className="relative flex min-h-[calc(100vh-8rem)] items-center justify-center pb-20 md:min-h-[calc(100vh-9rem)] lg:pb-28">
          <div className="app-shell flex flex-col items-center text-center">
            <div className="max-w-5xl">
              <div className="flex flex-col items-center justify-center space-y-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                <h1 className="mx-auto overflow-visible py-4 text-center text-4xl font-bold leading-[1.3] tracking-tight text-white sm:text-6xl lg:text-[5.5rem]">
                  <span className="block overflow-visible pb-4 text-gradient">Medical Data Management.</span>
                </h1>
                <p className="mx-auto max-w-3xl text-center text-lg leading-relaxed text-zinc-400 sm:text-xl">
                  MedChain utilizes explainable AI and blockchain technology to give patients full ownership and clear understanding of their medical history.
                </p>
              </div>

              <div className="mt-20 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-center animate-fade-in" style={{ animationDelay: '0.3s', marginTop: '30px' }}>
                <HomeCta />
              </div>

              <div className="mt-28 w-full space-y-14 lg:mt-32!">
                <div className="mx-auto flex max-w-5xl flex-col items-center justify-center space-y-5 px-4 text-center mb-20!">
                  <p className="text-xs font-semibold uppercase tracking-[0.45em] text-blue-400">
                    Platform Overview
                  </p>
                  <h2 className="mx-auto max-w-4xl text-center text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-[3.25rem] mt-10!">
                    Everything you need in one secure health workspace
                  </h2>
                  <p className="mx-auto max-w-3xl text-center text-base leading-relaxed text-zinc-400 sm:text-lg lg:text-xl mt-5!">
                    Quickly access your dashboard, upload medical reports, scan records with OCR, and manage consent and access from a single clean interface.
                  </p>
                </div>

                <div className="mx-auto grid w-full max-w-5xl gap-6 px-4 sm:grid-cols-2">
                  <LandingFeatureCard
                    icon={<LayoutDashboard className="h-6 w-6" />}
                    title="Patient Dashboard"
                    description="View reports, activity, health score, and key insights in one place."
                  />
                  <LandingFeatureCard
                    icon={<UploadCloud className="h-6 w-6" />}
                    title="Upload Documents"
                    description="Add new medical files securely with a guided upload flow."
                  />
                  <LandingFeatureCard
                    icon={<ScanText className="h-6 w-6" />}
                    title="OCR Processing"
                    description="Extract readable data from report scans and turn them into structured records."
                  />
                  <LandingFeatureCard
                    icon={<FileCheck2 className="h-6 w-6" />}
                    title="Report Review"
                    description="Track document status, analysis results, and verified record details."
                  />
                  <LandingFeatureCard
                    icon={<ShieldPlus className="h-6 w-6" />}
                    title="Consent Control"
                    description="Manage access permissions with a simple and transparent approval flow."
                  />
                  <LandingFeatureCard
                    icon={<Users className="h-6 w-6" />}
                    title="Hospital Access"
                    description="Coordinate sharing with medical teams while keeping an audit trail."
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function LandingFeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="group min-h-[176px] w-full rounded-[1.75rem] border border-white/10 bg-black/40 p-6 shadow-lg shadow-black/20 transition-all duration-300 hover:-translate-y-1 hover:border-blue-500/20 hover:bg-white/[0.05] sm:p-7">
      <div className="flex h-full items-center gap-5">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-blue-500/20 bg-blue-500/10 text-blue-400 transition-colors group-hover:bg-blue-500/15">
          {icon}
        </div>
        <div className="space-y-3">
          <h3 className="text-lg font-semibold tracking-tight text-white sm:text-xl">
            {title}
          </h3>
          <p className="text-sm leading-relaxed text-zinc-400 sm:text-[0.98rem]">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}
