"use client";

import React, { useState } from "react";
import { ArrowUpDown, Globe2 } from "lucide-react";
import { PillButton } from "@/components/design-system/PillButton";
import { useRouter } from "next/navigation";

export function QuickAdaptCard() {
  const router = useRouter();
  const [sourceLang, setSourceLang] = useState("English");
  const [targetLang, setTargetLang] = useState("Telugu");
  const [quickText, setQuickText] = useState("");

  const handleSwap = () => {
    const temp = sourceLang;
    setSourceLang(targetLang);
    setTargetLang(temp);
  };

  const handleAdapt = (e: React.FormEvent) => {
    e.preventDefault();
    const query = new URLSearchParams({
      sourceLang,
      targetLang,
      message: quickText,
    });
    router.push(`/campaigns/new?${query.toString()}`);
  };

  return (
    <div className="bg-[#161616] rounded-[26px] p-6 flex flex-col justify-between h-full shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-[#2A2A2A] text-white flex items-center justify-center text-xs">
            <Globe2 className="w-3.5 h-3.5" />
          </div>
          <h3 className="font-semibold text-sm text-[#E0E0E0]">Quick Adapt</h3>
        </div>
        <span className="text-[10px] text-[#A3A3A3] font-medium tracking-wide">
          REGIONAL STUDIO
        </span>
      </div>

      <form onSubmit={handleAdapt} className="flex flex-col gap-3">
        {/* Source Language Row */}
        <div className="bg-[#1C1C1C] rounded-[20px] p-3 flex items-center justify-between border border-[#262626]">
          <div className="flex flex-col">
            <span className="text-[10px] text-[#777777] uppercase font-bold tracking-wider">
              Source Language
            </span>
            <select
              value={sourceLang}
              onChange={(e) => setSourceLang(e.target.value)}
              className="bg-transparent text-white font-semibold text-sm outline-none cursor-pointer mt-0.5"
            >
              <option value="English" className="bg-[#1C1C1C]">English (en-IN)</option>
              <option value="Hindi" className="bg-[#1C1C1C]">Hindi (hi-IN)</option>
              <option value="Telugu" className="bg-[#1C1C1C]">Telugu (te-IN)</option>
              <option value="Tamil" className="bg-[#1C1C1C]">Tamil (ta-IN)</option>
              <option value="Bengali" className="bg-[#1C1C1C]">Bengali (bn-IN)</option>
              <option value="Marathi" className="bg-[#1C1C1C]">Marathi (mr-IN)</option>
              <option value="Kannada" className="bg-[#1C1C1C]">Kannada (kn-IN)</option>
              <option value="Malayalam" className="bg-[#1C1C1C]">Malayalam (ml-IN)</option>
              <option value="Gujarati" className="bg-[#1C1C1C]">Gujarati (gu-IN)</option>
            </select>
          </div>
          <span className="text-xs font-bold text-[#A3A3A3] px-2 py-1 rounded-md bg-[#252525]">
            SRC
          </span>
        </div>

        {/* Swap Button (matching the circular green swap from Finance_app_design.jpg) */}
        <div className="flex justify-center -my-2 relative z-10">
          <button
            type="button"
            onClick={handleSwap}
            className="w-8 h-8 rounded-full bg-[#2BD64F] text-black flex items-center justify-center shadow-md hover:scale-110 transition-transform cursor-pointer"
            title="Swap languages"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Target Language Row */}
        <div className="bg-[#1C1C1C] rounded-[20px] p-3 flex items-center justify-between border border-[#262626]">
          <div className="flex flex-col">
            <span className="text-[10px] text-[#777777] uppercase font-bold tracking-wider">
              Target Language
            </span>
            <select
              value={targetLang}
              onChange={(e) => setTargetLang(e.target.value)}
              className="bg-transparent text-white font-semibold text-sm outline-none cursor-pointer mt-0.5"
            >
              <option value="Telugu" className="bg-[#1C1C1C]">Telugu (te-IN)</option>
              <option value="Hindi" className="bg-[#1C1C1C]">Hindi (hi-IN)</option>
              <option value="Tamil" className="bg-[#1C1C1C]">Tamil (ta-IN)</option>
              <option value="Bengali" className="bg-[#1C1C1C]">Bengali (bn-IN)</option>
              <option value="Marathi" className="bg-[#1C1C1C]">Marathi (mr-IN)</option>
              <option value="Kannada" className="bg-[#1C1C1C]">Kannada (kn-IN)</option>
              <option value="Malayalam" className="bg-[#1C1C1C]">Malayalam (ml-IN)</option>
              <option value="Gujarati" className="bg-[#1C1C1C]">Gujarati (gu-IN)</option>
              <option value="English" className="bg-[#1C1C1C]">English (en-IN)</option>
            </select>
          </div>
          <span className="text-xs font-bold text-[#A3A3A3] px-2 py-1 rounded-md bg-[#252525]">
            TGT
          </span>
        </div>

        {/* Fast input */}
        <input
          type="text"
          value={quickText}
          onChange={(e) => setQuickText(e.target.value)}
          placeholder="Brief copy or headline to transcreate..."
          className="w-full bg-[#1C1C1C] text-xs text-white placeholder-[#666666] rounded-full px-4 py-2.5 border border-[#262626] focus:outline-none focus:border-[#333333]"
        />

        {/* White pill Adapt button */}
        <PillButton
          type="submit"
          variant="white"
          size="md"
          className="w-full mt-1"
        >
          Adapt Now
        </PillButton>
      </form>
    </div>
  );
}
