"use client";

import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Variant = "cyan" | "purple" | "gradient" | "ghost";

const variantStyles: Record<Variant, string> = {
  cyan: "bg-cyan-accent hover:bg-cyan-accent/80 text-slate-950 shadow-[0_0_12px_rgba(0,242,254,0.2)]",
  purple:
    "bg-purple-accent hover:bg-purple-accent/80 text-white shadow-[0_0_12px_rgba(157,78,221,0.25)]",
  gradient:
    "bg-gradient-to-r from-cyan-accent to-purple-accent text-slate-950 shadow-md shadow-cyan-accent/15",
  ghost: "bg-slate-800 hover:bg-slate-700 text-foreground",
};

type SubmitButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  isLoading?: boolean;
  loadingText?: string;
  variant?: Variant;
};

export function SubmitButton({
  isLoading = false,
  loadingText = "Please wait...",
  variant = "cyan",
  children,
  className,
  disabled,
  type = "submit",
  ...props
}: SubmitButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all",
        "disabled:opacity-60 disabled:cursor-not-allowed disabled:pointer-events-none",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin shrink-0" aria-hidden />
          <span>{loadingText}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}
