"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  FolderKanban,
  CheckCircle2,
  Clock,
  AlertCircle,
  Activity,
  Calendar,
  Zap,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

export default function DashboardPage() {
  const { user } = useAuth();
  
  // State for data
  const [projects, setProjects] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fallback / Mock Data
  const mockTaskDistribution = [
    { name: "To Do", value: 12, color: "#94a3b8" }, // slate-400
    { name: "In Progress", value: 18, color: "#00f2fe" }, // cyan-accent
    { name: "Completed", value: 24, color: "#10b981" }, // emerald-accent
  ];

  const mockProgressTrend = [
    { name: "Mon", tasks: 4 },
    { name: "Tue", tasks: 7 },
    { name: "Wed", tasks: 5 },
    { name: "Thu", tasks: 12 },
    { name: "Fri", tasks: 18 },
    { name: "Sat", tasks: 14 },
    { name: "Sun", tasks: 20 },
  ];

  const mockWorkload = [
    { name: "Alex", total: 15, completed: 10 },
    { name: "Sarah", total: 12, completed: 8 },
    { name: "Marcus", total: 8, completed: 7 },
    { name: "Kyle", total: 20, completed: 5 },
  ];

  const mockActivities = [
    { id: 1, text: "Task 'Setup API' assigned to John", time: "10:15 AM", type: "assignment" },
    { id: 2, text: "Project 'Cyber UI' marked as ACTIVE", time: "09:30 AM", type: "status" },
    { id: 3, text: "Sarah completed 'Database Schema'", time: "Yesterday", type: "completion" },
    { id: 4, text: "Overdue alert: 'Auth Middleware'", time: "Yesterday", type: "alert" },
    { id: 5, text: "Alex commented on 'Redis Cache'", time: "2 days ago", type: "comment" },
  ];

  const mockUpcomingTasks = [
    { id: 1, title: "Finalize GraphQL Types", deadline: "Today, 5:00 PM", priority: "HIGH" },
    { id: 2, title: "Review Pull Request #42", deadline: "Tomorrow", priority: "MEDIUM" },
    { id: 3, title: "Deploy Staging Environment", deadline: "Friday", priority: "HIGH" },
  ];

  useEffect(() => {
    // In a real app, we would fetch from our /api endpoints here.
    // For now, we simulate a loading state and then use the mock data if no db data exists.
    const fetchData = async () => {
      try {
        setLoading(true);
        // const [projRes, taskRes, actRes] = await Promise.all([
        //   fetch("/api/projects"),
        //   fetch("/api/tasks"),
        //   fetch("/api/activity")
        // ]);
        // ... (data mapping logic would go here)
        
        // Simulating network delay
        setTimeout(() => {
          setLoading(false);
        }, 800);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants: any = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-cyan-accent"></div>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <div>
        <motion.h1 variants={itemVariants} className="text-3xl font-bold tracking-tight">
          Dashboard
        </motion.h1>
        <motion.p variants={itemVariants} className="text-sm text-muted mt-1">
          System overview and productivity metrics for your workspace.
        </motion.p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {[
          { title: "Total Projects", value: "14", icon: FolderKanban, color: "text-purple-accent", bg: "bg-purple-accent/10" },
          { title: "Total Tasks", value: "156", icon: Activity, color: "text-cyan-accent", bg: "bg-cyan-accent/10" },
          { title: "Completed", value: "84", icon: CheckCircle2, color: "text-emerald-accent", bg: "bg-emerald-accent/10" },
          { title: "Pending", value: "62", icon: Clock, color: "text-slate-400", bg: "bg-slate-400/10" },
          { title: "Overdue", value: "10", icon: AlertCircle, color: "text-rose-500", bg: "bg-rose-500/10", glow: true },
        ].map((kpi, index) => (
          <motion.div
            key={index}
            variants={itemVariants}
            className={cn(
              "relative overflow-hidden rounded-2xl border bg-card/45 glassmorphism p-5 transition-all hover:bg-card/60",
              kpi.glow ? "border-rose-500/50 shadow-[0_0_15px_rgba(244,63,94,0.15)] animate-pulse-slow" : "border-card-border"
            )}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-muted uppercase tracking-wider">{kpi.title}</span>
              <div className={cn("p-2 rounded-lg", kpi.bg)}>
                <kpi.icon className={cn("h-4 w-4", kpi.color)} />
              </div>
            </div>
            <div className="mt-4">
              <span className={cn("text-3xl font-extrabold tracking-tight", kpi.glow ? "text-rose-500" : "")}>{kpi.value}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Doughnut Chart */}
        <motion.div variants={itemVariants} className="rounded-2xl border border-card-border bg-card/45 glassmorphism p-5 flex flex-col">
          <h3 className="text-sm font-bold flex items-center gap-2 mb-6">
            <CheckCircle2 className="h-4 w-4 text-cyan-accent" /> Task Status Distribution
          </h3>
          <div className="flex-1 min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={mockTaskDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {mockTaskDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip
                  contentStyle={{ backgroundColor: "#0f172a", borderColor: "#1e293b", borderRadius: "8px", fontSize: "12px" }}
                  itemStyle={{ color: "#e2e8f0" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* Legend */}
          <div className="flex justify-center gap-4 mt-2">
            {mockTaskDistribution.map((entry, idx) => (
              <div key={idx} className="flex items-center gap-1.5 text-xs text-muted">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
                {entry.name}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Area Chart */}
        <motion.div variants={itemVariants} className="lg:col-span-2 rounded-2xl border border-card-border bg-card/45 glassmorphism p-5 flex flex-col">
          <h3 className="text-sm font-bold flex items-center gap-2 mb-6">
            <Activity className="h-4 w-4 text-purple-accent" /> Project Progress Trend
          </h3>
          <div className="flex-1 min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockProgressTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTasks" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#9d4edd" stopOpacity={0.5}/>
                    <stop offset="95%" stopColor="#9d4edd" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                <RechartsTooltip
                  contentStyle={{ backgroundColor: "#0f172a", borderColor: "#1e293b", borderRadius: "8px", fontSize: "12px" }}
                />
                <Area type="monotone" dataKey="tasks" stroke="#9d4edd" strokeWidth={3} fillOpacity={1} fill="url(#colorTasks)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Lower Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Bar Chart */}
        <motion.div variants={itemVariants} className="lg:col-span-2 rounded-2xl border border-card-border bg-card/45 glassmorphism p-5 flex flex-col">
           <h3 className="text-sm font-bold flex items-center gap-2 mb-6">
            <Zap className="h-4 w-4 text-emerald-accent" /> Member Workload Summary
          </h3>
          <div className="flex-1 min-h-[250px]">
             <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockWorkload} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                <RechartsTooltip
                  cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                  contentStyle={{ backgroundColor: "#0f172a", borderColor: "#1e293b", borderRadius: "8px", fontSize: "12px" }}
                />
                <Bar dataKey="total" fill="#1e293b" radius={[4, 4, 0, 0]} />
                <Bar dataKey="completed" fill="#00f2fe" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
           {/* Legend */}
           <div className="flex justify-center gap-4 mt-2">
              <div className="flex items-center gap-1.5 text-xs text-muted">
                <span className="h-2 w-2 rounded-full bg-slate-800" />
                Assigned
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted">
                <span className="h-2 w-2 rounded-full bg-cyan-accent" />
                Completed
              </div>
          </div>
        </motion.div>

        {/* Activity Widget */}
        <motion.div variants={itemVariants} className="rounded-2xl border border-card-border bg-card/45 glassmorphism p-5">
           <h3 className="text-sm font-bold flex items-center gap-2 mb-6">
            <Clock className="h-4 w-4 text-sky-400" /> Recent Activity Log
          </h3>
          <div className="space-y-4 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-700 before:to-transparent">
            {mockActivities.map((activity, index) => (
               <div key={activity.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-5 h-5 rounded-full border border-card-border bg-slate-900 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow shadow-slate-900 z-10">
                      <div className="w-1.5 h-1.5 bg-sky-400 rounded-full"></div>
                  </div>
                  <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] p-3 rounded-xl border border-card-border bg-slate-900/40 shadow">
                      <div className="flex items-center justify-between mb-1">
                          <time className="text-[9px] font-bold text-sky-400 uppercase tracking-wider">{activity.time}</time>
                      </div>
                      <div className="text-xs text-slate-300">{activity.text}</div>
                  </div>
               </div>
            ))}
          </div>
        </motion.div>
      </div>
      
      {/* Quick Actions / Shortcuts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         <motion.div variants={itemVariants} className="rounded-2xl border border-card-border bg-card/45 glassmorphism p-5">
            <h3 className="text-sm font-bold flex items-center gap-2 mb-4">
              <Calendar className="h-4 w-4 text-rose-500" /> Upcoming Deadlines & High Priority
            </h3>
            <div className="space-y-3">
              {mockUpcomingTasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between p-3 rounded-xl border border-card-border bg-slate-900/50 hover:bg-slate-800/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <button className="h-5 w-5 rounded-full border border-slate-500 flex items-center justify-center hover:border-emerald-accent hover:text-emerald-accent transition-colors">
                       <CheckCircle2 className="h-3 w-3 opacity-0 hover:opacity-100" />
                    </button>
                    <div>
                      <p className="text-xs font-semibold">{task.title}</p>
                      <p className="text-[10px] text-muted mt-0.5">{task.deadline}</p>
                    </div>
                  </div>
                  <span className={cn(
                    "text-[9px] font-bold px-2 py-0.5 rounded-full border",
                    task.priority === "HIGH" ? "bg-rose-500/10 text-rose-500 border-rose-500/20" : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                  )}>
                    {task.priority}
                  </span>
                </div>
              ))}
            </div>
         </motion.div>
      </div>

    </motion.div>
  );
}
