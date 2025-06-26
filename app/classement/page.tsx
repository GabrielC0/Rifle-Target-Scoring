"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ClassementDashboard } from "@/components/classement-dashboard";

export default function ClassementPage() {
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
          <h1 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-900 text-center px-2">
            🏆 Classement et Performances
          </h1>
          <p className="text-sm sm:text-base text-gray-600 text-center mt-2">
            Visualisez les classements, sélectionnez des tireurs et comparez
            leurs statistiques
          </p>
        </header>

        <div ref={dashboardRef}>
          <ClassementDashboard />
        </div>
      </div>
    </div>
  );
}
