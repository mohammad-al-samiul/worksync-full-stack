"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, Upload, Image as ImageIcon, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { apiFetch } from "@/lib/api";

// Types
interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate?: string;
  priority: string;
  status: string;
  project?: { id: string; name: string };
  assignedTo?: { id: string; name: string; avatar?: string };
  comments?: Array<{ id: string; text: string; createdAt: string; author: { name: string; avatar?: string } }>;
  attachments?: Array<{ id: string; name: string; url: string }>; 
}

interface TaskDetailModalProps {
  taskId: string | null;
  open: boolean;
  onClose: () => void;
}

export default function TaskDetailModal({ taskId, open, onClose }: TaskDetailModalProps) {
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [uploadState, setUploadState] = useState<"idle" | "uploading" | "done">("idle");
  const [previewFiles, setPreviewFiles] = useState<File[]>([]);

  // Fetch task details (including comments & attachments)
  useEffect(() => {
    if (!taskId) return;
    const fetchTask = async () => {
      setLoading(true);
      try {
        const res = await apiFetch(`/api/tasks/${taskId}`);
        if (res.ok) {
          const data = await res.json();
          setTask(data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchTask();
  }, [taskId]);

  // Post new comment
  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !taskId) return;
    try {
      const res = await apiFetch(`/api/tasks/${taskId}/comments?taskId=${taskId}`, {
        method: "POST",
        body: JSON.stringify({ text: newComment.trim() }),
      });
      if (res.ok) {
        const comment = await res.json();
        setTask((prev) => prev && { ...prev, comments: [...(prev.comments || []), comment] });
        setNewComment("");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Drag‑and‑drop handlers for attachments
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    if (!files.length) return;
    setPreviewFiles(files);
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
        if (res.ok) {
          uploaded.push(await res.json());
        }
      }
      if (uploaded.length) {
        setTask((prev) =>
          prev && { ...prev, attachments: [...(prev.attachments || []), ...uploaded] }
        );
        setPreviewFiles([]);
        setUploadState("done");
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
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto glassmorphism border border-card-border bg-card/80 p-6 rounded-2xl shadow-2xl"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className="absolute top-3 right-3 text-muted hover:text-foreground"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </button>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-cyan-accent" />
            </div>
          ) : task ? (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center gap-4">
                <h2 className="text-2xl font-bold text-foreground">{task.title}</h2>
                <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium border", {
                  "bg-green-500/10 text-green-500 border-green-500/30": task.status === "COMPLETED",
                  "bg-cyan-accent/10 text-cyan-accent border-cyan-accent/30": task.status === "IN_PROGRESS",
                  "bg-slate-400/10 text-slate-400 border-slate-400/30": task.status === "TODO",
                })}>
                  {task.status.replace("_", " ")}
                </span>
              </div>

              {/* Details */}
              <div className="space-y-2 text-sm text-muted">
                {task.description && <p>{task.description}</p>}
                {task.dueDate && (
                  <p>Due: {new Date(task.dueDate).toLocaleDateString()}</p>
                )}
                {task.assignedTo && (
                  <div className="flex items-center gap-2">
                    {task.assignedTo.avatar ? (
                      <img src={task.assignedTo.avatar} alt={task.assignedTo.name} className="h-6 w-6 rounded-full" />
                    ) : (
                      <div className="h-6 w-6 rounded-full bg-foreground/10" />
                    )}
                    <span>{task.assignedTo.name}</span>
                  </div>
                )}
                {task.project && (
                  <p>Project: {task.project.name}</p>
                )}
              </div>

              {/* Comments */}
              <section className="border-t border-card-border pt-4">
                <h3 className="font-semibold mb-2">Comments</h3>
                <div className="space-y-3 max-h-60 overflow-y-auto mb-4">
                  {task.comments && task.comments.length ? (
                    task.comments.map((c) => (
                      <div key={c.id} className="flex items-start gap-3">
                        {c.author.avatar ? (
                          <img src={c.author.avatar} alt={c.author.name} className="h-6 w-6 rounded-full" />
                        ) : (
                          <div className="h-6 w-6 rounded-full bg-foreground/10" />
                        )}
                        <div className="flex-1">
                          <p className="text-xs font-medium text-foreground">{c.author.name}</p>
                          <p className="text-sm text-muted">{c.text}</p>
                          <span className="text-[10px] text-muted/70">{new Date(c.createdAt).toLocaleTimeString()}</span>
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
                    placeholder="Add a comment..."
                    className="flex-1 bg-slate-900/30 border border-card-border rounded-xl p-2 text-sm focus:outline-none focus:border-cyan-accent"
                    rows={2}
                  />
                  <button
                    type="submit"
                    className="px-3 py-1 bg-cyan-accent text-white rounded-lg hover:bg-cyan-accent/80 transition"
                  >
                    Post
                  </button>
                </form>
              </section>

              {/* Attachments */}
              <section className="border-t border-card-border pt-4">
                <h3 className="font-semibold mb-2">Attachments</h3>
                <div className="grid grid-cols-2 gap-4">
                  {task.attachments && task.attachments.map((a) => (
                    <a
                      key={a.id}
                      href={a.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-2 border rounded-lg hover:bg-card/40"
                    >
                      <FileText className="h-5 w-5 text-muted" />
                      <span className="truncate text-sm">{a.name}</span>
                    </a>
                  ))}
                </div>
                {/* Drag‑and‑drop area */}
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
                      <p>{previewFiles.length} file(s) ready to upload</p>
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
                      <p>Drag & drop files here, or click to select</p>
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
                        Browse files
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
    </AnimatePresence>
  );
}
