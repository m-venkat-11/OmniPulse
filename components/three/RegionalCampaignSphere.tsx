"use client";

import React, { useRef, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";

interface RegionalCampaignSphereProps {
  className?: string;
  size?: number;
  interactive?: boolean;
}

// Static SVG fallback for reduced-motion and non-WebGL environments
export function SphereFallback({ className }: { className?: string }) {
  return (
    <div className={cn("relative flex items-center justify-center", className)}>
      <svg
        viewBox="0 0 400 400"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full max-w-md opacity-90"
        aria-hidden="true"
        role="img"
      >
        <defs>
          <radialGradient id="sphereGrad" cx="40%" cy="35%" r="60%">
            <stop offset="0%" stopColor="#DCE5D9" stopOpacity="0.6" />
            <stop offset="60%" stopColor="#183B2B" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#183B2B" stopOpacity="0.02" />
          </radialGradient>
          <radialGradient id="rimLight" cx="80%" cy="70%" r="50%">
            <stop offset="0%" stopColor="#B39A67" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#B39A67" stopOpacity="0" />
          </radialGradient>
          <filter id="softBlur">
            <feGaussianBlur stdDeviation="1.5" />
          </filter>
        </defs>

        {/* Outer glow ring */}
        <circle cx="200" cy="200" r="175" fill="url(#rimLight)" />

        {/* Main sphere */}
        <circle cx="200" cy="200" r="150" fill="url(#sphereGrad)" stroke="#183B2B" strokeWidth="0.5" strokeOpacity="0.15" />

        {/* Meridian lines (longitude) */}
        {[-60, -30, 0, 30, 60].map((angle, i) => {
          const rx = Math.abs(Math.cos((angle * Math.PI) / 180)) * 150;
          return (
            <ellipse
              key={i}
              cx="200" cy="200"
              rx={rx < 8 ? 8 : rx} ry="150"
              fill="none"
              stroke="#183B2B"
              strokeWidth="0.6"
              strokeOpacity="0.18"
              transform={`rotate(${angle}, 200, 200)`}
            />
          );
        })}

        {/* Parallel lines (latitude) */}
        {[-100, -60, -20, 20, 60, 100].map((offset, i) => {
          const r = Math.sqrt(Math.max(0, 150 * 150 - offset * offset));
          return (
            <ellipse
              key={i}
              cx="200" cy={200 + offset}
              rx={r} ry={r * 0.28}
              fill="none"
              stroke="#183B2B"
              strokeWidth="0.5"
              strokeOpacity="0.14"
            />
          );
        })}

        {/* Brass accent arc */}
        <path
          d="M 90,140 Q 200,60 310,140"
          fill="none"
          stroke="#B39A67"
          strokeWidth="1.5"
          strokeOpacity="0.55"
          strokeLinecap="round"
        />
        <path
          d="M 95,260 Q 200,340 305,260"
          fill="none"
          stroke="#B39A67"
          strokeWidth="1.5"
          strokeOpacity="0.4"
          strokeLinecap="round"
        />

        {/* Region markers */}
        {[
          { x: 148, y: 175, label: "हिं" },
          { x: 220, y: 195, label: "తె" },
          { x: 175, y: 220, label: "த" },
          { x: 250, y: 165, label: "ಕ" },
          { x: 165, y: 150, label: "ਪੰ" },
        ].map((m, i) => (
          <g key={i}>
            <circle cx={m.x} cy={m.y} r="10" fill="#183B2B" fillOpacity="0.06" stroke="#B39A67" strokeWidth="0.8" strokeOpacity="0.5" />
            <text x={m.x} y={m.y + 4.5} textAnchor="middle" fill="#183B2B" fontSize="8" fontFamily="sans-serif" opacity="0.75">
              {m.label}
            </text>
          </g>
        ))}

        {/* Highlight specular */}
        <ellipse cx="162" cy="148" rx="38" ry="22" fill="white" fillOpacity="0.12" transform="rotate(-20 162 148)" />

        {/* Brass equator ring */}
        <ellipse cx="200" cy="200" rx="150" ry="38" fill="none" stroke="#B39A67" strokeWidth="1" strokeOpacity="0.30" />
      </svg>
    </div>
  );
}

// Canvas-based 3D sphere (no Three.js dependency, pure canvas for lightweight rendering)
export function RegionalCampaignSphere({ className, size = 480, interactive = true }: RegionalCampaignSphereProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const rotationRef = useRef({ x: 0.3, y: 0, vx: 0, vy: 0.003 });
  const mouseRef = useRef({ active: false, x: 0, y: 0 });

  // Region markers (spherical coordinates: lat/lon in radians)
  const markers = [
    { lat: 0.3, lon: 0.5,  label: "తె", name: "Telugu" },
    { lat: -0.1, lon: 1.0, label: "த",  name: "Tamil" },
    { lat: 0.5, lon: 0.0,  label: "हिं", name: "Hindi" },
    { lat: 0.2, lon: 0.9,  label: "ಕ",  name: "Kannada" },
    { lat: 0.6, lon: -0.3, label: "ਪੰ", name: "Punjabi" },
    { lat: -0.3, lon: 0.4, label: "মা", name: "Malayalam" },
  ];

  const project = useCallback(
    (lat: number, lon: number, rx: number, ry: number, R: number, cx: number, cy: number) => {
      const x = R * Math.cos(lat) * Math.sin(lon + ry);
      const y = R * Math.sin(lat) * Math.cos(rx) - R * Math.cos(lat) * Math.cos(lon + ry) * Math.sin(rx);
      const z = R * Math.sin(lat) * Math.sin(rx) + R * Math.cos(lat) * Math.cos(lon + ry) * Math.cos(rx);
      return { px: cx + x, py: cy - y, z };
    },
    []
  );

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    const cx = W / 2;
    const cy = H / 2;
    const R = W * 0.38;
    const { x: rx, y: ry } = rotationRef.current;

    ctx.clearRect(0, 0, W, H);

    // Outer glow
    const glow = ctx.createRadialGradient(cx - R * 0.15, cy - R * 0.15, R * 0.1, cx, cy, R * 1.3);
    glow.addColorStop(0, "rgba(220,229,217,0.12)");
    glow.addColorStop(0.6, "rgba(179,154,103,0.06)");
    glow.addColorStop(1, "rgba(24,59,43,0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(cx, cy, R * 1.3, 0, Math.PI * 2);
    ctx.fill();

    // Sphere base
    const sphereGrad = ctx.createRadialGradient(cx - R * 0.25, cy - R * 0.3, R * 0.05, cx, cy, R);
    sphereGrad.addColorStop(0, "rgba(220,229,217,0.22)");
    sphereGrad.addColorStop(0.4, "rgba(24,59,43,0.06)");
    sphereGrad.addColorStop(1, "rgba(24,59,43,0.03)");
    ctx.fillStyle = sphereGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.fill();

    // Sphere edge
    ctx.strokeStyle = "rgba(24,59,43,0.12)";
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.stroke();

    // Longitude lines
    const longitudes = 12;
    for (let i = 0; i < longitudes; i++) {
      const lon = (i / longitudes) * Math.PI * 2;
      ctx.beginPath();
      ctx.strokeStyle = "rgba(24,59,43,0.13)";
      ctx.lineWidth = 0.5;
      const steps = 60;
      let started = false;
      for (let j = 0; j <= steps; j++) {
        const lat = -Math.PI / 2 + (j / steps) * Math.PI;
        const { px, py, z } = project(lat, lon, rx, ry, R, cx, cy);
        if (z > 0) {
          if (!started) { ctx.moveTo(px, py); started = true; }
          else ctx.lineTo(px, py);
        } else {
          started = false;
        }
      }
      ctx.stroke();
    }

    // Latitude lines
    const latitudes = 7;
    for (let i = 1; i < latitudes; i++) {
      const lat = -Math.PI / 2 + (i / latitudes) * Math.PI;
      ctx.beginPath();
      ctx.strokeStyle = "rgba(24,59,43,0.10)";
      ctx.lineWidth = 0.4;
      const steps = 80;
      let started = false;
      for (let j = 0; j <= steps; j++) {
        const lon = (j / steps) * Math.PI * 2;
        const { px, py, z } = project(lat, lon, rx, ry, R, cx, cy);
        if (z > 0) {
          if (!started) { ctx.moveTo(px, py); started = true; }
          else ctx.lineTo(px, py);
        } else {
          started = false;
        }
      }
      ctx.stroke();
    }

    // Brass accent arcs
    ctx.strokeStyle = "rgba(179,154,103,0.5)";
    ctx.lineWidth = 1.2;
    // Great circle arc (brass)
    ctx.beginPath();
    let bStarted = false;
    for (let j = 0; j <= 60; j++) {
      const t = j / 60;
      const lat = -0.6 + t * 1.2;
      const lon = Math.PI * 0.25;
      const { px, py, z } = project(lat, lon, rx, ry, R, cx, cy);
      if (z > -R * 0.2) {
        const alpha = Math.max(0, Math.min(1, (z + R * 0.2) / (R * 0.5)));
        ctx.globalAlpha = alpha * 0.6;
        if (!bStarted) { ctx.moveTo(px, py); bStarted = true; }
        else ctx.lineTo(px, py);
      } else {
        bStarted = false;
      }
    }
    ctx.stroke();
    ctx.globalAlpha = 1;

    // Region markers
    for (const m of markers) {
      const { px, py, z } = project(m.lat, m.lon, rx, ry, R, cx, cy);
      if (z < 0) continue;
      const alpha = Math.min(1, (z / R) * 2);

      // Pulse ring
      ctx.globalAlpha = alpha * 0.25;
      ctx.beginPath();
      ctx.arc(px, py, 9, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(179,154,103,0.3)";
      ctx.fill();

      // Dot
      ctx.globalAlpha = alpha * 0.9;
      ctx.beginPath();
      ctx.arc(px, py, 4, 0, Math.PI * 2);
      const dotGrad = ctx.createRadialGradient(px - 1, py - 1, 0.5, px, py, 4);
      dotGrad.addColorStop(0, "#DCE5D9");
      dotGrad.addColorStop(1, "#B39A67");
      ctx.fillStyle = dotGrad;
      ctx.fill();
      ctx.strokeStyle = "rgba(179,154,103,0.8)";
      ctx.lineWidth = 0.8;
      ctx.stroke();

      // Label
      ctx.globalAlpha = alpha * 0.85;
      ctx.font = "bold 9px sans-serif";
      ctx.fillStyle = "#183B2B";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(m.label, px, py + 0.5);

      ctx.globalAlpha = 1;
    }

    // Specular highlight
    const spec = ctx.createRadialGradient(cx - R * 0.3, cy - R * 0.35, 0, cx - R * 0.1, cy - R * 0.15, R * 0.4);
    spec.addColorStop(0, "rgba(255,255,255,0.13)");
    spec.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = spec;
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.fill();
  }, [project, markers]);

  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    let lastTime = 0;
    const tick = (time: number) => {
      const dt = Math.min((time - lastTime) / 16.67, 3);
      lastTime = time;
      if (!mouseRef.current.active) {
        rotationRef.current.y += 0.004 * dt;
      }
      draw();
      animRef.current = requestAnimationFrame(tick);
    };
    animRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animRef.current);
  }, [draw]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !interactive) return;

    const onMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      const my = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
      mouseRef.current = { active: true, x: mx, y: my };
      rotationRef.current.y += mx * 0.012;
      rotationRef.current.x = 0.3 + my * 0.18;
    };
    const onLeave = () => { mouseRef.current.active = false; };

    canvas.addEventListener("mousemove", onMove);
    canvas.addEventListener("mouseleave", onLeave);
    return () => {
      canvas.removeEventListener("mousemove", onMove);
      canvas.removeEventListener("mouseleave", onLeave);
    };
  }, [interactive]);

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      className={cn("block", className)}
      style={{ imageRendering: "auto" }}
      aria-label="Regional Campaign Sphere — interactive visualization of connected regional markets"
      role="img"
    />
  );
}
