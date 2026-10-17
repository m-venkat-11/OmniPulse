import React from "react";

export interface BarItem {
  label: string;
  value: number; // 0 to 100
  secondaryValue?: number;
}

interface BarTrackProps {
  primaryFigure?: string;
  deltaBadge?: string;
  bars: BarItem[];
  emptyMessage?: string;
  className?: string;
}

export function BarTrack({
  primaryFigure,
  deltaBadge,
  bars,
  emptyMessage = "No performance data yet",
  className = "",
}: BarTrackProps) {
  const hasData = bars.length > 0 && bars.some((b) => b.value > 0);

  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      {primaryFigure && (
        <div className="flex items-center gap-3">
          <span className="text-3xl font-extrabold text-white tracking-tight">
            {primaryFigure}
          </span>
          {deltaBadge && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-[#FFE234] text-black">
              {deltaBadge}
            </span>
          )}
        </div>
      )}

      {/* Bar Tracks matching the bottom panel in Finance_app_design.jpg */}
      <div className="flex items-end gap-2.5 h-28 pt-2">
        {hasData ? (
          bars.map((bar, idx) => (
            <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group">
              <div className="w-full h-full bg-[#202020] rounded-[14px] flex items-end p-1 overflow-hidden relative">
                <div
                  className="w-full bg-[#2BD64F] rounded-[10px] transition-all duration-500 ease-out group-hover:bg-[#34F05C]"
                  style={{ height: `${Math.max(bar.value, 6)}%` }}
                />
              </div>
              <span className="text-[10px] text-[#A3A3A3] mt-2 truncate w-full text-center">
                {bar.label}
              </span>
            </div>
          ))
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-[#1A1A1A] rounded-[18px] border border-dashed border-[#2A2A2A] text-center p-4">
            <div className="flex items-end gap-2 h-10 mb-2 opacity-30">
              <div className="w-6 h-6 bg-[#2A2A2A] rounded-[6px]" />
              <div className="w-6 h-10 bg-[#2A2A2A] rounded-[6px]" />
              <div className="w-6 h-4 bg-[#2A2A2A] rounded-[6px]" />
              <div className="w-6 h-8 bg-[#2A2A2A] rounded-[6px]" />
            </div>
            <span className="text-xs text-[#A3A3A3] font-medium">{emptyMessage}</span>
          </div>
        )}
      </div>
    </div>
  );
}
