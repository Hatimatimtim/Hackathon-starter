"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileCheck2,
  Play,
  Loader2,
  UploadCloud,
  Sparkles,
  Download,
  Sliders,
  FileSpreadsheet,
  FileText,
  Wand2,
  Copy,
  Check,
  X,
} from "lucide-react";
import { ComplianceReport, RuleCheck } from "@/app/api/compliance/route";

export default function CompliancePage() {
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<ComplianceReport | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [hasDocs, setHasDocs] = useState<boolean>(true);

  // AI Remediation Patch Modal State
  const [remediatingRule, setRemediatingRule] = useState<RuleCheck | null>(null);
  const [patchLoading, setPatchLoading] = useState(false);
  const [patchContent, setPatchContent] = useState<string>("");
  const [copied, setCopied] = useState(false);

  async function checkInitialStatus() {
    try {
      const res = await fetch("/api/compliance");
      if (res.ok) {
        const data = await res.json();
        if (data.documentsUploaded === 0) {
          setHasDocs(false);
        }
      }
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    checkInitialStatus();
  }, []);

  async function runAudit() {
    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/compliance", {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to execute compliance audit.");
      }

      setReport(data.report);
      setHasDocs(true);
    } catch (err: any) {
      setErrorMsg(err.message || "Audit execution failed.");
    } finally {
      setLoading(false);
    }
  }

  function downloadTextReport() {
    if (!report) return;

    let content = `====================================================\n`;
    content += `KCAI AI ENTERPRISE COMPLIANCE AUDIT REPORT\n`;
    content += `Generated: ${new Date(report.auditTimestamp).toLocaleString()}\n`;
    content += `Overall Compliance Rating: ${report.overallScore}%\n`;
    content += `Documents Analyzed: ${report.documentsAnalyzed}\n`;
    content += `Passed Controls: ${report.passedChecks} / ${report.totalChecks}\n`;
    content += `====================================================\n\n`;
    content += `EXECUTIVE SUMMARY:\n${report.summary}\n\n`;
    content += `DETAILED RULE EVALUATION:\n`;

    report.rules.forEach((r, idx) => {
      content += `\n[${idx + 1}] ${r.id} - ${r.title} (${r.category})\n`;
      content += `    Status: ${r.status} | Severity: ${r.severity}\n`;
      content += `    Evidence: "${r.evidence}"\n`;
      content += `    Recommendation: ${r.remediation}\n`;
    });

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `KCAI_Compliance_Report_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function downloadCSVReport() {
    if (!report) return;

    let csv = `Rule ID,Framework,Title,Status,Severity,Evidence,Remediation\n`;
    report.rules.forEach((r) => {
      const cleanEv = `"${r.evidence.replace(/"/g, '""')}"`;
      const cleanRem = `"${r.remediation.replace(/"/g, '""')}"`;
      csv += `${r.id},${r.category},"${r.title}",${r.status},${r.severity},${cleanEv},${cleanRem}\n`;
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `KCAI_Compliance_Matrix_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function printPDFReport() {
    if (!report) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>KCAI Executive Compliance Audit Certificate</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; color: #1e293b; line-height: 1.5; }
            .header { border-bottom: 3px solid #0284c7; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: center; }
            .title { font-size: 24px; font-weight: bold; color: #0f172a; }
            .subtitle { font-size: 14px; color: #64748b; margin-top: 5px; }
            .score-box { background: #f0f9ff; border: 2px solid #0284c7; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 30px; }
            .score { font-size: 48px; font-weight: 800; color: #0284c7; }
            .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 30px; }
            .card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; p: 15px; padding: 15px; text-align: center; }
            .card-num { font-size: 24px; font-weight: bold; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 12px; }
            th, td { border: 1px solid #cbd5e1; padding: 10px; text-align: left; }
            th { background: #f1f5f9; font-weight: bold; }
            .pass { color: #16a34a; font-weight: bold; }
            .flagged { color: #dc2626; font-weight: bold; }
            .signatures { margin-top: 50px; display: flex; justify-content: space-between; padding-top: 30px; border-top: 1px solid #cbd5e1; }
            .sig-box { width: 45%; border-top: 1px font-size: 12px; color: #64748b; text-align: center; padding-top: 8px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="title">KCAI Enterprise Compliance Audit Report</div>
              <div class="subtitle">Official Regulatory Assessment Certificate & Control Assessment</div>
            </div>
            <div style="text-align: right; font-size: 12px; color: #64748b;">
              Audit Date: ${new Date(report.auditTimestamp).toLocaleDateString()}<br/>
              Frameworks: ${report.frameworksCovered.join(", ")}
            </div>
          </div>

          <div class="score-box">
            <div style="font-size: 12px; font-weight: bold; text-transform: uppercase; color: #475569;">Overall Policy Compliance Rating</div>
            <div class="score">${report.overallScore}%</div>
            <div style="font-size: 13px; color: #334155;">${report.passedChecks} of ${report.totalChecks} Controls Satisfied</div>
          </div>

          <div class="grid">
            <div class="card">
              <div class="card-num" style="color: #16a34a;">${report.passedChecks}</div>
              <div style="font-size: 11px; color: #64748b;">Passed Controls</div>
            </div>
            <div class="card">
              <div class="card-num" style="color: #d97706;">${report.flaggedChecks}</div>
              <div style="font-size: 11px; color: #64748b;">Flagged Items</div>
            </div>
            <div class="card">
              <div class="card-num" style="color: #dc2626;">${report.highSeverityCount}</div>
              <div style="font-size: 11px; color: #64748b;">High Severity Risks</div>
            </div>
          </div>

          <h3>Executive Summary</h3>
          <p style="font-size: 13px; color: #334155;">${report.summary}</p>

          <h3>Detailed Control Evaluation Matrix</h3>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Category</th>
                <th>Rule Title</th>
                <th>Status</th>
                <th>Document Evidence</th>
                <th>Remediation Action</th>
              </tr>
            </thead>
            <tbody>
              ${report.rules
                .map(
                  (r) => `
                <tr>
                  <td><b>${r.id}</b></td>
                  <td>${r.category}</td>
                  <td><b>${r.title}</b></td>
                  <td class="${r.status === "PASS" ? "pass" : "flagged"}">${r.status}</td>
                  <td>${r.evidence}</td>
                  <td>${r.remediation}</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>

          <div class="signatures">
            <div style="width: 40%; border-top: 1px solid #94a3b8; text-align: center; padding-top: 5px; font-size: 12px; color: #64748b;">
              Chief Information Security Officer (CISO)
            </div>
            <div style="width: 40%; border-top: 1px solid #94a3b8; text-align: center; padding-top: 5px; font-size: 12px; color: #64748b;">
              Lead Compliance Auditor Sign-Off
            </div>
          </div>

          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  }

  async function generateRedlinePatch(rule: RuleCheck) {
    setRemediatingRule(rule);
    setPatchLoading(true);
    setPatchContent("");
    setCopied(false);

    try {
      const res = await fetch("/api/compliance/remediate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(rule),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Remediation generation failed.");

      setPatchContent(data.patch);
    } catch (err: any) {
      setPatchContent(`Failed to generate policy clause: ${err.message}`);
    } finally {
      setPatchLoading(false);
    }
  }

  function copyPatchToClipboard() {
    navigator.clipboard.writeText(patchContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const filteredRules = report
    ? report.rules.filter(
        (r) => selectedCategory === "ALL" || r.category === selectedCategory
      )
    : [];

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-950/30 px-3 py-1 text-xs font-medium text-indigo-400">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Automated Regulatory Verification Engine</span>
            </div>
            <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-white">
              Compliance & Policy Audit Suite
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              Evaluate your uploaded knowledge base against GDPR, SOC 2 Type II, ISO 27001, HIPAA, and custom rules.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/compliance/rules"
              className="flex items-center gap-2 rounded-xl glass-card px-4 py-3 font-semibold text-slate-300 hover:text-white border border-slate-800 transition"
            >
              <Sliders className="h-4 w-4 text-cyan-400" />
              <span>Configure Custom Rules</span>
            </Link>

            {report && (
              <div className="flex items-center gap-2">
                <button
                  onClick={printPDFReport}
                  className="flex items-center gap-2 rounded-xl glass-card px-4 py-3 font-semibold text-cyan-300 border border-cyan-500/30 hover:bg-cyan-950/40 transition"
                  title="Print / Download Executive PDF Certificate"
                >
                  <FileText className="h-4 w-4" />
                  <span>Export PDF</span>
                </button>

                <button
                  onClick={downloadCSVReport}
                  className="flex items-center gap-2 rounded-xl glass-card px-4 py-3 font-semibold text-emerald-300 border border-emerald-500/30 hover:bg-emerald-950/40 transition"
                  title="Export Spreadsheet Matrix CSV"
                >
                  <FileSpreadsheet className="h-4 w-4" />
                  <span>Export CSV</span>
                </button>
              </div>
            )}

            <button
              onClick={runAudit}
              disabled={loading}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3 font-semibold text-slate-950 shadow-lg shadow-cyan-500/20 hover:scale-105 transition disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Scanning Policies...</span>
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 fill-slate-950" />
                  <span>Execute Full Audit</span>
                </>
              )}
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="flex items-center gap-3 rounded-xl bg-rose-950/40 p-4 border border-rose-500/40 text-rose-300 text-sm">
            <AlertTriangle className="h-5 w-5 text-rose-400 shrink-0" />
            <span className="flex-1">{errorMsg}</span>
            <Link
              href="/upload"
              className="rounded-lg bg-rose-900/60 px-3 py-1 text-xs font-semibold hover:bg-rose-800"
            >
              Upload PDF
            </Link>
          </div>
        )}

        {/* Empty state prompt before running audit */}
        {!report && !loading && (
          <div className="glass-panel rounded-3xl p-12 text-center border border-slate-800">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 mb-6 glow-purple">
              <ShieldCheck className="h-8 w-8" />
            </div>

            <h2 className="text-2xl font-bold text-white">
              Ready to Perform Compliance Audit
            </h2>
            <p className="mt-3 text-sm text-slate-400 max-w-lg mx-auto leading-relaxed">
              Click <strong className="text-cyan-400">"Execute Full Audit"</strong> to analyze your uploaded PDF documents for privacy, access control, password policy, and data retention rules.
            </p>

            <div className="mt-8 flex justify-center gap-4">
              <button
                onClick={runAudit}
                className="flex items-center gap-2 rounded-xl bg-cyan-500 px-6 py-3 font-semibold text-slate-950 hover:bg-cyan-400 transition"
              >
                <Play className="h-4 w-4 fill-slate-950" />
                <span>Run Compliance Scan Now</span>
              </button>

              <Link
                href="/upload"
                className="flex items-center gap-2 rounded-xl glass-card px-6 py-3 font-semibold text-slate-300 hover:text-white"
              >
                <UploadCloud className="h-4 w-4 text-cyan-400" />
                <span>Manage Knowledge Files</span>
              </Link>
            </div>
          </div>
        )}

        {/* Audit Results Report Display */}
        {report && (
          <div className="space-y-8">
            {/* Top Score Banner */}
            <div className="grid gap-6 md:grid-cols-4">
              {/* Score Card */}
              <div className="glass-panel rounded-2xl p-6 border border-slate-800 flex flex-col justify-between">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Overall Compliance Rating
                </p>
                <div className="mt-4 flex items-baseline gap-3">
                  <span
                    className={`text-5xl font-extrabold tracking-tight ${
                      report.overallScore >= 80
                        ? "text-emerald-400"
                        : report.overallScore >= 60
                        ? "text-amber-400"
                        : "text-rose-400"
                    }`}
                  >
                    {report.overallScore}%
                  </span>
                  <span className="text-xs text-slate-400">
                    {report.passedChecks} of {report.totalChecks} Controls Passed
                  </span>
                </div>
                <div className="mt-4 w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ${
                      report.overallScore >= 80
                        ? "bg-emerald-500"
                        : report.overallScore >= 60
                        ? "bg-amber-500"
                        : "bg-rose-500"
                    }`}
                    style={{ width: `${report.overallScore}%` }}
                  />
                </div>
              </div>

              {/* Passed Controls Card */}
              <div className="glass-panel rounded-2xl p-6 border border-slate-800">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Passed Controls
                  </p>
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                </div>
                <p className="mt-4 text-4xl font-extrabold text-emerald-400">
                  {report.passedChecks}
                </p>
                <p className="mt-2 text-xs text-slate-500">
                  Compliant with framework rules
                </p>
              </div>

              {/* Flagged Rules Card */}
              <div className="glass-panel rounded-2xl p-6 border border-slate-800">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Flagged / Review Needed
                  </p>
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30">
                    <AlertTriangle className="h-4 w-4" />
                  </div>
                </div>
                <p className="mt-4 text-4xl font-extrabold text-amber-400">
                  {report.flaggedChecks}
                </p>
                <p className="mt-2 text-xs text-slate-500">
                  Requires documentation updates
                </p>
              </div>

              {/* High Severity Items */}
              <div className="glass-panel rounded-2xl p-6 border border-slate-800">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    High Severity Risks
                  </p>
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/30">
                    <XCircle className="h-4 w-4" />
                  </div>
                </div>
                <p className="mt-4 text-4xl font-extrabold text-rose-400">
                  {report.highSeverityCount}
                </p>
                <p className="mt-2 text-xs text-slate-500">
                  Action recommended immediately
                </p>
              </div>
            </div>

            {/* Audit Summary & Framework Filters */}
            <div className="glass-panel rounded-2xl p-6 border border-slate-800">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <FileCheck2 className="h-5 w-5 text-cyan-400" />
                    <span>Policy Evaluation Matrix</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">{report.summary}</p>
                </div>

                {/* Filter Tabs */}
                <div className="flex flex-wrap gap-1.5 bg-slate-900/80 p-1.5 rounded-xl border border-slate-800">
                  {["ALL", "GDPR", "SOC2", "ISO27001", "HIPAA", "PCI-DSS", "Internal Policy"].map(
                    (cat) => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                          selectedCategory === cat
                            ? "bg-cyan-500 text-slate-950 shadow-sm"
                            : "text-slate-400 hover:text-white"
                        }`}
                      >
                        {cat}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Rules List */}
              <div className="space-y-4">
                {filteredRules.map((rule) => (
                  <div
                    key={rule.id}
                    className={`glass-card rounded-xl p-5 border ${
                      rule.status === "PASS"
                        ? "border-emerald-500/30 bg-emerald-950/10"
                        : rule.status === "FLAGGED"
                        ? "border-rose-500/30 bg-rose-950/10"
                        : "border-amber-500/30 bg-amber-950/10"
                    }`}
                  >
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2.5">
                          <span className="text-xs font-bold text-slate-400">
                            {rule.id}
                          </span>
                          <span className="rounded-md bg-slate-800 px-2 py-0.5 text-[10px] font-semibold text-cyan-300 border border-slate-700">
                            {rule.category}
                          </span>
                          <h4 className="text-base font-bold text-white">
                            {rule.title}
                          </h4>
                        </div>
                        <p className="text-xs text-slate-300">{rule.description}</p>
                      </div>

                      {/* Status Badges & Actions */}
                      <div className="flex items-center gap-2 shrink-0">
                        {rule.status !== "PASS" && (
                          <button
                            onClick={() => generateRedlinePatch(rule)}
                            className="flex items-center gap-1.5 rounded-lg bg-indigo-950/80 px-2.5 py-1 text-xs font-semibold text-indigo-300 border border-indigo-500/40 hover:bg-indigo-900 transition"
                            title="Generate AI Policy Clause Remediation"
                          >
                            <Wand2 className="h-3.5 w-3.5 text-indigo-400" />
                            <span>AI Redline Clause</span>
                          </button>
                        )}

                        {rule.severity !== "NONE" && (
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${
                              rule.severity === "HIGH"
                                ? "bg-rose-950 text-rose-400 border-rose-800"
                                : rule.severity === "MEDIUM"
                                ? "bg-amber-950 text-amber-400 border-amber-800"
                                : "bg-slate-800 text-slate-300 border-slate-700"
                            }`}
                          >
                            {rule.severity} SEVERITY
                          </span>
                        )}

                        <span
                          className={`flex items-center gap-1.5 rounded-xl px-3 py-1 text-xs font-extrabold border ${
                            rule.status === "PASS"
                              ? "bg-emerald-950 text-emerald-400 border-emerald-700"
                              : rule.status === "FLAGGED"
                              ? "bg-rose-950 text-rose-400 border-rose-700"
                              : "bg-amber-950 text-amber-400 border-amber-700"
                          }`}
                        >
                          {rule.status === "PASS" && <CheckCircle2 className="h-3.5 w-3.5" />}
                          {rule.status === "FLAGGED" && <XCircle className="h-3.5 w-3.5" />}
                          {rule.status === "NEEDS_REVIEW" && <AlertTriangle className="h-3.5 w-3.5" />}
                          <span>{rule.status}</span>
                        </span>
                      </div>
                    </div>

                    {/* Evidence & Remediation */}
                    <div className="mt-4 grid gap-3 md:grid-cols-2 pt-3 border-t border-slate-800/80 text-xs">
                      <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                        <span className="font-bold text-slate-400 block mb-1">
                          📄 Document Evidence / Semantic Match:
                        </span>
                        <p className="text-slate-300 italic">"{rule.evidence}"</p>
                      </div>

                      <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                        <span className="font-bold text-cyan-400 block mb-1">
                          🛠 Recommended Action:
                        </span>
                        <p className="text-slate-300">{rule.remediation}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* AI Policy Redline Remediation Modal */}
        {remediatingRule && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md">
            <div className="glass-panel w-full max-w-2xl rounded-2xl border border-indigo-500/30 p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2 text-indigo-400">
                  <Wand2 className="h-5 w-5" />
                  <h3 className="font-bold text-white">AI Policy Redline Generator</h3>
                </div>
                <button
                  onClick={() => setRemediatingRule(null)}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-400">
                  Generating policy clause patch for:
                </p>
                <h4 className="text-base font-bold text-white mt-0.5">
                  {remediatingRule.title} ({remediatingRule.category})
                </h4>
              </div>

              {patchLoading ? (
                <div className="p-12 text-center text-slate-400 space-y-3">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto text-indigo-400" />
                  <p className="text-xs">Drafting compliant legal policy clause using AI...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="max-h-80 overflow-y-auto rounded-xl bg-slate-900/90 p-4 border border-slate-800 font-mono text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
                    {patchContent}
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      onClick={copyPatchToClipboard}
                      className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-indigo-500 transition"
                    >
                      {copied ? (
                        <>
                          <Check className="h-4 w-4" />
                          <span>Copied to Clipboard!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4" />
                          <span>Copy Clause Patch</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}