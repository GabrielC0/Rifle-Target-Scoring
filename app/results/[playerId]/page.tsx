"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, Suspense } from "react";
import { gsap } from "gsap";
import { useScoring } from "@/contexts/scoring-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Home,
  RotateCcw,
  Trophy,
  Target,
  TrendingUp,
} from "lucide-react";
import { ChartErrorBoundary } from "@/components/chart-error-boundary";
import {
  SimpleLineChart,
  SimpleBarChart,
  PrecisionChart,
} from "@/components/simple-charts";

function ResultsContent() {
  const params = useParams();
  const router = useRouter();
  const { state, dispatch } = useScoring();
  const headerRef = useRef<HTMLDivElement>(null);
  const summaryRef = useRef<HTMLDivElement>(null);
  const chartsRef = useRef<HTMLDivElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);

  // Sécurisation des paramètres
  const playerId =
    typeof params?.playerId === "string" ? params.playerId : null;
  const player = playerId ? state.players.find((p) => p.id === playerId) : null;

  useEffect(() => {
    // Animation d'entrée de la page des résultats
    const tl = gsap.timeline();

    tl.fromTo(
      headerRef.current,
      { y: -30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, ease: "power2.out" }
    )
      .fromTo(
        summaryRef.current?.children || [],
        { y: 30, opacity: 0, scale: 0.9 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.5,
          stagger: 0.1,
          ease: "back.out(1.7)",
        },
        "-=0.3"
      )
      .fromTo(
        chartsRef.current?.children || [],
        { x: -50, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.6, stagger: 0.2, ease: "power2.out" },
        "-=0.4"
      )
      .fromTo(
        actionsRef.current,
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: "power2.out" },
        "-=0.2"
      );
  }, []);

  if (!playerId || !player) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-8">
            <p className="text-gray-500 mb-4">
              {!playerId ? "ID de tireur manquant" : "Tireur non trouvé"}
            </p>
            <Button onClick={() => router.push("/")} variant="outline">
              <Home className="w-4 h-4 mr-2" />
              Retour à l'accueil
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleRestart = () => {
    // Animation avant redirection
    gsap.to(document.body, {
      scale: 0.95,
      opacity: 0.8,
      duration: 0.3,
      ease: "power2.in",
      onComplete: () => {
        dispatch({ type: "RESET_PLAYER_SCORES", payload: { id: player.id } });
        router.push(`/shooting/${player.id}`);
      },
    });
  };

  // Calculate statistics with safety checks
  const hasScores = player.scores && player.scores.length > 0;
  const averageScore = hasScores ? player.totalScore / player.scores.length : 0;
  const averagePrecision = hasScores ? (averageScore / 10) * 100 : 0; // Pourcentage de précision
  const bestShot = hasScores ? Math.max(...player.scores) : 0;
  const worstShot = hasScores ? Math.min(...player.scores) : 0;
  const consistency =
    player.scores && player.scores.length > 1
      ? Math.sqrt(
          player.scores.reduce(
            (sum, score) => sum + Math.pow(score - averageScore, 2),
            0
          ) / player.scores.length
        )
      : 0;

  // Prepare chart data with safety checks
  const evolutionData = hasScores
    ? player.scores.map((score, index) => {
        const cumulativeScore = player.scores
          .slice(0, index + 1)
          .reduce((sum, s) => sum + s, 0);
        return {
          shot: index + 1,
          score: Number(score) || 0,
          cumulative: Number(cumulativeScore) || 0,
          average: Number((cumulativeScore / (index + 1)).toFixed(2)) || 0,
        };
      })
    : [];

  // Prepare score distribution data with safety checks
  const scoreDistribution = hasScores
    ? Array.from({ length: 11 }, (_, i) => {
        const scoreValue = i;
        const count = player.scores.filter(
          (score) => Math.floor(Number(score) || 0) === scoreValue
        ).length;
        return {
          score: scoreValue.toString(),
          count: count,
        };
      }).filter((item) => item.count > 0)
    : [];

  // Get player rank
  const sortedPlayers = [...state.players].sort(
    (a, b) => b.totalScore - a.totalScore
  );
  const playerRank = sortedPlayers.findIndex((p) => p.id === player.id) + 1;

  return (
    <div className="min-h-screen bg-gray-50 p-2 sm:p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div
          ref={headerRef}
          className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6"
        >
          <Button
            variant="outline"
            onClick={() => router.push("/")}
            size="sm"
            className="transition-all duration-200 hover:scale-105 self-start"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Retour</span>
            <span className="sm:hidden">←</span>
          </Button>
          <div className="flex-1">
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
              <span className="hidden sm:inline">
                📊 Résultats Détaillés - {player.name}
              </span>
              <span className="sm:hidden">📊 {player.name}</span>
            </h1>
          </div>
          <Button
            onClick={handleRestart}
            variant="outline"
            className="transition-all duration-200 hover:scale-105 self-start sm:self-center"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Recommencer</span>
            <span className="sm:hidden">↻</span>
          </Button>
        </div>

        {/* Summary Cards */}
        <div
          ref={summaryRef}
          className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-6"
        >
          <Card className="transition-all duration-300 hover:shadow-lg hover:scale-105">
            <CardContent className="text-center py-3 sm:py-4">
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-blue-600">
                {player.totalScore}
              </div>
              <div className="text-xs sm:text-sm text-gray-500">
                Score Total
              </div>
            </CardContent>
          </Card>
          <Card className="transition-all duration-300 hover:shadow-lg hover:scale-105">
            <CardContent className="text-center py-3 sm:py-4">
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-green-600">
                {averagePrecision.toFixed(1)}%
              </div>
              <div className="text-xs sm:text-sm text-gray-500">
                Précision Moy.
              </div>
            </CardContent>
          </Card>
          <Card className="transition-all duration-300 hover:shadow-lg hover:scale-105">
            <CardContent className="text-center py-3 sm:py-4">
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-yellow-600">
                {bestShot}
              </div>
              <div className="text-xs sm:text-sm text-gray-500">
                Meilleur Tir
              </div>
            </CardContent>
          </Card>
          <Card className="transition-all duration-300 hover:shadow-lg hover:scale-105">
            <CardContent className="text-center py-3 sm:py-4">
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-purple-600">
                #{playerRank}
              </div>
              <div className="text-xs sm:text-sm text-gray-500">Classement</div>
            </CardContent>
          </Card>
        </div>

        <div
          ref={chartsRef}
          className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6"
        >
          {/* Evolution Chart */}
          <Card className="transition-all duration-300 hover:shadow-lg">
            <CardHeader className="pb-3 sm:pb-6">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Évolution des Scores</span>
                <span className="sm:hidden">Évolution</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {evolutionData.length > 0 ? (
                <ChartErrorBoundary>
                  <div className="h-64 sm:h-80">
                    <SimpleLineChart
                      data={evolutionData}
                      width={500}
                      height={320}
                    />
                  </div>
                </ChartErrorBoundary>
              ) : (
                <div className="h-64 sm:h-80 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <Target className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>Aucun score disponible pour afficher le graphique</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Precision Chart */}
          <Card className="transition-all duration-300 hover:shadow-lg">
            <CardHeader className="pb-3 sm:pb-6">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Target className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">
                  Précision par Rapport au Centre
                </span>
                <span className="sm:hidden">Précision</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {evolutionData.length > 0 ? (
                <ChartErrorBoundary>
                  <div className="h-64 sm:h-80">
                    <PrecisionChart
                      scores={evolutionData.map((d) => d.score)}
                      width={500}
                      height={320}
                    />
                  </div>
                </ChartErrorBoundary>
              ) : (
                <div className="h-64 sm:h-80 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <Target className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>Aucun score disponible pour la précision</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Detailed Statistics */}
          <Card className="transition-all duration-300 hover:shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5" />
                Statistiques Détaillées
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 rounded-lg transition-all duration-200 hover:scale-105">
                  <div className="text-sm text-gray-600">Tirs Effectués</div>
                  <div className="text-xl font-bold">
                    {player?.scores?.length || 0}/{player?.totalShots || 0}
                  </div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg transition-all duration-200 hover:scale-105">
                  <div className="text-sm text-gray-600">Précision Globale</div>
                  <div className="text-xl font-bold text-blue-600">
                    {averagePrecision.toFixed(1)}%
                  </div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg transition-all duration-200 hover:scale-105">
                  <div className="text-sm text-gray-600">Plus Mauvais Tir</div>
                  <div className="text-xl font-bold text-red-600">
                    {worstShot}
                  </div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg transition-all duration-200 hover:scale-105">
                  <div className="text-sm text-gray-600">Régularité (σ)</div>
                  <div className="text-xl font-bold text-purple-600">
                    {consistency.toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Performance Analysis */}
              <div className="p-4 bg-blue-50 rounded-lg transition-all duration-200 hover:scale-[1.02]">
                <h4 className="font-medium text-blue-900 mb-2">
                  Analyse de Performance
                </h4>
                <div className="space-y-2 text-sm">
                  {averagePrecision >= 80 && (
                    <div className="flex items-center gap-2 text-green-700 animate-pulse">
                      <span>🎯</span>
                      <span>
                        Excellent niveau de précision ! Plus de 80% au centre.
                      </span>
                    </div>
                  )}
                  {averagePrecision >= 60 && averagePrecision < 80 && (
                    <div className="flex items-center gap-2 text-yellow-700">
                      <span>👍</span>
                      <span>Bonne précision. Travaillez la constance !</span>
                    </div>
                  )}
                  {averagePrecision < 60 && (
                    <div className="flex items-center gap-2 text-blue-700">
                      <span>📈</span>
                      <span>
                        Marge de progression importante. Concentrez-vous sur le
                        centre.
                      </span>
                    </div>
                  )}
                  {consistency < 1.5 && (
                    <div className="flex items-center gap-2 text-green-700">
                      <span>🎖️</span>
                      <span>Très bonne régularité dans vos tirs.</span>
                    </div>
                  )}
                  {consistency >= 2.5 && (
                    <div className="flex items-center gap-2 text-orange-700">
                      <span>⚡</span>
                      <span>
                        Travaillez la constance pour améliorer vos performances.
                      </span>
                    </div>
                  )}
                  {bestShot === 10 && (
                    <div className="flex items-center gap-2 text-purple-700">
                      <span>🏆</span>
                      <span>
                        Mouche parfaite ! Excellent tir dans le mille.
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Shot by Shot Details */}
          <Card className="transition-all duration-300 hover:shadow-lg">
            <CardHeader>
              <CardTitle>Détail Tir par Tir</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {player.scores.map((score, index) => (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-2 rounded transition-all duration-200 hover:scale-[1.02] ${
                      score >= 9
                        ? "bg-green-50 border border-green-200"
                        : score >= 7
                        ? "bg-yellow-50 border border-yellow-200"
                        : "bg-red-50 border border-red-200"
                    }`}
                  >
                    <span className="font-medium">Tir #{index + 1}</span>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={`transition-all duration-200 hover:scale-110 ${
                          score >= 9
                            ? "bg-green-100 text-green-800 border-green-300"
                            : score >= 7
                            ? "bg-yellow-100 text-yellow-800 border-yellow-300"
                            : "bg-red-100 text-red-800 border-red-300"
                        }`}
                      >
                        {score}
                      </Badge>
                      {score === bestShot && (
                        <span className="text-yellow-500 animate-bounce">
                          🏆
                        </span>
                      )}
                      {score === worstShot &&
                        player.scores.filter((s) => s === worstShot).length ===
                          1 && <span className="text-gray-400">📉</span>}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div ref={actionsRef} className="flex justify-center gap-4 mt-8">
          <Button
            onClick={() => router.push("/")}
            variant="outline"
            size="lg"
            className="transition-all duration-200 hover:scale-105"
          >
            <Home className="w-4 h-4 mr-2" />
            Retour à l'Accueil
          </Button>
          <Button
            onClick={handleRestart}
            size="lg"
            className="transition-all duration-200 hover:scale-105"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Nouvelle Session
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function ResultsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardContent className="text-center py-8">
              <p className="text-gray-500 mb-4">Chargement des résultats...</p>
            </CardContent>
          </Card>
        </div>
      }
    >
      <ResultsContent />
    </Suspense>
  );
}
