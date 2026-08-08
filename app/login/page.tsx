"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Lock,
  Mail,
  ArrowRight,
  Sparkles,
  Loader2,
  AlertCircle,
  Eye,
  EyeOff,
  UserCheck,
  Building2,
  CheckCircle2,
} from "lucide-react";
import { useAuth } from "@/components/auth/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { login, quickLoginDemo, user } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg("Please enter both email and password.");
      return;
    }

    try {
      setLoading(true);
      setErrorMsg("");
      setSuccessMsg("");

      const res = await login(email, password);

      if (!res.success) {
        throw new Error(res.error || "Invalid credentials.");
      }

      setSuccessMsg("Authentication successful! Redirecting to Dashboard...");
      setTimeout(() => {
        router.push("/dashboard");
      }, 800);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to log in.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDemoLogin(role: "CISO" | "Compliance Auditor" | "Security Analyst") {
    try {
      setLoading(true);
      setErrorMsg("");
      await quickLoginDemo(role);
      setSuccessMsg(`Logged in as Demo ${role}! Redirecting...`);
      setTimeout(() => {
        router.push("/dashboard");
      }, 800);
    } catch (err: any) {
      setErrorMsg("Failed demo login.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-[calc(100vh-73px)] bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background glow graphics */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md space-y-6 relative z-10">
        {/* Top Title Card */}
        <div className="text-center space-y-3">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 shadow-xl shadow-cyan-500/20 mb-2">
            <ShieldCheck className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            Enterprise Sign In
          </h1>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            Access your secure AI knowledge retrieval and compliance audit workspace.
          </p>
        </div>

        {/* Form Container */}
        <div className="glass-panel bg-slate-900/80 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-xl space-y-6">
          {errorMsg && (
            <div className="rounded-xl bg-rose-950/60 p-3.5 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2.5">
              <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="rounded-xl bg-emerald-950/60 p-3.5 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">
                Work Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ciso@enterprise.com"
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 pl-10 pr-4 py-3 text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none transition"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-slate-300 font-semibold">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-[10px] text-cyan-400 hover:underline cursor-pointer"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 pl-10 pr-10 py-3 text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none transition"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 py-3.5 text-sm font-bold text-slate-950 shadow-lg shadow-cyan-500/20 hover:scale-[1.02] transition disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Workspace</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Login Section */}
          <div className="space-y-3 pt-2 border-t border-slate-800/80">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1 font-semibold text-slate-300">
                <Sparkles className="h-3.5 w-3.5 text-cyan-400" /> Quick Demo Login (1-Click)
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleDemoLogin("CISO")}
                disabled={loading}
                className="rounded-xl bg-slate-950 border border-slate-800 hover:border-cyan-500/50 p-2.5 text-center text-[10px] font-bold text-slate-300 hover:text-cyan-400 transition"
              >
                <Building2 className="h-4 w-4 mx-auto mb-1 text-cyan-400" />
                CISO Demo
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin("Compliance Auditor")}
                disabled={loading}
                className="rounded-xl bg-slate-950 border border-slate-800 hover:border-cyan-500/50 p-2.5 text-center text-[10px] font-bold text-slate-300 hover:text-cyan-400 transition"
              >
                <UserCheck className="h-4 w-4 mx-auto mb-1 text-emerald-400" />
                Auditor Demo
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin("Security Analyst")}
                disabled={loading}
                className="rounded-xl bg-slate-950 border border-slate-800 hover:border-cyan-500/50 p-2.5 text-center text-[10px] font-bold text-slate-300 hover:text-cyan-400 transition"
              >
                <ShieldCheck className="h-4 w-4 mx-auto mb-1 text-indigo-400" />
                Analyst Demo
              </button>
            </div>
          </div>

          <div className="text-center pt-2">
            <p className="text-xs text-slate-400">
              Don't have an enterprise account?{" "}
              <Link
                href="/register"
                className="font-semibold text-cyan-400 hover:text-cyan-300 hover:underline transition"
              >
                Create Account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
