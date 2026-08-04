import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="text-xl font-bold tracking-wide text-cyan-400"
        >
          KCAI
        </Link>

        <div className="flex items-center gap-6 text-sm">
          <Link href="/" className="hover:text-cyan-400">
            Home
          </Link>

          <Link href="/dashboard" className="hover:text-cyan-400">
            Dashboard
          </Link>

          <Link href="/chat" className="hover:text-cyan-400">
            AI Chat
          </Link>

          <Link href="/upload" className="hover:text-cyan-400">
            Upload
          </Link>

          <Link href="/compliance" className="hover:text-cyan-400">
            Compliance
          </Link>
        </div>
      </div>
    </nav>
  );
}