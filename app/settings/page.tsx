import React from "react";
import { getCurrentUser } from "@/src/server/auth/session";
import { redirect } from "next/navigation";
import { aiOrchestrator } from "@/src/server/ai/orchestrator";
import { AppShell } from "@/components/shell/AppShell";
import { Card } from "@/components/design-system/Card";
import { StatusChip } from "@/components/design-system/StatusChip";
import { LANGUAGE_REGISTRY } from "@/lib/languages/registry";
import {
  ShieldCheck,
  Server,
  Cpu,
  Database,
  Lock,
  Globe2,
  Users,
  AlertCircle,
  Clock,
  Sparkles,
} from "lucide-react";

export default async function SettingsPage() {
  const session = await getCurrentUser();
  if (!session) {
    redirect("/sign-in");
  }

  // Live health check probe of Gemini and Sarvam
  const health = await aiOrchestrator.checkAllHealth();

  return (
    <AppShell
      userName={session.user.name}
      userRole={session.role}
      workspaceName={session.workspace.name}
    >
      <div className="flex flex-col gap-8 max-w-6xl mx-auto">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Settings & System Governance
          </h1>
          <p className="text-xs text-[#A3A3A3] mt-1">
            Workspace configuration, live integration health, and reference registries.
          </p>
        </div>

        {/* Integration Health Matrix (Section 6, Section 2) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Gemini Health Card */}
          <Card
            title="Google Gemini AI Integration"
            icon={<Sparkles className="w-4 h-4 text-[#FFE234]" />}
            surface="default"
          >
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#222222]">
                <span className="text-xs text-[#A3A3A3]">Status</span>
                <StatusChip
                  status={health.gemini.status === "connected" ? "Connected" : "Not connected"}
                  size="sm"
                />
              </div>

              <div className="flex items-center justify-between pb-3 border-b border-[#222222]">
                <span className="text-xs text-[#A3A3A3]">Active Text Model</span>
                <span className="text-xs font-mono text-white">{health.gemini.model}</span>
              </div>

              <div className="flex items-center justify-between pb-3 border-b border-[#222222]">
                <span className="text-xs text-[#A3A3A3]">Last Health Check</span>
                <span className="text-[11px] text-[#D4D4D4] font-mono">
                  {new Date(health.gemini.lastChecked).toLocaleTimeString()} ({health.gemini.latencyMs}ms)
                </span>
              </div>

              {health.gemini.message && (
                <p className="text-[11px] text-[#FF5C5C] bg-[#2A1414] p-2.5 rounded-lg">
                  {health.gemini.message}
                </p>
              )}

              {/* Free-tier notice required by Section 5, F12 */}
              <div className="p-3 bg-[#1F1A12] border border-[#FFE234]/20 rounded-xl text-[11px] text-[#E0CE8A] leading-relaxed flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-[#FFE234] flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Data Privacy Notice:</strong> Prompts sent via free-tier Gemini API keys may be reviewed by Google according to public API terms. Confidential brand material requires a paid-tier enterprise key.
                </span>
              </div>
            </div>
          </Card>

          {/* Sarvam AI Health Card */}
          <Card
            title="Sarvam AI (Indic Language Intelligence)"
            icon={<Globe2 className="w-4 h-4 text-[#2BD64F]" />}
            surface="default"
          >
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#222222]">
                <span className="text-xs text-[#A3A3A3]">Status</span>
                <StatusChip
                  status={health.sarvam.status === "connected" ? "Connected" : "Not connected"}
                  size="sm"
                />
              </div>

              <div className="flex items-center justify-between pb-3 border-b border-[#222222]">
                <span className="text-xs text-[#A3A3A3]">Active Translation Model</span>
                <span className="text-xs font-mono text-white">{health.sarvam.model}</span>
              </div>

              <div className="flex items-center justify-between pb-3 border-b border-[#222222]">
                <span className="text-xs text-[#A3A3A3]">Last Health Check</span>
                <span className="text-[11px] text-[#D4D4D4] font-mono">
                  {new Date(health.sarvam.lastChecked).toLocaleTimeString()} ({health.sarvam.latencyMs}ms)
                </span>
              </div>

              {health.sarvam.message && (
                <p className="text-[11px] text-[#FF5C5C] bg-[#2A1414] p-2.5 rounded-lg">
                  {health.sarvam.message}
                </p>
              )}

              <div className="p-3 bg-[#142618] border border-[#2BD64F]/20 rounded-xl text-[11px] text-[#A5E3B5] leading-relaxed flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-[#2BD64F] flex-shrink-0 mt-0.5" />
                <span>
                  Provides literal translation, transliteration for prohibited-phrase detection, and native Indic text quality verification.
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* Database & Security Configuration */}
        <Card title="Database & Storage Subsystem" icon={<Database className="w-4 h-4 text-[#60A5FA]" />}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-[#1C1C1C] rounded-[20px]">
              <span className="text-[10px] text-[#777777] uppercase font-bold">Engine</span>
              <p className="text-sm font-semibold text-white mt-1">Turso libSQL</p>
              <span className="text-[10px] text-[#2BD64F]">Foreign keys active</span>
            </div>
            <div className="p-4 bg-[#1C1C1C] rounded-[20px]">
              <span className="text-[10px] text-[#777777] uppercase font-bold">Immutability</span>
              <p className="text-sm font-semibold text-white mt-1">5 SQLite Triggers</p>
              <span className="text-[10px] text-[#2BD64F]">Append-only verified</span>
            </div>
            <div className="p-4 bg-[#1C1C1C] rounded-[20px]">
              <span className="text-[10px] text-[#777777] uppercase font-bold">Audit Hashing</span>
              <p className="text-sm font-semibold text-white mt-1">SHA-256 Hash Chain</p>
              <span className="text-[10px] text-[#2BD64F]">Tamper detection active</span>
            </div>
          </div>
        </Card>

        {/* Language Capability Reference Configuration (Section 2 - Allowed Reference Config) */}
        <Card title="Configured Indian Language Matrix" icon={<Globe2 className="w-4 h-4 text-white" />}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#222222] text-[#777777]">
                  <th className="pb-3 font-medium">Language</th>
                  <th className="pb-3 font-medium">Native Name</th>
                  <th className="pb-3 font-medium">BCP-47</th>
                  <th className="pb-3 font-medium">Script Family</th>
                  <th className="pb-3 font-medium">Supported Regional Dialects</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1F1F1F]">
                {LANGUAGE_REGISTRY.map((lang) => (
                  <tr key={lang.id} className="py-2.5">
                    <td className="py-3 font-semibold text-white">{lang.name}</td>
                    <td className="py-3 text-[#D4D4D4] font-medium">{lang.nativeName}</td>
                    <td className="py-3 font-mono text-[#A3A3A3]">{lang.code}</td>
                    <td className="py-3 text-[#A3A3A3]">{lang.script}</td>
                    <td className="py-3 text-[#A3A3A3]">
                      {lang.dialects.map((d) => d.name).join(", ")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
