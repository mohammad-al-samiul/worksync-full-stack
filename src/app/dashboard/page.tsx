"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";
import {
  FolderKanban,
  CheckSquare,
  Users,
  TrendingUp,
  Plus,
  ArrowUpRight,
  Clock,
  Sparkles,
  ShieldAlert,
  Sliders,
  Play,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCard {
  title: string;
  value: string;
  change: string;
  positive: boolean;
  icon: React.ComponentType<any>;
  accent: "cyan" | "purple" | "emerald";
}

interface ProjectItem {
  id: string;
  name: string;
  desc: string;
  progress: number;
  priority: "High" | "Medium" | "Low";
  status: "Active" | "Completed" | "Review";
  contributors: string[];
}

export default function Dashboard() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([
    { id: "1", text: "Integrate framer-motion page router transitions", completed: true },
    { id: "2", text: "Verify cyber theme CSS variable mappings", completed: false },
    { id: "3", text: "Design responsive collapsible sidebar menu", completed: true },
    { id: "4", text: "Audit auth credentials matching rules", completed: false },
  ]);
  const [newTaskText, setNewTaskText] = useState("");

  const metrics: MetricCard[] = [
    {
      title: "Active Projects",
      value: "8 Active",
      change: "+12.4% this month",
      positive: true,
      icon: FolderKanban,
      accent: "cyan",
    },
    {
      title: "Tasks Completed",
      value: "42 / 64",
      change: "+8.2% vs last week",
      positive: true,
      icon: CheckSquare,
      accent: "purple",
    },
    {
      title: "Team Members",
      value: "14 Eng",
      change: "+2 members added",
      positive: true,
      icon: Users,
      accent: "cyan",
    },
    {
      title: "Efficiency Index",
      value: "94.8%",
      change: "-1.1% dip today",
      positive: false,
      icon: TrendingUp,
      accent: "emerald",
    },
  ];

  const [projects, setProjects] = useState<ProjectItem[]>([
    {
      id: "p1",
      name: "Cyber Interface System",
      desc: "Implement Next.js 16 app layout styling using custom CSS variables.",
      progress: 68,
      priority: "High",
      status: "Active",
      contributors: [
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&q=80",
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=80&q=80",
      ],
    },
    {
      id: "p2",
      name: "WorkSync Database Sync",
      desc: "Architect background jobs for auto-fetching telemetry metrics.",
      progress: 85,
      priority: "Medium",
      status: "Active",
      contributors: [
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&q=80",
      ],
    },
    {
      id: "p3",
      name: "Glassmorphism Themes",
      desc: "Optimize theme context rendering loops to remove styling mismatches.",
      progress: 100,
      priority: "Low",
      status: "Completed",
      contributors: [
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=80&q=80",
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&q=80",
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&q=80",
      ],
    },
  ]);

  const handleToggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;
    setTasks((prev) => [
      ...prev,
      { id: Date.now().toString(), text: newTaskText.trim(), completed: false },
    ]);
    setNewTaskText("");
  };

  const getGlowClass = (accent: string) => {
    switch (accent) {
      case "cyan":
        return "cyber-glow-cyan cyber-glow-cyan-hover";
      case "purple":
        return "cyber-glow-purple cyber-glow-purple-hover";
      default:
        return "cyber-glow-emerald cyber-glow-emerald-hover";
    }
  };

  const getTextColor = (accent: string) => {
    switch (accent) {
      case "cyan":
        return "text-cyan-accent";
      case "purple":
        return "text-purple-accent";
      default:
        return "text-emerald-accent";
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl border border-card-border bg-card/45 glassmorphism relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-accent/5 rounded-full blur-3xl pointer-events-none" />
        <div className="space-y-1 relative z-10">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-cyan-accent flex items-center gap-1.5 bg-cyan-accent/10 px-2.5 py-0.5 rounded-full border border-cyan-accent/20">
              <Sparkles className="h-3 w-3 animate-spin" /> Live Session
            </span>
            <span className="text-xs text-muted">•</span>
            <span className="text-xs font-medium text-muted">{user?.role} Mode</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            Welcome back, <span className="bg-gradient-to-r from-cyan-accent to-purple-accent bg-clip-text text-transparent">{user?.name}</span>
          </h1>
          <p className="text-xs text-muted">
            Here is what is happening across your projects today.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button className="flex items-center gap-1.5 px-4 h-10 rounded-xl bg-gradient-to-r from-cyan-accent to-purple-accent hover:from-cyan-accent hover:to-purple-accent text-slate-950 text-xs font-bold uppercase tracking-wider transition-all duration-300 shadow-lg shadow-purple-accent/15 cursor-pointer">
            <Plus className="h-4 w-4" />
            <span>New Project</span>
          </button>
        </div>
      </motion.div>

      {/* Role-Based Insight Banners */}
      {user?.role === "Admin" && (
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="p-4 rounded-xl border border-purple-accent/30 bg-purple-accent/5 text-purple-accent flex items-center justify-between gap-4 shadow-sm"
        >
          <div className="flex items-center gap-3">
            <Sliders className="h-5 w-5 shrink-0" />
            <div className="text-left">
              <p className="text-xs font-bold uppercase tracking-wider">Administrator Workspace Privileges Active</p>
              <p className="text-[11px] text-muted leading-tight mt-0.5">You have read-write auth configs, database sync actions, and telemetry adjustments.</p>
            </div>
          </div>
          <button className="text-[11px] font-bold underline shrink-0 hover:text-white transition-colors cursor-pointer">
            Run Telemetry Audit
          </button>
        </motion.div>
      )}

      {user?.role === "Manager" && (
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="p-4 rounded-xl border border-cyan-accent/30 bg-cyan-accent/5 text-cyan-accent flex items-center justify-between gap-4 shadow-sm"
        >
          <div className="flex items-center gap-3">
            <ShieldAlert className="h-5 w-5 shrink-0" />
            <div className="text-left">
              <p className="text-xs font-bold uppercase tracking-wider">Manager moderation active</p>
              <p className="text-[11px] text-muted leading-tight mt-0.5">You can adjust task priorities, edit project contributors, and dispatch project warnings.</p>
            </div>
          </div>
          <button className="text-[11px] font-bold underline shrink-0 hover:text-white transition-colors cursor-pointer">
            Update Priorities
          </button>
        </motion.div>
      )}

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m, idx) => {
          const Icon = m.icon;
          return (
            <motion.div
              key={m.title}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08, duration: 0.3 }}
              className={cn(
                "p-5 rounded-2xl border border-card-border bg-card/40 glassmorphism relative overflow-hidden group shadow-sm transition-all duration-300",
                getGlowClass(m.accent)
              )}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-muted uppercase tracking-wider">{m.title}</span>
                <div className={cn("p-2 rounded-lg bg-card border border-card-border/60", getTextColor(m.accent))}>
                  <Icon className="h-4.5 w-4.5" />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-bold tracking-tight text-foreground">{m.value}</p>
                <div className="flex items-center gap-1.5">
                  <span className={cn("text-[10px] font-semibold", m.positive ? "text-emerald-accent" : "text-rose-500")}>
                    {m.change.split(" ")[0]}
                  </span>
                  <span className="text-[10px] text-muted">{m.change.split(" ").slice(1).join(" ")}</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Main Core Layout: Projects Grid & Task List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Projects Panel */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-base font-bold tracking-tight flex items-center gap-2">
              <FolderKanban className="h-4.5 w-4.5 text-purple-accent" />
              <span>Project Pipelines</span>
            </h2>
            <button className="text-xs font-semibold text-cyan-accent hover:underline flex items-center gap-0.5 cursor-pointer">
              <span>View all</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="space-y-4">
            {projects.map((proj, idx) => (
              <motion.div
                key={proj.id}
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1, duration: 0.3 }}
                className="p-5 rounded-2xl border border-card-border bg-card/35 glassmorphism hover:bg-card/50 transition-all duration-300 relative group"
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="space-y-0.5">
                    <h3 className="font-bold text-sm text-foreground group-hover:text-cyan-accent transition-colors">
                      {proj.name}
                    </h3>
                    <p className="text-xs text-muted leading-snug">{proj.desc}</p>
                  </div>
                  <span
                    className={cn(
                      "px-2 py-0.5 rounded-full border text-[9px] font-bold uppercase tracking-wider shrink-0",
                      proj.priority === "High"
                        ? "bg-rose-500/10 text-rose-500 border-rose-500/20"
                        : proj.priority === "Medium"
                        ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                        : "bg-emerald-accent/10 text-emerald-accent border-emerald-accent/20"
                    )}
                  >
                    {proj.priority}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 border-t border-card-border/30">
                  {/* Progress Gauge */}
                  <div className="flex-1 max-w-xs space-y-1">
                    <div className="flex items-center justify-between text-[10px] font-semibold text-muted">
                      <span>Progress</span>
                      <span className="text-foreground">{proj.progress}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-foreground/5 dark:bg-foreground/10 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${proj.progress}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className={cn(
                          "h-full rounded-full",
                          proj.progress === 100 ? "bg-emerald-accent" : "bg-gradient-to-r from-cyan-accent to-purple-accent"
                        )}
                      />
                    </div>
                  </div>

                  {/* Contributor Avatars */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                    <div className="flex -space-x-2">
                      {proj.contributors.map((avatar, cIdx) => (
                        <img
                          key={cIdx}
                          src={avatar}
                          alt="Contributor"
                          className="h-6.5 w-6.5 rounded-full border-2 border-background object-cover bg-slate-900"
                        />
                      ))}
                    </div>
                    <span className="text-[10px] font-bold text-muted flex items-center gap-1">
                      <Clock className="h-3 w-3 text-cyan-accent" /> {proj.status}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Tasks List Panel */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-base font-bold tracking-tight flex items-center gap-2">
              <CheckSquare className="h-4.5 w-4.5 text-cyan-accent" />
              <span>Sprint Tasks</span>
            </h2>
            <span className="text-[10px] font-semibold bg-emerald-accent/10 border border-emerald-accent/20 text-emerald-accent px-2 py-0.5 rounded-full">
              {tasks.filter((t) => t.completed).length}/{tasks.length} Done
            </span>
          </div>

          <div className="p-5 rounded-2xl border border-card-border bg-card/35 glassmorphism space-y-4">
            {/* Add Task Form */}
            <form onSubmit={handleAddTask} className="flex gap-2">
              <input
                type="text"
                value={newTaskText}
                onChange={(e) => setNewTaskText(e.target.value)}
                placeholder="Assign new task..."
                className="flex-1 h-9 px-3 bg-slate-950/40 dark:bg-slate-950/65 rounded-lg border border-card-border/60 text-xs focus:outline-none focus:border-cyan-accent transition-all placeholder:text-muted"
              />
              <button
                type="submit"
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-accent hover:bg-cyan-accent text-slate-950 cursor-pointer shadow-md shadow-cyan-accent/10 active:scale-95 transition-all"
              >
                <Plus className="h-4 w-4" />
              </button>
            </form>

            {/* Task Checklist items */}
            <div className="space-y-2.5">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => handleToggleTask(task.id)}
                  className="flex items-center gap-3 p-3 rounded-xl border border-card-border/50 bg-card/20 hover:bg-card/45 transition-all duration-200 cursor-pointer group"
                >
                  <button className="shrink-0 flex items-center justify-center h-4.5 w-4.5 rounded-md border border-card-border group-hover:border-cyan-accent/60 bg-slate-950/40 text-cyan-accent transition-colors">
                    {task.completed && <CheckCircle2 className="h-4.5 w-4.5 fill-cyan-accent text-slate-950" />}
                  </button>
                  <span
                    className={cn(
                      "text-xs font-medium transition-all duration-300 select-none",
                      task.completed ? "line-through text-muted opacity-60" : "text-foreground"
                    )}
                  >
                    {task.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
