"use client";

import dynamic from "next/dynamic";
import { SphereFallback } from "./RegionalCampaignSphere";
import { useEffect, useState } from "react";

const RegionalCampaignSphere = dynamic(
  () =>
    import("./RegionalCampaignSphere").then((m) => ({
      default: m.RegionalCampaignSphere,
    })),
  { ssr: false, loading: () => <SphereFallback className="w-full h-full" /> }
);

interface LazySphereProps {
  className?: string;
  size?: number;
  interactive?: boolean;
}

export function LazySphere({ className, size = 480, interactive = true }: LazySphereProps) {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  if (reducedMotion) {
    return <SphereFallback className={className} />;
  }

  return (
    <RegionalCampaignSphere className={className} size={size} interactive={interactive} />
  );
}
