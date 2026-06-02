"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  CheckSquare, Search, Filter, Plus, Calendar, 
  Flag, AlertCircle, Clock, CheckCircle2 
} from "lucide-react";
import TaskDetailModal from "@/components/TaskDetailModal";
import { cn } from "@/lib/utils";

const taskSchema = z.object({
  title: z.string().min(3, "Task title must be at least 3 characters"),
  description: z.string().optional(),
  dueDate: z.string().min(1, "Due date is required"),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]),
  projectId: z.string().min(1, "Project is required"),
  assignedToEmail: z.string().email("Valid email required").optional().or(z.literal("")),
});

type TaskFormValues = z.infer<typeof taskSchema>;

export default function TasksPage() {
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [totalPages, setTotalPages] = useState(1);

  const [tasks, setTasks] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]); // For the modal dropdown
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
      const res = await fetch(`/api/tasks?page=${newPage}&limit=${limit}`);
      if (res.ok) {
        const data = await res.json();
        if (newPage === 1) {
          setTasks(data.data);
        } else {
          setTasks(prev => [...prev, ...data.data]);
        }
        setTotalPages(data.meta.totalPages);
        if (newPage < data.meta.totalPages) {
          setPage(newPage + 1);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Load more button handler
  const loadMore = () => {
    fetchTasks(page);
  };

  const fetchProjects = async () => {
    try {
      const res = await fetch("/api/projects");
      if (res.ok) {
        setProjects(await res.json());
      }
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    fetchTasks();
    fetchProjects();
  }, []);

  const onSubmit = async (data: TaskFormValues) => {
    try {
      // Clean up empty email string to undefined
      const payload = { ...data };
      if (!payload.assignedToEmail) delete payload.assignedToEmail;

      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setIsModalOpen(false);
        reset();
        fetchTasks();
      } else {
        const err = await res.json();
        alert(err.error); // Show strict backend error
      }
    } catch (error) {
      console.error(error);
    }
  };

  const updateTaskStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        fetchTasks();
      } else {
        const err = await res.json();
        alert(err.error);
      }
    } catch (error) {
      console.error(error);
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
          <p className="text-sm text-muted mt-1">Manage, filter, and update your personal and team assignments.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-cyan-accent hover:bg-cyan-accent/80 text-slate-950 px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-[0_0_15px_rgba(0,242,254,0.4)]"
        >
          <Plus className="h-4 w-4" /> New Task
        </button>
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
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-900/50 border border-card-border rounded-xl px-3 py-2 text-sm focus:outline-none"
          >
            <option value="ALL">All Status</option>
            <option value="TODO">To Do</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
          </select>
          
          <select 
            value={priorityFilter} 
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="bg-slate-900/50 border border-card-border rounded-xl px-3 py-2 text-sm focus:outline-none"
          >
            <option value="ALL">All Priorities</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>

          <select 
            value={deadlineFilter} 
            onChange={(e) => setDeadlineFilter(e.target.value)}
            className="bg-slate-900/50 border border-card-border rounded-xl px-3 py-2 text-sm focus:outline-none"
          >
            <option value="ALL">All Dates</option>
            <option value="UPCOMING">Upcoming</option>
            <option value="OVERDUE">Overdue</option>
          </select>

          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-slate-900/50 border border-card-border rounded-xl px-3 py-2 text-sm focus:outline-none text-cyan-accent"
          >
            <option value="DEADLINE">Nearest Deadline</option>
            <option value="PRIORITY">Highest Priority</option>
            <option value="LATEST">Latest Created</option>
          </select>
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
                  className={cn(
                    "bg-card/45 glassmorphism border p-5 rounded-2xl transition-all",
                    isOverdue ? "border-rose-500/50 shadow-[0_0_10px_rgba(244,63,94,0.1)]" : "border-card-border hover:border-cyan-accent/50"
                  )}
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-bold text-base leading-tight truncate pr-4" title={task.title}>{task.title}</h3>
                    {/* Inline Status Update Dropdown */}
                    <select 
                        value={task.status}
                        onChange={(e) => updateTaskStatus(task.id, e.target.value)}
                        className={cn(
                            "text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider focus:outline-none bg-slate-900 border appearance-none cursor-pointer",
                            task.status === "COMPLETED" ? "text-emerald-accent border-emerald-accent/30" :
                            task.status === "IN_PROGRESS" ? "text-cyan-accent border-cyan-accent/30" :
                            "text-slate-400 border-slate-700"
                        )}
                    >
                        <option value="TODO">To Do</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="COMPLETED">Completed</option>
                    </select>
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
        <button
          onClick={loadMore}
          className="mt-4 w-full py-2 bg-cyan-accent text-slate-950 rounded-xl hover:bg-cyan-accent/80 transition"
        >
          Load More
        </button>
      )}
      {taskModalOpen && (
        <TaskDetailModal
          taskId={selectedTaskId}
          open={taskModalOpen}
          onClose={() => setTaskModalOpen(false)}
        />
      )}

      {/* Create Task Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-900 border border-card-border rounded-2xl p-6 w-full max-w-lg shadow-2xl"
          >
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Plus className="text-cyan-accent" /> Create New Task
            </h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              
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
                    <select 
                      {...register("projectId")}
                      className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm focus:border-cyan-accent focus:outline-none"
                    >
                        <option value="">Select a project...</option>
                        {projects.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                    </select>
                    {errors.projectId && <p className="text-rose-500 text-[10px] mt-1">{errors.projectId.message}</p>}
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-muted uppercase">Due Date</label>
                    <input 
                      type="date"
                      {...register("dueDate")}
                      className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm focus:border-cyan-accent focus:outline-none text-slate-200"
                    />
                    {errors.dueDate && <p className="text-rose-500 text-[10px] mt-1">{errors.dueDate.message}</p>}
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-muted uppercase">Priority</label>
                    <select 
                      {...register("priority")}
                      className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm focus:border-cyan-accent focus:outline-none"
                    >
                        <option value="LOW">Low</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HIGH">High</option>
                    </select>
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
                <button 
                  type="button" 
                  onClick={() => { setIsModalOpen(false); reset(); }}
                  className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-sm font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-2 bg-cyan-accent hover:bg-cyan-accent/80 text-slate-950 rounded-xl text-sm font-semibold transition-colors"
                >
                  Create Task
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
