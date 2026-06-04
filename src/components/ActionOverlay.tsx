"use client";

import { Loader2 } from "lucide-react";

type ActionOverlayProps = {
  show: boolean;
  label?: string;
};

/** Full-panel loading overlay for modals / forms (parent needs `position: relative`). */
export function ActionOverlay({
  show,
  label = "Working...",
}: ActionOverlayProps) {
  if (!show) return null;

  return (
    <div
      className="absolute inset-0 z-20 flex flex-col items-center justify-center rounded-2xl bg-slate-950/75 backdrop-blur-[2px]"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <Loader2 className="h-9 w-9 animate-spin text-cyan-accent" />
      <p className="mt-3 text-sm font-medium text-foreground">{label}</p>
      <p className="mt-1 text-xs text-muted">Do not close this window</p>
    </div>
  );
}
