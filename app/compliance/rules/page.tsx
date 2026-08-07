"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ShieldAlert,
  Plus,
  Trash2,
  ToggleLeft,
  ToggleRight,
  ArrowLeft,
  Sliders,
  CheckCircle2,
  Sparkles,
  Loader2,
  BookmarkPlus,
} from "lucide-react";
import { CustomRule } from "@/lib/documentStore";

export default function CustomRulesPage() {
  const [rules, setRules] = useState<CustomRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<CustomRule["category"]>("Internal Policy");
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState<CustomRule["severity"]>("MEDIUM");
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  async function fetchRules() {
    try {
      setLoading(true);
      const res = await fetch("/api/compliance/rules");
      if (res.ok) {
        const data = await res.json();
        setRules(data.rules || []);
      }
    } catch (e) {
      console.error("Failed to load rules:", e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchRules();
  }, []);

  async function handleCreateRule(e: React.FormEvent) {
    e.preventDefault();
    if (!title || !description) {
      setErrorMsg("Title and description are required.");
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg("");
      setSuccessMsg("");

      const res = await fetch("/api/compliance/rules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, category, description, severity }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create rule.");
      }

      setSuccessMsg(`Rule "${title}" added successfully!`);
      setTitle("");
      setDescription("");
      fetchRules();
    } catch (err: any) {
      setErrorMsg(err.message || "Rule creation failed.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleToggleRule(id: string) {
    try {
      const res = await fetch("/api/compliance/rules", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        fetchRules();
      }
    } catch (e) {
      console.error("Failed to toggle rule:", e);
    }
  }

  async function handleDeleteRule(id: string) {
    if (!confirm("Are you sure you want to delete this custom compliance rule?")) return;
    try {
      const res = await fetch(`/api/compliance/rules?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchRules();
      }
    } catch (e) {
      console.error("Failed to delete rule:", e);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-6xl space-y-8">
        {/* Top Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <Link
              href="/compliance"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300 mb-2 transition"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Compliance Suite</span>
            </Link>
            <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
              <Sliders className="h-8 w-8 text-cyan-400" />
              <span>Custom Policy & Compliance Rule Builder</span>
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              Configure custom corporate policies, HIPAA, PCI-DSS, or internal security requirements for automated AI audit scans.
            </p>
          </div>
        </div>

        {/* Grid layout: Form + Rules List */}
        <div className="grid gap-8 lg:grid-cols-12">
          {/* Create Rule Form */}
          <div className="lg:col-span-5">
            <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-5 sticky top-6">
              <div className="flex items-center gap-2 text-cyan-400 border-b border-slate-800 pb-3">
                <BookmarkPlus className="h-5 w-5" />
                <h3 className="font-bold text-white">Add New Compliance Control</h3>
              </div>

              {successMsg && (
                <div className="rounded-xl bg-emerald-950/40 p-3.5 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              {errorMsg && (
                <div className="rounded-xl bg-rose-950/40 p-3.5 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4 text-rose-400 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleCreateRule} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Rule Title <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Mandatory Bi-Annual SOC 2 Vendor Review"
                    className="w-full rounded-xl bg-slate-900 border border-slate-800 p-3 text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      Framework / Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as any)}
                      className="w-full rounded-xl bg-slate-900 border border-slate-800 p-3 text-white focus:border-cyan-500 focus:outline-none"
                    >
                      <option value="Internal Policy">Internal Policy</option>
                      <option value="HIPAA">HIPAA Compliance</option>
                      <option value="PCI-DSS">PCI-DSS Payment Security</option>
                      <option value="GDPR">GDPR Data Privacy</option>
                      <option value="SOC2">SOC 2 Type II</option>
                      <option value="ISO27001">ISO 27001</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      Risk Severity
                    </label>
                    <select
                      value={severity}
                      onChange={(e) => setSeverity(e.target.value as any)}
                      className="w-full rounded-xl bg-slate-900 border border-slate-800 p-3 text-white focus:border-cyan-500 focus:outline-none"
                    >
                      <option value="HIGH">HIGH SEVERITY</option>
                      <option value="MEDIUM">MEDIUM SEVERITY</option>
                      <option value="LOW">LOW SEVERITY</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Requirement Description <span className="text-rose-400">*</span>
                  </label>
                  <textarea
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe what the auditor or AI engine should look for in uploaded documents..."
                    className="w-full rounded-xl bg-slate-900 border border-slate-800 p-3 text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 py-3 text-sm font-bold text-slate-950 shadow-lg shadow-cyan-500/20 hover:scale-[1.02] transition disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Saving Rule...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" />
                      <span>Save Custom Rule</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Active Rules List */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-lg">
                Custom Policy Repository ({rules.length})
              </h3>
              <span className="text-xs text-slate-400">
                Active rules automatically included in audit scans
              </span>
            </div>

            {loading ? (
              <div className="p-12 text-center text-slate-500">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-cyan-500" />
                <span>Loading custom rules...</span>
              </div>
            ) : rules.length === 0 ? (
              <div className="glass-panel rounded-2xl p-10 text-center border border-slate-800">
                <Sparkles className="h-10 w-10 text-slate-600 mx-auto mb-3" />
                <h4 className="font-semibold text-slate-300">No Custom Rules Created Yet</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Use the form on the left to add company-specific policy requirements.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {rules.map((rule) => (
                  <div
                    key={rule.id}
                    className={`glass-card rounded-xl p-5 border transition ${
                      rule.active
                        ? "border-cyan-500/30 bg-slate-900/60"
                        : "border-slate-800 bg-slate-950/40 opacity-60"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-cyan-400 font-bold">
                            {rule.id}
                          </span>
                          <span className="rounded-md bg-slate-800 px-2 py-0.5 text-[10px] font-semibold text-slate-300 border border-slate-700">
                            {rule.category}
                          </span>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[9px] font-bold border ${
                              rule.severity === "HIGH"
                                ? "bg-rose-950 text-rose-400 border-rose-800"
                                : rule.severity === "MEDIUM"
                                ? "bg-amber-950 text-amber-400 border-amber-800"
                                : "bg-slate-800 text-slate-300 border-slate-700"
                            }`}
                          >
                            {rule.severity}
                          </span>
                        </div>
                        <h4 className="text-base font-bold text-white mt-1">{rule.title}</h4>
                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                          {rule.description}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleToggleRule(rule.id)}
                          title={rule.active ? "Deactivate Rule" : "Activate Rule"}
                          className="text-slate-400 hover:text-cyan-400 transition"
                        >
                          {rule.active ? (
                            <ToggleRight className="h-6 w-6 text-cyan-400" />
                          ) : (
                            <ToggleLeft className="h-6 w-6 text-slate-600" />
                          )}
                        </button>

                        <button
                          onClick={() => handleDeleteRule(rule.id)}
                          title="Delete Custom Rule"
                          className="text-slate-500 hover:text-rose-400 transition"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
