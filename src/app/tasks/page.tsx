"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  CheckSquare,
  Search,
  Plus,
  Calendar,
  Flag,
  AlertCircle,
  Loader2,
} from "lucide-react";
import TaskDetailModal from "@/components/TaskDetailModal";
import { SubmitButton } from "@/components/SubmitButton";
import { ActionOverlay } from "@/components/ActionOverlay";
import { StyledSelect } from "@/components/StyledSelect";
import { CyberDropdown } from "@/components/CyberDropdown";
import { cn } from "@/lib/utils";
import { apiFetch, parseJson, type PaginatedResponse } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { canManageTasks, todayInputValue } from "@/lib/roles";

const taskSchema = z.object({
  title: z.string().min(3, "Task title must be at least 3 characters"),
  description: z.string().optional(),
  dueDate: z.string().min(1, "Due date is required"),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]),
  projectId: z.string().min(1, "Project is required"),
  assignedToEmail: z.string().email("Valid email required").optional().or(z.literal("")),
});

type TaskFormValues = z.infer<typeof taskSchema>;

const TASK_STATUS_FILTER_OPTIONS = [
  { value: "ALL", label: "All Status" },
  { value: "TODO", label: "To Do" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "COMPLETED", label: "Completed" },
];

const TASK_PRIORITY_FILTER_OPTIONS = [
  { value: "ALL", label: "All Priorities" },
  { value: "HIGH", label: "High" },
  { value: "MEDIUM", label: "Medium" },
  { value: "LOW", label: "Low" },
];

const TASK_DEADLINE_FILTER_OPTIONS = [
  { value: "ALL", label: "All Dates" },
  { value: "UPCOMING", label: "Upcoming" },
  { value: "OVERDUE", label: "Overdue" },
];

const TASK_SORT_OPTIONS = [
  { value: "DEADLINE", label: "Nearest Deadline" },
  { value: "PRIORITY", label: "Highest Priority" },
  { value: "LATEST", label: "Latest Created" },
];

export default function TasksPage() {
  const { user } = useAuth();
  const canCreate = user ? canManageTasks(user.role) : false;

  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [totalPages, setTotalPages] = useState(1);

  const [tasks, setTasks] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]); // For the modal dropdown
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);

  // Filters state
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [deadlineFilter, setDeadlineFilter] = useState("ALL"); // ALL, UPCOMING, OVERDUE
  const [sortBy, setSortBy] = useState("DEADLINE"); // LATEST, DEADLINE, PRIORITY

  const { register, handleSubmit, formState: { errors }, reset } = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: { priority: "MEDIUM" }
  });

  const [page, setPage] = useState(1);
  const limit = 10; // items per page

  const fetchTasks = async (newPage = 1) => {
    try {
      setLoading(true);
      const res = await apiFetch(`/api/tasks?page=${newPage}&limit=${limit}`);
      if (res.ok) {
        const data = await parseJson<PaginatedResponse<typeof tasks[0]>>(res);
        if (!data) return;
        if (newPage === 1) {
          setTasks(data.data);
          setPage(data.meta.totalPages > 1 ? 2 : 1);
        } else {
          setTasks((prev) => [...prev, ...data.data]);
          if (newPage < data.meta.totalPages) {
            setPage(newPage + 1);
          }
        }
        setTotalPages(data.meta.totalPages);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Load more button handler
  const loadMore = async () => {
    setIsLoadingMore(true);
    try {
      await fetchTasks(page);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const res = await apiFetch("/api/projects?limit=100");
      if (res.ok) {
        const data = await parseJson<PaginatedResponse<{ id: string; name: string }>>(res);
        if (data) setProjects(data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTasks();
    fetchProjects();
  }, []);

  const onSubmit = async (data: TaskFormValues) => {
    setIsCreating(true);
    try {
      const payload = { ...data };
      if (!payload.assignedToEmail) delete payload.assignedToEmail;

      const res = await apiFetch("/api/tasks", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setIsModalOpen(false);
        reset();
        await fetchTasks();
      } else {
        const err = await res.json();
        alert(err.error);
      }
    } catch (error) {
      console.error(error);
      alert("Could not create task. Check your connection and try again.");
    } finally {
      setIsCreating(false);
    }
  };

  const updateTaskStatus = async (id: string, newStatus: string) => {
    setUpdatingStatusId(id);
    try {
      const res = await apiFetch(`/api/tasks/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setTasks((prev) =>
          prev.map((t) => (t.id === id ? { ...t, status: newStatus } : t))
        );
      } else {
        const err = await res.json();
        alert(err.error);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setUpdatingStatusId(null);
    }
  };

  // Advanced Filtering & Sorting
  const filteredTasks = tasks.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          t.assignedTo?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || t.status === statusFilter;
    const matchesPriority = priorityFilter === "ALL" || t.priority === priorityFilter;
    
    let matchesDeadline = true;
    if (deadlineFilter === "OVERDUE" && t.dueDate) {
       matchesDeadline = new Date(t.dueDate) < new Date() && t.status !== "COMPLETED";
    } else if (deadlineFilter === "UPCOMING" && t.dueDate) {
       matchesDeadline = new Date(t.dueDate) >= new Date() && t.status !== "COMPLETED";
    }

    return matchesSearch && matchesStatus && matchesPriority && matchesDeadline;
  }).sort((a, b) => {
    if (sortBy === "LATEST") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    if (sortBy === "DEADLINE") {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    }
    if (sortBy === "PRIORITY") {
      const pmap: Record<string, number> = { HIGH: 3, MEDIUM: 2, LOW: 1 };
      return pmap[b.priority] - pmap[a.priority];
    }
    return 0;
  });

  const getPriorityColor = (priority: string) => {
    if (priority === "HIGH") return "text-rose-500 bg-rose-500/10 border-rose-500/20";
    if (priority === "MEDIUM") return "text-amber-500 bg-amber-500/10 border-amber-500/20";
    return "text-emerald-accent bg-emerald-accent/10 border-emerald-accent/20";
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <CheckSquare className="text-cyan-accent" /> Tasks
          </h1>
          <p className="text-sm text-muted mt-1">
            {canCreate
              ? "Manage, filter, and update team assignments."
              : "View and update tasks assigned to you."}
          </p>
        </div>
        {canCreate && (
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-cyan-accent hover:bg-cyan-accent/80 text-slate-950 px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-[0_0_15px_rgba(0,242,254,0.4)]"
        >
          <Plus className="h-4 w-4" /> New Task
        </button>
        )}
      </div>

      {/* Advanced Filter Bar */}
      <div className="bg-card/45 glassmorphism border border-card-border p-4 rounded-2xl flex flex-col xl:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
          <input 
            type="text" 
            placeholder="Search tasks or assignees..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900/50 border border-card-border rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-cyan-accent transition-colors"
          />
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
          <CyberDropdown
            value={statusFilter}
            onChange={setStatusFilter}
            options={TASK_STATUS_FILTER_OPTIONS}
          />
          <CyberDropdown
            value={priorityFilter}
            onChange={setPriorityFilter}
            options={TASK_PRIORITY_FILTER_OPTIONS}
          />
          <CyberDropdown
            value={deadlineFilter}
            onChange={setDeadlineFilter}
            options={TASK_DEADLINE_FILTER_OPTIONS}
          />
          <CyberDropdown
            value={sortBy}
            onChange={setSortBy}
            options={TASK_SORT_OPTIONS}
            className="[&_button]:text-cyan-accent"
          />
        </div>
      </div>

      {/* Tasks Grid/List */}
      {loading ? (
        <div className="flex justify-center p-12">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-cyan-accent"></div>
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="text-center p-12 bg-card/20 rounded-2xl border border-card-border border-dashed">
          <CheckSquare className="h-10 w-10 text-muted mx-auto mb-3" />
          <p className="text-slate-400">No tasks found matching your criteria.</p>
        </div>
      ) : (
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <AnimatePresence>
            {filteredTasks.map((task) => {
              const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "COMPLETED";

              return (
        
                <motion.div
                  key={task.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  onClick={() => {
                    setSelectedTaskId(task.id);
                    setTaskModalOpen(true);
                  }}
                  className={cn(
                    "bg-card/45 glassmorphism border p-5 rounded-2xl transition-all cursor-pointer",
                    isOverdue ? "border-rose-500/50 shadow-[0_0_10px_rgba(244,63,94,0.1)]" : "border-card-border hover:border-cyan-accent/50"
                  )}
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-bold text-base leading-tight truncate pr-4" title={task.title}>{task.title}</h3>
                    <div
                      className="relative shrink-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {updatingStatusId === task.id && (
                        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-md bg-slate-900/90">
                          <Loader2 className="h-3.5 w-3.5 animate-spin text-cyan-accent" />
                        </div>
                      )}
                      <CyberDropdown
                        variant="status"
                        value={task.status}
                        disabled={updatingStatusId === task.id}
                        onChange={(v) => updateTaskStatus(task.id, v)}
                        align="right"
                        menuClassName="min-w-[140px]"
                        options={[
                          { value: "TODO", label: "To Do" },
                          { value: "IN_PROGRESS", label: "In Progress" },
                          { value: "COMPLETED", label: "Completed" },
                        ]}
                        triggerClassName={cn(
                          task.status === "COMPLETED"
                            ? "text-emerald-accent border-emerald-accent/30"
                            : task.status === "IN_PROGRESS"
                              ? "text-cyan-accent border-cyan-accent/30"
                              : "text-slate-400 border-slate-700",
                          updatingStatusId === task.id && "opacity-40"
                        )}
                      />
                    </div>
                  </div>
                  
                  <p className="text-xs text-slate-400 mb-4 line-clamp-2 min-h-[32px]">
                    {task.description || "No description."}
                  </p>
                  
                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted pt-3 border-t border-card-border/50">
                    <div className={cn("flex items-center gap-1.5 px-2 py-1 rounded-full border", getPriorityColor(task.priority))}>
                      <Flag className="h-3 w-3" /> {task.priority}
                    </div>
                    
                    {task.dueDate && (
                        <div className={cn("flex items-center gap-1.5", isOverdue ? "text-rose-500" : "")}>
                            {isOverdue ? <AlertCircle className="h-3.5 w-3.5" /> : <Calendar className="h-3.5 w-3.5" />}
                            {new Date(task.dueDate).toLocaleDateString()}
                        </div>
                    )}

                    <div className="ml-auto text-slate-300 bg-slate-800 px-2 py-1 rounded-md text-[10px] font-mono">
                      {task.project?.name || "Unknown Project"}
                    </div>
                  </div>
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
          loadingText="Loading tasks..."
          variant="cyan"
          className="mt-4 w-full py-2.5 text-sm"
        >
          Load More
        </SubmitButton>
      )}
      {taskModalOpen && (
        <TaskDetailModal
          taskId={selectedTaskId}
          open={taskModalOpen}
          onClose={() => setTaskModalOpen(false)}
          onChanged={() => fetchTasks(1)}
        />
      )}

      {/* Create Task Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative bg-slate-900 border border-card-border rounded-2xl p-6 w-full max-w-lg shadow-2xl"
          >
            <ActionOverlay show={isCreating} label="Creating task..." />
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Plus className="text-cyan-accent" /> Create New Task
            </h2>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className={cn("space-y-4", isCreating && "pointer-events-none opacity-80")}
            >
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="text-xs font-semibold text-muted uppercase">Task Title</label>
                    <input 
                      {...register("title")}
                      className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm focus:border-cyan-accent focus:outline-none"
                    />
                    {errors.title && <p className="text-rose-500 text-[10px] mt-1">{errors.title.message}</p>}
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="text-xs font-semibold text-muted uppercase">Project</label>
                    <StyledSelect variant="form" {...register("projectId")} className="mt-1">
                      <option value="">Select a project...</option>
                      {projects.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </StyledSelect>
                    {errors.projectId && <p className="text-rose-500 text-[10px] mt-1">{errors.projectId.message}</p>}
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-muted uppercase">Due Date</label>
                    <input
                      type="date"
                      min={todayInputValue()}
                      {...register("dueDate")}
                      className="cyber-input w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm focus:border-cyan-accent focus:outline-none text-slate-200"
                    />
                    {errors.dueDate && <p className="text-rose-500 text-[10px] mt-1">{errors.dueDate.message}</p>}
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-muted uppercase">Priority</label>
                    <StyledSelect variant="form" {...register("priority")} className="mt-1">
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                    </StyledSelect>
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="text-xs font-semibold text-muted uppercase">Assignee Email (Optional)</label>
                    <input 
                      type="email"
                      {...register("assignedToEmail")}
                      placeholder="e.g. member@worksync.com"
                      className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm focus:border-cyan-accent focus:outline-none"
                    />
                    {errors.assignedToEmail && <p className="text-rose-500 text-[10px] mt-1">{errors.assignedToEmail.message}</p>}
                  </div>
              </div>

              <div className="flex gap-3 pt-4">
                <SubmitButton
                  type="button"
                  variant="ghost"
                  disabled={isCreating}
                  onClick={() => {
                    setIsModalOpen(false);
                    reset();
                  }}
                  className="flex-1 px-4 py-2 text-sm"
                >
                  Cancel
                </SubmitButton>
                <SubmitButton
                  isLoading={isCreating}
                  loadingText="Creating task..."
                  variant="cyan"
                  className="flex-1 px-4 py-2 text-sm"
                >
                  Create Task
                </SubmitButton>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
