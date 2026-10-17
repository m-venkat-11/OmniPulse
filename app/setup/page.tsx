import React from "react";
import { initializeFirstRunWorkspace } from "./actions";
import { Card } from "@/components/design-system/Card";
import { PillButton } from "@/components/design-system/PillButton";
import { ShieldCheck, ArrowRight, Building, Mail, Lock, User } from "lucide-react";

export default function SetupPage() {
  return (
    <div className="canvas-swirl-bg min-h-screen flex items-center justify-center p-4">
      <div className="app-enclosure w-full max-w-xl p-8 md:p-12 border border-[#222222]">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-full bg-[#2BD64F] flex items-center justify-center text-black font-black text-xl shadow-md">
            <ShieldCheck className="w-6 h-6 text-black" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              Braco OmniPulse
            </h1>
            <p className="text-xs text-[#A3A3A3]">
              First-Run Workspace & Admin Account Setup
            </p>
          </div>
        </div>

        <div className="p-4 rounded-[18px] bg-[#161616] border border-[#262626] mb-8 text-xs text-[#A3A3A3] leading-relaxed">
          <span className="font-semibold text-white">Zero Demo Data Policy:</span>{" "}
          This installation will start with completely clean, empty tables. No seed or synthetic campaigns will be loaded. All future figures and records will originate strictly from what your team enters or imports.
        </div>

        <form action={initializeFirstRunWorkspace} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-medium text-[#A3A3A3] mb-1.5">
              Workspace / Agency Name
            </label>
            <div className="relative">
              <Building className="w-4 h-4 text-[#777777] absolute left-4 top-3.5" />
              <input
                type="text"
                name="workspaceName"
                required
                placeholder="e.g. Acme Brand Studio"
                className="w-full bg-[#1C1C1C] text-white placeholder-[#666666] text-xs rounded-full pl-11 pr-5 py-3 border border-transparent focus:border-[#333333] focus:outline-none focus:ring-1 focus:ring-[#2BD64F]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#A3A3A3] mb-1.5">
              Admin Full Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-[#777777] absolute left-4 top-3.5" />
              <input
                type="text"
                name="adminName"
                required
                placeholder="e.g. Maya Sharma"
                className="w-full bg-[#1C1C1C] text-white placeholder-[#666666] text-xs rounded-full pl-11 pr-5 py-3 border border-transparent focus:border-[#333333] focus:outline-none focus:ring-1 focus:ring-[#2BD64F]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#A3A3A3] mb-1.5">
              Admin Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#777777] absolute left-4 top-3.5" />
              <input
                type="email"
                name="adminEmail"
                required
                placeholder="admin@brand.com"
                className="w-full bg-[#1C1C1C] text-white placeholder-[#666666] text-xs rounded-full pl-11 pr-5 py-3 border border-transparent focus:border-[#333333] focus:outline-none focus:ring-1 focus:ring-[#2BD64F]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#A3A3A3] mb-1.5">
              Password (minimum 8 characters)
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#777777] absolute left-4 top-3.5" />
              <input
                type="password"
                name="password"
                required
                minLength={8}
                placeholder="••••••••••••"
                className="w-full bg-[#1C1C1C] text-white placeholder-[#666666] text-xs rounded-full pl-11 pr-5 py-3 border border-transparent focus:border-[#333333] focus:outline-none focus:ring-1 focus:ring-[#2BD64F]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#A3A3A3] mb-1.5">
              Company (Optional)
            </label>
            <input
              type="text"
              name="company"
              placeholder="e.g. Brand Marketing Ltd."
              className="w-full bg-[#1C1C1C] text-white placeholder-[#666666] text-xs rounded-full px-5 py-3 border border-transparent focus:border-[#333333] focus:outline-none focus:ring-1 focus:ring-[#2BD64F]"
            />
          </div>

          <div className="mt-4 pt-4 border-t border-[#1C1C1C] flex justify-end">
            <PillButton
              type="submit"
              variant="white"
              size="lg"
              icon={<ArrowRight className="w-4 h-4 text-black" />}
            >
              Create Workspace & Start Rebuild
            </PillButton>
          </div>
        </form>
      </div>
    </div>
  );
}
