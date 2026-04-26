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

      <main className="relative z-10">
        <div className="h-28 md:h-32" aria-hidden="true" />
        <section className="relative flex min-h-[calc(100vh-8rem)] items-center justify-center pb-20 md:min-h-[calc(100vh-9rem)] lg:pb-28">
          <div className="app-shell flex flex-col items-center text-center">
            <div className="max-w-5xl">
              <div className="flex flex-col items-center justify-center space-y-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                <h1 className="mx-auto overflow-visible py-4 text-center text-4xl font-bold leading-[1.3] tracking-tight sm:text-6xl lg:text-[5.5rem]">
                  <span className="text-gradient-vivid block overflow-visible pb-4 drop-shadow-[0_4px_24px_rgba(0,0,0,0.6)]">Medical Data Management.</span>
                </h1>
                <p className="text-gradient-soft mx-auto max-w-3xl text-center text-lg leading-relaxed sm:text-xl">
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
