"use client";

import { usePathname } from "next/navigation";
import { AuthButton } from "@/components/auth-button";

export function FloatingAuthButton() {
  const pathname = usePathname();

  // Afficher seulement sur la page classement
  if (pathname !== "/classement") {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="group">
        {/* Bouton principal en survol */}
        <div className="opacity-20 hover:opacity-100 transition-opacity duration-300">
          <AuthButton />
        </div>

        {/* Indicateur discret pour montrer qu'il y a quelque chose */}
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-pulse group-hover:hidden"></div>
      </div>
    </div>
  );
}
