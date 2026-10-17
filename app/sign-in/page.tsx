import React from "react";
import { signInAction } from "./actions";
import { PillButton } from "@/components/design-system/PillButton";
import { Shield, ArrowRight, Mail, Lock } from "lucide-react";
import Link from "next/link";

export default async function SignInPage(props: {
  searchParams?: Promise<{ error?: string }>;
}) {
  const searchParams = await props.searchParams;
  const errorMsg = searchParams?.error;

  return (
    <div className="canvas-swirl-bg min-h-screen flex items-center justify-center p-4">
      <div className="app-enclosure w-full max-w-md p-8 md:p-10 border border-[#222222]">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-[#2BD64F] flex items-center justify-center text-black font-black text-lg">
            <Shield className="w-5 h-5 text-black" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight">
              Braco OmniPulse
            </h1>
            <p className="text-xs text-[#A3A3A3]">Enterprise Regional Campaign Intelligence</p>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-5 p-3 rounded-xl bg-[#2A1417] border border-[#EF4444]/40 text-[#EF4444] text-xs font-medium">
            {errorMsg}
          </div>
        )}

        {/* Demo Credentials Helper */}
        <div className="mb-5 p-3 rounded-xl bg-[#16271B] border border-[#2BD64F]/30 text-xs text-[#A3A3A3] flex items-center justify-between">
          <div>
            <span className="text-[#2BD64F] font-bold block">Quick Demo Access</span>
            <span className="text-[11px] font-mono text-white">admin@brand.com</span> / <span className="text-[11px] font-mono text-white">password123</span>
          </div>
          <span className="text-[10px] font-mono bg-[#2BD64F]/20 text-[#2BD64F] px-2 py-0.5 rounded-full font-bold">
            ADMIN
          </span>
        </div>

        <form action={signInAction} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-medium text-[#A3A3A3] mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#777777] absolute left-4 top-3.5" />
              <input
                type="email"
                name="email"
                required
                defaultValue="admin@brand.com"
                placeholder="name@company.com"
                className="w-full bg-[#1C1C1C] text-white placeholder-[#666666] text-xs rounded-full pl-11 pr-5 py-3 border border-transparent focus:border-[#333333] focus:outline-none focus:ring-1 focus:ring-[#2BD64F]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#A3A3A3] mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#777777] absolute left-4 top-3.5" />
              <input
                type="password"
                name="password"
                required
                defaultValue="password123"
                placeholder="••••••••••••"
                className="w-full bg-[#1C1C1C] text-white placeholder-[#666666] text-xs rounded-full pl-11 pr-5 py-3 border border-transparent focus:border-[#333333] focus:outline-none focus:ring-1 focus:ring-[#2BD64F]"
              />
            </div>
          </div>

          <div className="mt-4 pt-2 flex flex-col gap-3">
            <PillButton
              type="submit"
              variant="white"
              size="md"
              className="w-full"
              icon={<ArrowRight className="w-4 h-4 text-black" />}
            >
              Sign In
            </PillButton>
            <Link
              href="/setup"
              className="text-center text-xs text-[#777777] hover:text-[#A3A3A3] transition-colors"
            >
              First-run setup? Click here to configure workspace
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
