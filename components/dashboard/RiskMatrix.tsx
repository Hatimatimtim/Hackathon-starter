"use client";

import React, { useState } from "react";
import { ShieldAlert, Info, AlertTriangle, CheckCircle2, Flame } from "lucide-react";
import { AuditRecord } from "@/lib/documentStore";

interface RiskMatrixProps {
  auditHistory: AuditRecord[];
  docsCount: number;
}

export default function RiskMatrix({ auditHistory, docsCount }: RiskMatrixProps) {
  const [selectedCell, setSelectedCell] = useState<{ r: number; c: number } | null>(null);

  const latestAudit = auditHistory.length > 0 ? auditHistory[0] : null;
  const highRisks = latestAudit ? latestAudit.highSeverity : 0;
  const flagged = latestAudit ? latestAudit.flagged : 0;
  const passed = latestAudit ? latestAudit.passed : 0;

  // NIST 5x5 matrix score map
  // Likelihood (1-5) x Impact (1-5)
  // Scores 1-4: LOW (Emerald), 5-11: MEDIUM (Amber), 12-25: HIGH/CRITICAL (Rose)

  function getCellRiskLevel(likelihood: number, impact: number): "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" {
    const score = likelihood * impact;
    if (score >= 16) return "CRITICAL";
    if (score >= 10) return "HIGH";
    if (score >= 5) return "MEDIUM";
    return "LOW";
  }

  function getCellBg(level: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL", count: number) {
    if (count > 0) {
      if (level === "CRITICAL") return "bg-rose-600/40 border-rose-500 text-rose-200 shadow-md shadow-rose-950";
      if (level === "HIGH") return "bg-rose-950/60 border-rose-600/60 text-rose-300";
      if (level === "MEDIUM") return "bg-amber-950/60 border-amber-600/60 text-amber-300";
      return "bg-emerald-950/60 border-emerald-600/60 text-emerald-300";
    }

    if (level === "CRITICAL") return "bg-rose-950/20 border-rose-900/40 text-slate-500 hover:border-rose-700/50";
    if (level === "HIGH") return "bg-rose-950/15 border-rose-900/30 text-slate-500 hover:border-rose-700/50";
    if (level === "MEDIUM") return "bg-amber-950/15 border-amber-900/30 text-slate-500 hover:border-amber-700/50";
    return "bg-slate-900/40 border-slate-800 text-slate-500 hover:border-emerald-700/50";
  }

  // Distribution of findings into cells for dynamic demonstration
  function getCountForCell(l: number, i: number): number {
    if (!latestAudit && docsCount === 0) return 0;

    // Critical high severity risks (e.g. L4, I4 or L5, I5)
    if (l === 4 && i === 4) return Math.ceil(highRisks * 0.6);
    if (l === 5 && i === 3) return Math.floor(highRisks * 0.4);

    // Medium flagged items
    if (l === 3 && i === 3) return Math.ceil(flagged * 0.5);
    if (l === 3 && i === 2) return Math.floor(flagged * 0.5);

    // Low passed checks
    if (l === 1 && i === 2) return Math.ceil(passed * 0.5);
    if (l === 1 && i === 1) return Math.floor(passed * 0.5);

    return 0;
  }

  const likelihoodLabels = ["5 - Almost Certain", "4 - Likely", "3 - Possible", "2 - Unlikely", "1 - Rare"];
  const impactLabels = ["1 - Negligible", "2 - Minor", "3 - Moderate", "4 - Major", "5 - Catastrophic"];

  return (
    <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-5">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Flame className="h-5 w-5 text-rose-400" />
            <span>NIST SP 800-30 Enterprise Risk Matrix</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Likelihood vs. Impact 5x5 threat distribution heatmap calculated from compliance audits.
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1 text-emerald-400">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Low (1-4)
          </span>
          <span className="flex items-center gap-1 text-amber-400">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500" /> Medium (5-9)
          </span>
          <span className="flex items-center gap-1 text-rose-400">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-500" /> High (10-25)
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* 5x5 Heatmap Grid */}
        <div className="lg:col-span-8 space-y-2">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 px-1">
            <span>LIKELIHOOD \ IMPACT</span>
            <span>NIST Risk Score Grid</span>
          </div>

          <div className="grid grid-cols-6 gap-1.5 text-xs">
            {/* Corner header */}
            <div className="h-10 flex items-center justify-center font-bold text-[10px] text-slate-500 bg-slate-950 rounded-lg">
              L \ I
            </div>

            {/* Impact column headers */}
            {impactLabels.map((imp, idx) => (
              <div
                key={idx}
                className="h-10 flex items-center justify-center font-semibold text-[10px] text-slate-300 bg-slate-900/80 rounded-lg text-center px-1"
              >
                {imp.split(" - ")[1]}
              </div>
            ))}

            {/* Matrix Rows */}
            {[5, 4, 3, 2, 1].map((l, lIdx) => (
              <React.Fragment key={l}>
                {/* Likelihood row label */}
                <div className="h-12 flex items-center justify-center font-semibold text-[10px] text-slate-300 bg-slate-900/80 rounded-lg px-1 text-center">
                  {likelihoodLabels[lIdx].split(" - ")[1]}
                </div>

                {/* 5 Impact Cells */}
                {[1, 2, 3, 4, 5].map((i) => {
                  const level = getCellRiskLevel(l, i);
                  const count = getCountForCell(l, i);
                  const cellClass = getCellBg(level, count);
                  const isSelected = selectedCell?.r === l && selectedCell?.c === i;

                  return (
                    <button
                      key={i}
                      onClick={() => setSelectedCell({ r: l, c: i })}
                      className={`h-12 rounded-xl border flex flex-col items-center justify-center transition p-1 ${cellClass} ${
                        isSelected ? "ring-2 ring-cyan-400 scale-105 z-10" : ""
                      }`}
                    >
                      <span className="font-extrabold text-xs">
                        {count > 0 ? count : l * i}
                      </span>
                      <span className="text-[9px] font-semibold opacity-75">
                        {count > 0 ? `${count} items` : `Score ${l * i}`}
                      </span>
                    </button>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Selected Cell Risk Detail Panel */}
        <div className="lg:col-span-4 glass-card rounded-2xl p-5 border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-cyan-400 border-b border-slate-800 pb-2">
            <Info className="h-4 w-4" />
            <h3 className="font-bold text-white text-xs">Risk Breakdown & Guidance</h3>
          </div>

          {selectedCell ? (
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Likelihood:</span>
                <span className="font-bold text-white">{likelihoodLabels[5 - selectedCell.r]}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Impact:</span>
                <span className="font-bold text-white">{impactLabels[selectedCell.c - 1]}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Calculated Score:</span>
                <span className="font-extrabold text-cyan-400">{selectedCell.r * selectedCell.c} / 25</span>
              </div>

              <div className="pt-2 border-t border-slate-800">
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  {selectedCell.r * selectedCell.c >= 16
                    ? "Critical risk tier requiring immediate CISO remediation plan, emergency policy patching, and continuous audit monitoring."
                    : selectedCell.r * selectedCell.c >= 10
                    ? "High priority vulnerability requiring corrective control documentation within 30 days."
                    : selectedCell.r * selectedCell.c >= 5
                    ? "Medium risk factor. Recommended policy review during regular audit cycle."
                    : "Low risk control. Satisfactorily mitigated or baseline standard requirement."}
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-6 text-slate-500 text-xs">
              <ShieldAlert className="h-8 w-8 mx-auto mb-2 text-slate-600" />
              <p>Click any cell in the 5x5 matrix to inspect NIST risk tier guidance.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
