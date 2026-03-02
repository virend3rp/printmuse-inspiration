"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { apiFetch } from "@/lib/api";
import { User, AuthResponse } from "@/types";

type AuthContextType = {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  // Restore user on refresh
  useEffect(() => {
    const storedUser = sessionStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  async function login(email: string, password: string) {
    const res: AuthResponse = await apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    setUser(res.data.user);

    sessionStorage.setItem(
      "access_token",
      res.data.access_token
    );

    sessionStorage.setItem(
      "user",
      JSON.stringify(res.data.user)
    );
  }

  async function register(email: string, password: string) {
    const res: AuthResponse = await apiFetch("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    setUser(res.data.user);

    sessionStorage.setItem(
      "access_token",
      res.data.access_token
    );

    sessionStorage.setItem(
      "user",
      JSON.stringify(res.data.user)
    );
  }

  function logout() {
    setUser(null);
    sessionStorage.removeItem("access_token");
    sessionStorage.removeItem("user");
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}