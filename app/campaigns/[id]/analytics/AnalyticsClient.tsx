"use client";

import React, { useState } from "react";
import { Card } from "@/components/design-system/Card";
import { PillButton } from "@/components/design-system/PillButton";
import { StatusChip } from "@/components/design-system/StatusChip";
import { EmptyState } from "@/components/design-system/EmptyState";
import { BarTrack } from "@/components/design-system/BarTrack";
import { importCsvAction } from "./actions";
import { useRouter } from "next/navigation";
import {
  FileSpreadsheet,
  Upload,
  CheckCircle2,
  AlertTriangle,
  Lock,
  ArrowRight,
  TrendingUp,
  Table,
  ShieldCheck,
  Clock,
  Layers,
} from "lucide-react";
import Link from "next/link";

interface AnalyticsClientProps {
  campaignId: string;
  campaignName: string;
  brandName: string;
  productName: string;
  allExperiments: Array<{
    id: string;
    hypothesis: string;
    primary_metric_name: string;
    is_locked: boolean;
    created_at: string;
  }>;
  activeExperiment: any | null;
  observations: any[];
  importBatches: any[];
}

export function AnalyticsClient({
  campaignId,
  campaignName,
  brandName,
  productName,
  allExperiments,
  activeExperiment,
  observations,
  importBatches,
}: AnalyticsClientProps) {
  const router = useRouter();
  const [csvContent, setCsvContent] = useState("");
  const [parsedHeaders, setParsedHeaders] = useState<string[]>([]);
  const [mapping, setMapping] = useState({
    variantColumn: "",
    impressionsColumn: "",
    clicksColumn: "",
    conversionsColumn: "",
  });

  const [isImporting, setIsImporting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [importResult, setImportResult] = useState<any>(null);

  // When CSV text changes, parse headers dynamically
  const handleCsvChange = (text: string) => {
    setCsvContent(text);
    const firstLine = text.trim().split("\n")[0];
    if (firstLine) {
      const headers = firstLine.split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
      setParsedHeaders(headers);

      // Auto-detect common names
      const varCol = headers.find((h) => /variant|creative|ad|version/i.test(h)) || headers[0] || "";
      const impCol = headers.find((h) => /impression|views|impressions/i.test(h)) || headers[1] || "";
      const clkCol = headers.find((h) => /click|clicks/i.test(h)) || headers[2] || "";
      const convCol = headers.find((h) => /conv|conversions/i.test(h)) || "";

      setMapping({
        variantColumn: varCol,
        impressionsColumn: impCol,
        clicksColumn: clkCol,
        conversionsColumn: convCol,
      });
    } else {
      setParsedHeaders([]);
    }
  };

  const handleImport = async () => {
    if (!activeExperiment?.id || !csvContent) return;
    if (!mapping.variantColumn || !mapping.impressionsColumn || !mapping.clicksColumn) {
      setErrorMsg("Please map variant, impressions, and clicks columns.");
      return;
    }

    setIsImporting(true);
    setErrorMsg("");

    try {
      const res = await importCsvAction({
        experimentId: activeExperiment.id,
        csvText: csvContent,
        columnMapping: mapping,
      });

      if (res.success && res.data) {
        setImportResult(res.data);
        setCsvContent("");
        router.refresh();
      } else {
        setErrorMsg(res.error || "CSV import failed.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred.");
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-[#2BD64F] uppercase tracking-wider">
            {brandName} • {productName}
          </span>
          <span className="text-xs text-[#777777]">•</span>
          <span className="text-[11px] text-[#A3A3A3]">Section 5 F10 Analytics</span>
        </div>
        <h1 className="text-2xl font-black text-white tracking-tight mt-1">
          Analytics & Dynamic CSV Import
        </h1>
        <p className="text-xs text-[#A3A3A3]">
          Strict measurement integrity: dynamic column mapping, provenance labels, and Wilson 95% intervals.
        </p>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-[18px] bg-[#2A1414] border border-[#FF5C5C]/30 text-xs text-[#FF8585] flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {importResult && (
        <div className="p-4 rounded-[18px] bg-[#142618] border border-[#2BD64F]/30 text-xs text-[#2BD64F] flex flex-col gap-1">
          <span className="font-bold">
            ✓ Successfully imported {importResult.importedCount} valid rows.
          </span>
          {importResult.rejectedCount > 0 && (
            <span className="text-[#FF8585]">
              {importResult.rejectedCount} row(s) rejected due to data validation errors.
            </span>
          )}
        </div>
      )}

      {activeExperiment ? (
        <div className="flex flex-col gap-6">
          {/* Active Experiment Info */}
          <div className="p-5 rounded-[22px] bg-[#161616] border border-[#222222] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-white">
                  Hypothesis: &ldquo;{activeExperiment.hypothesis}&rdquo;
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    activeExperiment.is_locked ? "bg-[#142618] text-[#2BD64F]" : "bg-[#252525] text-[#FFE234]"
                  }`}
                >
                  {activeExperiment.is_locked ? "Locked for Import" : "Unlocked (Lock required before import)"}
                </span>
              </div>
              <p className="text-xs text-[#A3A3A3] mt-1">
                Primary Metric: <strong className="text-white">{activeExperiment.primary_metric_name}</strong> • Rule: {activeExperiment.decision_rule}
              </p>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <select
                value={activeExperiment.id}
                onChange={(e) => router.push(`/campaigns/${campaignId}/analytics?experimentId=${e.target.value}`)}
                className="bg-[#1C1C1C] text-white text-xs rounded-full px-4 py-2 border border-[#262626] cursor-pointer"
              >
                {allExperiments.map((e) => (
                  <option key={e.id} value={e.id} className="bg-[#1C1C1C]">
                    {e.hypothesis.slice(0, 30)}...
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Observations Performance Table */}
          <Card title="Observed Variant Results & Wilson 95% Confidence" icon={<TrendingUp className="w-3.5 h-3.5 text-[#2BD64F]" />}>
            {observations.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#222222] text-[#777777]">
                      <th className="pb-3 font-semibold">Variant</th>
                      <th className="pb-3 font-semibold">Metric</th>
                      <th className="pb-3 font-semibold">Observed Rate</th>
                      <th className="pb-3 font-semibold">Wilson 95% Margin</th>
                      <th className="pb-3 font-semibold">Provenance Tag</th>
                      <th className="pb-3 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1F1F1F]">
                    {observations.map((obs) => (
                      <tr key={obs.id} className="py-2.5">
                        <td className="py-3 font-bold text-white">{obs.variant_label}</td>
                        <td className="py-3 text-[#A3A3A3]">{obs.metric_name}</td>
                        <td className="py-3 font-mono font-bold text-[#2BD64F] text-sm">
                          {obs.value.toFixed(2)}{obs.metric_unit}
                        </td>
                        <td className="py-3 font-mono text-[#A3A3A3]">
                          ±{obs.uncertainty.toFixed(2)}%
                        </td>
                        <td className="py-3">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#1C1C1C] border border-[#2BD64F]/30 text-[#2BD64F] uppercase tracking-wider">
                            {obs.provenance}
                          </span>
                        </td>
                        <td className="py-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#2A2416] text-[#FFE234] uppercase">
                            Interim
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-xs text-[#777777] py-6 text-center">
                No observations imported yet for this experiment. Paste or upload CSV metrics below.
              </p>
            )}
          </Card>

          {/* Dynamic CSV Importer Form */}
          <Card title="Dynamic CSV Import & Column Mapping" icon={<FileSpreadsheet className="w-3.5 h-3.5" />}>
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-[11px] font-bold text-[#777777] uppercase mb-1.5">
                  Paste Raw CSV Content *
                </label>
                <textarea
                  rows={4}
                  value={csvContent}
                  onChange={(e) => handleCsvChange(e.target.value)}
                  placeholder="variant,impressions,clicks,conversions&#10;Variant A (Control),10000,450,22&#10;Variant B (Challenger),10000,580,31"
                  className="w-full bg-[#1C1C1C] font-mono text-xs text-white rounded-[16px] p-3 border border-[#262626] focus:outline-none"
                />
              </div>

              {/* Dynamic Column Mapping */}
              {parsedHeaders.length > 0 && (
                <div className="p-4 rounded-[18px] bg-[#141414] border border-[#222222] flex flex-col gap-3">
                  <span className="text-xs font-bold text-white">
                    Dynamic Column Mapping (Found {parsedHeaders.length} columns)
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[10px] text-[#777777] uppercase font-bold mb-1">
                        Variant Identifier *
                      </label>
                      <select
                        value={mapping.variantColumn}
                        onChange={(e) => setMapping({ ...mapping, variantColumn: e.target.value })}
                        className="w-full bg-[#1C1C1C] text-white text-xs rounded-full px-3 py-2 border border-[#2A2A2A]"
                      >
                        {parsedHeaders.map((h) => (
                          <option key={h} value={h}>{h}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] text-[#777777] uppercase font-bold mb-1">
                        Impressions (Denominator) *
                      </label>
                      <select
                        value={mapping.impressionsColumn}
                        onChange={(e) => setMapping({ ...mapping, impressionsColumn: e.target.value })}
                        className="w-full bg-[#1C1C1C] text-white text-xs rounded-full px-3 py-2 border border-[#2A2A2A]"
                      >
                        {parsedHeaders.map((h) => (
                          <option key={h} value={h}>{h}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] text-[#777777] uppercase font-bold mb-1">
                        Clicks (Numerator) *
                      </label>
                      <select
                        value={mapping.clicksColumn}
                        onChange={(e) => setMapping({ ...mapping, clicksColumn: e.target.value })}
                        className="w-full bg-[#1C1C1C] text-white text-xs rounded-full px-3 py-2 border border-[#2A2A2A]"
                      >
                        {parsedHeaders.map((h) => (
                          <option key={h} value={h}>{h}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-2">
                <PillButton
                  variant="white"
                  size="md"
                  onClick={handleImport}
                  disabled={isImporting || !csvContent}
                  icon={<Upload className="w-4 h-4 text-black" />}
                >
                  {isImporting ? "Validating & Computing..." : "Import & Compute Provenance Metrics"}
                </PillButton>
              </div>
            </div>
          </Card>
        </div>
      ) : (
        <EmptyState
          icon={<FileSpreadsheet className="w-6 h-6" />}
          title="No experiments planned"
          description="Create and lock an experiment plan first before importing CSV metrics."
          actionLabel="Go to Experiment Planner"
          actionHref={`/campaigns/${campaignId}/experiment`}
        />
      )}
    </div>
  );
}
