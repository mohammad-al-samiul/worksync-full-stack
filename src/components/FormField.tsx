import React from "react";
import { cn } from "@/lib/utils";

export const formLabelClass =
  "block text-xs font-semibold uppercase tracking-wide text-muted";

export const formFieldClass = "space-y-1.5";

export function formInputClass(accent: "cyan" | "purple" = "cyan") {
  return cn(
    "w-full h-10 rounded-xl border border-slate-800 bg-slate-950 px-4 text-sm text-slate-200",
    "placeholder:text-muted focus:outline-none focus:ring-1",
    "disabled:cursor-not-allowed disabled:opacity-50",
    accent === "purple"
      ? "focus:border-purple-accent focus:ring-purple-accent/25"
      : "focus:border-cyan-accent focus:ring-cyan-accent/25"
  );
}

export function formTextareaClass(accent: "cyan" | "purple" = "cyan") {
  return cn(
    formInputClass(accent),
    "h-auto min-h-[80px] py-2.5 resize-y"
  );
}

type FormFieldProps = {
  label: string;
  error?: string;
  hint?: string;
  className?: string;
  children: React.ReactNode;
};

export function FormField({
  label,
  error,
  hint,
  className,
  children,
}: FormFieldProps) {
  return (
    <div className={cn(formFieldClass, className)}>
      <label className={formLabelClass}>{label}</label>
      {children}
      {error ? (
        <p className="text-xs text-rose-500">{error}</p>
      ) : hint ? (
        <p className="text-[10px] text-muted">{hint}</p>
      ) : null}
    </div>
  );
}
