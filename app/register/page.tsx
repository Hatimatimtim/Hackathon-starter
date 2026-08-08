"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Lock,
  Mail,
  User,
  ArrowRight,
  Loader2,
  AlertCircle,
  Eye,
  EyeOff,
  UserCheck,
  Building2,
  CheckCircle2,
  Shield,
  Briefcase,
} from "lucide-react";
import { useAuth } from "@/components/auth/AuthContext";
import { UserRole } from "@/lib/userStore";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("Compliance Auditor");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const roleOptions: { role: UserRole; label: string; desc: string; icon: any }[] = [
    {
      role: "CISO",
      label: "CISO / Security Executive",
      desc: "Full governance, audit approvals & strategic security policy control.",
      icon: Building2,
    },
    {
      role: "Compliance Auditor",
      label: "Compliance Auditor",
      desc: "Execute SOC 2, HIPAA, ISO scans & review AI compliance remediations.",
      icon: UserCheck,
    },
    {
      role: "Security Analyst",
      label: "Security Analyst",
      desc: "Manage knowledge base uploads, vector indexing & RAG chat sessions.",
      icon: Shield,
    },
  ];

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();

    if (!name || !email || !password) {
      setErrorMsg("Please fill in all required fields.");
      return;
    }

    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters.");
      return;
    }

    try {
      setLoading(true);
      setErrorMsg("");
      setSuccessMsg("");

      const res = await register(name, email, password, role);

      if (!res.success) {
        throw new Error(res.error || "Registration failed.");
      }

      setSuccessMsg("Account created successfully! Initializing workspace...");
      setTimeout(() => {
        router.push("/dashboard");
      }, 900);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to create account.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-[calc(100vh-73px)] bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background glow graphics */}
      <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-xl space-y-6 relative z-10 my-8">
        {/* Top Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 shadow-xl shadow-cyan-500/20 mb-2">
            <ShieldCheck className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            Create Enterprise Account
          </h1>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Join your organization's Knowledge & Compliance AI workspace.
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

          <form onSubmit={handleRegister} className="space-y-5 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">
                  Full Name <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jane Doe"
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 pl-10 pr-4 py-3 text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none transition"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">
                  Enterprise Work Email <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="jane@company.com"
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 pl-10 pr-4 py-3 text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none transition"
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">
                Password <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 6 characters"
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

            {/* Select Enterprise Role */}
            <div className="space-y-2">
              <label className="block text-slate-300 font-semibold flex items-center gap-1.5">
                <Briefcase className="h-3.5 w-3.5 text-cyan-400" /> Select Enterprise Role
              </label>

              <div className="grid grid-cols-1 gap-2.5">
                {roleOptions.map((opt) => {
                  const Icon = opt.icon;
                  const isSelected = role === opt.role;
                  return (
                    <div
                      key={opt.role}
                      onClick={() => setRole(opt.role)}
                      className={`cursor-pointer rounded-xl p-3.5 border transition flex items-start gap-3 ${
                        isSelected
                          ? "bg-cyan-950/40 border-cyan-500/60 shadow-md shadow-cyan-500/10"
                          : "bg-slate-950 border-slate-800 hover:border-slate-700"
                      }`}
                    >
                      <div
                        className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                          isSelected ? "bg-cyan-500 text-slate-950" : "bg-slate-900 text-slate-400"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white text-xs">{opt.label}</span>
                          {isSelected && (
                            <span className="text-[10px] font-bold text-cyan-400 flex items-center gap-1">
                              <CheckCircle2 className="h-3.5 w-3.5" /> Selected
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">{opt.desc}</p>
                      </div>
                    </div>
                  );
                })}
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
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Create Account & Join Workspace</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <div className="text-center pt-2 border-t border-slate-800/80">
            <p className="text-xs text-slate-400">
              Already have an enterprise account?{" "}
              <Link
                href="/login"
                className="font-semibold text-cyan-400 hover:text-cyan-300 hover:underline transition"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
