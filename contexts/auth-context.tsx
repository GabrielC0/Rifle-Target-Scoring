"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface AuthContextType {
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  checkAuth: () => boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Vérifier si l'utilisateur est connecté au démarrage
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("auth-token");
      if (token) {
        setIsAuthenticated(true);
      }
    }
    setLoading(false);
  }, []);

  const login = async (
    username: string,
    password: string
  ): Promise<boolean> => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const data = await response.json();
        if (typeof window !== "undefined") {
          localStorage.setItem("auth-token", data.token);
        }
        setIsAuthenticated(true);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Erreur de connexion:", error);
      return false;
    }
  };

  const logout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth-token");
    }
    setIsAuthenticated(false);
    router.push("/classement");
  };

  const checkAuth = (): boolean => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("auth-token");
      const isAuth = !!token;
      setIsAuthenticated(isAuth);
      return isAuth;
    }
    return false;
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        login,
        logout,
        checkAuth,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
