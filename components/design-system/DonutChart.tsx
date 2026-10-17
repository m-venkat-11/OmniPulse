"use client";

import React from "react";

export interface DonutSegment {
  label: string;
  value: number;
  color: string;
  isHatched?: boolean;
}

interface DonutChartProps {
  segments: DonutSegment[];
  centerLabel?: string;
  centerSublabel?: string;
  size?: number;
  className?: string;
}

export function DonutChart({
  segments,
  centerLabel,
  centerSublabel = "of total balance",
  size = 180,
  className = "",
}: DonutChartProps) {
  const total = segments.reduce((sum, s) => sum + s.value, 0);
  const strokeWidth = 24;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Empty state handling
  if (total === 0) {
    return (
      <div className={`flex flex-col items-center justify-center p-4 ${className}`}>
        <div className="relative" style={{ width: size, height: size }}>
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="#2A2A2A"
              strokeWidth={strokeWidth}
              strokeDasharray="4 4"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-2">
            <span className="text-xl font-bold text-white">0%</span>
            <span className="text-[11px] text-[#A3A3A3] mt-0.5">No data yet</span>
          </div>
        </div>
      </div>
    );
  }

  // Calculate cumulative offsets
  let accumulatedAngle = 0;

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="rotate-[-90deg]">
          <defs>
            {/* Pattern for hatched effect from Finance_app_design.jpg */}
            <pattern
              id="hatch-pattern-white"
              patternUnits="userSpaceOnUse"
              width="6"
              height="6"
              patternTransform="rotate(45)"
            >
              <line x1="0" y1="0" x2="0" y2="6" stroke="#FFFFFF" strokeWidth="2.5" />
            </pattern>
            <pattern
              id="hatch-pattern-green"
              patternUnits="userSpaceOnUse"
              width="6"
              height="6"
              patternTransform="rotate(45)"
            >
              <line x1="0" y1="0" x2="0" y2="6" stroke="#2BD64F" strokeWidth="2.5" />
            </pattern>
          </defs>

          {/* Background track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#202020"
            strokeWidth={strokeWidth}
          />

          {/* Segments */}
          {segments.map((seg, idx) => {
            if (seg.value <= 0) return null;
            const percentage = seg.value / total;
            const strokeDasharray = `${percentage * circumference} ${circumference}`;
            const strokeDashoffset = -accumulatedAngle * circumference;
            accumulatedAngle += percentage;

            const strokeColor = seg.isHatched
              ? "url(#hatch-pattern-white)"
              : seg.color;

            return (
              <circle
                key={idx}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={strokeColor}
                strokeWidth={strokeWidth}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-500 ease-out"
              />
            );
          })}
        </svg>

        {/* Center Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-3xl font-extrabold text-white tracking-tight">
            {centerLabel || `${Math.round(((segments[0]?.value || 0) / total) * 100)}%`}
          </span>
          <span className="text-[11px] text-[#A3A3A3] font-medium mt-0.5">
            {centerSublabel}
          </span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-4 mt-5">
        {segments.map((seg, idx) => (
          <div key={idx} className="flex items-center gap-1.5 text-xs">
            <span
              className="w-2.5 h-2.5 rounded-full inline-block"
              style={{
                backgroundColor: seg.isHatched ? "#FFFFFF" : seg.color,
                backgroundImage: seg.isHatched
                  ? "repeating-linear-gradient(45deg, #111, #111 1px, #FFF 1px, #FFF 3px)"
                  : "none",
              }}
            />
            <span className="text-[#A3A3A3]">{seg.label}</span>
            <span className="text-white font-medium ml-0.5">
              {seg.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
