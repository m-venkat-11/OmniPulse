"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Share2,
  Sparkles,
  ShieldCheck,
  Palette,
  CheckCircle2,
  FlaskConical,
  FileCheck2,
  BarChart3,
  ArrowLeft,
} from "lucide-react";

interface CampaignNavProps {
  campaignId: string;
  campaignName?: string;
  brandName?: string;
}

export function CampaignNav({ campaignId, campaignName, brandName }: CampaignNavProps) {
  const pathname = usePathname();

  const navItems = [
    {
      href: `/campaigns/${campaignId}`,
      label: "Overview",
      icon: LayoutDashboard,
      exact: true,
    },
    {
      href: `/campaigns/${campaignId}/claims`,
      label: "Claim Evidence Graph",
      icon: Share2,
      badge: "Graph",
    },
    {
      href: `/campaigns/${campaignId}/studio`,
      label: "Regional Studio",
      icon: Sparkles,
    },
    {
      href: `/campaigns/${campaignId}/guardian`,
      label: "Brand Guardian",
      icon: ShieldCheck,
    },
    {
      href: `/campaigns/${campaignId}/posters`,
      label: "Poster Studio",
      icon: Palette,
    },
    {
      href: `/campaigns/${campaignId}/review`,
      label: "Review Queue",
      icon: CheckCircle2,
    },
    {
      href: `/campaigns/${campaignId}/experiment`,
      label: "Experiments",
      icon: FlaskConical,
    },
    {
      href: `/campaigns/${campaignId}/passport`,
      label: "Decision Passport",
      icon: FileCheck2,
    },
    {
      href: `/campaigns/${campaignId}/analytics`,
      label: "Analytics",
      icon: BarChart3,
    },
  ];

  const isItemActive = (item: (typeof navItems)[0]) => {
    if (item.exact) {
      return pathname === item.href;
    }
    return pathname.startsWith(item.href);
  };

  return (
    <div className="w-full flex flex-col gap-3 mb-6">
      {/* Top Breadcrumb & Return Link */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/campaigns"
            className="w-8 h-8 rounded-full bg-[#181818] border border-[#262626] flex items-center justify-center text-[#888888] hover:text-white hover:border-[#444444] transition-all"
            title="Back to all campaigns"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          {campaignName && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white tracking-tight">
                {campaignName}
              </span>
              {brandName && (
                <span className="text-[11px] font-semibold text-[#2BD64F] bg-[#16271B] border border-[#2BD64F]/30 px-2 py-0.5 rounded-full">
                  {brandName}
                </span>
              )}
            </div>
          )}
        </div>

        <div className="hidden sm:flex items-center gap-2 text-[11px] font-mono text-[#666666]">
          <span>ID: {campaignId.slice(0, 8)}</span>
          <span>•</span>
          <span className="text-[#2BD64F]">Provenance Live</span>
        </div>
      </div>

      {/* Navigation Pill Track */}
      <div className="bg-[#111111] p-1.5 rounded-full border border-[#222222] shadow-md overflow-x-auto flex items-center gap-1.5 scrollbar-none">
        {navItems.map((item) => {
          const active = isItemActive(item);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                active
                  ? "bg-white text-black font-bold shadow-sm"
                  : "text-[#888888] hover:text-white hover:bg-[#1A1A1A]"
              }`}
            >
              <Icon
                className={`w-3.5 h-3.5 ${
                  active ? "text-black" : "text-[#777777]"
                }`}
              />
              <span>{item.label}</span>
              {item.badge && (
                <span
                  className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full uppercase tracking-wider ${
                    active
                      ? "bg-black text-[#2BD64F]"
                      : "bg-[#2BD64F]/20 text-[#2BD64F] border border-[#2BD64F]/30"
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
