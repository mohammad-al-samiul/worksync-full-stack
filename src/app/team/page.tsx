"use client";

import React, { useState, useEffect } from "react";
import { Users, Mail, UserPlus, Shield, MessageSquare, Search, Award } from "lucide-react";
import { motion } from "framer-motion";
import { SubmitButton } from "@/components/SubmitButton";
import { CyberDropdown } from "@/components/CyberDropdown";
import { cn } from "@/lib/utils";
import { apiFetch, parseJson } from "@/lib/api";
import { apiRoleToDisplay, displayRoleToApi } from "@/lib/roles";

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

  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [isInviting, setIsInviting] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await apiFetch("/api/users");
        if (res.ok) {
          const data = await parseJson<
            {
              id: string;
              name: string;
              email: string;
              role: string;
              avatar?: string | null;
              activeTasks: number;
              completedTasks: number;
              efficiency: string;
            }[]
          >(res);
          if (data) {
            const statuses: Member["status"][] = ["Online", "In Meeting", "Offline"];
            setMembers(
              data.map((u, i) => ({
                id: u.id,
                name: u.name,
                email: u.email,
                role: apiRoleToDisplay(u.role),
                avatar:
                  u.avatar ||
                  `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(u.name)}`,
                activeTasks: u.activeTasks,
                completedTasks: u.completedTasks,
                status: statuses[i % statuses.length],
                efficiency: u.efficiency,
              }))
            );
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim() || isInviting) return;

    setIsInviting(true);
    setInviteSuccess("");
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: inviteEmail.split("@")[0],
          email: inviteEmail.trim(),
          password: "worksync123",
          role: displayRoleToApi(inviteRole),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setInviteSuccess(
          `Account created for ${inviteEmail} (${inviteRole}). Temp password: worksync123`
        );
        setInviteEmail("");
        const rosterRes = await apiFetch("/api/users");
        if (rosterRes.ok) {
          const roster = await parseJson<typeof members>(rosterRes);
          if (roster) {
            const statuses: Member["status"][] = ["Online", "In Meeting", "Offline"];
            setMembers(
              roster.map((u: any, i: number) => ({
                id: u.id,
                name: u.name,
                email: u.email,
                role: apiRoleToDisplay(u.role),
                avatar:
                  u.avatar ||
                  `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(u.name)}`,
                activeTasks: u.activeTasks,
                completedTasks: u.completedTasks,
                status: statuses[i % statuses.length],
                efficiency: u.efficiency,
              }))
            );
          }
        }
      } else {
        setInviteSuccess(data.error || "Invite failed.");
      }
    } catch {
      setInviteSuccess("Invite failed. Check network.");
    } finally {
      setIsInviting(false);
      setTimeout(() => setInviteSuccess(""), 5000);
    }
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
          <form
            onSubmit={handleInvite}
            className={cn("space-y-4 relative", isInviting && "opacity-80")}
          >
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-wider text-muted font-bold">Email Address</label>
              <input
                type="email"
                required
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="developer@worksync.io"
                disabled={isInviting}
                className="w-full h-10 px-3 bg-slate-950/40 rounded-lg border border-card-border/60 text-xs focus:outline-none focus:border-cyan-accent transition-all placeholder:text-muted disabled:opacity-60"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-wider text-muted font-bold">Role Access</label>
              <CyberDropdown
                variant="form"
                value={inviteRole}
                disabled={isInviting}
                onChange={(v) =>
                  setInviteRole(v as "Admin" | "Manager" | "Member")
                }
                className="w-full [&_button]:h-10 [&_button]:rounded-lg [&_button]:border-card-border/60 [&_button]:bg-slate-950/60 [&_button]:text-xs"
                options={[
                  { value: "Member", label: "Member (Limited)" },
                  { value: "Manager", label: "Manager (Moderator)" },
                  { value: "Admin", label: "Admin (Full Access)" },
                ]}
              />
            </div>

            <SubmitButton
              isLoading={isInviting}
              loadingText="Sending invite..."
              variant="gradient"
              className="w-full h-10 text-xs uppercase tracking-wider"
            >
              Dispatch Invite
            </SubmitButton>
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
            {loading ? (
              <div className="col-span-2 flex justify-center py-16">
                <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-cyan-accent" />
              </div>
            ) : null}
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
