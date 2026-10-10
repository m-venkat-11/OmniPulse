"use client";

import React, { useState, useMemo } from "react";
import {
  Share2, ZoomIn, ZoomOut, RotateCcw, Maximize2, Filter,
  Info, CheckCircle2, AlertTriangle, ArrowRight, Database,
  Building2, Package, Megaphone, UserCheck, ShieldCheck,
  XCircle, Lock, Hash, Sparkles, ExternalLink
} from "lucide-react";

export interface GraphNode {
  id: string;
  label: string;
  subLabel: string;
  type: "brand" | "product" | "claim" | "official" | "lab" | "ad" | "conflict";
  color: string;
  status?: string;
  val: number;
  metadata?: any;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  label: string;
  status: "normal" | "conflict" | "verified";
}

interface ClaimEvidenceGraphProps {
  campaign?: any;
  claims?: any[];
  variants?: any[];
  findings?: any[];
  onSelectClaim?: (claimId: string) => void;
}

export const ClaimEvidenceGraph: React.FC<ClaimEvidenceGraphProps> = ({
  campaign,
  claims = [],
  variants = [],
  findings = [],
  onSelectClaim,
}) => {
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  const brandName = campaign?.brand_name || "Rasa Foods";
  const productName = campaign?.product_name || "Rasa Oats Festive Pack";

  // Build dynamic nodes and edges from input data
  const { nodes, edges } = useMemo(() => {
    const nodesList: GraphNode[] = [
      {
        id: "brand-main",
        label: brandName,
        subLabel: "Brand Owner",
        type: "brand",
        color: "#183B2B",
        val: 28,
        metadata: { role: "Origin Brand Entity", workspace: "ws-default" }
      },
      {
        id: "prod-main",
        label: productName.length > 24 ? productName.slice(0, 22) + "..." : productName,
        subLabel: "Audited Product Entity",
        type: "product",
        color: "#3D5AFE",
        val: 26,
        metadata: { category: "Packaged Foods & Nutrition" }
      }
    ];

    const edgesList: GraphEdge[] = [
      {
        id: "edge-brand-prod",
        source: "brand-main",
        target: "prod-main",
        label: "Manufactures / Brands",
        status: "verified"
      }
    ];

    // Add Claim Atom Nodes
    const activeClaims = claims.length > 0 ? claims.slice(0, 5) : [
      { id: "cl-1", claim_text: "Provides 100% daily iron needs with milk", evidence_status: "supported", claim_type: "product_fact", qualifications: "NABL Lab Certificate #2026-F09" },
      { id: "cl-2", claim_text: "100% whole grain rolled oats with zero sugar", evidence_status: "supported", claim_type: "product_fact", qualifications: "Brand Spec v2.4" },
      { id: "cl-3", claim_text: "100% cures morning acidity & fatigue", evidence_status: "contradicted", claim_type: "prohibited_claim", qualifications: "Prohibited by ASCI Food Code 4.2" }
    ];

    activeClaims.forEach((cl: any, idx: number) => {
      const isContradicted = cl.evidence_status === "contradicted" || cl.evidence_status === "unsupported";
      const claimColor = isContradicted ? "#FF2FA3" : cl.evidence_status === "supported" ? "#00FF87" : "#FF8A1E";

      nodesList.push({
        id: cl.id || `cl-${idx}`,
        label: cl.claim_text?.length > 24 ? cl.claim_text.slice(0, 22) + "..." : cl.claim_text,
        subLabel: `Claim Atom • ${cl.evidence_status?.toUpperCase()}`,
        type: isContradicted ? "conflict" : "claim",
        color: claimColor,
        status: cl.evidence_status,
        val: 22,
        metadata: { ...cl }
      });

      edgesList.push({
        id: `edge-prod-cl-${idx}`,
        source: "prod-main",
        target: cl.id || `cl-${idx}`,
        label: "Asserts Fact Atom",
        status: isContradicted ? "conflict" : "normal"
      });

      // Evidence node for this claim
      if (cl.qualifications || cl.evidence_status === "supported") {
        const evId = `ev-${cl.id || idx}`;
        nodesList.push({
          id: evId,
          label: cl.qualifications?.length > 22 ? cl.qualifications.slice(0, 20) + "..." : (cl.qualifications || "Evidence Document"),
          subLabel: isContradicted ? "Violates Rule / Code" : "NABL Lab / Scientific Spec",
          type: isContradicted ? "conflict" : "lab",
          color: isContradicted ? "#FF2FA3" : "#00E5FF",
          val: 16,
          metadata: { evidence: cl.qualifications, status: cl.evidence_status }
        });

        edgesList.push({
          id: `edge-cl-ev-${idx}`,
          source: cl.id || `cl-${idx}`,
          target: evId,
          label: isContradicted ? "Contradicts Standard" : "Grounded by Evidence",
          status: isContradicted ? "conflict" : "verified"
        });
      }
    });

    // Add Regional Creative Variant Nodes
    const activeVariants = variants.length > 0 ? variants.slice(0, 4) : [
      { id: "var-te", target_language: "Telugu", dialect: "Telangana", status: "approved", regional_adaptation: "పండుగ సీజన్‌లో 100% రోజువారీ ఐరన్ శక్తి" },
      { id: "var-hi", target_language: "Hindi", dialect: "Standard", status: "approved", regional_adaptation: "त्योहारों में 100% आयरन की शक्ति और ताजगी" }
    ];

    activeVariants.forEach((v: any, vIdx: number) => {
      const isApproved = v.status === "approved";
      const varId = v.id || `var-${vIdx}`;
      nodesList.push({
        id: varId,
        label: `${v.target_language} Ad (${v.dialect || "Native"})`,
        subLabel: `v${v.version_number || 1} • ${v.status?.toUpperCase()}`,
        type: "ad",
        color: isApproved ? "#00FF87" : "#FF8A1E",
        val: 20,
        metadata: { ...v }
      });

      edgesList.push({
        id: `edge-cl-var-${vIdx}`,
        source: activeClaims[0]?.id || "cl-0",
        target: varId,
        label: `Adapted for ${v.target_language}`,
        status: isApproved ? "verified" : "normal"
      });
    });

    return { nodes: nodesList, edges: edgesList };
  }, [campaign, claims, variants, findings]);

  const selectedNode = (selectedNodeId ? nodes.find(n => n.id === selectedNodeId) : null) || nodes[2] || nodes[0] || null;
  const setSelectedNode = (node: GraphNode) => setSelectedNodeId(node.id);

  // Node position layout
  const getNodeCoordinates = (nodeId: string, index: number, total: number) => {
    if (nodeId === "brand-main") return { x: 70, y: 220 };
    if (nodeId === "prod-main") return { x: 210, y: 220 };

    // Claims column at x = 390
    const claimNodes = nodes.filter(n => n.type === "claim" || n.type === "conflict");
    const claimIdx = claimNodes.findIndex(n => n.id === nodeId);
    if (claimIdx !== -1) {
      const spacing = Math.min(80, 360 / (claimNodes.length || 1));
      return { x: 390, y: 90 + claimIdx * spacing };
    }

    // Evidence column at x = 580
    const evNodes = nodes.filter(n => n.type === "lab" || (n.type === "conflict" && n.id.startsWith("ev-")));
    const evIdx = evNodes.findIndex(n => n.id === nodeId);
    if (evIdx !== -1) {
      const spacing = Math.min(75, 340 / (evNodes.length || 1));
      return { x: 580, y: 80 + evIdx * spacing };
    }

    // Regional Ads column at x = 740
    const adNodes = nodes.filter(n => n.type === "ad");
    const adIdx = adNodes.findIndex(n => n.id === nodeId);
    if (adIdx !== -1) {
      const spacing = Math.min(85, 360 / (adNodes.length || 1));
      return { x: 740, y: 100 + adIdx * spacing };
    }

    return { x: 400, y: 200 };
  };

  const filteredNodes = nodes.filter(n => {
    if (activeFilter === "all") return true;
    if (activeFilter === "claims") return n.type === "claim" || n.type === "conflict";
    if (activeFilter === "evidence") return n.type === "lab" || n.type === "official";
    if (activeFilter === "ads") return n.type === "ad";
    if (activeFilter === "conflicts") return n.type === "conflict";
    return true;
  });

  return (
    <div
      style={{
        backgroundColor: "#11141A",
        color: "#FFFFFF",
        borderRadius: "24px",
        border: "1px solid #232834",
        padding: "24px",
        position: "relative",
        overflow: "hidden",
        boxShadow: "0 20px 40px rgba(0,0,0,0.3)"
      }}
    >
      {/* Glow Effects */}
      <div style={{ position: "absolute", top: 0, right: 0, width: "320px", height: "320px", backgroundColor: "rgba(16, 185, 129, 0.08)", borderRadius: "50%", filter: "blur(60px)", pointerEvents: "none" }}></div>
      <div style={{ position: "absolute", bottom: 0, left: 0, width: "320px", height: "320px", backgroundColor: "rgba(59, 130, 246, 0.08)", borderRadius: "50%", filter: "blur(60px)", pointerEvents: "none" }}></div>

      {/* Graph Toolbar */}
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "16px", marginBottom: "20px", paddingBottom: "16px", borderBottom: "1px solid rgba(255, 255, 255, 0.08)", position: "relative", zIndex: 10 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "#34D399" }}></span>
            <h3 style={{ fontSize: "18px", fontWeight: "800", color: "#FFFFFF", margin: 0, letterSpacing: "-0.01em" }}>
              Claim Evidence Graph
            </h3>
            <span style={{ fontSize: "10px", fontFamily: "monospace", padding: "2px 8px", borderRadius: "6px", backgroundColor: "rgba(16, 185, 129, 0.2)", color: "#6EE7B7", fontWeight: "700", border: "1px solid rgba(16, 185, 129, 0.3)" }}>
              AD-EVIDENCE LAYER
            </span>
          </div>
          <p style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.6)", marginTop: "4px", margin: 0 }}>
            Real-time provenance graph connecting claims, evidence sources, and regional adaptations.
          </p>
        </div>

        {/* Filter Pills */}
        <div style={{ display: "flex", alignItems: "center", gap: "6px", backgroundColor: "rgba(255, 255, 255, 0.06)", padding: "4px", borderRadius: "10px", border: "1px solid rgba(255, 255, 255, 0.1)" }}>
          {["all", "claims", "evidence", "ads", "conflicts"].map(f => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              style={{
                backgroundColor: activeFilter === f ? "#10B981" : "transparent",
                color: activeFilter === f ? "#0C0E14" : "rgba(255, 255, 255, 0.7)",
                borderRadius: "8px",
                padding: "4px 12px",
                fontSize: "11px",
                fontWeight: "700",
                textTransform: "capitalize",
                border: "none",
                cursor: "pointer",
                transition: "all 0.2s ease"
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Main Graph Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 3fr) minmax(0, 1.2fr)", gap: "20px", position: "relative", zIndex: 10 }}>

        {/* SVG Interactive Visualizer */}
        <div
          style={{
            backgroundColor: "#0C0E14",
            borderRadius: "16px",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            position: "relative",
            overflow: "hidden",
            height: "440px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <svg className="w-full h-full" viewBox="0 0 860 420" preserveAspectRatio="xMidYMid meet">
            <defs>
              <linearGradient id="grad-line-normal" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#3D5AFE" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#00FF87" stopOpacity="0.6" />
              </linearGradient>
              <linearGradient id="grad-line-conflict" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#FF2FA3" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#FF2FA3" stopOpacity="0.3" />
              </linearGradient>
            </defs>

            {/* Edges */}
            {edges.map(edge => {
              const srcNode = nodes.find(n => n.id === edge.source);
              const tgtNode = nodes.find(n => n.id === edge.target);
              if (!srcNode || !tgtNode) return null;

              const srcCoord = getNodeCoordinates(srcNode.id, 0, nodes.length);
              const tgtCoord = getNodeCoordinates(tgtNode.id, 0, nodes.length);

              const isConflict = edge.status === "conflict";

              return (
                <g key={edge.id} className="transition-all duration-300">
                  <line
                    x1={srcCoord.x}
                    y1={srcCoord.y}
                    x2={tgtCoord.x}
                    y2={tgtCoord.y}
                    stroke={isConflict ? "url(#grad-line-conflict)" : "url(#grad-line-normal)"}
                    strokeWidth={isConflict ? 2.5 : 1.5}
                    strokeDasharray={isConflict ? "5,5" : "none"}
                    className={isConflict ? "animate-pulse" : ""}
                  />
                  {/* Midpoint Label */}
                  <text
                    x={(srcCoord.x + tgtCoord.x) / 2}
                    y={(srcCoord.y + tgtCoord.y) / 2 - 4}
                    fill={isConflict ? "#FF2FA3" : "rgba(255,255,255,0.4)"}
                    fontSize="9"
                    fontFamily="monospace"
                    textAnchor="middle"
                  >
                    {edge.label}
                  </text>
                </g>
              );
            })}

            {/* Nodes */}
            {filteredNodes.map((node, i) => {
              const coord = getNodeCoordinates(node.id, i, nodes.length);
              const isSelected = selectedNode?.id === node.id;
              const isConflict = node.type === "conflict";

              return (
                <g
                  key={node.id}
                  onClick={() => setSelectedNode(node)}
                  className="cursor-pointer group"
                  transform={`translate(${coord.x}, ${coord.y})`}
                >
                  {/* Outer pulse circle if selected */}
                  {isSelected && (
                    <circle
                      r={node.val + 6}
                      fill="none"
                      stroke={node.color}
                      strokeWidth="2"
                      opacity="0.8"
                      className="animate-ping"
                    />
                  )}

                  {/* Main Node Circle */}
                  <circle
                    r={node.val}
                    fill="#151A20"
                    stroke={node.color}
                    strokeWidth={isSelected ? 3 : 2}
                    className="transition-transform group-hover:scale-110 shadow-lg"
                  />

                  {/* Icon Indicator inside circle */}
                  <circle
                    r={node.val - 8}
                    fill={node.color}
                    opacity="0.2"
                  />

                  {/* Text Label */}
                  <text
                    y={node.val + 14}
                    fill="#FFFFFF"
                    fontSize="11"
                    fontWeight="600"
                    textAnchor="middle"
                    className="select-none"
                  >
                    {node.label}
                  </text>
                  <text
                    y={node.val + 26}
                    fill="rgba(255,255,255,0.5)"
                    fontSize="9"
                    textAnchor="middle"
                    className="select-none"
                  >
                    {node.subLabel}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Canvas Footer Legend */}
          <div
            style={{
              position: "absolute",
              bottom: "12px",
              left: "16px",
              display: "flex",
              alignItems: "center",
              gap: "16px",
              fontSize: "11px",
              color: "rgba(255, 255, 255, 0.7)",
              backgroundColor: "rgba(12, 14, 20, 0.85)",
              padding: "6px 14px",
              borderRadius: "8px",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              backdropFilter: "blur(6px)"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#00FF87", display: "inline-block" }}></span>
              <span>Verified Fact</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#FF2FA3", display: "inline-block" }}></span>
              <span>Cross-Source Conflict</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#00E5FF", display: "inline-block" }}></span>
              <span>Evidence Grounding</span>
            </div>
          </div>
        </div>

        {/* Node Inspector Side Panel */}
        <div
          style={{
            backgroundColor: "#0C0E14",
            borderRadius: "16px",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between"
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: "8px", marginBottom: "12px", borderBottom: "1px solid rgba(255, 255, 255, 0.08)" }}>
              <span style={{ fontSize: "10px", fontWeight: "700", color: "rgba(255, 255, 255, 0.4)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                Node Inspector
              </span>
              {selectedNode && (
                <span
                  style={{
                    fontSize: "10px",
                    fontWeight: "800",
                    padding: "2px 8px",
                    borderRadius: "4px",
                    textTransform: "uppercase",
                    backgroundColor: `${selectedNode.color}25`,
                    color: selectedNode.color,
                    border: `1px solid ${selectedNode.color}40`
                  }}
                >
                  {selectedNode.type}
                </span>
              )}
            </div>

            {selectedNode ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "12px" }}>
                <div>
                  <h4 style={{ fontWeight: "800", color: "#FFFFFF", fontSize: "14px", margin: 0 }}>{selectedNode.label}</h4>
                  <p style={{ fontSize: "11px", color: "rgba(255, 255, 255, 0.5)", margin: "2px 0 0" }}>{selectedNode.subLabel}</p>
                </div>

                <div style={{ backgroundColor: "rgba(255, 255, 255, 0.05)", padding: "12px", borderRadius: "10px", border: "1px solid rgba(255, 255, 255, 0.06)", display: "flex", flexDirection: "column", gap: "8px" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "11px" }}>
                    <span style={{ color: "rgba(255, 255, 255, 0.4)" }}>Status:</span>
                    <span style={{ fontWeight: "700", color: "#34D399", textTransform: "capitalize" }}>
                      {selectedNode.status || "Active Entity"}
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "11px" }}>
                    <span style={{ color: "rgba(255, 255, 255, 0.4)" }}>Entity ID:</span>
                    <span style={{ fontFamily: "monospace", color: "rgba(255, 255, 255, 0.7)" }}>{selectedNode.id}</span>
                  </div>
                </div>

                {selectedNode.metadata && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px", paddingTop: "4px" }}>
                    <span style={{ fontSize: "10px", fontWeight: "700", color: "rgba(255, 255, 255, 0.5)" }}>Grounding Metadata</span>
                    <div style={{ fontSize: "11px", color: "rgba(255, 255, 255, 0.8)", backgroundColor: "rgba(255, 255, 255, 0.05)", padding: "10px", borderRadius: "8px", border: "1px solid rgba(255, 255, 255, 0.06)", lineHeight: "1.4", fontFamily: "monospace" }}>
                      {selectedNode.metadata.qualifications || selectedNode.metadata.regional_adaptation || selectedNode.metadata.role || "Linked in Campaign Evidence Graph"}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.4)", padding: "24px 0", textAlign: "center" }}>Click any node to inspect details.</p>
            )}
          </div>

          <div style={{ paddingTop: "16px", borderTop: "1px solid rgba(255, 255, 255, 0.08)", fontSize: "10px", color: "rgba(255, 255, 255, 0.4)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span>Graph ID: CEG-2026-OMNI</span>
            <span style={{ color: "#34D399", display: "flex", alignItems: "center", gap: "4px" }}>
              <CheckCircle2 size={12} /> Sync Active
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};
