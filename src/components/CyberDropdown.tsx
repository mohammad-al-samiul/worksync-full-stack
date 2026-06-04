"use client";

import { useState, useRef, useEffect, useId } from "react";
import { ChevronDown, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export type CyberDropdownOption = { value: string; label: string };

type DropdownVariant = "filter" | "form" | "inline" | "status";
type Accent = "cyan" | "purple";

const triggerVariants: Record<DropdownVariant, string> = {
  filter:
    "min-w-[130px] rounded-xl border border-card-border bg-slate-900/50 px-3 py-2 pr-9 text-sm",
  form: "w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2 pr-10 text-sm",
  inline: "min-w-[100px] border-0 bg-transparent py-0 pl-0 pr-8 text-sm",
  status:
    "min-w-[100px] rounded-md border bg-slate-900 px-2 py-1 pr-7 text-[10px] font-bold uppercase tracking-wider",
};

const accentRing: Record<Accent, string> = {
  cyan: "focus-visible:ring-cyan-accent/25 focus-visible:border-cyan-accent",
  purple: "focus-visible:ring-purple-accent/25 focus-visible:border-purple-accent",
};

const accentSelected: Record<Accent, string> = {
  cyan: "bg-cyan-accent/15 text-cyan-accent",
  purple: "bg-purple-accent/15 text-purple-accent",
};

const accentCheck: Record<Accent, string> = {
  cyan: "text-cyan-accent",
  purple: "text-purple-accent",
};

type CyberDropdownProps = {
  value: string;
  onChange: (value: string) => void;
  options: CyberDropdownOption[];
  variant?: DropdownVariant;
  accent?: Accent;
  disabled?: boolean;
  className?: string;
  triggerClassName?: string;
  menuClassName?: string;
  align?: "left" | "right";
};

export function CyberDropdown({
  value,
  onChange,
  options,
  variant = "filter",
  accent = "cyan",
  disabled = false,
  className,
  triggerClassName,
  menuClassName,
  align = "left",
}: CyberDropdownProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  const selected = options.find((o) => o.value === value) ?? options[0];

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const pick = (next: string) => {
    onChange(next);
    setOpen(false);
  };

  return (
    <div ref={rootRef} className={cn("relative inline-flex max-w-full", className)}>
      <button
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => !disabled && setOpen((v) => !v)}
        className={cn(
          "inline-flex w-full items-center justify-between gap-2 text-left text-foreground transition-colors",
          "cursor-pointer focus:outline-none focus-visible:ring-1 disabled:cursor-not-allowed disabled:opacity-50",
          triggerVariants[variant],
          variant !== "inline" && accentRing[accent],
          open && variant !== "inline" && (accent === "purple" ? "border-purple-accent/60" : "border-cyan-accent/60"),
          triggerClassName
        )}
      >
        <span className="truncate">{selected?.label}</span>
        <ChevronDown
          className={cn(
            "pointer-events-none absolute top-1/2 -translate-y-1/2 text-muted transition-transform",
            variant === "status" ? "right-1.5 h-3 w-3" : "right-2.5 h-4 w-4",
            open && "rotate-180"
          )}
          aria-hidden
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            id={listId}
            role="listbox"
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className={cn(
              "absolute z-50 mt-1.5 min-w-full overflow-hidden rounded-xl border border-card-border",
              "bg-slate-900/95 py-1 shadow-xl backdrop-blur-md",
              accent === "purple"
                ? "shadow-purple-accent/10"
                : "shadow-cyan-accent/10",
              align === "right" ? "right-0" : "left-0",
              menuClassName
            )}
          >
            {options.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <li key={opt.value} role="option" aria-selected={isSelected}>
                  <button
                    type="button"
                    onClick={() => pick(opt.value)}
                    className={cn(
                      "flex w-full items-center justify-between gap-2 px-3 py-2.5 text-sm transition-colors",
                      "text-slate-300 hover:bg-slate-800/80 hover:text-foreground",
                      isSelected && accentSelected[accent]
                    )}
                  >
                    <span className="truncate">{opt.label}</span>
                    {isSelected && (
                      <Check className={cn("h-3.5 w-3.5 shrink-0", accentCheck[accent])} />
                    )}
                  </button>
                </li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
