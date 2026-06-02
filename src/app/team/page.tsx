"use client";

import React, { useState } from "react";
import { Users, Mail, UserPlus, Shield, MessageSquare, Search, Award } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface Member {
  id: string;
  name: string;
  email: string;
  role: "Admin" | "Manager" | "Member";
  avatar: string;
  activeTasks: number;
  completedTasks: number;
  status: "Online" | "Offline" | "In Meeting";
  efficiency: string;
}

export default function TeamPage() {
  const [search, setSearch] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"Admin" | "Manager" | "Member">("Member");
  const [inviteSuccess, setInviteSuccess] = useState("");

  const [members, setMembers] = useState<Member[]>([
    {
      id: "1",
      name: "Alex Rivers",
      email: "admin@worksync.io",
      role: "Admin",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
      activeTasks: 3,
      completedTasks: 18,
      status: "Online",
      efficiency: "96.4%",
    },
    {
      id: "2",
      name: "Sarah Connor",
      email: "manager@worksync.io",
      role: "Manager",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80",
      activeTasks: 4,
      completedTasks: 12,
      status: "In Meeting",
      efficiency: "92.1%",
    },
    {
      id: "3",
      name: "Marcus Wright",
      email: "member@worksync.io",
      role: "Member",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
      activeTasks: 2,
      completedTasks: 22,
      status: "Online",
      efficiency: "95.8%",
    },
    {
      id: "4",
      name: "Kyle Reese",
      email: "kyle@worksync.io",
      role: "Member",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80",
      activeTasks: 5,
      completedTasks: 8,
      status: "Offline",
      efficiency: "88.5%",
    },
  ]);

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    setInviteSuccess(`Invitation sent to ${inviteEmail} as ${inviteRole}!`);
    setInviteEmail("");
    
    // Auto clear success notice
    setTimeout(() => setInviteSuccess(""), 3000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Online":
        return "bg-emerald-accent";
      case "In Meeting":
        return "bg-amber-500 animate-pulse";
      default:
        return "bg-muted";
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "Admin":
        return "bg-purple-accent/15 text-purple-accent border-purple-accent/30";
      case "Manager":
        return "bg-cyan-accent/15 text-cyan-accent border-cyan-accent/30";
      default:
        return "bg-emerald-accent/15 text-emerald-accent border-emerald-accent/30";
    }
  };

  const filteredMembers = members.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase()) ||
      m.role.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Users className="h-6 w-6 text-cyan-accent" />
            <span>Team Directory</span>
          </h1>
          <p className="text-xs text-muted mt-1">Review permissions, task loads, and efficiency values of engineers.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Left Invite Box */}
        <div className="p-5 rounded-2xl border border-card-border bg-card/45 glassmorphism space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider flex items-center gap-1.5 text-foreground">
            <UserPlus className="h-4.5 w-4.5 text-cyan-accent" /> Invite Engineer
          </h2>
          {inviteSuccess && (
            <div className="p-2.5 rounded-lg border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 text-[11px] font-semibold leading-snug">
              {inviteSuccess}
            </div>
          )}
          <form onSubmit={handleInvite} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-wider text-muted font-bold">Email Address</label>
              <input
                type="email"
                required
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="developer@worksync.io"
                className="w-full h-10 px-3 bg-slate-950/40 rounded-lg border border-card-border/60 text-xs focus:outline-none focus:border-cyan-accent transition-all placeholder:text-muted"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-wider text-muted font-bold">Role Access</label>
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as any)}
                className="w-full h-10 px-2 bg-slate-950/60 rounded-lg border border-card-border/60 text-xs focus:outline-none focus:border-cyan-accent text-foreground"
              >
                <option value="Member">Member (Limited)</option>
                <option value="Manager">Manager (Moderator)</option>
                <option value="Admin">Admin (Full Access)</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full h-10 bg-gradient-to-r from-cyan-accent to-purple-accent text-slate-950 font-bold rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-cyan-accent/15"
            >
              <span>Dispatch Invite</span>
            </button>
          </form>
        </div>

        {/* Right Members Grid */}
        <div className="lg:col-span-3 space-y-4">
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, role or email..."
              className="w-full h-10 pl-10 pr-4 bg-card/40 rounded-xl border border-card-border/60 text-xs focus:outline-none focus:border-cyan-accent transition-all placeholder:text-muted"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredMembers.map((m) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-5 rounded-2xl border border-card-border bg-card/45 glassmorphism flex items-start gap-4 relative group"
              >
                {/* Avatar with status indicator */}
                <div className="relative shrink-0">
                  <img src={m.avatar} alt={m.name} className="h-12 w-12 rounded-xl object-cover border border-card-border bg-slate-900" />
                  <span className={cn("absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full border-2 border-background", getStatusColor(m.status))} />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="leading-tight">
                    <h3 className="font-bold text-sm text-foreground truncate">{m.name}</h3>
                    <p className="text-[10px] text-muted truncate flex items-center gap-1 mt-0.5">
                      <Mail className="h-3 w-3" /> {m.email}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    <span className={cn("inline-flex items-center rounded-full border px-2 py-0.2 text-[9px] font-bold tracking-wide", getRoleBadge(m.role))}>
                      {m.role}
                    </span>
                    <span className="inline-flex items-center rounded-full border border-card-border bg-slate-950/20 px-2 py-0.2 text-[9px] font-bold text-muted">
                      {m.status}
                    </span>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-3 gap-2 pt-2.5 border-t border-card-border/30 text-[10px]">
                    <div className="leading-tight">
                      <p className="text-muted font-semibold">Active Tasks</p>
                      <p className="font-bold text-foreground text-xs mt-0.5">{m.activeTasks}</p>
                    </div>
                    <div className="leading-tight">
                      <p className="text-muted font-semibold">Completed</p>
                      <p className="font-bold text-foreground text-xs mt-0.5">{m.completedTasks}</p>
                    </div>
                    <div className="leading-tight">
                      <p className="text-muted font-semibold">Efficiency</p>
                      <p className="font-bold text-emerald-accent text-xs mt-0.5 flex items-center gap-0.5">
                        <Award className="h-3 w-3" /> {m.efficiency}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
