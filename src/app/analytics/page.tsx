"use client";

import React, { useEffect, useState } from "react";
import { BarChart3, TrendingUp, CheckCircle2, Flag } from "lucide-react";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import { apiFetch, parseJson, type PaginatedResponse } from "@/lib/api";

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [completionRate, setCompletionRate] = useState(0);
  const [statusData, setStatusData] = useState<{ name: string; count: number; color: string }[]>([]);
  const [priorityData, setPriorityData] = useState<{ name: string; count: number; color: string }[]>([]);
  const [weeklyDone, setWeeklyDone] = useState<{ day: string; completed: number }[]>([]);
  const [memberStats, setMemberStats] = useState<{ name: string; done: number; open: number }[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [taskRes, userRes] = await Promise.all([
          apiFetch("/api/tasks?limit=200"),
          apiFetch("/api/users"),
        ]);
        const taskData = taskRes.ok
          ? await parseJson<PaginatedResponse<{ status: string; priority: string; assignedTo?: { name: string }; updatedAt: string }>>(taskRes)
          : null;
        const users = userRes.ok ? await parseJson<{ name: string; activeTasks: number; completedTasks: number }[]>(userRes) : null;

        const tasks = taskData?.data ?? [];
        const done = tasks.filter((t) => t.status === "COMPLETED").length;
        setCompletionRate(tasks.length ? Math.round((done / tasks.length) * 100) : 0);

        setStatusData([
          { name: "To Do", count: tasks.filter((t) => t.status === "TODO").length, color: "#94a3b8" },
          { name: "In Progress", count: tasks.filter((t) => t.status === "IN_PROGRESS").length, color: "#00f2fe" },
          { name: "Done", count: done, color: "#10b981" },
        ]);

        setPriorityData([
          { name: "High", count: tasks.filter((t) => t.priority === "HIGH").length, color: "#f43f5e" },
          { name: "Medium", count: tasks.filter((t) => t.priority === "MEDIUM").length, color: "#f59e0b" },
          { name: "Low", count: tasks.filter((t) => t.priority === "LOW").length, color: "#10b981" },
        ]);

        const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        setWeeklyDone(
          days.map((day, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (6 - i));
            const count = tasks.filter(
              (t) =>
                t.status === "COMPLETED" &&
                new Date(t.updatedAt).toDateString() === d.toDateString()
            ).length;
            return { day, completed: count };
          })
        );

        if (users) {
          setMemberStats(
            users.slice(0, 6).map((u) => ({
              name: u.name.split(" ")[0],
              done: u.completedTasks,
              open: u.activeTasks,
            }))
          );
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-emerald-accent" />
      </div>
    );
  }

  const tooltipStyle = {
    backgroundColor: "#0f172a",
    borderColor: "#1e293b",
    borderRadius: "8px",
    fontSize: "12px",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight flex items-center gap-2">
          <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-accent shrink-0" />
          Analytics
        </h1>
        <p className="text-xs text-muted mt-1">
          Task completion trends and team output from your live data.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-5 rounded-2xl border border-card-border bg-card/45 glassmorphism">
          <span className="text-xs font-bold text-muted uppercase tracking-wider">Completion Rate</span>
          <p className="text-3xl font-bold mt-2">{completionRate}%</p>
          <p className="text-[10px] text-muted mt-1">Tasks marked done out of total</p>
        </div>
        <div className="p-5 rounded-2xl border border-card-border bg-card/45 glassmorphism">
          <span className="text-xs font-bold text-muted uppercase tracking-wider">Open Tasks</span>
          <p className="text-3xl font-bold mt-2">
            {statusData.reduce((s, d) => s + (d.name !== "Done" ? d.count : 0), 0)}
          </p>
          <p className="text-[10px] text-muted mt-1">Still to do or in progress</p>
        </div>
        <div className="p-5 rounded-2xl border border-card-border bg-card/45 glassmorphism">
          <span className="text-xs font-bold text-muted uppercase tracking-wider">High Priority</span>
          <p className="text-3xl font-bold mt-2 text-rose-500">
            {priorityData.find((p) => p.name === "High")?.count ?? 0}
          </p>
          <p className="text-[10px] text-muted mt-1">Tasks flagged as high priority</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-5 rounded-2xl border border-card-border bg-card/45 glassmorphism"
        >
          <h3 className="font-bold text-sm flex items-center gap-2 mb-4">
            <CheckCircle2 className="h-4 w-4 text-cyan-accent" /> Task Status Breakdown
          </h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusData} dataKey="count" nameKey="name" innerRadius={50} outerRadius={75} stroke="none">
                  {statusData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-5 rounded-2xl border border-card-border bg-card/45 glassmorphism"
        >
          <h3 className="font-bold text-sm flex items-center gap-2 mb-4">
            <Flag className="h-4 w-4 text-rose-500" /> Priority Distribution
          </h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={priorityData}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {priorityData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-5 rounded-2xl border border-card-border bg-card/45 glassmorphism"
        >
          <h3 className="font-bold text-sm flex items-center gap-2 mb-4">
            <TrendingUp className="h-4 w-4 text-purple-accent" /> Completions This Week
          </h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyDone}>
                <XAxis dataKey="day" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="completed" stroke="#9d4edd" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-5 rounded-2xl border border-card-border bg-card/45 glassmorphism"
        >
          <h3 className="font-bold text-sm flex items-center gap-2 mb-4">
            <BarChart3 className="h-4 w-4 text-emerald-accent" /> Team Productivity
          </h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={memberStats}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="open" fill="#1e293b" radius={[4, 4, 0, 0]} name="Open" />
                <Bar dataKey="done" fill="#00f2fe" radius={[4, 4, 0, 0]} name="Done" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
