"use client";

import Link from "next/link";
import {
  LayoutDashboard,
  UploadCloud,
  ScanText,
  FileCheck2,
  Users,
  ShieldPlus,
  ArrowRight,
  CheckCircle2,
  Lock,
  Zap,
  BarChart3,
  Shield,
  Clock,
  Brain
} from "lucide-react";
import { HomeCta } from "./home-cta";
import { useUserRole } from "@/lib/use-user-role";

export default function Home() {
  const { role } = useUserRole();
  const isPatient = role === "patient";

  return (
    <div className="min-h-screen bg-[#f0f4f8]">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#ebf4ff] via-[#f0f4f8] to-[#faf5ff]" />
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-blue-300/20 blur-[120px]" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-purple-300/20 blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-gradient-to-br from-blue-200/10 to-purple-200/10 blur-[100px]" />
        
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/80 px-5 py-2 text-sm font-medium text-[#2b6cb0] shadow-sm backdrop-blur-sm">
              <Zap size={14} />
              Blockchain-Powered Healthcare
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-[#1a202c] sm:text-5xl lg:text-7xl">
              Medical Data
              <span className="block bg-gradient-to-r from-[#2b6cb0] to-[#6b46c1] bg-clip-text text-transparent">
                Management Reimagined
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-[#718096] sm:text-xl">
              MedChain utilizes explainable AI and blockchain technology to give patients full ownership and clear understanding of their medical history.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <HomeCta />
            </div>

            {/* Stats */}
            <div className="mx-auto mt-16 grid max-w-2xl grid-cols-3 gap-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-[#1a202c]">100%</p>
                <p className="mt-1 text-sm text-[#718096]">Data Ownership</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-[#1a202c]">256-bit</p>
                <p className="mt-1 text-sm text-[#718096]">Encryption</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-[#1a202c]">24/7</p>
                <p className="mt-1 text-sm text-[#718096]">Access Control</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-[#2b6cb0]">
              Platform Overview
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#1a202c] sm:text-4xl">
              Everything you need in one secure health workspace
            </h2>
            <p className="mt-4 text-lg text-[#718096]">
              Quickly access your dashboard, upload medical reports, scan records with OCR, and manage consent and access from a single clean interface.
            </p>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              href="/dashboard"
              icon={<LayoutDashboard className="h-6 w-6" />}
              title="Patient Dashboard"
              description="View reports, activity, health score, and key insights in one place."
            />
            <FeatureCard
              href="/dashboard/uploads"
              icon={<UploadCloud className="h-6 w-6" />}
              title="Upload Documents"
              description="Add new medical files securely with a guided upload flow."
            />
            <FeatureCard
              href="/workflow"
              icon={<ScanText className="h-6 w-6" />}
              title="OCR Processing"
              description="Extract readable data from report scans and turn them into structured records."
            />
            <FeatureCard
              href="/dashboard/reports"
              icon={<FileCheck2 className="h-6 w-6" />}
              title="Report Review"
              description="Track document status, analysis results, and verified record details."
            />
            <FeatureCard
              href="/dashboard/consent"
              icon={<ShieldPlus className="h-6 w-6" />}
              title="Consent Control"
              description="Manage access permissions with a simple and transparent approval flow."
            />
            {!isPatient && (
              <FeatureCard
                href="/hospital"
                icon={<Users className="h-6 w-6" />}
                title="Hospital Access"
                description="Coordinate sharing with medical teams while keeping an audit trail."
              />
            )}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="border-t border-[#e2e8f0] bg-white py-20 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-[#1a202c] sm:text-4xl">
              Trusted by Healthcare Professionals
            </h2>
            <p className="mt-4 text-lg text-[#718096]">
              Built with security and transparency at its core.
            </p>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-3">
            <TrustCard
              icon={<Lock className="h-8 w-8 text-[#2b6cb0]" />}
              title="Blockchain Secured"
              description="Every access request and approval is recorded on an immutable ledger."
            />
            <TrustCard
              icon={<BarChart3 className="h-8 w-8 text-[#2b6cb0]" />}
              title="Explainable AI"
              description="Understand every AI decision with LIME and SHAP visualizations."
            />
            <TrustCard
              icon={<CheckCircle2 className="h-8 w-8 text-[#2b6cb0]" />}
              title="Patient Controlled"
              description="You decide who sees your data and for how long."
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-[#2b6cb0]">
              How It Works
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#1a202c] sm:text-4xl">
              From upload to blockchain in minutes
            </h2>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <StepCard
              step={1}
              icon={<UploadCloud className="h-6 w-6" />}
              title="Upload"
              description="Upload your medical report securely"
            />
            <StepCard
              step={2}
              icon={<Brain className="h-6 w-6" />}
              title="AI Analysis"
              description="AI extracts and analyzes clinical data"
            />
            <StepCard
              step={3}
              icon={<Shield className="h-6 w-6" />}
              title="Blockchain"
              description="Record anchored to blockchain with CID"
            />
            <StepCard
              step={4}
              icon={<Clock className="h-6 w-6" />}
              title="Time-Limited Access"
              description="Grant access with automatic expiry"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#2b6cb0] to-[#6b46c1] px-6 py-20 text-center sm:px-12 sm:py-28">
            <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-white/10 blur-[80px]" />
            <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white/10 blur-[80px]" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-white/5 blur-[100px]" />
            <div className="relative">
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Ready to take control of your medical data?
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-blue-100">
                Join MedChain today and experience the future of healthcare data management.
              </p>
              <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link
                  href="/sign-up"
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 text-sm font-semibold text-[#2b6cb0] shadow-xl transition-all hover:bg-blue-50 hover:-translate-y-1"
                >
                  Get Started <ArrowRight size={16} />
                </Link>
                <Link
                  href="/features"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/30 px-8 py-4 text-sm font-semibold text-white transition-all hover:bg-white/10"
                >
                  Learn More
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({
  href,
  icon,
  title,
  description,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-2xl border border-[#e2e8f0] bg-white p-8 shadow-sm transition-all hover:-translate-y-2 hover:border-[#2b6cb0]/20 hover:shadow-xl"
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#ebf4ff] to-[#faf5ff] text-[#2b6cb0] transition-all group-hover:bg-gradient-to-br group-hover:from-[#2b6cb0] group-hover:to-[#6b46c1] group-hover:text-white group-hover:shadow-lg group-hover:shadow-blue-500/20">
        {icon}
      </div>
      <h3 className="mt-6 text-xl font-semibold text-[#1a202c]">{title}</h3>
      <p className="mt-3 text-sm leading-relaxed text-[#718096]">{description}</p>
    </Link>
  );
}

function TrustCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="text-center">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-[#ebf4ff] to-[#faf5ff] shadow-lg shadow-blue-500/5">
        {icon}
      </div>
      <h3 className="mt-6 text-xl font-semibold text-[#1a202c]">{title}</h3>
      <p className="mt-3 text-sm leading-relaxed text-[#718096]">{description}</p>
    </div>
  );
}

function StepCard({
  step,
  icon,
  title,
  description,
}: {
  step: number;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="relative rounded-2xl border border-[#e2e8f0] bg-white p-8 text-center shadow-sm transition-all hover:-translate-y-2 hover:shadow-xl">
      <div className="absolute -top-4 left-1/2 -translate-x-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#2b6cb0] to-[#6b46c1] text-sm font-bold text-white shadow-lg">
        {step}
      </div>
      <div className="mx-auto mt-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#ebf4ff] to-[#faf5ff] text-[#2b6cb0]">
        {icon}
      </div>
      <h3 className="mt-4 text-lg font-semibold text-[#1a202c]">{title}</h3>
      <p className="mt-2 text-sm text-[#718096]">{description}</p>
    </div>
  );
}
