import { SignUp } from "@clerk/nextjs";
import { Shield } from "lucide-react";
import Link from "next/link";

export default function Page() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center">
          <Link href="/" className="mb-8 flex items-center gap-2">
            <div className="rounded-xl bg-blue-600 p-2">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-slate-900">MedChain</span>
          </Link>
          <SignUp
            path="/sign-up"
            routing="path"
            appearance={{
              elements: {
                formButtonPrimary: "rounded-xl bg-blue-600 text-sm font-bold hover:bg-blue-700",
                card: "rounded-3xl border border-slate-200 shadow-2xl",
                headerTitle: "text-2xl font-black text-slate-900",
                headerSubtitle: "font-medium text-slate-500",
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}