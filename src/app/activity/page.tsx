"use client";

import React, { useState } from "react";
import { History, GitCommit, GitPullRequest, ShieldAlert, CheckSquare, MessageSquare, Rocket, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface Activity {
  id: string;
  user: string;
  avatar: string;
  action: string;
  target: string;
  type: "commit" | "pr" | "task" | "comment" | "deploy" | "alert";
  time: string;
  hash?: string;
  project: string;
}

export default function ActivityPage() {
  const [filter, setFilter] = useState<"All" | "Updates" | "Code" | "Alerts">("All");
  const [search, setSearch] = useState("");

  const [activities, setActivities] = useState<Activity[]>([
    {
      id: "1",
      user: "Alex Rivers",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&q=80",
      action: "pushed commit to main branch",
      target: "feat: add theme context variables & provider setup",
      type: "commit",
      time: "8m ago",
      hash: "8bbafb3",
      project: "Cyber Interface System",
    },
    {
      id: "2",
      user: "Sarah Connor",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=80&q=80",
      action: "merged pull request #42",
      target: "refactor: optimize rendering loops in glassmorphism grids",
      type: "pr",
      time: "24m ago",
      hash: "cfefdeb",
      project: "Glassmorphism Themes",
    },
    {
      id: "3",
      user: "Marcus Wright",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&q=80",
      action: "completed sprint task",
      target: "Design responsive collapsible sidebar menu",
      type: "task",
      time: "1h ago",
      project: "Glassmorphism Themes",
    },
    {
      id: "4",
      user: "Kyle Reese",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=80&q=80",
      action: "raised security flag",
      target: "High-level token vulnerability detected in OAuth workflow",
      type: "alert",
      time: "3h ago",
      project: "OAuth 2.0 Auth Gate",
    },
    {
      id: "5",
      user: "Sarah Connor",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=80&q=80",
      action: "commented on issue #105",
      target: "'We need to restrict manager roles from modifying admin configs.'",
      type: "comment",
      time: "5h ago",
      project: "OAuth 2.0 Auth Gate",
    },
    {
      id: "6",
      user: "Jenkins CI",
      avatar: "https://images.unsplash.com/photo-1618401471353-b98aedd07871?auto=format&fit=crop&w=80&q=80",
      action: "deployed release v0.4.2-rc2",
      target: "Successfully pushed builds to Vercel production edge",
      type: "deploy",
      time: "1d ago",
      project: "Cyber Interface System",
    },
  ]);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "commit":
        return <GitCommit className="h-4 w-4 text-purple-accent" />;
      case "pr":
        return <GitPullRequest className="h-4 w-4 text-cyan-accent" />;
      case "task":
        return <CheckSquare className="h-4 w-4 text-emerald-accent" />;
      case "comment":
        return <MessageSquare className="h-4 w-4 text-sky-400" />;
      case "deploy":
        return <Rocket className="h-4 w-4 text-emerald-accent" />;
      default:
        return <ShieldAlert className="h-4 w-4 text-rose-500 animate-pulse" />;
    }
  };

  const getBorderColor = (type: string) => {
    switch (type) {
      case "alert":
        return "border-rose-500/20 hover:border-rose-500/40";
      case "commit":
      case "pr":
        return "border-purple-accent/20 hover:border-purple-accent/40";
      default:
        return "border-card-border/50 hover:border-cyan-accent/35";
    }
  };

  const filteredActivities = activities.filter((act) => {
    // Type categorizations
    const matchesFilter =
      filter === "All" ||
      (filter === "Code" && (act.type === "commit" || act.type === "pr")) ||
      (filter === "Updates" && (act.type === "task" || act.type === "comment" || act.type === "deploy")) ||
      (filter === "Alerts" && act.type === "alert");

    const matchesSearch =
      act.user.toLowerCase().includes(search.toLowerCase()) ||
      act.action.toLowerCase().includes(search.toLowerCase()) ||
      act.target.toLowerCase().includes(search.toLowerCase()) ||
      act.project.toLowerCase().includes(search.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <History className="h-6 w-6 text-purple-accent" />
          <span>Activity Log</span>
        </h1>
        <p className="text-xs text-muted mt-1">Review live auditing and development telemetry updates.</p>
      </div>

      {/* Toolbar Options */}
      <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search log triggers..."
            className="w-full h-10 pl-10 pr-4 bg-card/40 rounded-xl border border-card-border/60 text-xs focus:outline-none focus:border-cyan-accent transition-all placeholder:text-muted"
          />
        </div>

        {/* Categories */}
        <div className="flex bg-slate-950/15 dark:bg-slate-950/50 p-1 rounded-xl border border-card-border/40 shrink-0 overflow-x-auto">
          {(["All", "Code", "Updates", "Alerts"] as const).map((opt) => (
            <button
              key={opt}
              onClick={() => setFilter(opt)}
              className={cn(
                "px-3 py-1.5 text-xs font-bold rounded-lg cursor-pointer transition-all whitespace-nowrap",
                filter === opt
                  ? "bg-gradient-to-r from-cyan-accent to-purple-accent text-slate-950 shadow-sm"
                  : "text-muted hover:text-foreground"
              )}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline List */}
      <div className="space-y-3.5 relative before:absolute before:left-12 before:top-4 before:bottom-4 before:w-0.5 before:bg-card-border/30">
        <AnimatePresence mode="popLayout">
          {filteredActivities.map((act) => (
            <motion.div
              key={act.id}
              layout
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className={cn(
                "p-4 rounded-xl border bg-card/35 glassmorphism hover:bg-card/50 transition-all duration-300 flex items-start gap-4 shadow-sm",
                getBorderColor(act.type)
              )}
            >
              {/* Timeline Time Marker */}
              <span className="hidden sm:block text-[10px] text-muted/65 font-bold w-16 text-right shrink-0 pt-1">
                {act.time}
              </span>

              {/* Icon Bubble */}
              <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-card-border/60 bg-slate-950/20 shrink-0">
                {getActivityIcon(act.type)}
              </div>

              {/* Avatar actor */}
              <img
                src={act.avatar}
                alt={act.user}
                className="h-8.5 w-8.5 rounded-lg border border-card-border/80 object-cover shrink-0 bg-slate-900"
              />

              {/* Text Description */}
              <div className="flex-1 min-w-0 space-y-1.5 leading-snug">
                <p className="text-xs text-foreground font-semibold">
                  <span className="text-foreground hover:underline font-bold cursor-pointer">{act.user}</span>{" "}
                  <span className="text-muted/80">{act.action}</span>
                </p>
                <p className="text-xs text-slate-350 bg-slate-950/20 dark:bg-slate-950/40 p-2.5 rounded-lg border border-card-border/40 font-mono tracking-tight break-all">
                  {act.target}
                </p>
                
                {/* Secondary Info */}
                <div className="flex flex-wrap items-center gap-2.5 text-[9px] font-bold text-muted uppercase tracking-wider">
                  <span className="text-cyan-accent">{act.project}</span>
                  {act.hash && (
                    <>
                      <span>•</span>
                      <span className="font-mono text-purple-accent select-all">{act.hash}</span>
                    </>
                  )}
                  <span className="sm:hidden text-muted/60">• {act.time}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredActivities.length === 0 && (
          <div className="text-center p-8 rounded-2xl border border-dashed border-card-border/60 bg-card/10">
            <p className="text-xs text-muted">No telemetry items matches the filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}
