"use client";

import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  Sun,
  Moon,
  LogOut,
  Menu,
  ChevronDown,
  User as UserIcon,
  CheckCircle,
  AlertCircle,
  MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface HeaderProps {
  onToggleMobileSidebar: () => void;
}

interface NotificationItem {
  id: string;
  title: string;
  desc: string;
  type: "success" | "warning" | "comment";
  time: string;
  read: boolean;
}

export default function Header({ onToggleMobileSidebar }: HeaderProps) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: "1",
      title: "Task Assigned",
      desc: "Implement glassmorphic Sidebar component.",
      type: "success",
      time: "5m ago",
      read: false,
    },
    {
      id: "2",
      title: "Deadline Warning",
      desc: "Framer Motion layout validation due in 2 hours.",
      type: "warning",
      time: "32m ago",
      read: false,
    },
    {
      id: "3",
      title: "New Comment",
      desc: "Sarah Connor commented on 'Auth Flow Refactor'.",
      type: "comment",
      time: "1h ago",
      read: true,
    },
  ]);

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const getNotifIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-4.5 w-4.5 text-emerald-accent" />;
      case "warning":
        return <AlertCircle className="h-4.5 w-4.5 text-orange-400" />;
      default:
        return <MessageSquare className="h-4.5 w-4.5 text-cyan-accent" />;
    }
  };

  const getRoleColor = (role?: string) => {
    switch (role) {
      case "Admin":
        return "bg-purple-accent/15 text-purple-accent border-purple-accent/30";
      case "Manager":
        return "bg-cyan-accent/15 text-cyan-accent border-cyan-accent/30";
      default:
        return "bg-emerald-accent/15 text-emerald-accent border-emerald-accent/30";
    }
  };

  return (
    <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between px-6 border-b glassmorphism bg-header border-card-border shadow-sm">
      {/* Mobile Toggle & Brand */}
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleMobileSidebar}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-card-border bg-card/40 text-muted hover:text-foreground md:hidden cursor-pointer"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="hidden md:flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted">Workspace</span>
          <span className="text-xs text-muted/60">/</span>
          <span className="text-xs font-medium text-foreground">Main Board</span>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-4">
        {/* Theme Toggler */}
        <button
          onClick={toggleTheme}
          className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-card-border bg-card/40 text-muted hover:text-foreground cursor-pointer transition-all duration-200 overflow-hidden shadow-sm"
          aria-label="Toggle theme"
        >
          <AnimatePresence mode="wait" initial={false}>
            {theme === "dark" ? (
              <motion.div
                key="moon"
                initial={{ rotate: -90, scale: 0, opacity: 0 }}
                animate={{ rotate: 0, scale: 1, opacity: 1 }}
                exit={{ rotate: 90, scale: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
              >
                <Moon className="h-5 w-5 text-cyan-accent" />
              </motion.div>
            ) : (
              <motion.div
                key="sun"
                initial={{ rotate: -90, scale: 0, opacity: 0 }}
                animate={{ rotate: 0, scale: 1, opacity: 1 }}
                exit={{ rotate: 90, scale: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
              >
                <Sun className="h-5 w-5 text-purple-accent" />
              </motion.div>
            )}
          </AnimatePresence>
        </button>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className={cn(
              "relative flex h-9 w-9 items-center justify-center rounded-lg border border-card-border bg-card/40 text-muted hover:text-foreground cursor-pointer transition-all duration-200 shadow-sm",
              showNotifications && "cyber-glow-cyan"
            )}
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-cyan-accent text-[9px] font-bold text-slate-950 animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: 15, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 15, scale: 0.95 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="absolute right-0 mt-2.5 w-80 rounded-xl border border-card-border bg-card/95 glassmorphism shadow-xl p-4 overflow-hidden"
              >
                <div className="flex items-center justify-between border-b border-card-border/50 pb-2.5 mb-2">
                  <h3 className="font-semibold text-sm">Notifications</h3>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-xs text-cyan-accent hover:underline font-medium cursor-pointer"
                    >
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={cn(
                        "flex items-start gap-3 p-2 rounded-lg transition-all",
                        notif.read ? "opacity-60" : "bg-foreground/3 dark:bg-foreground/5"
                      )}
                    >
                      <div className="mt-0.5 shrink-0">{getNotifIcon(notif.type)}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold truncate text-foreground">{notif.title}</p>
                        <p className="text-[11px] text-muted leading-tight mt-0.5">{notif.desc}</p>
                        <span className="text-[9px] text-muted/65 mt-1 block">{notif.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* User Profile */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setShowProfileDropdown(!showProfileDropdown)}
            className={cn(
              "flex items-center gap-2.5 rounded-lg border border-card-border bg-card/40 p-1.5 pr-2.5 text-left text-sm hover:border-foreground/20 cursor-pointer transition-all duration-200 shadow-sm",
              showProfileDropdown && "cyber-glow-purple"
            )}
          >
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="h-7 w-7 rounded-md object-cover border border-card-border/80"
              />
            ) : (
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-purple-accent/20 border border-purple-accent/40">
                <UserIcon className="h-4 w-4 text-purple-accent" />
              </div>
            )}
            <div className="hidden sm:block shrink-0 leading-tight">
              <p className="font-semibold text-xs text-foreground">{user?.name || "Guest"}</p>
              <p className="text-[9px] text-muted font-medium">{user?.role || "Member"}</p>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-muted shrink-0" />
          </button>

          <AnimatePresence>
            {showProfileDropdown && (
              <motion.div
                initial={{ opacity: 0, y: 15, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 15, scale: 0.95 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="absolute right-0 mt-2.5 w-60 rounded-xl border border-card-border bg-card/95 glassmorphism shadow-xl p-3"
              >
                <div className="flex items-center gap-3 p-2 border-b border-card-border/50 pb-3 mb-2">
                  <img
                    src={user?.avatar}
                    alt={user?.name}
                    className="h-10 w-10 rounded-lg object-cover border border-card-border"
                  />
                  <div className="leading-tight">
                    <p className="font-bold text-sm text-foreground">{user?.name}</p>
                    <p className="text-xs text-muted truncate max-w-[140px]">{user?.email}</p>
                  </div>
                </div>

                <div className="px-2 py-1 mb-2">
                  <span
                    className={cn(
                      "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold tracking-wide",
                      getRoleColor(user?.role)
                    )}
                  >
                    {user?.role} Access
                  </span>
                </div>

                <button
                  onClick={logout}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-semibold text-rose-500 hover:bg-rose-500/10 hover:text-rose-400 transition-all cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
