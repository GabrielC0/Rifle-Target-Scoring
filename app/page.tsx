"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { PlayerManagement } from "@/components/player-management";
import { GlobalRanking } from "@/components/global-ranking";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function HomePage() {
  const headerRef = useRef<HTMLElement>(null);
  const tabsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tl = gsap.timeline();

    // Animation d'entrée du header
    tl.fromTo(
      headerRef.current,
      { y: -50, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: "power2.out" }
    );

    // Animation d'entrée des onglets
    tl.fromTo(
      tabsRef.current,
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
            🎯 Système core
          </h1>
          <div className="flex justify-center gap-2 mt-4">
            <a
              href="/diagnostic"
              className="text-xs px-3 py-1 bg-blue-100 text-blue-800 rounded-full hover:bg-blue-200 transition-colors"
            >
              🔍 Diagnostic
            </a>
            <a
              href="/test"
              className="text-xs px-3 py-1 bg-green-100 text-green-800 rounded-full hover:bg-green-200 transition-colors"
            >
              🧪 Test
            </a>
          </div>
        </header>

        <div ref={tabsRef}>
          <Tabs defaultValue="players" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4 sm:mb-6 h-12 sm:h-14">
              <TabsTrigger
                value="players"
                className="text-xs sm:text-sm lg:text-base font-medium"
              >
                <span className="hidden sm:inline">👥 Gestion des Tireurs</span>
                <span className="sm:hidden">👥 Tireurs</span>
              </TabsTrigger>
              <TabsTrigger
                value="ranking"
                className="text-xs sm:text-sm lg:text-base font-medium"
              >
                <span className="hidden sm:inline">🏆 Classement Global</span>
                <span className="sm:hidden">🏆 Classement</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="players" className="mt-0">
              <div className="max-w-4xl mx-auto">
                <PlayerManagement />
              </div>
            </TabsContent>

            <TabsContent value="ranking" className="mt-0">
              <GlobalRanking />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
