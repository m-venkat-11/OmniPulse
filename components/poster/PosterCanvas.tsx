"use client";

import React, { useRef } from "react";
import { PillButton } from "@/components/design-system/PillButton";
import { Download, Sparkles, AlertCircle, ShieldCheck } from "lucide-react";

interface PosterCanvasProps {
  layoutTemplateId: string;
  format: "1:1" | "4:5" | "9:16" | "16:9";
  palette?: {
    primary: string;
    secondary: string;
    background: string;
    text_contrast: string;
  };
  backgroundImagePath?: string;
  isAiImage?: boolean;
  isApproved?: boolean;
  content: {
    headline: string;
    subline?: string;
    body?: string;
    cta?: string;
    disclosure?: string;
    brandName?: string;
    targetLanguage?: string;
  };
}

export function PosterCanvas({
  layoutTemplateId = "centered_hero",
  format = "1:1",
  palette = {
    primary: "#2BD64F",
    secondary: "#FFE234",
    background: "#0A0D0B",
    text_contrast: "#FFFFFF",
  },
  backgroundImagePath,
  isAiImage = false,
  isApproved = false,
  content,
}: PosterCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Aspect ratio pixel dimensions for SVG
  const dimensions = {
    "1:1": { width: 800, height: 800 },
    "4:5": { width: 800, height: 1000 },
    "9:16": { width: 720, height: 1280 },
    "16:9": { width: 1280, height: 720 },
  }[format];

  const handleExportPng = () => {
    const svgElement = containerRef.current?.querySelector("svg");
    if (!svgElement) return;

    const svgData = new XMLSerializer().serializeToString(svgElement);
    const canvas = document.createElement("canvas");
    canvas.width = dimensions.width;
    canvas.height = dimensions.height;
    const ctx = canvas.getContext("2d");

    const img = new Image();
    const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      ctx?.drawImage(img, 0, 0);
      const pngUrl = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.href = pngUrl;
      downloadLink.download = `omnipulse-poster-${isApproved ? "approved" : "draft"}.png`;
      downloadLink.click();
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Visual background mode badge */}
      <div className="flex items-center justify-between w-full max-w-md px-2 text-xs">
        <span className="text-[#A3A3A3] flex items-center gap-1.5">
          {isAiImage ? (
            <>
              <Sparkles className="w-3.5 h-3.5 text-[#2BD64F]" />
              Gemini Imagen Background
            </>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-[#FFE234]" />
              App-Rendered Brand Gradient (No AI image)
            </>
          )}
        </span>

        <span
          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
            isApproved ? "bg-[#142618] text-[#2BD64F]" : "bg-[#2A1414] text-[#FF5C5C]"
          }`}
        >
          {isApproved ? "Clean Approved Export" : "UNAPPROVED DRAFT"}
        </span>
      </div>

      {/* SVG Canvas Container */}
      <div
        ref={containerRef}
        className="relative rounded-[24px] overflow-hidden shadow-2xl border border-[#333333] max-w-md w-full bg-black select-none"
        style={{ aspectRatio: format.replace(":", "/") }}
      >
        <svg
          viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
          className="w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Fallback brand gradients */}
            <linearGradient id="brand-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0B1A10" />
              <stop offset="50%" stopColor="#14331C" />
              <stop offset="100%" stopColor="#050505" />
            </linearGradient>

            {/* Dark backing overlay for readability */}
            <linearGradient id="text-scrim" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#000000" stopOpacity="0.85" />
              <stop offset="35%" stopColor="#000000" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0.9" />
            </linearGradient>
          </defs>

          {/* Background Layer */}
          {backgroundImagePath ? (
            <image
              href={backgroundImagePath}
              width={dimensions.width}
              height={dimensions.height}
              preserveAspectRatio="xMidYMid slice"
            />
          ) : (
            <rect width={dimensions.width} height={dimensions.height} fill="url(#brand-grad)" />
          )}

          {/* Contrast Protection Scrim */}
          <rect width={dimensions.width} height={dimensions.height} fill="url(#text-scrim)" />

          {/* Brand Header */}
          <text
            x={50}
            y={80}
            fill="#2BD64F"
            fontSize="26"
            fontWeight="bold"
            letterSpacing="2"
            fontFamily="Poppins, sans-serif"
          >
            {content.brandName?.toUpperCase() || "BRACO OMNIPULSE"}
          </text>

          {/* Layout Template Variations */}
          {layoutTemplateId === "bottom_band" ? (
            // Bottom Band Layout
            <g>
              <rect
                x={0}
                y={dimensions.height - 380}
                width={dimensions.width}
                height={380}
                fill="#0A0D0B"
                fillOpacity="0.95"
              />
              <text
                x={50}
                y={dimensions.height - 280}
                fill="#FFFFFF"
                fontSize="42"
                fontWeight="800"
                className="indic-text"
              >
                {content.headline}
              </text>
              {content.subline && (
                <text
                  x={50}
                  y={dimensions.height - 220}
                  fill="#D4D4D4"
                  fontSize="22"
                  className="indic-text"
                >
                  {content.subline}
                </text>
              )}
            </g>
          ) : (
            // Centered Hero / Default Modern Layout
            <g>
              {/* Main Headline */}
              <text
                x={dimensions.width / 2}
                y={dimensions.height * 0.42}
                fill="#FFFFFF"
                fontSize="46"
                fontWeight="800"
                textAnchor="middle"
                className="indic-text"
              >
                {content.headline}
              </text>

              {/* Subline */}
              {content.subline && (
                <text
                  x={dimensions.width / 2}
                  y={dimensions.height * 0.52}
                  fill="#E0E0E0"
                  fontSize="24"
                  fontWeight="500"
                  textAnchor="middle"
                  className="indic-text"
                >
                  {content.subline}
                </text>
              )}

              {/* Call to Action Pill Button */}
              {content.cta && (
                <g>
                  <rect
                    x={dimensions.width / 2 - 160}
                    y={dimensions.height * 0.65}
                    width={320}
                    height={64}
                    rx={32}
                    fill="#2BD64F"
                  />
                  <text
                    x={dimensions.width / 2}
                    y={dimensions.height * 0.65 + 40}
                    fill="#000000"
                    fontSize="22"
                    fontWeight="bold"
                    textAnchor="middle"
                    className="indic-text"
                  >
                    {content.cta}
                  </text>
                </g>
              )}
            </g>
          )}

          {/* Mandatory Disclosure Backing & Text (Always rendered legibly) */}
          {content.disclosure && (
            <g>
              <rect
                x={30}
                y={dimensions.height - 70}
                width={dimensions.width - 60}
                height={46}
                rx={10}
                fill="#000000"
                fillOpacity="0.8"
              />
              <text
                x={50}
                y={dimensions.height - 42}
                fill="#A3A3A3"
                fontSize="15"
                fontFamily="sans-serif"
                className="indic-text"
              >
                {content.disclosure}
              </text>
            </g>
          )}

          {/* Prominent Diagonal Watermark for Unapproved Drafts */}
          {!isApproved && (
            <g transform={`rotate(-35 ${dimensions.width / 2} ${dimensions.height / 2})`}>
              <rect
                x={dimensions.width / 2 - 400}
                y={dimensions.height / 2 - 40}
                width={800}
                height={80}
                fill="#FF5C5C"
                fillOpacity="0.85"
              />
              <text
                x={dimensions.width / 2}
                y={dimensions.height / 2 + 15}
                fill="#FFFFFF"
                fontSize="38"
                fontWeight="900"
                textAnchor="middle"
                letterSpacing="4"
                fontFamily="Poppins, sans-serif"
              >
                UNAPPROVED DRAFT
              </text>
            </g>
          )}
        </svg>
      </div>

      {/* Export Action */}
      <PillButton
        variant="white"
        size="md"
        onClick={handleExportPng}
        icon={<Download className="w-4 h-4 text-black" />}
      >
        Export PNG ({isApproved ? "Clean" : "Watermarked Draft"})
      </PillButton>
    </div>
  );
}
