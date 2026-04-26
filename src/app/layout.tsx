import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { PageLoader } from "@/components/page-loader";
import { Suspense } from "react";


const manrope = Manrope({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MedChain | AI-Powered Smart Medical Data Management",
  description: "Secure, patient-centric healthcare information management with blockchain consent and AI analysis.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full scroll-smooth" data-scroll-behavior="smooth">
      <body className={`${manrope.className} min-h-screen bg-black text-white antialiased`}>
        <ClerkProvider
          signInForceRedirectUrl="/dashboard"
          signUpForceRedirectUrl="/dashboard"
          signInFallbackRedirectUrl="/dashboard"
          signUpFallbackRedirectUrl="/dashboard"
        >
          <Suspense fallback={null}>
            <PageLoader />
          </Suspense>
          <Navbar />
          {children}
          <Footer />

        </ClerkProvider>
      </body>
    </html>
  );
}
