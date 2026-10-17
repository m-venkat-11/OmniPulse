"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Search, Plus, Sparkles, Shield, User } from "lucide-react";
import { PillButton } from "../design-system/PillButton";

interface TopBarProps {
  userName?: string;
  userRole?: string;
  workspaceName?: string;
  primaryActionLabel?: string;
  primaryActionHref?: string;
}

export function TopBar({
  userName = "User",
  userRole = "CampaignManager",
  workspaceName = "OmniPulse Workspace",
  primaryActionLabel = "New Campaign",
  primaryActionHref = "/campaigns/new",
}: TopBarProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "OP";

  return (
    <header className="flex items-center justify-between gap-4 py-4 px-6 md:px-8 border-b border-[#141414]">
      {/* Brand Mark (Green Glyph) */}
      <Link href="/dashboard" className="flex items-center gap-3 flex-shrink-0 group">
        <div className="w-10 h-10 rounded-full bg-[#2BD64F] flex items-center justify-center text-black font-extrabold text-lg shadow-sm transition-transform group-hover:scale-105">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12"
              stroke="#050505"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            <path
              d="M12 6C8.69 6 6 8.69 6 12C6 15.31 8.69 18 12 18"
              stroke="#050505"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <div className="hidden sm:flex flex-col">
          <span className="font-extrabold text-sm tracking-tight text-white leading-tight">
            BRACO <span className="text-[#2BD64F]">OMNIPULSE</span>
          </span>
          <span className="text-[10px] text-[#A3A3A3] font-medium tracking-wide uppercase">
            {workspaceName}
          </span>
        </div>
      </Link>

      {/* Full-width Search Pill (#1C1C1C) */}
      <div className="flex-1 max-w-xl mx-2 md:mx-6">
        <div className="relative flex items-center w-full">
          <Search className="w-4 h-4 text-[#777777] absolute left-4 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search campaigns, claims, assets..."
            className="w-full bg-[#1C1C1C] text-white placeholder-[#777777] text-xs font-normal rounded-full pl-11 pr-5 py-3 border border-transparent focus:border-[#333333] focus:outline-none focus:ring-1 focus:ring-[#2BD64F]/50 transition-all"
          />
        </div>
      </div>

      {/* Right Actions: Primary Action Pill & User Avatar */}
      <div className="flex items-center gap-3 flex-shrink-0">
        {primaryActionLabel && primaryActionHref && (
          <PillButton
            variant="white"
            size="sm"
            href={primaryActionHref}
            icon={<Plus className="w-3.5 h-3.5 text-black" />}
          >
            {primaryActionLabel}
          </PillButton>
        )}

        {/* User initials circle avatar */}
        <Link
          href="/settings"
          title={`${userName} (${userRole})`}
          className="w-10 h-10 rounded-full bg-[#1C1C1C] border border-[#2A2A2A] text-white flex items-center justify-center text-xs font-bold transition-transform hover:scale-105 hover:border-[#444444]"
        >
          {initials}
        </Link>
      </div>
    </header>
  );
}
