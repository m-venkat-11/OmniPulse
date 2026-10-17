import React from "react";
import { getCurrentUser, isFirstRun } from "@/src/server/auth/session";
import { redirect } from "next/navigation";
import { getDashboardData } from "@/src/server/services/dashboardService";
import { AppShell } from "@/components/shell/AppShell";
import { ActiveCampaignsCard } from "@/components/dashboard/ActiveCampaignsCard";
import { QuickAdaptCard } from "@/components/dashboard/QuickAdaptCard";
import { Card } from "@/components/design-system/Card";
import { DonutChart } from "@/components/design-system/DonutChart";
import { BarTrack } from "@/components/design-system/BarTrack";
import { StatusChip } from "@/components/design-system/StatusChip";
import { PieChart, TrendingUp, AlertTriangle, ShieldCheck, Clock, FileCheck } from "lucide-react";
import Link from "next/link";

export default async function DashboardPage() {
  const fresh = await isFirstRun();
  if (fresh) {
    redirect("/setup");
  }

  const session = await getCurrentUser();
  if (!session) {
    redirect("/sign-in");
  }

  const data = await getDashboardData(session.workspace.id);

  return (
    <AppShell
      userName={session.user.name}
      userRole={session.role}
      workspaceName={session.workspace.name}
      primaryActionLabel="New Campaign"
      primaryActionHref="/campaigns/new"
    >
      <div className="flex flex-col gap-6 max-w-7xl mx-auto">
        {/* Top 3 Bento Columns (matching Finance_app_design.jpg top row) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Card 1: Active Campaigns (Hero Green + Activity List) */}
          <div className="lg:col-span-4">
            <ActiveCampaignsCard
              count={data.campaignsCount}
              campaigns={data.activeCampaigns}
              activities={data.activityEvents}
            />
          </div>

          {/* Card 2: State Donut (Workflow status distribution) */}
          <div className="lg:col-span-4 h-full">
            <Card
              title="Asset Workflow Status"
              icon={<PieChart className="w-3.5 h-3.5" />}
              actionHref="/campaigns"
              actionLabel="View all assets"
              className="h-full flex flex-col justify-between"
            >
              <div className="py-2 flex-1 flex flex-col items-center justify-center">
                <DonutChart
                  segments={data.stateDonut.segments}
                  centerLabel={data.stateDonut.centerLabel}
                  centerSublabel={data.stateDonut.centerSublabel}
                  size={200}
                />
              </div>
              <div className="pt-4 border-t border-[#202020] flex items-center justify-between text-xs text-[#A3A3A3]">
                <span>Governance integrity</span>
                <span className="text-[#2BD64F] font-semibold">100% Traceable</span>
              </div>
            </Card>
          </div>

          {/* Card 3: Quick Adapt (Currency Exchange panel design) */}
          <div className="lg:col-span-4 h-full">
            <QuickAdaptCard />
          </div>
        </div>

        {/* Bottom Bento Row: Variant Performance & Governance Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Variant Performance Card (Income card from Finance_app_design.jpg) */}
          <div className="lg:col-span-7">
            <Card
              title="Variant Performance"
              icon={<TrendingUp className="w-3.5 h-3.5 text-[#2BD64F]" />}
              actionHref="/campaigns"
              actionLabel="View experiments"
            >
              <BarTrack
                primaryFigure={data.variantPerformance.primaryFigure}
                deltaBadge={data.variantPerformance.deltaBadge}
                bars={data.variantPerformance.bars}
                emptyMessage="No variant observations recorded yet. Import CSV or create an experiment to see real metrics."
              />
            </Card>
          </div>

          {/* Status Metric Counters */}
          <div className="lg:col-span-5 grid grid-cols-2 gap-4">
            <Link
              href="/campaigns"
              className="bg-[#161616] rounded-[24px] p-5 border border-[#202020] hover:border-[#333333] transition-colors flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#A3A3A3] uppercase tracking-wider">
                  Pending Review
                </span>
                <Clock className="w-4 h-4 text-[#FFE234]" />
              </div>
              <div className="mt-4">
                <span className="text-3xl font-black text-white">
                  {data.metricsSummary.pendingReviews}
                </span>
                <p className="text-[11px] text-[#777777] mt-1">Awaiting approval</p>
              </div>
            </Link>

            <Link
              href="/campaigns"
              className="bg-[#161616] rounded-[24px] p-5 border border-[#202020] hover:border-[#333333] transition-colors flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#A3A3A3] uppercase tracking-wider">
                  Open Blockers
                </span>
                <AlertTriangle className="w-4 h-4 text-[#FF5C5C]" />
              </div>
              <div className="mt-4">
                <span className="text-3xl font-black text-white">
                  {data.metricsSummary.openBlockers}
                </span>
                <p className="text-[11px] text-[#777777] mt-1">Critical/High findings</p>
              </div>
            </Link>

            <Link
              href="/campaigns"
              className="bg-[#161616] rounded-[24px] p-5 border border-[#202020] hover:border-[#333333] transition-colors flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#A3A3A3] uppercase tracking-wider">
                  Approved
                </span>
                <ShieldCheck className="w-4 h-4 text-[#2BD64F]" />
              </div>
              <div className="mt-4">
                <span className="text-3xl font-black text-white">
                  {data.metricsSummary.approvedVersions}
                </span>
                <p className="text-[11px] text-[#777777] mt-1">Version-locked</p>
              </div>
            </Link>

            <Link
              href="/campaigns"
              className="bg-[#161616] rounded-[24px] p-5 border border-[#202020] hover:border-[#333333] transition-colors flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#A3A3A3] uppercase tracking-wider">
                  Active Tests
                </span>
                <FileCheck className="w-4 h-4 text-[#60A5FA]" />
              </div>
              <div className="mt-4">
                <span className="text-3xl font-black text-white">
                  {data.metricsSummary.runningExperiments}
                </span>
                <p className="text-[11px] text-[#777777] mt-1">Locked experiments</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
