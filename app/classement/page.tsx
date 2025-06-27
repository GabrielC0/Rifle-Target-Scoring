"use client";

import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { gsap } from "gsap";
import { ClassementDashboard } from "@/components/classement-dashboard";

export default function ClassementPage() {
  const searchParams = useSearchParams();
  const selectedPlayerId = searchParams.get("player");
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
    <div className="min-h-screen bg-gray-50 p-2 sm:p-4 lg:p-6 xl:p-8">
      <div className="max-w-7xl mx-auto">
        <header ref={headerRef} className="mb-6 sm:mb-8 lg:mb-10 xl:mb-12">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl 2xl:text-6xl font-bold text-gray-900 text-center px-2 sm:px-4 leading-tight">
            🏆 Classement et Performances
          </h1>
          <p className="text-sm sm:text-base lg:text-lg text-gray-600 text-center mt-2 sm:mt-4 px-4">
            Visualisez les classements, sélectionnez des tireurs et comparez
            leurs statistiques
          </p>
        </header>

        <div ref={dashboardRef}>
          <ClassementDashboard preselectedPlayerId={selectedPlayerId} />
        </div>
      </div>
    </div>
  );
}
