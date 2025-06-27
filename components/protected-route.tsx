"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const publicRoutes = ["/classement"];

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, loading, checkAuth } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [showAccessDenied, setShowAccessDenied] = useState(false);

  useEffect(() => {
    if (loading) return;

    // Si c'est une route publique, laisser passer
    if (publicRoutes.includes(pathname)) {
      return;
    }

    // Vérifier l'authentification
    const isAuth = checkAuth();

    if (!isAuth) {
      setShowAccessDenied(true);
    }
  }, [pathname, loading, checkAuth]);

  const handleRedirect = () => {
    setShowAccessDenied(false);
    router.push("/classement");
  };

  // Pendant le chargement
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  // Si route publique ou utilisateur authentifié, afficher le contenu
  if (publicRoutes.includes(pathname) || isAuthenticated) {
    return <>{children}</>;
  }

  // Afficher le popup d'accès refusé
  return (
    <>
      {children}
      <Dialog open={showAccessDenied} onOpenChange={setShowAccessDenied}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              Accès Refusé
            </DialogTitle>
            <DialogDescription className="pt-2">
              Vous n'avez pas les droits nécessaires pour accéder à cette page.
              Vous allez être redirigé vers la page de classement.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center pt-4">
            <Button onClick={handleRedirect} className="w-full">
              Aller au Classement
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
