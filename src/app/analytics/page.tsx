"use client";

import React, { useState } from "react";
import { BarChart3, TrendingUp, Cpu, Flame, Database, ArrowUpRight, Award, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function AnalyticsPage() {
  const [activeChartTab, setActiveChartTab] = useState<"Productivity" | "Load" | "Queries">("Productivity");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-emerald-accent" />
          <span>System Analytics</span>
        </h1>
        <p className="text-xs text-muted mt-1">Review live load factors, compute telemetry, and project velocity.</p>
      </div>

      {/* Grid: 3 stat widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Computing Load */}
        <div className="p-5 rounded-2xl border border-card-border bg-card/45 glassmorphism space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted uppercase tracking-wider">Telemetry compute</span>
            <Cpu className="h-4.5 w-4.5 text-cyan-accent" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold tracking-tight">4.2 TFlops</span>
              <span className="text-[10px] font-bold text-emerald-accent bg-emerald-accent/15 px-2 py-0.5 rounded-full border border-emerald-accent/35">
                Optimal
              </span>
            </div>
            <div className="h-1.5 w-full bg-foreground/5 dark:bg-foreground/10 rounded-full overflow-hidden">
              <div className="h-full rounded-full bg-cyan-accent w-[72%]" />
            </div>
            <p className="text-[10px] text-muted leading-tight">CPU Thread Load: 72% across 16 core instances.</p>
          </div>
        </div>

        {/* Database Queries */}
        <div className="p-5 rounded-2xl border border-card-border bg-card/45 glassmorphism space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted uppercase tracking-wider">Sync queries</span>
            <Database className="h-4.5 w-4.5 text-purple-accent" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold tracking-tight">14.8k / min</span>
              <span className="text-[10px] font-bold text-cyan-accent bg-cyan-accent/15 px-2 py-0.5 rounded-full border border-cyan-accent/35">
                Active
              </span>
            </div>
            <div className="h-1.5 w-full bg-foreground/5 dark:bg-foreground/10 rounded-full overflow-hidden">
              <div className="h-full rounded-full bg-purple-accent w-[48%]" />
            </div>
            <p className="text-[10px] text-muted leading-tight">Average response latency: 14ms (cache hit ratio 98%).</p>
          </div>
        </div>

        {/* Commit Velocity */}
        <div className="p-5 rounded-2xl border border-card-border bg-card/45 glassmorphism space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted uppercase tracking-wider">Commit Velocity</span>
            <Flame className="h-4.5 w-4.5 text-rose-500" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold tracking-tight">64 pushes</span>
              <span className="text-[10px] font-bold text-rose-500 bg-rose-500/15 px-2 py-0.5 rounded-full border border-rose-500/35 animate-pulse">
                High Speed
              </span>
            </div>
            <div className="h-1.5 w-full bg-foreground/5 dark:bg-foreground/10 rounded-full overflow-hidden">
              <div className="h-full rounded-full bg-rose-500 w-[91%]" />
            </div>
            <p className="text-[10px] text-muted leading-tight">Increased code deliveries by 24.2% vs baseline.</p>
          </div>
        </div>
      </div>

      {/* Handcrafted Interactive SVG Chart Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Core Line Chart Widget */}
        <div className="lg:col-span-2 p-5 rounded-2xl border border-card-border bg-card/45 glassmorphism space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
            <div className="leading-tight">
              <h3 className="font-bold text-sm text-foreground flex items-center gap-1.5">
                <TrendingUp className="h-4.5 w-4.5 text-cyan-accent" /> Productivity Telemetry
              </h3>
              <p className="text-[10px] text-muted">Developer code outputs and telemetry logs over the past week.</p>
            </div>

            {/* Selector */}
            <div className="flex bg-slate-950/15 dark:bg-slate-950/50 p-0.5 rounded-lg border border-card-border/40 shrink-0">
              {(["Productivity", "Load", "Queries"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveChartTab(tab)}
                  className={cn(
                    "px-2.5 py-1 text-[10px] font-bold rounded-md cursor-pointer transition-all",
                    activeChartTab === tab
                      ? "bg-emerald-accent text-slate-950 shadow-sm"
                      : "text-muted hover:text-foreground"
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* SVG Line Graph */}
          <div className="relative h-60 w-full bg-slate-950/20 dark:bg-slate-950/40 rounded-xl border border-card-border/40 p-4 flex flex-col justify-end overflow-hidden group">
            {/* Chart grids */}
            <div className="absolute inset-0 flex flex-col justify-between p-4 pointer-events-none opacity-20">
              <div className="w-full border-b border-card-border" />
              <div className="w-full border-b border-card-border" />
              <div className="w-full border-b border-card-border" />
              <div className="w-full border-b border-card-border" />
            </div>

            {/* Glowing neon paths inside SVG */}
            <svg viewBox="0 0 500 200" className="w-full h-[85%] overflow-visible">
              <defs>
                <linearGradient id="glowGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00f2fe" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#00f2fe" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="purpleGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#9d4edd" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#9d4edd" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Chart paths depending on tab */}
              {activeChartTab === "Productivity" && (
                <>
                  <path
                    d="M 0 160 Q 80 120 160 140 T 320 80 T 480 30"
                    fill="none"
                    stroke="#00f2fe"
                    strokeWidth="3.5"
                    className="drop-shadow-[0_0_8px_rgba(0,242,254,0.6)]"
                  />
                  <path
                    d="M 0 160 Q 80 120 160 140 T 320 80 T 480 30 L 480 200 L 0 200 Z"
                    fill="url(#glowGrad)"
                  />
                  {/* Nodes */}
                  <circle cx="160" cy="140" r="5" fill="#0b0f19" stroke="#00f2fe" strokeWidth="2.5" />
                  <circle cx="320" cy="80" r="5" fill="#0b0f19" stroke="#00f2fe" strokeWidth="2.5" />
                  <circle cx="480" cy="30" r="5" fill="#00f2fe" className="animate-ping" />
                </>
              )}

              {activeChartTab === "Load" && (
                <>
                  <path
                    d="M 0 60 Q 80 140 160 80 T 320 150 T 480 110"
                    fill="none"
                    stroke="#9d4edd"
                    strokeWidth="3.5"
                    className="drop-shadow-[0_0_8px_rgba(157,78,221,0.6)]"
                  />
                  <path
                    d="M 0 60 Q 80 140 160 80 T 320 150 T 480 110 L 480 200 L 0 200 Z"
                    fill="url(#purpleGrad)"
                  />
                  <circle cx="160" cy="80" r="5" fill="#0b0f19" stroke="#9d4edd" strokeWidth="2.5" />
                  <circle cx="320" cy="150" r="5" fill="#0b0f19" stroke="#9d4edd" strokeWidth="2.5" />
                </>
              )}

              {activeChartTab === "Queries" && (
                <>
                  <path
                    d="M 0 180 Q 80 150 160 90 T 320 50 T 480 80"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="3.5"
                    className="drop-shadow-[0_0_8px_rgba(16,185,129,0.6)]"
                  />
                  {/* Bar indicators representation */}
                  <rect x="70" y="100" width="12" height="100" fill="#10b981" fillOpacity="0.25" rx="3" />
                  <rect x="150" y="70" width="12" height="130" fill="#10b981" fillOpacity="0.25" rx="3" />
                  <rect x="310" y="40" width="12" height="160" fill="#10b981" fillOpacity="0.25" rx="3" />
                  <rect x="470" y="60" width="12" height="140" fill="#10b981" fillOpacity="0.25" rx="3" />
                </>
              )}
            </svg>

            {/* Labels */}
            <div className="flex justify-between items-center text-[9px] font-bold text-muted uppercase tracking-wider pt-2 border-t border-card-border/20">
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
              <span>Sun</span>
            </div>
          </div>
        </div>

        {/* Circular Progress Gauge */}
        <div className="p-5 rounded-2xl border border-card-border bg-card/45 glassmorphism space-y-6 flex flex-col justify-between">
          <div className="leading-tight">
            <h3 className="font-bold text-sm text-foreground flex items-center gap-1.5">
              <Award className="h-4.5 w-4.5 text-purple-accent" /> Sprint Accomplishment
            </h3>
            <p className="text-[10px] text-muted">Weekly sprint burnup progress against scheduled backlogs.</p>
          </div>

          <div className="flex justify-center items-center relative my-4">
            <svg width="150" height="150" className="rotate-[-90deg]">
              {/* Background circle */}
              <circle cx="75" cy="75" r="60" fill="transparent" stroke="rgba(148,163,184,0.08)" strokeWidth="10" />
              {/* Foreground circle with dash-offset */}
              <circle
                cx="75"
                cy="75"
                r="60"
                fill="transparent"
                stroke="url(#gradientRing)"
                strokeWidth="10"
                strokeDasharray="377"
                strokeDashoffset="94" /* 75% complete */
                strokeLinecap="round"
                className="drop-shadow-[0_0_6px_rgba(0,242,254,0.4)]"
              />
              <defs>
                <linearGradient id="gradientRing" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#9d4edd" />
                  <stop offset="100%" stopColor="#00f2fe" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute text-center leading-none">
              <p className="text-3xl font-extrabold tracking-tight">75%</p>
              <p className="text-[9px] text-muted uppercase font-bold tracking-widest mt-1">Complete</p>
            </div>
          </div>

          <div className="p-3 bg-slate-950/25 dark:bg-slate-950/45 rounded-xl border border-card-border/40 text-[10px] font-medium leading-relaxed text-muted flex items-start gap-2">
            <Zap className="h-4.5 w-4.5 text-cyan-accent shrink-0 mt-0.5" />
            <span>Telemetry reports you are 12% faster in task completion times compared to last sprint. Keep pushing!</span>
          </div>
        </div>

      </div>
    </div>
  );
}
