"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ShieldCheck,
  LayoutDashboard,
  MessageSquare,
  UploadCloud,
  FileCheck2,
  Sparkles,
  Bot,
  Sliders,
} from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const [docCount, setDocCount] = useState<number>(0);

  useEffect(() => {
    async function fetchDocCount() {
      try {
        const res = await fetch("/api/upload");
        if (res.ok) {
          const data = await res.json();
          setDocCount(data.totalDocuments || 0);
        }
      } catch (err) {
        // silent catch
      }
    }
    fetchDocCount();
    const interval = setInterval(fetchDocCount, 5000);
    return () => clearInterval(interval);
  }, [pathname]);

  const navLinks = [
    { href: "/", label: "Home", icon: Sparkles },
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/chat", label: "AI Chat", icon: MessageSquare },
    { href: "/upload", label: "Upload Knowledge", icon: UploadCloud },
    { href: "/compliance", label: "Compliance Suite", icon: FileCheck2 },
    { href: "/compliance/rules", label: "Custom Rules", icon: Sliders },
  ];

  return (
    <nav className="sticky top-0 z-50 glass-panel border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3.5 gap-4">
        {/* Brand logo */}
        <Link href="/" className="flex items-center gap-2.5 group shrink-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 shadow-md shadow-cyan-500/20 transition-transform group-hover:scale-105">
            <ShieldCheck className="h-5 w-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
              KCAI <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800/60">Agent</span>
            </span>
            <span className="text-[10px] text-slate-400 tracking-wide font-medium whitespace-nowrap">Knowledge & Compliance</span>
          </div>
        </Link>

        {/* Navigation links */}
        <div className="flex items-center gap-1 text-sm bg-slate-900/60 p-1.5 rounded-xl border border-slate-800/60 overflow-x-auto max-w-full scrollbar-none">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  isActive
                    ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 shadow-sm"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                }`}
              >
                <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-cyan-400" : "text-slate-400"}`} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </div>

        {/* System status pill */}
        <div className="hidden lg:flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-slate-300 font-medium flex items-center gap-1.5 whitespace-nowrap">
              <Bot className="h-4 w-4 shrink-0 text-cyan-400" /> AI Online
            </span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-950/40 border border-cyan-800/50 text-xs font-semibold text-cyan-300 whitespace-nowrap">
            <span>{docCount} {docCount === 1 ? "Doc" : "Docs"} Active</span>
          </div>
        </div>
      </div>
    </nav>
  );
}