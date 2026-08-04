import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="mx-auto flex max-w-7xl flex-col items-center justify-center px-6 py-24 text-center">
        <p className="rounded-full border border-cyan-500 px-4 py-1 text-sm text-cyan-400">
          GDG × HowToAlgo Hackathon 2026
        </p>

        <h1 className="mt-8 text-5xl font-extrabold tracking-tight md:text-7xl">
          Knowledge & Compliance
          <span className="block text-cyan-400">AI Agent</span>
        </h1>

        <p className="mt-6 max-w-3xl text-lg text-slate-300">
          An AI-powered assistant that helps organizations search internal
          knowledge, answer policy questions, and verify compliance in real
          time.
        </p>

        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link
            href="/dashboard"
            className="rounded-lg bg-cyan-500 px-6 py-3 font-semibold text-black transition hover:bg-cyan-400"
          >
            Open Dashboard
          </Link>

          <Link
            href="/chat"
            className="rounded-lg border border-slate-600 px-6 py-3 hover:border-cyan-400"
          >
            Try AI Chat
          </Link>
        </div>
      </section>
    </main>
  );
}