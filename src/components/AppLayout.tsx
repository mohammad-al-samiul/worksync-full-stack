"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";
import { WorkSyncLogo } from "@/components/WorkSyncLogo";
import { cn } from "@/lib/utils";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isInitializing } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [isMobileOpen, setIsMobileOpen] = useState<boolean>(false);

  const isAuthPage = pathname === "/auth";

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!isInitializing && !user && !isAuthPage) {
      router.push("/auth");
    }
  }, [user, isInitializing, isAuthPage, router]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  // Close mobile sidebar on route change
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMobileOpen(false);
  }, [pathname]);

  if (isAuthPage) {
    return <>{children}</>;
  }

  // Beautiful cyber loading state
  if (isInitializing || (!user && !isAuthPage)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0b0f19] text-white cyber-mesh cyber-grid">
        <div className="flex flex-col items-center gap-4 p-8 rounded-2xl border border-purple-accent/20 bg-slate-900/60 glassmorphism shadow-[0_0_50px_rgba(157,78,221,0.15)]">
          <WorkSyncLogo showText={false} size="md" />
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            className="flex h-8 w-8 items-center justify-center"
          >
            <Loader2 className="h-6 w-6 text-cyan-accent" />
          </motion.div>
          <div className="text-center">
            <h2 className="text-sm font-semibold tracking-wider uppercase text-cyan-accent animate-pulse-glow">
              Connecting WorkSync
            </h2>
            <p className="text-xs text-muted mt-1">Decrypting secure token session...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col w-full bg-background text-foreground cyber-mesh cyber-grid">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      </div>

      {/* Mobile Sidebar (Drawer) */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              className="fixed top-0 bottom-0 left-0 z-50 w-[260px] md:hidden"
            >
              <Sidebar isCollapsed={false} setIsCollapsed={() => {}} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Page Container */}
      <div
        className={cn(
          "flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out",
          isCollapsed ? "md:pl-[76px]" : "md:pl-[260px]"
        )}
      >
        <Header onToggleMobileSidebar={() => setIsMobileOpen(!isMobileOpen)} />
        <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-8 flex flex-col">
          {children}
        </main>
      </div>
    </div>
  );
}
