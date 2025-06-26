"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScoresDashboardSimple } from "@/components/scores-dashboard-simple";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ScoresPage() {
  const headerRef = useRef<HTMLElement>(null);
  const dashboardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tl = gsap.timeline();

    // Animation d'entrée du header
    tl.fromTo(
      headerRef.current,
      { y: -50, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: "power2.out" }
    );

    // Animation d'entrée du dashboard
    tl.fromTo(
      dashboardRef.current,
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, ease: "power2.out" },
      "-=0.4"
    );
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-2 sm:p-4 lg:p-6">
      <div className="max-w-7xl mx-auto">
        <header ref={headerRef} className="mb-4 sm:mb-6 lg:mb-8">
          <div className="flex items-center justify-between mb-4">
            <Link href="/">
              <Button variant="outline" size="sm" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Retour
              </Button>
            </Link>
          </div>

          <h1 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-900 text-center px-2">
            📊 Scores et Classements
          </h1>
          <p className="text-sm sm:text-base text-gray-600 text-center mt-2">
            Visualisez les performances, sélectionnez des tireurs et comparez
            leurs statistiques
          </p>
        </header>

        <div ref={dashboardRef}>
          <ScoresDashboardSimple />
        </div>
      </div>
    </div>
  );
}
