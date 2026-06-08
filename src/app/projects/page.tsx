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
  Pencil,
  Trash2,
} from "lucide-react";
import { SubmitButton } from "@/components/SubmitButton";
import { ActionOverlay } from "@/components/ActionOverlay";
import { CyberDropdown } from "@/components/CyberDropdown";
import { StyledSelect } from "@/components/StyledSelect";
import { FormField, formInputClass, formTextareaClass } from "@/components/FormField";
import ConfirmDeleteModal from "@/components/ConfirmDeleteModal";
import { cn } from "@/lib/utils";
import { apiFetch, parseJson, type PaginatedResponse } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { canManageProjects, todayInputValue } from "@/lib/roles";

const projectSchema = z.object({
  name: z.string().min(3, "Project name must be at least 3 characters"),
  description: z.string().optional(),
  deadline: z.string().min(1, "Deadline is required"),
  status: z.enum(["ACTIVE", "COMPLETED", "ON_HOLD"]).optional(),
  memberEmails: z.string().optional(),
});

type ProjectFormValues = z.infer<typeof projectSchema>;

const PROJECT_STATUS_OPTIONS = [
  { value: "ALL", label: "All Status" },
  { value: "ACTIVE", label: "Active" },
  { value: "COMPLETED", label: "Completed" },
  { value: "ON_HOLD", label: "On Hold" },
] as const;

const PROJECT_SORT_OPTIONS = [
  { value: "LATEST", label: "Latest Created" },
  { value: "DEADLINE", label: "Nearest Deadline" },
  { value: "UPDATED", label: "Recently Updated" },
] as const;

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
  tasks?: { id: string; status: string }[];
}

function parseMemberEmails(raw?: string): string[] {
  if (!raw?.trim()) return [];
  return raw.split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);
}

export default function ProjectsPage() {
  const { user } = useAuth();
  const canManage = user ? canManageProjects(user.role) : false;

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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
    defaultValues: { status: "ACTIVE" },
  });

  const fetchProjects = useCallback(async (pageNum = 1, append = false) => {
    try {
      if (!append) setLoading(true);
      const res = await apiFetch(`/api/projects?page=${pageNum}&limit=12`);
      if (res.ok) {
        const data = await parseJson<PaginatedResponse<Project>>(res);
        if (data) {
          setProjects((prev) => (append ? [...prev, ...data.data] : data.data));
          setTotalPages(data.meta.totalPages);
          setPage(pageNum);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchProjects(1);
  }, [fetchProjects]);

  const openCreate = () => {
    setEditingProject(null);
    reset({ status: "ACTIVE", memberEmails: "" });
    setIsModalOpen(true);
  };

  const openEdit = (project: Project) => {
    setEditingProject(project);
    reset({
      name: project.name,
      description: project.description || "",
      deadline: project.deadline ? new Date(project.deadline).toISOString().split("T")[0] : "",
      status: project.status as ProjectFormValues["status"],
      memberEmails: project.members?.map((m) => m.email).join(", ") || "",
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProject(null);
    reset();
  };

  const onSubmit = async (data: ProjectFormValues) => {
    setIsSaving(true);
    try {
      const payload = {
        name: data.name,
        description: data.description,
        deadline: data.deadline,
        status: data.status,
        memberEmails: parseMemberEmails(data.memberEmails),
      };

      const res = editingProject
        ? await apiFetch(`/api/projects/${editingProject.id}`, {
            method: "PUT",
            body: JSON.stringify(payload),
          })
        : await apiFetch("/api/projects", {
            method: "POST",
            body: JSON.stringify(payload),
          });

      if (res.ok) {
        closeModal();
        await fetchProjects(1);
      } else {
        const err = await res.json();
        alert(err.error);
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const res = await apiFetch(`/api/projects/${deleteTarget.id}`, { method: "DELETE" });
      if (res.ok) {
        setDeleteTarget(null);
        await fetchProjects(1);
      } else {
        const err = await res.json();
        alert(err.error);
      }
    } catch {
      alert("Could not delete project.");
    } finally {
      setIsDeleting(false);
    }
  };

  const loadMore = async () => {
    if (page >= totalPages) return;
    setIsLoadingMore(true);
    await fetchProjects(page + 1, true);
    setIsLoadingMore(false);
  };

  const filteredProjects = projects
    .filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.members?.some((m) => m.name.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesStatus = statusFilter === "ALL" || p.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === "LATEST")
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === "DEADLINE")
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      if (sortBy === "UPDATED")
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
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

  const taskProgress = (project: Project) => {
    const total = project.tasks?.length || 0;
    const done = project.tasks?.filter((t) => t.status === "COMPLETED").length || 0;
    if (total === 0) return null;
    return Math.round((done / total) * 100);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2">
            <FolderKanban className="text-purple-accent shrink-0" /> Projects
          </h1>
          <p className="text-sm text-muted mt-1">
            Keep track of what your team is working on.
          </p>
        </div>
        {canManage && (
          <button
            onClick={openCreate}
            className="flex items-center justify-center gap-2 bg-purple-accent hover:bg-purple-accent/80 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-[0_0_15px_rgba(157,78,221,0.4)] w-full sm:w-auto shrink-0"
          >
            <Plus className="h-4 w-4" /> New Project
          </button>
        )}
      </div>

      <div className="bg-card/45 glassmorphism border border-card-border p-4 rounded-2xl flex flex-col lg:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
          <input
            type="text"
            placeholder="Search by project or member name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900/50 border border-card-border rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-cyan-accent transition-colors"
          />
        </div>

        <div className="flex items-center gap-3 w-full lg:w-auto">
          <div className="flex items-center gap-2 rounded-xl border border-card-border bg-slate-900/50 px-3 py-2">
            <Filter className="h-4 w-4 shrink-0 text-muted" />
            <CyberDropdown
              variant="inline"
              accent="cyan"
              value={statusFilter}
              onChange={setStatusFilter}
              options={[...PROJECT_STATUS_OPTIONS]}
              menuClassName="min-w-[160px]"
            />
          </div>
          <CyberDropdown
            variant="filter"
            accent="purple"
            value={sortBy}
            onChange={setSortBy}
            options={[...PROJECT_SORT_OPTIONS]}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-purple-accent" />
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="text-center p-12 bg-card/20 rounded-2xl border border-card-border border-dashed">
          <FolderKanban className="h-10 w-10 text-muted mx-auto mb-3" />
          <p className="text-slate-400">No projects match your filters.</p>
        </div>
      ) : (
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredProjects.map((project) => {
              const pct = taskProgress(project);
              return (
                <motion.div
                  key={project.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  onClick={() => canManage && openEdit(project)}
                  className={cn(
                    "bg-card/45 glassmorphism border border-card-border p-4 sm:p-6 rounded-2xl hover:border-purple-accent/50 transition-colors group",
                    canManage && "cursor-pointer"
                  )}
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-bold text-base sm:text-lg leading-tight group-hover:text-purple-accent transition-colors truncate pr-2">
                      {project.name}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "text-[10px] font-bold px-2.5 py-1 rounded-full border uppercase tracking-wider",
                          getStatusColor(project.status)
                        )}
                      >
                        {project.status.replace("_", " ")}
                      </span>
                      {canManage && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteTarget(project);
                          }}
                          className="p-1.5 rounded-md text-muted hover:text-rose-500 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                          title="Delete project"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <p className="text-sm text-slate-400 mb-4 line-clamp-2 min-h-[40px]">
                    {project.description || "No description yet."}
                  </p>

                  {pct !== null && (
                    <div className="mb-4">
                      <div className="flex justify-between text-[10px] text-muted mb-1">
                        <span>Progress</span>
                        <span>{pct}% done</span>
                      </div>
                      <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-purple-accent rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs text-muted pt-4 border-t border-card-border/50">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" />
                      {project.deadline
                        ? new Date(project.deadline).toLocaleDateString()
                        : "No deadline"}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5" />
                      {project.members?.length || 0} members
                    </div>
                  </div>

                  {canManage && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openEdit(project);
                      }}
                      className="mt-3 flex items-center gap-1 text-[11px] text-purple-accent opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Pencil className="h-3 w-3" /> Edit
                    </button>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      )}

      {page < totalPages && (
        <SubmitButton
          type="button"
          onClick={loadMore}
          isLoading={isLoadingMore}
          loadingText="Loading..."
          variant="purple"
          className="w-full py-2.5 text-sm"
        >
          Load More
        </SubmitButton>
      )}

      <ConfirmDeleteModal
        open={!!deleteTarget}
        onClose={() => !isDeleting && setDeleteTarget(null)}
        onConfirm={confirmDelete}
        itemName={deleteTarget?.name ?? ""}
        title="Delete this project?"
        description="All tasks under this project will be removed permanently."
        isLoading={isDeleting}
        confirmLabel="Delete Project"
      />

      {isModalOpen && canManage && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative bg-slate-900 border border-card-border rounded-2xl p-4 sm:p-6 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            <ActionOverlay
              show={isSaving}
              label={editingProject ? "Saving changes..." : "Creating project..."}
            />
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              {editingProject ? (
                <>
                  <Pencil className="text-purple-accent" /> Edit Project
                </>
              ) : (
                <>
                  <Plus className="text-purple-accent" /> New Project
                </>
              )}
            </h2>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className={cn("space-y-4", isSaving && "pointer-events-none opacity-80")}
            >
              <FormField label="Name" error={errors.name?.message}>
                <input {...register("name")} className={formInputClass("purple")} />
              </FormField>

              <FormField label="Description">
                <textarea
                  {...register("description")}
                  className={formTextareaClass("purple")}
                />
              </FormField>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="Deadline" error={errors.deadline?.message}>
                  <input
                    type="date"
                    min={todayInputValue()}
                    {...register("deadline")}
                    className={cn(formInputClass("purple"), "cyber-input")}
                  />
                </FormField>
                <FormField label="Status">
                  <StyledSelect variant="form" {...register("status")}>
                    <option value="ACTIVE">Active</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="ON_HOLD">On Hold</option>
                  </StyledSelect>
                </FormField>
              </div>

              <FormField
                label="Team Members"
                hint="Comma-separated emails. Only registered users can be added."
              >
                <input
                  {...register("memberEmails")}
                  placeholder="member@worksync.io, manager@worksync.io"
                  className={formInputClass("purple")}
                />
              </FormField>

              <div className="flex gap-3 pt-2">
                <SubmitButton
                  type="button"
                  variant="ghost"
                  disabled={isSaving}
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 text-sm"
                >
                  Cancel
                </SubmitButton>
                <SubmitButton
                  isLoading={isSaving}
                  loadingText="Saving..."
                  variant="purple"
                  className="flex-1 px-4 py-2 text-sm"
                >
                  {editingProject ? "Save" : "Create"}
                </SubmitButton>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
