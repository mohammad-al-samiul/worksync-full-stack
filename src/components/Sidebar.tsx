"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  Users,
  History,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { WorkSyncLogo } from "@/components/WorkSyncLogo";
import { cn } from "@/lib/utils";

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  onMobileClose?: () => void;
}

interface SidebarLink {
  name: string;
  href: string;
  icon: React.ComponentType<any>;
  accentColor: string;
}

const sidebarLinks: SidebarLink[] = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, accentColor: "text-cyan-accent" },
  { name: "Projects", href: "/projects", icon: FolderKanban, accentColor: "text-purple-accent" },
  { name: "Tasks", href: "/tasks", icon: CheckSquare, accentColor: "text-emerald-accent" },
  { name: "Team", href: "/team", icon: Users, accentColor: "text-cyan-accent" },
  { name: "Activity Log", href: "/activity", icon: History, accentColor: "text-purple-accent" },
  { name: "Analytics", href: "/analytics", icon: BarChart3, accentColor: "text-emerald-accent" },
];

export default function Sidebar({ isCollapsed, setIsCollapsed, onMobileClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <motion.aside
      initial={{ width: isCollapsed ? 76 : 260 }}
      animate={{ width: isCollapsed ? 76 : 260 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className={cn(
        "fixed bottom-0 top-0 left-0 z-30 flex flex-col border-r glassmorphism bg-sidebar border-card-border overflow-hidden",
        "shadow-[4px_0_24px_-4px_rgba(0,0,0,0.05)] dark:shadow-[4px_0_24px_-4px_rgba(0,0,0,0.3)]"
      )}
    >
      {/* Sidebar Header Logo */}
      <div className="flex h-16 items-center justify-between px-3 border-b border-card-border/50">
        <WorkSyncLogo
          size="sm"
          showText={!isCollapsed}
          href="/dashboard"
          className={cn("min-w-0", isCollapsed && "justify-center w-full")}
        />
        {onMobileClose && (
          <button
            type="button"
            onClick={onMobileClose}
            className="md:hidden flex h-8 w-8 items-center justify-center rounded-lg border border-card-border text-muted hover:text-foreground"
            aria-label="Close menu"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1.5 px-3 py-6 overflow-y-auto overflow-x-hidden">
        {sidebarLinks.map((link) => {
          const isActive = pathname === link.href;
          const Icon = link.icon;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "relative flex h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-all group",
                isActive 
                  ? "text-foreground bg-foreground/5 dark:bg-foreground/10" 
                  : "text-muted hover:text-foreground hover:bg-foreground/5 dark:hover:bg-foreground/5"
              )}
            >
              {/* Active Indicator Bar & Glow */}
              {isActive && (
                <motion.div
                  layoutId="activeIndicator"
                  className={cn(
                    "absolute left-0 top-2 bottom-2 w-1 rounded-r-md",
                    link.accentColor.replace("text-", "bg-")
                  )}
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}

              {/* Icon Container */}
              <div
                className={cn(
                  "flex h-5 w-5 items-center justify-center transition-transform shrink-0 duration-300",
                  "group-hover:scale-110",
                  isActive ? link.accentColor : "text-muted group-hover:text-foreground"
                )}
              >
                <Icon className="h-5 w-5" />
              </div>

              {/* Label */}
              {!isCollapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="whitespace-nowrap truncate"
                >
                  {link.name}
                </motion.span>
              )}

              {/* Collapsed Tooltip */}
              {isCollapsed && (
                <div className="absolute left-16 z-50 rounded-md bg-foreground text-background dark:bg-foreground dark:text-background px-2.5 py-1 text-xs font-semibold shadow-md opacity-0 pointer-events-none group-hover:opacity-100 group-hover:left-[70px] transition-all duration-200 whitespace-nowrap">
                  {link.name}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Collapse Toggle Button */}
      <div className="p-3 border-t border-card-border/50">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={cn(
            "flex h-9 w-full items-center justify-center rounded-lg border border-card-border bg-card/40 text-muted hover:text-foreground hover:bg-foreground/5 transition-all duration-200 cursor-pointer shadow-sm"
          )}
        >
          {isCollapsed ? <ChevronRight className="h-4.5 w-4.5" /> : (
            <div className="flex items-center gap-2 text-xs font-medium">
              <ChevronLeft className="h-4.5 w-4.5" />
              <span>Collapse Sidebar</span>
            </div>
          )}
        </button>
      </div>
    </motion.aside>
  );
}
