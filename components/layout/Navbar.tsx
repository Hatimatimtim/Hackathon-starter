"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
  LogOut,
  LogIn,
  UserPlus,
  User as UserIcon,
  ChevronDown,
  Building2,
  UserCheck,
} from "lucide-react";
import { useAuth } from "@/components/auth/AuthContext";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [docCount, setDocCount] = useState<number>(0);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

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

  async function handleLogout() {
    setUserMenuOpen(false);
    await logout();
    router.push("/login");
  }

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

        {/* Right side: User Profile / Auth buttons & doc count */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-950/40 border border-cyan-800/50 text-xs font-semibold text-cyan-300 whitespace-nowrap">
            <span>{docCount} {docCount === 1 ? "Doc" : "Docs"} Active</span>
          </div>

          {user ? (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2.5 p-1.5 pr-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/50 transition group"
              >
                <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-bold text-slate-950 text-xs shadow">
                  {user.name ? user.name.slice(0, 2).toUpperCase() : "US"}
                </div>
                <div className="flex flex-col text-left hidden sm:block">
                  <span className="text-xs font-bold text-white leading-none flex items-center gap-1">
                    {user.name}
                  </span>
                  <span className="text-[10px] font-semibold text-cyan-400 leading-tight">
                    {user.role}
                  </span>
                </div>
                <ChevronDown className="h-3.5 w-3.5 text-slate-400 group-hover:text-cyan-400 transition" />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-2 z-50 text-xs space-y-1 backdrop-blur-xl animate-in fade-in zoom-in-95">
                  <div className="p-2.5 border-b border-slate-800/80 mb-1">
                    <p className="font-bold text-white text-xs">{user.name}</p>
                    <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                    <div className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800/60 text-[9px] font-bold">
                      <UserCheck className="h-3 w-3" />
                      {user.role}
                    </div>
                  </div>

                  <Link
                    href="/dashboard"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition"
                  >
                    <LayoutDashboard className="h-4 w-4 text-cyan-400" />
                    <span>Compliance Dashboard</span>
                  </Link>

                  <Link
                    href="/compliance/rules"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition"
                  >
                    <Sliders className="h-4 w-4 text-cyan-400" />
                    <span>Custom Policy Rules</span>
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 transition text-left"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white hover:border-cyan-500/50 transition"
              >
                <LogIn className="h-3.5 w-3.5 text-cyan-400" />
                <span>Sign In</span>
              </Link>
              <Link
                href="/register"
                className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-xs font-bold text-slate-950 shadow-md shadow-cyan-500/20 hover:scale-[1.02] transition"
              >
                <UserPlus className="h-3.5 w-3.5" />
                <span>Register</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}