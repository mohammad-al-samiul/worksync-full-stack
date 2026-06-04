"use client";

import React, { useState } from "react";
import { useAuth, UserRole } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lock,
  Mail,
  User,
  Shield,
  ArrowRight,
  Terminal,
  Activity,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

const DEMO_CREDENTIALS: Record<UserRole, { email: string; password: string }> = {
  Admin: { email: "admin@worksync.io", password: "admin123" },
  Manager: { email: "manager@worksync.io", password: "manager123" },
  Member: { email: "member@worksync.io", password: "member123" },
};

export default function AuthPage() {
  const { login, register, isSubmitting } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<UserRole>("Member");
  const [isAutofilling, setIsAutofilling] = useState(false);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");

    if (!email || !password || (!isLogin && !name)) {
      setFormError("Please fill out all required fields.");
      return;
    }

    try {
      if (isLogin) {
        const result = await login(email, password);
        if (!result.ok) {
          setFormError(result.error);
        }
      } else {
        const result = await register(name, email, password, role);
        if (!result.ok) {
          setFormError(result.error);
        }
      }
    } catch {
      setFormError("Authentication failed. Please try again.");
    }
  };

  const handleDemoFill = async (demoRole: UserRole) => {
    if (isAutofilling || isSubmitting) return;
    setIsAutofilling(true);
    setFormError("");
    setFormSuccess("");
    setIsLogin(true);

    const { email: demoEmail, password: demoPass } = DEMO_CREDENTIALS[demoRole];
    setEmail(demoEmail);
    setPassword(demoPass);
    setRole(demoRole);

    const result = await login(demoEmail, demoPass);
    if (!result.ok) {
      setFormError(result.error);
    }
    setIsAutofilling(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative p-4 md:p-6 bg-[#0b0f19] text-white overflow-hidden cyber-mesh cyber-grid">
      {/* Floating Glowing Orbs */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-accent/15 rounded-full blur-[100px] pointer-events-none animate-pulse-glow" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-cyan-accent/15 rounded-full blur-[100px] pointer-events-none animate-pulse-glow" />

      <div className="w-full max-w-5xl flex flex-col md:flex-row items-stretch justify-center gap-6 md:gap-0 z-10">
        {/* Brand Showcase Panel (Left) */}
        <div className="flex-1 rounded-t-2xl md:rounded-t-none md:rounded-l-2xl border-t border-x md:border-y md:border-l border-purple-accent/20 bg-slate-950/45 glassmorphism p-8 md:p-12 flex flex-col justify-between overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-accent/5 to-transparent pointer-events-none" />
          
          {/* Logo */}
          <div className="flex items-center gap-3 relative z-10">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-purple-accent to-cyan-accent shadow-[0_0_15px_rgba(157,78,221,0.5)]">
              <Terminal className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold tracking-wider bg-gradient-to-r from-cyan-accent to-purple-accent bg-clip-text text-transparent">
              WORKSYNC
            </span>
          </div>

          {/* Slogan */}
          <div className="my-12 space-y-4 relative z-10">
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight leading-tight">
              Collaborate in the <br />
              <span className="bg-gradient-to-r from-cyan-accent to-purple-accent bg-clip-text text-transparent neon-text-cyan">
                Cyber Workspace
              </span>
            </h1>
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              Empower your engineering teams with unified task coordination, real-time analytics, and lightning-fast glassmorphic dashboards.
            </p>
          </div>

          {/* Features Checklist */}
          <div className="space-y-3.5 relative z-10">
            <div className="flex items-center gap-3 text-xs font-semibold text-slate-350">
              <Activity className="h-4.5 w-4.5 text-cyan-accent" />
              <span>Real-Time Sync Diagnostics</span>
            </div>
            <div className="flex items-center gap-3 text-xs font-semibold text-slate-350">
              <Shield className="h-4.5 w-4.5 text-purple-accent" />
              <span>Role-Based Access Protections</span>
            </div>
            <div className="flex items-center gap-3 text-xs font-semibold text-slate-350">
              <Zap className="h-4.5 w-4.5 text-emerald-accent" />
              <span>Framer Motion Smooth Layouts</span>
            </div>
          </div>
        </div>

        {/* Form Console Panel (Right) */}
        <div className="flex-1 rounded-b-2xl md:rounded-b-none md:rounded-r-2xl border-b border-x md:border-y md:border-r border-cyan-accent/20 bg-slate-900/50 glassmorphism p-8 md:p-12 flex flex-col justify-center relative shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-accent/5 to-transparent pointer-events-none" />

          {/* Tab Switcher */}
          <div className="flex bg-slate-950/60 p-1.5 rounded-xl border border-card-border/40 mb-8 relative z-10">
            <button
              onClick={() => { setIsLogin(true); setFormError(""); }}
              className={cn(
                "flex-1 py-2 text-xs font-bold rounded-lg transition-all duration-300 relative cursor-pointer",
                isLogin ? "text-slate-950" : "text-slate-450 hover:text-white"
              )}
            >
              {isLogin && (
                <motion.div
                  layoutId="activeTabGlow"
                  className="absolute inset-0 bg-gradient-to-r from-cyan-accent to-purple-accent rounded-lg"
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                />
              )}
              <span className="relative z-10">Sign In</span>
            </button>
            <button
              onClick={() => { setIsLogin(false); setFormError(""); }}
              className={cn(
                "flex-1 py-2 text-xs font-bold rounded-lg transition-all duration-300 relative cursor-pointer",
                !isLogin ? "text-slate-950" : "text-slate-450 hover:text-white"
              )}
            >
              {!isLogin && (
                <motion.div
                  layoutId="activeTabGlow"
                  className="absolute inset-0 bg-gradient-to-r from-cyan-accent to-purple-accent rounded-lg"
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                />
              )}
              <span className="relative z-10">Create Account</span>
            </button>
          </div>

          {/* Status Banners */}
          {formError && (
            <div className="mb-4 p-3 rounded-lg border border-red-500/20 bg-red-500/10 text-red-400 text-xs font-semibold animate-pulse">
              {formError}
            </div>
          )}
          {formSuccess && (
            <div className="mb-4 p-3 rounded-lg border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 text-xs font-semibold">
              {formSuccess}
            </div>
          )}

          {/* Input Form */}
          <form onSubmit={handleAuthSubmit} className="space-y-4 relative z-10">
            {!isLogin && (
              <div className="space-y-1.5">
                <label className="text-[11px] uppercase tracking-wider text-slate-400 font-bold">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-450" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter full name"
                    className="w-full h-11 pl-10 pr-4 bg-slate-950/60 rounded-xl border border-card-border/40 text-sm focus:outline-none focus:border-purple-accent focus:ring-1 focus:ring-purple-accent transition-all duration-200"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[11px] uppercase tracking-wider text-slate-400 font-bold">Secure Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-450" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@worksync.io"
                  className="w-full h-11 pl-10 pr-4 bg-slate-950/60 rounded-xl border border-card-border/40 text-sm focus:outline-none focus:border-cyan-accent focus:ring-1 focus:ring-cyan-accent transition-all duration-200"
                  disabled={isAutofilling || isSubmitting}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] uppercase tracking-wider text-slate-400 font-bold">Credentials Key</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-450" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-11 pl-10 pr-4 bg-slate-950/60 rounded-xl border border-card-border/40 text-sm focus:outline-none focus:border-cyan-accent focus:ring-1 focus:ring-cyan-accent transition-all duration-200"
                  disabled={isAutofilling || isSubmitting}
                />
              </div>
            </div>

            {/* Form Button */}
            <button
              type="submit"
              disabled={isAutofilling || isSubmitting}
              className="w-full h-11 mt-2 bg-gradient-to-r from-cyan-accent to-purple-accent hover:from-cyan-accent hover:to-purple-accent text-slate-950 font-bold rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-[0_4px_20px_rgba(0,242,254,0.25)] hover:shadow-[0_4px_25px_rgba(157,78,221,0.4)] active:scale-98 transition-all duration-300 disabled:opacity-50"
            >
              <span>{isLogin ? "Decrypt Console" : "Initialize Key"}</span>
              <ArrowRight className="h-4.5 w-4.5" />
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-card-border/30" />
            </div>
            <span className="relative px-3 bg-[#0f1524] text-[10px] text-slate-450 font-bold uppercase tracking-widest z-10">
              Demo Access Port
            </span>
          </div>

          {/* Quick Demo Connect */}
          <div className="space-y-2.5 relative z-10">
            <p className="text-[10px] text-slate-400 text-center font-medium leading-none">
              Click to autofill credentials and initialize role console
            </p>
            <div className="grid grid-cols-3 gap-2">
              {(["Admin", "Manager", "Member"] as UserRole[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  disabled={isAutofilling || isSubmitting}
                  onClick={() => handleDemoFill(r)}
                  className="py-2.5 px-1 border border-card-border/40 hover:border-cyan-accent/50 bg-slate-950/60 hover:bg-slate-950 rounded-xl text-center cursor-pointer transition-all duration-200 group hover:shadow-[0_0_12px_rgba(0,242,254,0.15)] flex flex-col items-center justify-center gap-1"
                >
                  <span className="text-[11px] font-bold text-white group-hover:text-cyan-accent transition-colors leading-none">
                    {r}
                  </span>
                  <span className="text-[8px] text-slate-450 font-semibold group-hover:text-slate-350 leading-none">
                    {r === "Admin" ? "Full Access" : r === "Manager" ? "Moderator" : "Limited"}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
