import Link from "next/link";
import {
  ShieldCheck,
  FileSearch,
  CheckCircle2,
  Cpu,
  ArrowRight,
  Sparkles,
  Zap,
  Lock,
  FileText,
  MessageSquare,
} from "lucide-react";

export default function Home() {
  return (
    <main className="relative min-h-screen bg-slate-950 text-white overflow-hidden">
      {/* Background glow graphics */}
      <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-cyan-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 -right-40 h-96 w-96 rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none" />

      {/* Hero Section */}
      <section className="relative mx-auto flex max-w-7xl flex-col items-center justify-center px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/40 bg-cyan-950/40 px-4 py-1.5 text-xs font-semibold text-cyan-300 shadow-sm backdrop-blur-md">
          <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
          <span>GDG × HowToAlgo Hackathon 2026 Flagship Agent</span>
        </div>

        <h1 className="mt-8 text-5xl font-extrabold tracking-tight md:text-7xl">
          Knowledge & Compliance
          <span className="mt-2 block bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
            AI Enterprise Agent
          </span>
        </h1>

        <p className="mt-6 max-w-3xl text-lg text-slate-300 leading-relaxed">
          An autonomous AI-powered assistant designed for enterprise compliance,
          policy verification, and zero-hallucination document intelligence grounded strictly in your internal documents.
        </p>

        {/* CTA Buttons */}
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link
            href="/dashboard"
            className="group flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-7 py-3.5 font-semibold text-slate-950 shadow-lg shadow-cyan-500/25 transition-all hover:scale-105 hover:from-cyan-400 hover:to-blue-500"
          >
            <span>Open Dashboard</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>

          <Link
            href="/chat"
            className="flex items-center gap-2 rounded-xl glass-card px-7 py-3.5 font-semibold text-white transition hover:bg-slate-800/80 hover:border-cyan-500/50"
          >
            <MessageSquare className="h-4 w-4 text-cyan-400" />
            <span>Launch AI Chat</span>
          </Link>

          <Link
            href="/compliance"
            className="flex items-center gap-2 rounded-xl border border-indigo-500/40 bg-indigo-950/30 px-7 py-3.5 font-semibold text-indigo-300 transition hover:bg-indigo-900/40"
          >
            <ShieldCheck className="h-4 w-4 text-indigo-400" />
            <span>Compliance Audit</span>
          </Link>
        </div>

        {/* Live Metrics Pill Strip */}
        <div className="mt-16 grid grid-cols-2 gap-4 md:grid-cols-4 w-full max-w-4xl">
          <div className="glass-card rounded-xl p-4 text-center">
            <p className="text-3xl font-extrabold text-cyan-400">100%</p>
            <p className="mt-1 text-xs text-slate-400">Document Grounding</p>
          </div>
          <div className="glass-card rounded-xl p-4 text-center">
            <p className="text-3xl font-extrabold text-blue-400">OCR</p>
            <p className="mt-1 text-xs text-slate-400">Hybrid PDF Extraction</p>
          </div>
          <div className="glass-card rounded-xl p-4 text-center">
            <p className="text-3xl font-extrabold text-emerald-400">GDPR & SOC2</p>
            <p className="mt-1 text-xs text-slate-400">Automated Audit Suite</p>
          </div>
          <div className="glass-card rounded-xl p-4 text-center">
            <p className="text-3xl font-extrabold text-purple-400">Dual AI</p>
            <p className="mt-1 text-xs text-slate-400">Gemini + OpenRouter</p>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight text-white">
            Built for High-Stakes Enterprise Compliance
          </h2>
          <p className="mt-3 text-slate-400">
            Eliminating AI hallucination risks with strict policy verification and page-level citations.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          <div className="glass-card rounded-2xl p-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 mb-6">
              <FileSearch className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-white">Hybrid PDF & OCR Pipeline</h3>
            <p className="mt-3 text-sm text-slate-400 leading-relaxed">
              Instant text stream parsing for digital PDFs combined with Tesseract.js OCR for scanned document pages and legacy policy archives.
            </p>
          </div>

          <div className="glass-card rounded-2xl p-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-6">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-white">Automated Compliance Scoring</h3>
            <p className="mt-3 text-sm text-slate-400 leading-relaxed">
              Automated audit suite checking your uploaded documents against GDPR, SOC 2, ISO 27001, and corporate internal policy checklists.
            </p>
          </div>

          <div className="glass-card rounded-2xl p-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 mb-6">
              <Cpu className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-white">Resilient Failover AI Engine</h3>
            <p className="mt-3 text-sm text-slate-400 leading-relaxed">
              Powered by Google Gemini 2.5 Flash with instant automatic failover to OpenRouter to ensure 99.9% uptime during hackathon demos and high traffic.
            </p>
          </div>
        </div>
      </section>

      {/* Quick Action Footer Banner */}
      <section className="mx-auto max-w-7xl px-6 pb-24">
        <div className="glass-panel rounded-3xl p-10 border border-cyan-500/30 text-center relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-3xl font-bold text-white">Ready to Audit Your Policies?</h3>
            <p className="mt-3 text-slate-300 max-w-xl mx-auto">
              Upload your employee handbook, security policies, or legal terms to get instant AI answers and compliance metrics.
            </p>
            <div className="mt-8 flex justify-center gap-4">
              <Link
                href="/upload"
                className="flex items-center gap-2 rounded-xl bg-cyan-500 px-6 py-3 font-semibold text-slate-950 hover:bg-cyan-400 transition"
              >
                <FileText className="h-4 w-4" />
                <span>Upload PDF Document</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}