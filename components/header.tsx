"use client";

import { usePathname } from "next/navigation";
import { AuthButton } from "@/components/auth-button";

export function Header() {
  const pathname = usePathname();

  // Afficher seulement sur la page classement
  if (pathname !== "/classement") {
    return null;
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-semibold">🎯 Tir à la Carabine</h1>
        </div>
        <AuthButton />
      </div>
    </header>
  );
}
