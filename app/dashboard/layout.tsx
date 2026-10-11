import Link from "next/link";
import {
  Home, ShieldCheck, Sparkles, FolderOpen, Plus,
  Layers, ChevronDown, CheckCircle2, Globe2, FileText
} from "lucide-react";
import { getSession } from "@/app/auth/actions";
import { TopNav } from "@/components/navigation/TopNav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const sessionEmail = await getSession();
  const email = sessionEmail || "director@braco.ai";

  return (
    <div
      style={{ backgroundColor: "#0C0E14" }}
      className="min-h-screen p-3 sm:p-5 lg:p-6 flex flex-col items-center"
    >
      {/* Outer Shell Wrapper (Matching User Reference Image Exact Layout) */}
      <div className="w-full max-w-[1400px] flex flex-col space-y-4">
        
        {/* Top Dark Header Bar with Interactive Navigation & Sarvam AI Integration */}
        <TopNav userEmail={email} />

        {/* Main Inner Surface: Crisp Clean Rounded Canvas */}
        <main
          style={{ backgroundColor: "#FFFFFF" }}
          className="rounded-[32px] shadow-2xl p-6 sm:p-8 lg:p-10 border border-white/10 min-h-[calc(100vh-110px)] text-[#11141A]"
        >
          {children}
        </main>

        {/* Subtle Bottom Credit */}
        <footer className="text-center text-3xs text-neutral-500 py-1 font-mono">
          Braco OmniPulse • AI-Assisted Regional Campaign Intelligence with Turso libSQL & Gemini AI
        </footer>

      </div>
    </div>
  );
}
