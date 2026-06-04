"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { setStoredToken, getStoredToken } from "@/lib/api";
import { apiRoleToDisplay, displayRoleToApi, type DisplayRole } from "@/lib/roles";

export type UserRole = DisplayRole;

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
}

export type AuthResult =
  | { ok: true }
  | { ok: false; error: string };

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  /** True only while restoring session from localStorage on first load */
  isInitializing: boolean;
  /** True while login/register request is in flight */
  isSubmitting: boolean;
  /** @deprecated Use isInitializing — kept for older imports */
  isLoading: boolean;
  login: (email: string, password: string) => Promise<AuthResult>;
  register: (
    name: string,
    email: string,
    password: string,
    role: UserRole
  ) => Promise<AuthResult>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function mapApiUser(raw: {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string | null;
}): User {
  return {
    id: raw.id,
    name: raw.name,
    email: raw.email,
    role: apiRoleToDisplay(raw.role),
    avatar:
      raw.avatar ||
      `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(raw.name)}`,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    const token = getStoredToken();
    if (savedUser && token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1] ?? ""));
        const expired =
          typeof payload.exp === "number" && payload.exp * 1000 < Date.now();
        if (expired) {
          localStorage.removeItem("user");
          setStoredToken(null);
        } else {
          setUser(JSON.parse(savedUser));
        }
      } catch {
        localStorage.removeItem("user");
        setStoredToken(null);
      }
    }
    setIsInitializing(false);
  }, []);

  const login = async (email: string, password: string): Promise<AuthResult> => {
    const normalizedEmail = email.trim().toLowerCase();
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalizedEmail, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const message =
          typeof data.error === "string"
            ? data.error
            : res.status >= 500
              ? "Server error. Check DATABASE_URL and JWT_SECRET, then restart the app."
              : "Invalid email or password.";
        return { ok: false, error: message };
      }
      if (!data.token || !data.user) {
        return {
          ok: false,
          error: "Login response was invalid. Restart the dev server and try again.",
        };
      }
      setStoredToken(data.token);
      const loggedInUser = mapApiUser(data.user);
      setUser(loggedInUser);
      localStorage.setItem("user", JSON.stringify(loggedInUser));
      router.push("/dashboard");
      return { ok: true };
    } catch {
      return {
        ok: false,
        error:
          "Cannot reach the login API. Is `npm run dev` running on this same site?",
      };
    } finally {
      setIsSubmitting(false);
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    role: UserRole
  ): Promise<AuthResult> => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email: email.trim().toLowerCase(),
          password,
          role: displayRoleToApi(role),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const message =
          typeof data.error === "string"
            ? data.error
            : res.status >= 500
              ? "Server error. Check DATABASE_URL and JWT_SECRET."
              : "Registration failed. Email may already exist.";
        return { ok: false, error: message };
      }
      if (!data.token || !data.user) {
        return { ok: false, error: "Registration response was invalid." };
      }
      setStoredToken(data.token);
      const loggedInUser = mapApiUser(data.user);
      setUser(loggedInUser);
      localStorage.setItem("user", JSON.stringify(loggedInUser));
      router.push("/dashboard");
      return { ok: true };
    } catch {
      return {
        ok: false,
        error: "Cannot reach the server. Check your deployment settings.",
      };
    } finally {
      setIsSubmitting(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    setStoredToken(null);
    router.push("/auth");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isInitializing,
        isSubmitting,
        isLoading: isInitializing,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
