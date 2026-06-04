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

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string, role: UserRole) => Promise<boolean>;
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
  const [isLoading, setIsLoading] = useState(true);
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
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        return false;
      }
      setStoredToken(data.token);
      const loggedInUser = mapApiUser(data.user);
      setUser(loggedInUser);
      localStorage.setItem("user", JSON.stringify(loggedInUser));
      router.push("/dashboard");
      return true;
    } catch {
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    role: UserRole
  ): Promise<boolean> => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          role: displayRoleToApi(role),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        return false;
      }
      setStoredToken(data.token);
      const loggedInUser = mapApiUser(data.user);
      setUser(loggedInUser);
      localStorage.setItem("user", JSON.stringify(loggedInUser));
      router.push("/dashboard");
      return true;
    } catch {
      return false;
    } finally {
      setIsLoading(false);
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
        isLoading,
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
