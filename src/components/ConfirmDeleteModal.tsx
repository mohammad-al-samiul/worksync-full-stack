"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import { SubmitButton } from "@/components/SubmitButton";

interface ConfirmDeleteModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  itemName: string;
  title?: string;
  description?: string;
  isLoading?: boolean;
  confirmLabel?: string;
}

export default function ConfirmDeleteModal({
  open,
  onClose,
  onConfirm,
  itemName,
  title = "Delete this item?",
  description = "This action cannot be undone.",
  isLoading = false,
  confirmLabel = "Delete",
}: ConfirmDeleteModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-4 sm:p-6">
          <motion.button
            type="button"
            aria-label="Close"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-delete-title"
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-md rounded-2xl border border-rose-500/25 bg-slate-900/95 glassmorphism p-5 sm:p-6 shadow-2xl shadow-rose-500/10"
          >
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-rose-500/30 bg-rose-500/10">
                <AlertTriangle className="h-5 w-5 text-rose-500" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 id="confirm-delete-title" className="text-lg font-bold text-foreground">
                  {title}
                </h2>
                <p className="mt-1 text-sm text-muted">{description}</p>
                <p className="mt-3 rounded-xl border border-card-border bg-slate-950/60 px-3 py-2 text-sm font-semibold text-foreground truncate">
                  {itemName}
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-col-reverse sm:flex-row gap-3">
              <SubmitButton
                type="button"
                variant="ghost"
                disabled={isLoading}
                onClick={onClose}
                className="flex-1 py-2.5 text-sm"
              >
                Cancel
              </SubmitButton>
              <SubmitButton
                type="button"
                variant="danger"
                isLoading={isLoading}
                loadingText="Deleting..."
                onClick={() => void onConfirm()}
                className="flex-1 py-2.5 text-sm"
              >
                {confirmLabel}
              </SubmitButton>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
