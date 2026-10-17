import React from "react";
import Link from "next/link";
import { Plus, ArrowUpRight, Clock, ShieldCheck } from "lucide-react";
import { StatusChip } from "@/components/design-system/StatusChip";

interface ActiveCampaignsCardProps {
  count: number;
  campaigns: Array<{
    id: string;
    name: string;
    brand_name: string;
    product_name: string;
    status: string;
  }>;
  activities: Array<{
    id: string;
    event_type: string;
    actor_name: string;
    created_at: string;
  }>;
}

export function ActiveCampaignsCard({ count, campaigns, activities }: ActiveCampaignsCardProps) {
  return (
    <div className="flex flex-col gap-4">
      {/* Top Stacked Card (Hero Green from Finance_app_design.jpg) */}
      <div className="relative rounded-[28px] bg-gradient-to-b from-[#2BD64F] to-[#20AA3E] text-black p-6 shadow-xl overflow-hidden min-h-[220px] flex flex-col justify-between">
        {/* Decorative card layering visual at top */}
        <div className="absolute top-0 right-1/4 -translate-y-1/2 w-48 h-8 bg-white/20 rounded-full blur-[1px]" />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-black/15 flex items-center justify-center font-black text-sm">
              <ShieldCheck className="w-4 h-4 text-black" />
            </div>
            <span className="font-bold text-xs uppercase tracking-wider text-black/80">
              Active Campaigns
            </span>
          </div>

          {/* Round '+' button from Finance_app_design.jpg */}
          <Link
            href="/campaigns/new"
            title="Create new campaign"
            className="w-9 h-9 rounded-full bg-white text-black flex items-center justify-center shadow-md hover:scale-110 transition-transform"
          >
            <Plus className="w-5 h-5 text-black" />
          </Link>
        </div>

        {/* Big figure (e.g. 12 or 0) */}
        <div className="my-2">
          <div className="flex items-baseline gap-1">
            <span className="text-5xl font-black tracking-tight text-black">
              {count}
            </span>
            <span className="text-sm font-semibold text-black/70">
              in flight
            </span>
          </div>
          <p className="text-xs text-black/70 mt-1 font-medium">
            {count === 0 ? "No campaigns created yet." : "Verified regional adaptations"}
          </p>
        </div>

        {/* Mini campaign badge or status indicator */}
        <div className="flex items-center justify-between pt-3 border-t border-black/10 text-xs font-semibold text-black/90">
          <span>{campaigns[0]?.name || "Empty workspace"}</span>
          <Link
            href="/campaigns"
            className="flex items-center gap-1 hover:underline text-[11px]"
          >
            View all <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Fading Activity List (from audit events below stacked card) */}
      <div className="bg-[#161616] rounded-[26px] p-5 shadow-lg">
        <div className="flex items-center justify-between mb-3 px-1">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#A3A3A3]">
            Recent Activity
          </h4>
          <span className="text-[10px] text-[#666666]">AUDIT TRACE</span>
        </div>

        {activities.length > 0 ? (
          <div className="flex flex-col divide-y divide-[#202020]">
            {activities.map((act) => {
              const actorInitials = act.actor_name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase();

              return (
                <div key={act.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-full bg-[#242424] text-white flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                      {actorInitials}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-white font-medium truncate">
                        {act.event_type.replace(/_/g, " ")}
                      </span>
                      <span className="text-[10px] text-[#777777]">
                        {act.actor_name}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] text-[#A3A3A3] flex-shrink-0">
                    {new Date(act.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-6 text-center text-xs text-[#777777]">
            No activity recorded yet.
          </div>
        )}
      </div>
    </div>
  );
}
