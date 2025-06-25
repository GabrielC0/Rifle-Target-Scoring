"use client";

import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ChartErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Met à jour l'état pour que le rendu suivant affiche l'UI de fallback
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    // Vous pouvez aussi enregistrer l'erreur dans un service de rapport d'erreur
    console.warn("ChartErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Vous pouvez afficher n'importe quelle UI de fallback
      return (
        this.props.fallback || (
          <div className="h-64 sm:h-80 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 text-gray-300">📊</div>
              <p>Impossible d'afficher le graphique</p>
              <p className="text-xs text-gray-400 mt-2">
                {this.state.error?.message || "Erreur inconnue"}
              </p>
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
