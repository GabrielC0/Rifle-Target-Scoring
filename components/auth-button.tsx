"use client";

import { useAuth } from "@/contexts/auth-context";
import { LoginModal } from "@/components/login-modal";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogIn, LogOut, User } from "lucide-react";

export function AuthButton() {
  const { isAuthenticated, logout, loading } = useAuth();

  if (loading) {
    return <div className="h-10 w-20 bg-gray-200 rounded animate-pulse"></div>;
  }

  if (isAuthenticated) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <User className="w-4 h-4" />
            <span className="hidden sm:inline">Admin</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={logout} className="gap-2 text-red-600">
            <LogOut className="w-4 h-4" />
            Déconnexion
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <LoginModal>
      <Button variant="outline" size="sm" className="gap-2">
        <LogIn className="w-4 h-4" />
        <span className="hidden sm:inline">Connexion</span>
        <span className="sm:hidden">⚡</span>
      </Button>
    </LoginModal>
  );
}
