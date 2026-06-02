"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  FolderKanban,
  Search,
  Filter,
  Plus,
  Calendar,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

const projectSchema = z.object({
  name: z.string().min(3, "Project name must be at least 3 characters"),
  description: z.string().optional(),
  deadline: z.string().min(1, "Deadline is required"),
});

type ProjectFormValues = z.infer<typeof projectSchema>;

interface Member {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
}

interface Project {
  id: string;
  name: string;
  description?: string;
  deadline: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  members?: Member[];
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filters state
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("LATEST");

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
  });

  const fetchProjects = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      }
      const res = await fetch("/api/projects");
      if (res.ok) {
        const data = await res.json();
        setProjects(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const loadProjects = async () => {
      await fetchProjects(false);
    };

    void loadProjects();
  }, [fetchProjects]);

  const onSubmit = async (data: ProjectFormValues) => {
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        setIsModalOpen(false);
        reset();
        fetchProjects();
      } else {
        const err = await res.json();
        alert(err.error);
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Advanced Filtering & Sorting Logic
  const filteredProjects = projects
    .filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.members?.some((m: Member) =>
          m.name.toLowerCase().includes(searchTerm.toLowerCase()),
        );
      const matchesStatus = statusFilter === "ALL" || p.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === "LATEST")
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      if (sortBy === "DEADLINE")
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      return 0;
    });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "text-cyan-accent border-cyan-accent/20 bg-cyan-accent/10";
      case "COMPLETED":
        return "text-emerald-accent border-emerald-accent/20 bg-emerald-accent/10";
      case "ON_HOLD":
        return "text-amber-500 border-amber-500/20 bg-amber-500/10";
      default:
        return "text-slate-400 border-slate-700 bg-slate-800/50";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <FolderKanban className="text-purple-accent" /> Projects
          </h1>
          <p className="text-sm text-muted mt-1">
            Manage and track your active repositories and initiatives.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-purple-accent hover:bg-purple-accent/80 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-[0_0_15px_rgba(157,78,221,0.4)]"
        >
          <Plus className="h-4 w-4" /> New Project
        </button>
      </div>

      {/* Advanced Filter Bar */}
      <div className="bg-card/45 glassmorphism border border-card-border p-4 rounded-2xl flex flex-col lg:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
          <input
            type="text"
            placeholder="Search projects or members..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900/50 border border-card-border rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-cyan-accent transition-colors"
          />
        </div>

        <div className="flex items-center gap-3 w-full lg:w-auto">
          <div className="flex items-center gap-2 bg-slate-900/50 border border-card-border rounded-xl px-3 py-2">
            <Filter className="h-4 w-4 text-muted" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-sm focus:outline-none"
            >
              <option value="ALL">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="COMPLETED">Completed</option>
              <option value="ON_HOLD">On Hold</option>
            </select>
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-slate-900/50 border border-card-border rounded-xl px-3 py-2 text-sm focus:outline-none"
          >
            <option value="LATEST">Latest Created</option>
            <option value="DEADLINE">Nearest Deadline</option>
          </select>
        </div>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="flex justify-center p-12">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-purple-accent"></div>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="text-center p-12 bg-card/20 rounded-2xl border border-card-border border-dashed">
          <FolderKanban className="h-10 w-10 text-muted mx-auto mb-3" />
          <p className="text-slate-400">
            No projects found matching your criteria.
          </p>
        </div>
      ) : (
        <motion.div
          layout
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
        >
          <AnimatePresence>
            {filteredProjects.map((project) => (
              <motion.div
                key={project.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-card/45 glassmorphism border border-card-border p-6 rounded-2xl hover:border-purple-accent/50 transition-colors group cursor-pointer"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-bold text-lg leading-tight group-hover:text-purple-accent transition-colors">
                    {project.name}
                  </h3>
                  <span
                    className={cn(
                      "text-[10px] font-bold px-2.5 py-1 rounded-full border uppercase tracking-wider",
                      getStatusColor(project.status),
                    )}
                  >
                    {project.status.replace("_", " ")}
                  </span>
                </div>

                <p className="text-sm text-slate-400 mb-6 line-clamp-2 min-h-[40px]">
                  {project.description || "No description provided."}
                </p>

                <div className="flex items-center justify-between text-xs text-muted pt-4 border-t border-card-border/50">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    {new Date(project.deadline).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5" />
                    {project.members?.length || 0} Members
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-900 border border-card-border rounded-2xl p-6 w-full max-w-md shadow-2xl"
          >
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Plus className="text-purple-accent" /> Create New Project
            </h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-muted uppercase">
                  Project Name
                </label>
                <input
                  {...register("name")}
                  className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm focus:border-purple-accent focus:outline-none"
                />
                {errors.name && (
                  <p className="text-rose-500 text-xs mt-1">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div>
                <label className="text-xs font-semibold text-muted uppercase">
                  Description
                </label>
                <textarea
                  {...register("description")}
                  className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm focus:border-purple-accent focus:outline-none min-h-[80px]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted uppercase">
                  Deadline
                </label>
                <input
                  type="date"
                  {...register("deadline")}
                  className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm focus:border-purple-accent focus:outline-none text-slate-200"
                />
                {errors.deadline && (
                  <p className="text-rose-500 text-xs mt-1">
                    {errors.deadline.message}
                  </p>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    reset();
                  }}
                  className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-sm font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-purple-accent hover:bg-purple-accent/80 text-white rounded-xl text-sm font-semibold transition-colors"
                >
                  Create
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
