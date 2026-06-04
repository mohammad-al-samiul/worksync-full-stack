"use client";

import React, { useState, useEffect } from "react";
import { History, GitCommit, GitPullRequest, ShieldAlert, CheckSquare, MessageSquare, Rocket, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { apiFetch, parseJson } from "@/lib/api";

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

function inferActivityType(text: string): Activity["type"] {
  const lower = text.toLowerCase();
  if (lower.includes("overdue") || lower.includes("denied") || lower.includes("deleted")) return "alert";
  if (lower.includes("comment")) return "comment";
  if (lower.includes("logged in") || lower.includes("registered")) return "deploy";
  if (lower.includes("assigned") || lower.includes("created") || lower.includes("updated") || lower.includes("completed")) {
    return "task";
  }
  return "task";
}

function formatRelativeTime(date: Date): string {
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function ActivityPage() {
  const [filter, setFilter] = useState<"All" | "Updates" | "Code" | "Alerts">("All");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await apiFetch("/api/activity");
        if (res.ok) {
          const logs = await parseJson<
            {
              id: string;
              actionDescription: string;
              timestamp: string;
              user: { name: string; avatar?: string | null };
            }[]
          >(res);
          if (logs) {
            setActivities(
              logs.map((log) => ({
                id: log.id,
                user: log.user.name,
                avatar:
                  log.user.avatar ||
                  `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(log.user.name)}`,
                action: "performed action",
                target: log.actionDescription,
                type: inferActivityType(log.actionDescription),
                time: formatRelativeTime(new Date(log.timestamp)),
                project: "WorkSync",
              }))
            );
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

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
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-cyan-accent" />
          </div>
        ) : null}
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
