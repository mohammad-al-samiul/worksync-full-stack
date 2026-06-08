"use client";

import React, { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, Upload, Image as ImageIcon, FileText, Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { apiFetch } from "@/lib/api";
import { SubmitButton } from "@/components/SubmitButton";
import { StyledSelect } from "@/components/StyledSelect";
import { FormField, formInputClass, formTextareaClass } from "@/components/FormField";
import ConfirmDeleteModal from "@/components/ConfirmDeleteModal";
import { isImageAttachment } from "@/lib/attachment-utils";
import { useAuth } from "@/context/AuthContext";
import { canManageTasks, todayInputValue } from "@/lib/roles";

interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate?: string;
  priority: string;
  status: string;
  project?: { id: string; name: string };
  assignedTo?: { id: string; name: string; avatar?: string; email?: string };
  comments?: Array<{ id: string; text: string; createdAt: string; author: { name: string; avatar?: string } }>;
  attachments?: Array<{ id: string; name: string; url: string }>;
}

interface TaskDetailModalProps {
  taskId: string | null;
  open: boolean;
  onClose: () => void;
  onChanged?: () => void;
}

export default function TaskDetailModal({ taskId, open, onClose, onChanged }: TaskDetailModalProps) {
  const { user } = useAuth();
  const canEdit = user ? canManageTasks(user.role) : false;

  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [uploadState, setUploadState] = useState<"idle" | "uploading" | "done">("idle");
  const [isPostingComment, setIsPostingComment] = useState(false);
  const [previewFiles, setPreviewFiles] = useState<File[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    dueDate: "",
    priority: "MEDIUM",
    status: "TODO",
    assignedToEmail: "",
  });

  const fetchTask = useCallback(async (showLoading = true) => {
    if (!taskId) return;
    if (showLoading) setLoading(true);
    try {
      const res = await apiFetch(`/api/tasks/${taskId}`);
      if (res.ok) {
        const data: Task = await res.json();
        setTask(data);
        setEditForm({
          title: data.title,
          description: data.description || "",
          dueDate: data.dueDate ? new Date(data.dueDate).toISOString().split("T")[0] : "",
          priority: data.priority,
          status: data.status,
          assignedToEmail: data.assignedTo?.email || "",
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      if (showLoading) setLoading(false);
    }
  }, [taskId]);

  useEffect(() => {
    if (!open || !taskId) return;
    setIsEditing(false);
    setShowDeleteConfirm(false);
    void fetchTask();
  }, [open, taskId, fetchTask]);

  const handleSaveEdit = async () => {
    if (!taskId) return;
    setIsSaving(true);
    try {
      const payload: Record<string, string> = {
        title: editForm.title,
        description: editForm.description,
        dueDate: editForm.dueDate,
        priority: editForm.priority,
        status: editForm.status,
      };
      if (editForm.assignedToEmail) {
        payload.assignedToEmail = editForm.assignedToEmail;
      }

      const res = await apiFetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setIsEditing(false);
        await fetchTask(false);
        onChanged?.();
      } else {
        const err = await res.json();
        alert(err.error);
      }
    } catch {
      alert("Could not save changes.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!taskId || !task) return;
    setIsDeleting(true);
    try {
      const res = await apiFetch(`/api/tasks/${taskId}`, { method: "DELETE" });
      if (res.ok) {
        setShowDeleteConfirm(false);
        onChanged?.();
        onClose();
      } else {
        const err = await res.json();
        alert(err.error);
      }
    } catch {
      alert("Could not delete task.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !taskId || isPostingComment) return;
    setIsPostingComment(true);
    try {
      const res = await apiFetch(`/api/tasks/${taskId}/comments?taskId=${taskId}`, {
        method: "POST",
        body: JSON.stringify({ text: newComment.trim() }),
      });
      if (res.ok) {
        const comment = await res.json();
        setTask((prev) =>
          prev ? { ...prev, comments: [...(prev.comments || []), comment] } : prev
        );
        setNewComment("");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsPostingComment(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    if (files.length) setPreviewFiles(files);
  };

  const handleUpload = async () => {
    if (!taskId || !previewFiles.length) return;
    setUploadState("uploading");
    try {
      const uploaded: Array<{ id: string; name: string; url: string }> = [];
      for (const file of previewFiles) {
        const formData = new FormData();
        formData.append("file", file);
        const res = await apiFetch(`/api/tasks/${taskId}/attachments?taskId=${taskId}`, {
          method: "POST",
          body: formData,
        });
        if (res.ok) uploaded.push(await res.json());
      }
      if (uploaded.length) {
        setPreviewFiles([]);
        setUploadState("done");
        await fetchTask(false);
        setTimeout(() => setUploadState("idle"), 1500);
      } else {
        setUploadState("idle");
      }
    } catch (err) {
      console.error(err);
      setUploadState("idle");
    }
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="relative w-full max-w-2xl max-h-[92vh] sm:max-h-[90vh] overflow-y-auto glassmorphism border border-card-border bg-card/80 p-4 sm:p-6 rounded-2xl shadow-2xl"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="absolute top-3 right-3 flex items-center gap-2">
            {canEdit && task && !isEditing && (
              <>
                <button
                  className="text-muted hover:text-cyan-accent p-1"
                  onClick={() => setIsEditing(true)}
                  title="Edit task"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  className="text-muted hover:text-rose-500 p-1.5"
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={isDeleting}
                  title="Delete task"
                >
                  {isDeleting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </button>
              </>
            )}
            <button className="text-muted hover:text-foreground p-1" onClick={onClose}>
              <X className="h-5 w-5" />
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-cyan-accent" />
            </div>
          ) : task ? (
            <div className="space-y-6">
              {isEditing ? (
                <div className="space-y-4 pr-8">
                  <h2 className="text-xl font-bold">Edit Task</h2>

                  <FormField label="Title">
                    <input
                      value={editForm.title}
                      onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                      className={formInputClass("cyan")}
                    />
                  </FormField>

                  <FormField label="Description">
                    <textarea
                      value={editForm.description}
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                      className={formTextareaClass("cyan")}
                    />
                  </FormField>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField label="Due Date">
                      <input
                        type="date"
                        min={todayInputValue()}
                        value={editForm.dueDate}
                        onChange={(e) => setEditForm({ ...editForm, dueDate: e.target.value })}
                        className={cn(formInputClass("cyan"), "cyber-input")}
                      />
                    </FormField>
                    <FormField label="Priority">
                      <StyledSelect
                        variant="form"
                        value={editForm.priority}
                        onChange={(e) => setEditForm({ ...editForm, priority: e.target.value })}
                      >
                        <option value="LOW">Low</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HIGH">High</option>
                      </StyledSelect>
                    </FormField>
                    <FormField label="Status">
                      <StyledSelect
                        variant="form"
                        value={editForm.status}
                        onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                      >
                        <option value="TODO">To Do</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="COMPLETED">Completed</option>
                      </StyledSelect>
                    </FormField>
                    <FormField label="Assignee Email">
                      <input
                        type="email"
                        value={editForm.assignedToEmail}
                        onChange={(e) =>
                          setEditForm({ ...editForm, assignedToEmail: e.target.value })
                        }
                        disabled={task.status === "COMPLETED"}
                        className={formInputClass("cyan")}
                      />
                    </FormField>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <SubmitButton
                      type="button"
                      variant="ghost"
                      onClick={() => setIsEditing(false)}
                      className="flex-1 text-sm py-2"
                    >
                      Cancel
                    </SubmitButton>
                    <SubmitButton
                      isLoading={isSaving}
                      loadingText="Saving..."
                      variant="cyan"
                      onClick={() => void handleSaveEdit()}
                      className="flex-1 text-sm py-2"
                    >
                      Save Changes
                    </SubmitButton>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 pr-10 sm:pr-16">
                    <h2 className="text-xl sm:text-2xl font-bold text-foreground break-words">{task.title}</h2>
                    <span
                      className={cn("px-2 py-0.5 rounded-full text-xs font-medium border", {
                        "bg-green-500/10 text-green-500 border-green-500/30": task.status === "COMPLETED",
                        "bg-cyan-accent/10 text-cyan-accent border-cyan-accent/30": task.status === "IN_PROGRESS",
                        "bg-slate-400/10 text-slate-400 border-slate-400/30": task.status === "TODO",
                      })}
                    >
                      {task.status.replace("_", " ")}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm text-muted">
                    {task.description && <p>{task.description}</p>}
                    {task.dueDate && <p>Due: {new Date(task.dueDate).toLocaleDateString()}</p>}
                    <p>Priority: {task.priority}</p>
                    {task.assignedTo && (
                      <div className="flex items-center gap-2">
                        {task.assignedTo.avatar ? (
                          <img src={task.assignedTo.avatar} alt="" className="h-6 w-6 rounded-full" />
                        ) : (
                          <div className="h-6 w-6 rounded-full bg-foreground/10" />
                        )}
                        <span>{task.assignedTo.name}</span>
                      </div>
                    )}
                    {task.project && <p>Project: {task.project.name}</p>}
                  </div>
                </>
              )}

              <section className="border-t border-card-border pt-4">
                <h3 className="font-semibold mb-2">Comments</h3>
                <div className="space-y-3 max-h-60 overflow-y-auto mb-4">
                  {task.comments?.length ? (
                    task.comments.map((c) => (
                      <div key={c.id} className="flex items-start gap-3">
                        {c.author.avatar ? (
                          <img src={c.author.avatar} alt="" className="h-6 w-6 rounded-full" />
                        ) : (
                          <div className="h-6 w-6 rounded-full bg-foreground/10" />
                        )}
                        <div className="flex-1">
                          <p className="text-xs font-medium text-foreground">{c.author.name}</p>
                          <p className="text-sm text-muted">{c.text}</p>
                          <span className="text-[10px] text-muted/70">
                            {new Date(c.createdAt).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted text-sm">No comments yet.</p>
                  )}
                </div>
                <form onSubmit={handleCommentSubmit} className="flex gap-2 items-start">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write a comment..."
                    disabled={isPostingComment}
                    className="flex-1 bg-slate-900/30 border border-card-border rounded-xl p-2 text-sm focus:outline-none focus:border-cyan-accent disabled:opacity-60"
                    rows={2}
                  />
                  <SubmitButton
                    isLoading={isPostingComment}
                    loadingText="Posting..."
                    variant="cyan"
                    className="px-3 py-2 text-xs shrink-0 self-end"
                  >
                    Post
                  </SubmitButton>
                </form>
              </section>

              <section className="border-t border-card-border pt-4">
                <h3 className="font-semibold mb-2">
                  Attachments
                  {task.attachments?.length ? (
                    <span className="ml-1 text-xs font-normal text-muted">
                      ({task.attachments.length})
                    </span>
                  ) : null}
                </h3>
                {task.attachments?.length ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                    {task.attachments.map((a) => {
                      const isImage = isImageAttachment(a.name);
                      const isBrokenMock = a.url.startsWith("/mock-uploads/");
                      return (
                        <a
                          key={a.id}
                          href={a.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex flex-col gap-2 p-2 border border-card-border rounded-lg hover:bg-card/40 hover:border-cyan-accent/40 transition overflow-hidden"
                        >
                          {isImage && !isBrokenMock ? (
                            <div className="relative aspect-video w-full overflow-hidden rounded-md bg-slate-900/60">
                              <img src={a.url} alt={a.name} className="h-full w-full object-contain" />
                            </div>
                          ) : (
                            <div className="flex h-16 items-center justify-center rounded-md bg-slate-900/60">
                              <FileText className="h-7 w-7 text-muted" />
                            </div>
                          )}
                          <div className="flex items-center gap-2 min-w-0">
                            {isImage ? (
                              <ImageIcon className="h-4 w-4 shrink-0 text-cyan-accent" />
                            ) : (
                              <FileText className="h-4 w-4 shrink-0 text-muted" />
                            )}
                            <span className="truncate text-sm group-hover:text-cyan-accent">{a.name}</span>
                          </div>
                        </a>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-muted mb-4">No files attached.</p>
                )}
                <div
                  className={cn(
                    "mt-4 border border-dashed rounded-lg p-6 text-center text-muted hover:border-cyan-accent transition",
                    uploadState === "uploading" && "opacity-50"
                  )}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                >
                  {previewFiles.length ? (
                    <div className="space-y-2">
                      <p>{previewFiles.length} file(s) ready</p>
                      <button
                        type="button"
                        className="px-4 py-2 bg-cyan-accent text-white rounded-lg hover:bg-cyan-accent/80"
                        onClick={handleUpload}
                        disabled={uploadState === "uploading"}
                      >
                        {uploadState === "uploading" ? (
                          <Loader2 className="h-4 w-4 animate-spin inline-block mr-2" />
                        ) : (
                          <Upload className="h-4 w-4 inline-block mr-2" />
                        )}
                        Upload
                      </button>
                    </div>
                  ) : (
                    <>
                      <Upload className="h-8 w-8 mx-auto mb-2" />
                      <p>Drop files here or browse</p>
                      <input
                        type="file"
                        multiple
                        className="hidden"
                        id="file-upload-input"
                        onChange={(e) => {
                          if (e.target.files) setPreviewFiles(Array.from(e.target.files));
                        }}
                      />
                      <label htmlFor="file-upload-input" className="cursor-pointer text-cyan-accent underline">
                        Choose files
                      </label>
                    </>
                  )}
                </div>
              </section>
            </div>
          ) : (
            <p className="text-center text-muted">Task not found.</p>
          )}
        </motion.div>
      </motion.div>

      <ConfirmDeleteModal
        open={showDeleteConfirm}
        onClose={() => !isDeleting && setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        itemName={task?.title ?? ""}
        title="Delete this task?"
        description="This task and its comments will be removed permanently."
        isLoading={isDeleting}
        confirmLabel="Delete Task"
      />
    </AnimatePresence>
  );
}
