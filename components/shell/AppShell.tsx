import React from "react";
import { TopBar } from "./TopBar";
import { IconRail } from "./IconRail";

interface AppShellProps {
  userName?: string;
  userRole?: string;
  workspaceName?: string;
  primaryActionLabel?: string;
  primaryActionHref?: string;
  children: React.ReactNode;
}

export function AppShell({
  userName = "Admin User",
  userRole = "Admin",
  workspaceName = "OmniPulse Workspace",
  primaryActionLabel,
  primaryActionHref,
  children,
}: AppShellProps) {
  return (
    <div className="canvas-swirl-bg min-h-screen p-0 md:p-6 flex items-center justify-center">
      <div className="app-enclosure w-full max-w-[1440px] flex flex-col overflow-hidden">
        {/* Top Header */}
        <TopBar
          userName={userName}
          userRole={userRole}
          workspaceName={workspaceName}
          primaryActionLabel={primaryActionLabel}
          primaryActionHref={primaryActionHref}
        />

        {/* Content Body with Left Rail */}
        <div className="flex flex-1 overflow-hidden">
          <IconRail />

          {/* Main Scrollable View */}
          <main className="flex-1 overflow-y-auto p-4 md:p-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
