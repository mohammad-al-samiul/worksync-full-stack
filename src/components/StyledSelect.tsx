"use client";

import { forwardRef } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

type SelectVariant = "filter" | "form" | "status" | "inline";

const variantStyles: Record<SelectVariant, string> = {
  filter:
    "min-w-[130px] rounded-xl border border-card-border bg-slate-900/50 px-3 py-2 pr-9 text-sm text-foreground",
  form: "w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2 pr-10 text-sm text-foreground",
  status:
    "min-w-[100px] rounded-md border bg-slate-900 px-2 py-1 pr-7 text-[10px] font-bold uppercase tracking-wider",
  inline:
    "min-w-[110px] border-0 bg-transparent py-0 pl-0 pr-8 text-sm text-foreground",
};

type StyledSelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  variant?: SelectVariant;
  wrapperClassName?: string;
};

export const StyledSelect = forwardRef<HTMLSelectElement, StyledSelectProps>(
  function StyledSelect(
    { variant = "filter", className, wrapperClassName, children, disabled, ...props },
    ref
  ) {
    return (
      <div className={cn("relative inline-flex max-w-full", wrapperClassName)}>
        <select
          ref={ref}
          disabled={disabled}
          className={cn(
            "cyber-select cursor-pointer appearance-none transition-colors",
            "focus:outline-none focus:border-cyan-accent focus:ring-1 focus:ring-cyan-accent/25",
            "disabled:cursor-not-allowed disabled:opacity-50",
            variantStyles[variant],
            className
          )}
          {...props}
        >
          {children}
        </select>
        <ChevronDown
          className={cn(
            "pointer-events-none absolute top-1/2 -translate-y-1/2 text-muted",
            variant === "status" ? "right-1.5 h-3 w-3" : "right-2.5 h-4 w-4"
          )}
          aria-hidden
        />
      </div>
    );
  }
);

StyledSelect.displayName = "StyledSelect";
