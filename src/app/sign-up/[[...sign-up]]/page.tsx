import { SignUp } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { Shield } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function Page() {
  const { userId } = await auth();
  if (userId) redirect("/dashboard");

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-6 pt-32 selection:bg-blue-500/30">

      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/10 blur-[120px]" />
      </div>

      <div className="relative w-full max-w-md space-y-8 animate-fade-in">
        <div className="flex flex-col items-center">

          
          <SignUp
            path="/sign-up"
            routing="path"
            signInUrl="/sign-in"
            forceRedirectUrl="/dashboard"
            fallbackRedirectUrl="/dashboard"
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "rounded-[32px] border border-white/10 bg-zinc-950/50 backdrop-blur-xl shadow-2xl p-2",
                headerTitle: "text-white text-2xl font-bold",
                headerSubtitle: "text-zinc-500 font-medium",
                formButtonPrimary: "rounded-2xl bg-blue-600 py-3 text-sm font-bold hover:bg-blue-500 transition-all",
                formFieldLabel: "text-zinc-400 font-semibold",
                formFieldInput: "rounded-xl border-white/5 bg-white/5 text-white focus:ring-blue-500/50 focus:border-blue-500/30",
                footerActionLink: "text-blue-400 hover:text-blue-300 font-bold",
                dividerLine: "bg-white/5",
                dividerText: "text-zinc-600",
                socialButtonsBlockButton: "rounded-xl border-white/5 bg-white/5 text-white hover:bg-white/10",
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}
