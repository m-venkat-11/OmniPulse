"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  FileText,
  BarChart3,
  Layers,
  Sparkles,
  Users,
  Settings,
  LogOut,
  Bell,
  CheckCircle,
} from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

const PRIMARY_NAV: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: <Home className="w-4 h-4" /> },
  { href: "/campaigns", label: "Campaigns", icon: <FileText className="w-4 h-4" /> },
  { href: "/creators", label: "Creators", icon: <Users className="w-4 h-4" /> },
  { href: "/settings", label: "System Health & Config", icon: <BarChart3 className="w-4 h-4" /> },
];

export function IconRail() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard" || pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <aside className="hidden md:flex flex-col items-center justify-between py-6 w-20 flex-shrink-0 select-none">
      {/* Top Floating Pill for Core Navigation */}
      <nav className="flex flex-col items-center gap-3 bg-[#111111] p-2.5 rounded-full shadow-md border border-[#1A1A1A]">
        {PRIMARY_NAV.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              title={item.label}
              className={`w-11 h-11 rounded-full flex items-center justify-center transition-smooth group relative ${
                active
                  ? "bg-white text-black font-semibold shadow-sm"
                  : "bg-transparent text-[#777777] hover:text-white hover:bg-[#1A1A1A]"
              }`}
            >
              {item.icon}
              {/* Tooltip */}
              <span className="absolute left-16 px-2.5 py-1 rounded-md bg-[#222222] text-white text-[11px] font-medium whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 border border-[#333333] shadow-lg">
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Secondary Floating Pill for Tools & Settings */}
      <div className="flex flex-col items-center gap-3 bg-[#111111] p-2.5 rounded-full shadow-md border border-[#1A1A1A] mt-auto mb-4">
        <Link
          href="/settings"
          title="Settings & Integrations"
          className={`w-11 h-11 rounded-full flex items-center justify-center transition-smooth group relative ${
            pathname === "/settings"
              ? "bg-white text-black"
              : "bg-transparent text-[#777777] hover:text-white hover:bg-[#1A1A1A]"
          }`}
        >
          <Settings className="w-4 h-4" />
          <span className="absolute left-16 px-2.5 py-1 rounded-md bg-[#222222] text-white text-[11px] font-medium whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 border border-[#333333] shadow-lg">
            Settings
          </span>
        </Link>
      </div>

      {/* Pinned Logout Circle */}
      <form action="/auth/sign-out" method="POST">
        <button
          type="submit"
          title="Sign out"
          className="w-11 h-11 rounded-full bg-[#111111] border border-[#1A1A1A] text-[#777777] hover:text-[#FF5C5C] hover:bg-[#1A1A1A] flex items-center justify-center transition-smooth group relative"
        >
          <LogOut className="w-4 h-4" />
          <span className="absolute left-16 px-2.5 py-1 rounded-md bg-[#222222] text-white text-[11px] font-medium whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 border border-[#333333] shadow-lg">
            Sign out
          </span>
        </button>
      </form>
    </aside>
  );
}
