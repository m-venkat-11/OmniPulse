"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ChevronDown } from "lucide-react";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();

  const isDashboard = pathname === "/" || pathname === "/dashboard";
  const isClaimGraph = pathname.includes("claims") || pathname.includes("graph");
  const isNewCampaign = pathname.startsWith("/campaigns/new");
  const isLibrary = pathname.includes("library");

  return (
    <div
      style={{ backgroundColor: "#0C0E14" }}
      className="min-h-screen p-3 sm:p-5 lg:p-6 flex flex-col items-center"
    >
      {/* Outer Shell Wrapper (Matching User Reference Image Exact Layout) */}
      <div className="w-full max-w-[1400px] flex flex-col space-y-4">
        
        {/* Top Dark Header Bar (Directly Inset into Dark Tablet Chassis) */}
        <header className="flex flex-wrap items-center justify-between gap-4 px-3 py-1 text-white">
          
          {/* Brand Logo: Clean White Logo Matching Reference Image with Braco Tag */}
          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <span className="font-sans font-extrabold text-white text-2xl tracking-tight group-hover:opacity-90 transition-opacity flex items-center gap-1.5">
              <span>OmniPulse</span>
              <span className="w-2.5 h-2.5 rounded-full bg-[#00FF87] shadow-[0_0_8px_#00FF87] animate-pulse"></span>
            </span>
            <span className="text-3xs font-mono text-neutral-400 uppercase tracking-widest hidden sm:inline-block bg-white/5 px-2 py-0.5 rounded-md border border-white/10">
              Regional AI
            </span>
          </Link>

          {/* Central Pill Navigation Menu */}
          <nav
            style={{ backgroundColor: "#181C23" }}
            className="flex items-center gap-1.5 px-2 py-1.5 rounded-full border border-white/10 shadow-inner overflow-x-auto max-w-full"
          >
            <Link
              href="/dashboard"
              style={{
                backgroundColor: isDashboard ? "#262C37" : "transparent",
                color: isDashboard ? "#FFFFFF" : "rgba(255, 255, 255, 0.7)"
              }}
              className="flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold shadow transition-all whitespace-nowrap hover:text-white"
            >
              <Home size={13} className="text-white/80" />
              <span>Dashboard</span>
            </Link>

            <Link
              href="/dashboard#claim-graph"
              style={{
                backgroundColor: isClaimGraph ? "#262C37" : "transparent",
                color: isClaimGraph ? "#FFFFFF" : "rgba(255, 255, 255, 0.7)"
              }}
              className="px-3.5 py-1.5 rounded-full text-xs font-medium hover:text-white hover:bg-white/5 transition-all whitespace-nowrap"
            >
              ⚡ Claim Graph
            </Link>

            <Link
              href="/campaigns/new"
              style={{
                backgroundColor: isNewCampaign ? "#262C37" : "transparent",
                color: isNewCampaign ? "#FFFFFF" : "rgba(255, 255, 255, 0.7)"
              }}
              className="px-3.5 py-1.5 rounded-full text-xs font-medium hover:text-white hover:bg-white/5 transition-all whitespace-nowrap"
            >
              ➕ New Campaign
            </Link>

            <Link
              href="/dashboard/library"
              style={{
                backgroundColor: isLibrary ? "#262C37" : "transparent",
                color: isLibrary ? "#FFFFFF" : "rgba(255, 255, 255, 0.7)"
              }}
              className="px-3.5 py-1.5 rounded-full text-xs font-medium hover:text-white hover:bg-white/5 transition-all whitespace-nowrap"
            >
              Brand Library
            </Link>
          </nav>

          {/* User Profile Pill (Right Side) */}
          <div
            style={{ backgroundColor: "#181C23" }}
            className="flex items-center gap-2.5 pl-2 pr-3.5 py-1.5 rounded-full border border-white/10 hover:border-white/20 transition-all cursor-pointer"
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-400 via-rose-400 to-indigo-500 flex items-center justify-center text-[#0C0E14] font-bold text-xs shadow shrink-0">
              O
            </div>
            <div className="text-left hidden sm:block">
              <span className="text-xs font-bold text-white block leading-tight">Hi, Campaign Lead!</span>
              <span className="text-3xs text-neutral-400 block leading-tight truncate max-w-[130px]">lead@omnipulse.ai</span>
            </div>
            <ChevronDown size={13} className="text-neutral-400 shrink-0" />
          </div>

        </header>

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
