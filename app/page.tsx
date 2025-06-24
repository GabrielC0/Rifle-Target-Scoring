"use client"

import { useEffect, useRef } from "react"
import { gsap } from "gsap"
import { ScoringProvider } from "@/contexts/scoring-context"
import { PlayerManagement } from "@/components/player-management"
import { GlobalRanking } from "@/components/global-ranking"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function HomePage() {
  const headerRef = useRef<HTMLElement>(null)
  const tabsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const tl = gsap.timeline()

    // Animation d'entrée du header
    tl.fromTo(headerRef.current, { y: -50, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: "power2.out" })

    // Animation d'entrée des onglets
    tl.fromTo(tabsRef.current, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: "power2.out" }, "-=0.4")
  }, [])

  return (
    <ScoringProvider>
      <div className="min-h-screen bg-gray-50 p-2 sm:p-4">
        <div className="max-w-7xl mx-auto">
          <header ref={headerRef} className="mb-4 sm:mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center">
              🎯 Système de Score de Tir à la Carabine
            </h1>
          </header>

          <div ref={tabsRef}>
            <Tabs defaultValue="players" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="players" className="text-sm sm:text-base">
                  👥 Gestion des Tireurs
                </TabsTrigger>
                <TabsTrigger value="ranking" className="text-sm sm:text-base">
                  🏆 Classement Global
                </TabsTrigger>
              </TabsList>

              <TabsContent value="players">
                <div className="max-w-2xl mx-auto">
                  <PlayerManagement />
                </div>
              </TabsContent>

              <TabsContent value="ranking">
                <GlobalRanking />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </ScoringProvider>
  )
}
