"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FolderKanban, Search, Plus, Filter, Calendar, Users, Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface Project {
  id: string;
  name: string;
  category: string;
  desc: string;
  progress: number;
  priority: "High" | "Medium" | "Low";
  status: "Active" | "Completed" | "Review";
  dueDate: string;
  members: number;
  starred: boolean;
}

export default function ProjectsPage() {
  const [filter, setFilter] = useState<"All" | "Active" | "Completed" | "Review">("All");
  const [search, setSearch] = useState("");
  const [projects, setProjects] = useState<Project[]>([
    {
      id: "1",
      name: "Cyber Interface System",
      category: "Frontend UI",
      desc: "Implement Next.js 16 app layout styling using custom CSS variables and framer-motion.",
      progress: 68,
      priority: "High",
      status: "Active",
      dueDate: "June 15, 2026",
      members: 4,
      starred: true,
    },
    {
      id: "2",
      name: "WorkSync Database Sync",
      category: "Backend Engine",
      desc: "Architect background jobs for auto-fetching telemetry metrics and handling failovers.",
      progress: 85,
      priority: "Medium",
      status: "Active",
      dueDate: "June 20, 2026",
      members: 2,
      starred: false,
    },
    {
      id: "3",
      name: "Glassmorphism Themes",
      category: "Design System",
      desc: "Optimize theme context rendering loops to remove styling flashes on client load.",
      progress: 100,
      priority: "Low",
      status: "Completed",
      dueDate: "May 28, 2026",
      members: 3,
      starred: true,
    },
    {
      id: "4",
      name: "OAuth 2.0 Auth Gate",
      category: "Security",
      desc: "Develop encrypted JSON Web Token workflows with biometric autofills.",
      progress: 20,
      priority: "High",
      status: "Review",
      dueDate: "July 2, 2026",
      members: 5,
      starred: false,
    },
    {
      id: "5",
      name: "Productivity Heatmaps",
      category: "Data Analytics",
      desc: "Render canvas-based heatmaps representing developer keyboard triggers.",
      progress: 0,
      priority: "Medium",
      status: "Active",
      dueDate: "July 12, 2026",
      members: 3,
      starred: false,
    },
  ]);

  const toggleStar = (id: string) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, starred: !p.starred } : p))
    );
  };

  const filteredProjects = projects.filter((p) => {
    const matchesFilter = filter === "All" || p.status === filter;
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase()) ||
      p.desc.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <FolderKanban className="h-6 w-6 text-purple-accent" />
            <span>Projects Board</span>
          </h1>
          <p className="text-xs text-muted mt-1">Manage, monitor and configure workspace pipeline activities.</p>
        </div>
        <button className="flex items-center gap-1.5 px-4 h-10 rounded-xl bg-gradient-to-r from-cyan-accent to-purple-accent text-slate-950 text-xs font-bold uppercase tracking-wider transition-all duration-300 shadow-lg cursor-pointer">
          <Plus className="h-4.5 w-4.5" />
          <span>New Project</span>
        </button>
      </div>

      {/* Toolbar Options */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects by name, tags..."
            className="w-full h-10 pl-10 pr-4 bg-card/40 rounded-xl border border-card-border/60 text-xs focus:outline-none focus:border-cyan-accent focus:ring-1 focus:ring-cyan-accent transition-all placeholder:text-muted"
          />
        </div>

        {/* Filters */}
        <div className="flex overflow-x-auto gap-1 bg-slate-950/15 dark:bg-slate-950/50 p-1 rounded-xl border border-card-border/40 shrink-0">
          {(["All", "Active", "Completed", "Review"] as const).map((opt) => (
            <button
              key={opt}
              onClick={() => setFilter(opt)}
              className={cn(
                "px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap",
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

      {/* Project Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredProjects.map((p, idx) => (
            <motion.div
              key={p.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.25 }}
              className="p-5 rounded-2xl border border-card-border bg-card/45 glassmorphism hover:bg-card/65 transition-all duration-300 relative group flex flex-col justify-between shadow-sm h-full"
            >
              <div>
                {/* Upper bar */}
                <div className="flex items-center justify-between mb-3.5">
                  <span className="text-[10px] font-bold text-cyan-accent uppercase tracking-wider px-2 py-0.5 rounded-md bg-cyan-accent/10 border border-cyan-accent/20">
                    {p.category}
                  </span>
                  <button
                    onClick={() => toggleStar(p.id)}
                    className="p-1 rounded-lg border border-card-border/60 bg-slate-950/20 hover:border-amber-400 text-muted hover:text-amber-400 cursor-pointer transition-colors"
                  >
                    <Star className={cn("h-4 w-4", p.starred ? "fill-amber-400 text-amber-400" : "")} />
                  </button>
                </div>

                {/* Name & Desc */}
                <div className="space-y-1 mb-4">
                  <h3 className="font-bold text-base text-foreground leading-snug group-hover:text-cyan-accent transition-colors">
                    {p.name}
                  </h3>
                  <p className="text-xs text-muted leading-relaxed line-clamp-3">{p.desc}</p>
                </div>
              </div>

              {/* Progress & Bottom Bar */}
              <div className="space-y-4 pt-4 border-t border-card-border/30 mt-auto">
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-semibold text-muted">
                    <span>Task Completion</span>
                    <span className="text-foreground">{p.progress}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-foreground/5 dark:bg-foreground/10 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${p.progress}%` }}
                      className="h-full rounded-full bg-gradient-to-r from-cyan-accent to-purple-accent transition-all duration-500"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] font-medium text-muted">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-purple-accent" /> {p.dueDate}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5 text-cyan-accent" /> {p.members} Devs
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
