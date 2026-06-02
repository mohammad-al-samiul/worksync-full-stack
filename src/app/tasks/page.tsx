"use client";

import React, { useState } from "react";
import { CheckSquare, Plus, Search, Calendar, CheckCircle2, Circle, AlertTriangle, AlertCircle, Bookmark } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface Task {
  id: string;
  text: string;
  completed: boolean;
  priority: "High" | "Medium" | "Low";
  date: string;
  project: string;
}

export default function TasksPage() {
  const [filter, setFilter] = useState<"All" | "Pending" | "Completed">("All");
  const [search, setSearch] = useState("");
  const [newTaskText, setNewTaskText] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState<"High" | "Medium" | "Low">("Medium");
  const [newTaskProject, setNewTaskProject] = useState("Cyber UI");
  
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: "1",
      text: "Integrate framer-motion page router transitions",
      completed: true,
      priority: "High",
      date: "Today",
      project: "Cyber Interface System",
    },
    {
      id: "2",
      text: "Verify cyber theme CSS variable mappings in dark & light",
      completed: false,
      priority: "High",
      date: "Today",
      project: "Cyber Interface System",
    },
    {
      id: "3",
      text: "Design responsive collapsible sidebar menu and mobile triggers",
      completed: true,
      priority: "Medium",
      date: "Yesterday",
      project: "Glassmorphism Themes",
    },
    {
      id: "4",
      text: "Audit auth credentials matching rules for demo quick access",
      completed: false,
      priority: "Medium",
      date: "June 4",
      project: "OAuth 2.0 Auth Gate",
    },
    {
      id: "5",
      text: "Optimize theme context rendering loops to remove styling mismatches",
      completed: false,
      priority: "Low",
      date: "June 8",
      project: "Glassmorphism Themes",
    },
    {
      id: "6",
      text: "Draw SVG line paths for database telemetry analytics",
      completed: false,
      priority: "High",
      date: "June 10",
      project: "WorkSync Database Sync",
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

    const newTask: Task = {
      id: Date.now().toString(),
      text: newTaskText.trim(),
      completed: false,
      priority: newTaskPriority,
      date: "Today",
      project: newTaskProject,
    };

    setTasks((prev) => [newTask, ...prev]);
    setNewTaskText("");
  };

  const filteredTasks = tasks.filter((t) => {
    const matchesFilter =
      filter === "All" ||
      (filter === "Completed" && t.completed) ||
      (filter === "Pending" && !t.completed);
    
    const matchesSearch =
      t.text.toLowerCase().includes(search.toLowerCase()) ||
      t.project.toLowerCase().includes(search.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "High":
        return <AlertCircle className="h-4 w-4 text-rose-500" />;
      case "Medium":
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      default:
        return <Bookmark className="h-4 w-4 text-emerald-accent" />;
    }
  };

  const getPriorityBg = (priority: string) => {
    switch (priority) {
      case "High":
        return "bg-rose-500/10 text-rose-500 border-rose-500/20";
      case "Medium":
        return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      default:
        return "bg-emerald-accent/10 text-emerald-accent border-emerald-accent/20";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <CheckSquare className="h-6 w-6 text-cyan-accent" />
          <span>Sprint Tasks</span>
        </h1>
        <p className="text-xs text-muted mt-1">Assign, check, and filter sprint backlogs.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Form: Add Task Panel */}
        <div className="p-5 rounded-2xl border border-card-border bg-card/45 glassmorphism space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">Task Assigner</h2>
          <form onSubmit={handleAddTask} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-wider text-muted font-bold">Task Title</label>
              <input
                type="text"
                value={newTaskText}
                onChange={(e) => setNewTaskText(e.target.value)}
                placeholder="Integrate security audits..."
                className="w-full h-10 px-3 bg-slate-950/40 rounded-lg border border-card-border/60 text-xs focus:outline-none focus:border-cyan-accent transition-all placeholder:text-muted"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-wider text-muted font-bold">Parent Project</label>
              <select
                value={newTaskProject}
                onChange={(e) => setNewTaskProject(e.target.value)}
                className="w-full h-10 px-2 bg-slate-950/60 rounded-lg border border-card-border/60 text-xs focus:outline-none focus:border-cyan-accent text-foreground"
              >
                <option value="Cyber Interface System">Cyber Interface System</option>
                <option value="WorkSync Database Sync">WorkSync Database Sync</option>
                <option value="Glassmorphism Themes">Glassmorphism Themes</option>
                <option value="OAuth 2.0 Auth Gate">OAuth 2.0 Auth Gate</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-wider text-muted font-bold">Severity/Priority</label>
              <div className="grid grid-cols-3 gap-2">
                {(["Low", "Medium", "High"] as const).map((pr) => (
                  <button
                    key={pr}
                    type="button"
                    onClick={() => setNewTaskPriority(pr)}
                    className={cn(
                      "py-2 border text-xs font-bold rounded-lg cursor-pointer transition-all",
                      newTaskPriority === pr
                        ? getPriorityBg(pr)
                        : "border-card-border/60 bg-slate-950/20 text-muted hover:text-foreground"
                    )}
                  >
                    {pr}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full h-10 bg-gradient-to-r from-cyan-accent to-purple-accent text-slate-950 font-bold rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-cyan-accent/15"
            >
              <Plus className="h-4.5 w-4.5" />
              <span>Dispatch Task</span>
            </button>
          </form>
        </div>

        {/* Right Form: Task List View */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search tasks..."
                className="w-full h-9 pl-9 pr-3 bg-card/40 rounded-lg border border-card-border/60 text-xs focus:outline-none focus:border-cyan-accent transition-all placeholder:text-muted"
              />
            </div>

            {/* Filter */}
            <div className="flex bg-slate-950/15 dark:bg-slate-950/50 p-0.5 rounded-lg border border-card-border/40 shrink-0">
              {(["All", "Pending", "Completed"] as const).map((opt) => (
                <button
                  key={opt}
                  onClick={() => setFilter(opt)}
                  className={cn(
                    "px-2.5 py-1 text-[11px] font-bold rounded-md cursor-pointer transition-all",
                    filter === opt
                      ? "bg-cyan-accent text-slate-950 shadow-sm"
                      : "text-muted hover:text-foreground"
                  )}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <AnimatePresence mode="popLayout">
              {filteredTasks.map((t) => (
                <motion.div
                  key={t.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  onClick={() => handleToggleTask(t.id)}
                  className={cn(
                    "flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-card-border/50 bg-card/25 hover:bg-card/45 cursor-pointer transition-all group",
                    t.completed && "opacity-75"
                  )}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <button className="shrink-0 flex items-center justify-center h-4.5 w-4.5 rounded-md border border-card-border group-hover:border-cyan-accent text-cyan-accent bg-slate-950/20">
                      {t.completed ? (
                        <CheckCircle2 className="h-4.5 w-4.5 fill-cyan-accent text-slate-950" />
                      ) : (
                        <Circle className="h-3.5 w-3.5 text-muted/60" />
                      )}
                    </button>
                    <div className="leading-tight">
                      <p
                        className={cn(
                          "text-xs font-semibold text-foreground transition-all duration-300",
                          t.completed && "line-through text-muted opacity-60"
                        )}
                      >
                        {t.text}
                      </p>
                      <p className="text-[10px] text-muted/70 font-medium mt-0.5">{t.project}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3.5 shrink-0">
                    <span className="flex items-center gap-1 text-[10px] text-muted">
                      <Calendar className="h-3 w-3" /> {t.date}
                    </span>
                    <span className={cn("px-2 py-0.5 rounded-full border text-[9px] font-bold uppercase tracking-wider flex items-center gap-1", getPriorityBg(t.priority))}>
                      {getPriorityIcon(t.priority)}
                      <span>{t.priority}</span>
                    </span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {filteredTasks.length === 0 && (
              <div className="text-center p-8 rounded-2xl border border-dashed border-card-border/60 bg-card/10">
                <p className="text-xs text-muted">No tasks found matching your filters.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
