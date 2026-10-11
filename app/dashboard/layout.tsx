"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Plus, ShieldCheck, Sparkles, FolderOpen,
  ChevronDown, Layers, FileText, CheckCircle2, Globe
} from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const isOverview = pathname === "/" || pathname === "/dashboard";
  const isNewCampaign = pathname === "/campaigns/new";
  const isLibrary = pathname.includes("/library");

  return (
    <div className="min-h-screen bg-[#FBF9F5] text-[#292B29] font-sans flex flex-col">
      {/* Top Enterprise Header Bar */}
      <header className="bg-[#1A3C29] text-[#FFFDF8] border-b border-[#1A3C29]/20 px-6 py-3.5 sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          
          {/* Brand Identity */}
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-[#FFFDF8] text-[#1A3C29] font-serif font-black text-xl flex items-center justify-center shadow-sm">
                Ω
              </div>
              <div>
                <span className="font-serif font-bold text-lg text-[#FFFDF8] tracking-tight block leading-tight">
                  BRACO OMNIPULSE
                </span>
                <span className="text-[10px] font-mono text-[#BFE4DF] uppercase tracking-wider block leading-tight">
                  Regional Campaign Intelligence
                </span>
              </div>
            </Link>

            <span className="hidden sm:inline-block text-xs font-medium px-2.5 py-0.5 rounded-full bg-[#FFFDF8]/10 text-[#FFFDF8]/90 border border-[#FFFDF8]/15">
              Samartha Stage 1
            </span>
          </div>

          {/* Main Navigation Menu */}
          <nav className="flex items-center gap-1.5 bg-[#143020] p-1 rounded-full border border-[#FFFDF8]/15 overflow-x-auto">
            <Link
              href="/dashboard"
              className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
                isOverview
                  ? "bg-[#FFFDF8] text-[#1A3C29] shadow-sm font-bold"
                  : "text-[#FFFDF8]/80 hover:text-[#FFFDF8] hover:bg-[#FFFDF8]/10"
              }`}
            >
              <LayoutDashboard size={14} />
              <span>Campaigns</span>
            </Link>

            <Link
              href="/campaigns/new"
              className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
                isNewCampaign
                  ? "bg-[#FFFDF8] text-[#1A3C29] shadow-sm font-bold"
                  : "text-[#FFFDF8]/80 hover:text-[#FFFDF8] hover:bg-[#FFFDF8]/10"
              }`}
            >
              <Plus size={14} />
              <span>Create Campaign</span>
            </Link>

            <Link
              href="/dashboard/library"
              className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
                isLibrary
                  ? "bg-[#FFFDF8] text-[#1A3C29] shadow-sm font-bold"
                  : "text-[#FFFDF8]/80 hover:text-[#FFFDF8] hover:bg-[#FFFDF8]/10"
              }`}
            >
              <FolderOpen size={14} />
              <span>Brand Knowledge & Claims</span>
            </Link>
          </nav>

          {/* Workspace Pill & User Role */}
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 text-right">
              <div>
                <span className="text-xs font-bold text-[#FFFDF8] block leading-tight">
                  Brand Director (Reviewer)
                </span>
                <span className="text-[10px] text-[#BFE4DF] block leading-tight font-mono">
                  Tenant: Braco India Workspace
                </span>
              </div>
            </div>

            <div className="w-8 h-8 rounded-full bg-[#BFE4DF] text-[#1A3C29] font-bold text-xs flex items-center justify-center border-2 border-[#FFFDF8] shadow-sm">
              BD
            </div>
          </div>

        </div>
      </header>

      {/* Main Content Workspace Canvas */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {children}
      </main>

      {/* Enterprise Audit Footer */}
      <footer className="border-t border-[#1A3C29]/10 bg-[#FFFDF8] py-4 px-6 text-center text-xs text-[#292B29]/70 font-mono">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <span>Braco OmniPulse • AI-Assisted Regional Campaign Intelligence & Ad-Evidence Engine</span>
          <span className="flex items-center gap-1.5 text-[#1A3C29] font-semibold">
            <ShieldCheck size={14} /> Turso libSQL Hash-Verified • Gemini 3.8 Multilingual Adapter
          </span>
        </div>
      </footer>
    </div>
  );
}
