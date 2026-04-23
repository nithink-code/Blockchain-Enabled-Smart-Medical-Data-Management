import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

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
    <ClerkProvider>
      <html lang="en" className="h-full scroll-smooth">
        <body className={`${manrope.className} min-h-screen bg-black text-white antialiased`}>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}

