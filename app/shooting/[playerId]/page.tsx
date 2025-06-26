"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { gsap } from "gsap";
import { useScoring } from "@/contexts/scoring-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  SimpleLineChart,
  SimpleBarChart,
  PrecisionChart,
} from "@/components/simple-charts";
import { Target, ArrowLeft, Home } from "lucide-react";

export default function ShootingPage() {
  const params = useParams();
  const router = useRouter();
  const { state, dispatch, addScoreAsync } = useScoring();
  const [scoreInput, setScoreInput] = useState("");
  const headerRef = useRef<HTMLDivElement>(null);
  const leftPanelRef = useRef<HTMLDivElement>(null);
  const rightPanelRef = useRef<HTMLDivElement>(null);
  const scoreButtonsRef = useRef<HTMLDivElement>(null);

  const playerId =
    typeof params?.playerId === "string" ? params.playerId : null;
  const player = playerId ? state.players.find((p) => p.id === playerId) : null;

  useEffect(() => {
    if (playerId && player) {
      dispatch({ type: "SET_CURRENT_PLAYER", payload: { id: player.id } });
    }
  }, [playerId, player, dispatch]);

  useEffect(() => {
    // Animation d'entrée de la page
    const tl = gsap.timeline();

    tl.fromTo(
      headerRef.current,
      { y: -30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, ease: "power2.out" }
    )
      .fromTo(
        leftPanelRef.current,
        { x: -50, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.6, ease: "power2.out" },
        "-=0.3"
      )
      .fromTo(
        rightPanelRef.current,
        { x: 50, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.6, ease: "power2.out" },
        "-=0.6"
      );

    // Animation des boutons de score
    if (scoreButtonsRef.current) {
      const buttons = scoreButtonsRef.current.children;
      gsap.fromTo(
        buttons,
        { scale: 0, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 0.3,
          stagger: 0.05,
          ease: "back.out(1.7)",
          delay: 0.8,
        }
      );
    }
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

  const handleAddScore = async () => {
    if (!scoreInput.trim()) return;

    const score = Number.parseFloat(scoreInput);
    if (isNaN(score) || score < 0 || score > 10) return;

    // Animation du score ajouté
    const inputElement = document.querySelector("[data-score-input]");
    if (inputElement) {
      gsap.to(inputElement, {
        scale: 1.1,
        duration: 0.1,
        yoyo: true,
        repeat: 1,
        ease: "power2.inOut",
      });
    }

    try {
      await addScoreAsync(player.id, score);
      console.log(`✅ Score ${score} ajouté pour ${player.name}`);
    } catch (error) {
      console.error("❌ Erreur lors de l'ajout du score:", error);
      // Fallback sur dispatch en cas d'erreur
      dispatch({
        type: "ADD_SCORE",
        payload: { playerId: player.id, score },
      });
    }
    setScoreInput("");

    // Animation de célébration pour les bons scores
    if (score >= 9) {
      gsap.to(document.body, {
        backgroundColor: "#f0fdf4",
        duration: 0.3,
        yoyo: true,
        repeat: 1,
      });
    }

    // Si tous les tirs sont terminés, rediriger vers la page d'accueil
    if (player.currentShot + 1 >= player.totalShots) {
      setTimeout(() => {
        router.push("/");
      }, 1000);
    }
  };

  const handleQuickScore = async (score: number) => {
    const button = document.querySelector(`[data-quick-score="${score}"]`);
    if (button) {
      gsap.to(button, {
        scale: 1.2,
        duration: 0.1,
        yoyo: true,
        repeat: 1,
        ease: "power2.inOut",
      });
    }

    try {
      await addScoreAsync(player.id, score);
      console.log(`✅ Score rapide ${score} ajouté pour ${player.name}`);
    } catch (error) {
      console.error("❌ Erreur lors de l'ajout du score rapide:", error);
      // Fallback sur dispatch en cas d'erreur
      dispatch({
        type: "ADD_SCORE",
        payload: { playerId: player.id, score },
      });
    }

    // Animation de célébration pour les bons scores
    if (score >= 9) {
      gsap.to(document.body, {
        backgroundColor: "#f0fdf4",
        duration: 0.3,
        yoyo: true,
        repeat: 1,
      });
    } else if (score === 0) {
      gsap.to(document.body, {
        backgroundColor: "#fef2f2",
        duration: 0.3,
        yoyo: true,
        repeat: 1,
      });
    }

    // Si tous les tirs sont terminés, rediriger vers la page d'accueil
    if (player.currentShot + 1 >= player.totalShots) {
      setTimeout(() => {
        router.push("/");
      }, 1000);
    }
  };

  const canAddScore = player.currentShot < player.totalShots;
  const completionPercentage = Math.round(
    (player.currentShot / player.totalShots) * 100
  );

  // Prepare chart data with safety checks
  const chartData = (player.scores || []).map((score, index) => {
    const cumulativeScore = (player.scores || [])
      .slice(0, index + 1)
      .reduce((sum, s) => sum + (s || 0), 0);
    return {
      shot: index + 1,
      score: score || 0,
      cumulative: cumulativeScore,
      average: cumulativeScore / (index + 1),
    };
  });

  return (
    <div className="min-h-screen bg-gray-50 p-2 sm:p-4">
      <div className="max-w-6xl mx-auto">
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
                🎯 Session de Tir - {player.name}
              </span>
              <span className="sm:hidden">🎯 {player.name}</span>
            </h1>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Score Entry Panel */}
          <div ref={leftPanelRef} className="space-y-4 sm:space-y-6">
            {/* Player Info */}
            <Card className="transition-all duration-300 hover:shadow-lg">
              <CardHeader className="pb-3 sm:pb-6">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Target className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
                  <span className="hidden sm:inline">
                    Informations du Tireur
                  </span>
                  <span className="sm:hidden">Infos</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4 pt-0">
                <div className="p-3 sm:p-4 bg-blue-50 rounded-lg">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                    <span className="font-medium text-blue-900 text-base sm:text-lg truncate">
                      {player.name}
                    </span>
                    <Badge
                      variant="secondary"
                      className="bg-blue-100 text-blue-800 animate-pulse self-start sm:self-center"
                    >
                      <span className="hidden sm:inline">
                        {player.currentShot < player.totalShots
                          ? `${player.currentShot}/${player.totalShots} tirs effectués`
                          : `Terminé ${player.currentShot}/${player.totalShots}`}
                      </span>
                      <span className="sm:hidden">
                        {player.currentShot < player.totalShots
                          ? `${player.currentShot}/${player.totalShots}`
                          : `${player.currentShot}/${player.totalShots}`}
                      </span>
                    </Badge>
                  </div>
                  <div className="text-sm text-blue-700 mb-3 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                    <span>
                      Score Total:{" "}
                      <span className="font-bold text-lg sm:text-xl">
                        {player.totalScore}
                      </span>
                    </span>
                    {(player.scores || []).length > 0 && (
                      <span>
                        Moyenne:{" "}
                        <span className="font-bold">
                          {(
                            player.totalScore / (player.scores || []).length
                          ).toFixed(1)}
                        </span>
                      </span>
                    )}
                  </div>
                  <Progress value={completionPercentage} className="h-2" />
                  <div className="text-xs text-blue-600 mt-1">
                    {completionPercentage}% terminé
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Score Entry */}
            <Card className="transition-all duration-300 hover:shadow-lg">
              <CardHeader className="pb-3 sm:pb-6">
                <CardTitle className="text-base sm:text-lg">
                  Saisie du Score
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-3 sm:space-y-4 pt-0">
                {canAddScore ? (
                  <>
                    {/* Saisie manuelle */}
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          min="0"
                          max="10"
                          step="0.1"
                          placeholder="Score (0-10)"
                          value={scoreInput}
                          onChange={(e) => setScoreInput(e.target.value)}
                          onKeyDown={(e) =>
                            e.key === "Enter" && handleAddScore()
                          }
                          className="text-base sm:text-lg transition-all duration-200 focus:scale-[1.02]"
                          autoFocus
                          data-score-input
                        />
                        <Button
                          onClick={handleAddScore}
                          disabled={!scoreInput.trim()}
                          size="lg"
                          className="transition-all duration-200 hover:scale-105 px-4 sm:px-6"
                        >
                          <span className="hidden sm:inline">Valider</span>
                          <span className="sm:hidden">✓</span>
                        </Button>
                      </div>
                    </div>

                    {/* Boutons rapides */}
                    <div className="space-y-3">
                      <div className="text-sm font-medium text-gray-700">
                        <span className="hidden sm:inline">
                          Scores rapides :
                        </span>
                        <span className="sm:hidden">Rapides :</span>
                      </div>

                      <div
                        ref={scoreButtonsRef}
                        className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2"
                      >
                        {[10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map((s) => (
                          <Button
                            key={s}
                            variant="outline"
                            size="lg"
                            onClick={() => handleQuickScore(s)}
                            data-quick-score={s}
                            className={`h-10 sm:h-12 text-sm sm:text-lg font-bold transition-all duration-200 hover:scale-110 ${
                              s >= 9
                                ? "border-green-500 text-green-700 hover:bg-green-50"
                                : s >= 7
                                ? "border-yellow-500 text-yellow-700 hover:bg-yellow-50"
                                : "border-red-500 text-red-700 hover:bg-red-50"
                            }`}
                          >
                            {s}
                          </Button>
                        ))}

                        {/* Bouton “Raté” */}
                        <Button
                          variant="outline"
                          size="lg"
                          onClick={() => handleQuickScore(0)}
                          data-quick-score={0}
                          className="h-10 sm:h-12 col-span-3 sm:col-span-2 lg:col-span-1 text-sm sm:text-lg font-bold border-red-500 text-red-700 hover:bg-red-50 transition-all duration-200 hover:scale-110"
                        >
                          <span className="hidden sm:inline">Raté</span>
                          <span className="sm:hidden">×</span>
                        </Button>
                      </div>
                    </div>
                  </>
                ) : (
                  /* Tous les tirs effectués */
                  <div className="text-center py-6 sm:py-8">
                    <div className="text-green-600 text-lg sm:text-xl font-bold mb-2 animate-bounce">
                      🎉 Session terminée !
                    </div>
                    <p className="text-gray-600 mb-4 text-sm sm:text-base">
                      Tous les tirs ont été effectués
                    </p>
                    <Button
                      onClick={() =>
                        router.push(`/classement?player=${player.id}`)
                      }
                      size="lg"
                      className="transition-all duration-200 hover:scale-105"
                    >
                      <span className="hidden sm:inline">
                        Voir les résultats détaillés
                      </span>
                      <span className="sm:hidden">Résultats</span>
                    </Button>
                  </div>
                )}

                {/* Scores récents */}
                {(player.scores || []).length > 0 && (
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-gray-700">
                      <span className="hidden sm:inline">
                        Scores de cette session :
                      </span>
                      <span className="sm:hidden">Scores :</span>
                    </div>
                    <div className="flex flex-wrap gap-1 sm:gap-2">
                      {(player.scores || []).map((score, idx) => (
                        <Badge
                          key={idx}
                          variant="outline"
                          className={`text-xs sm:text-sm transition-all duration-200 hover:scale-110 ${
                            score >= 9
                              ? "bg-green-100 text-green-800 border-green-300"
                              : score >= 7
                              ? "bg-yellow-100 text-yellow-800 border-yellow-300"
                              : "bg-red-100 text-red-800 border-red-300"
                          }`}
                        >
                          #{idx + 1}: {score}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Live Chart */}
          <div ref={rightPanelRef} className="space-y-4 sm:space-y-6">
            <Card className="transition-all duration-300 hover:shadow-lg">
              <CardHeader className="pb-3 sm:pb-6">
                <CardTitle className="text-base sm:text-lg">
                  <span className="hidden sm:inline">
                    Évolution en Temps Réel
                  </span>
                  <span className="sm:hidden">Évolution</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                {chartData.length > 0 ? (
                  <div className="h-64 sm:h-80">
                    <SimpleLineChart
                      data={chartData}
                      lines={[
                        {
                          dataKey: "score",
                          stroke: "#3b82f6",
                          name: "Score du Tir",
                          strokeWidth: 2,
                          dots: true,
                        },
                        {
                          dataKey: "average",
                          stroke: "#10b981",
                          name: "Moyenne",
                          strokeWidth: 2,
                          strokeDasharray: "5,5",
                          dots: false,
                        },
                      ]}
                      xAxisKey="shot"
                      xAxisLabel="N° Tir"
                      yAxisLabel="Score"
                      tooltipFormatter={(label: string) => `Tir ${label}`}
                    />
                  </div>
                ) : (
                  <div className="h-64 sm:h-80 flex items-center justify-center text-gray-500">
                    <div className="text-center">
                      <Target className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 text-gray-300 animate-pulse" />
                      <p className="text-sm">
                        <span className="hidden sm:inline">
                          Commencez à tirer pour voir l'évolution
                        </span>
                        <span className="sm:hidden">Commencez à tirer</span>
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            {(player.scores || []).length > 0 && (
              <Card className="transition-all duration-300 hover:shadow-lg">
                <CardHeader className="pb-3 sm:pb-6">
                  <CardTitle className="text-base sm:text-lg">
                    <span className="hidden sm:inline">
                      Statistiques Actuelles
                    </span>
                    <span className="sm:hidden">Stats</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
                    <div className="text-center p-2 sm:p-3 bg-blue-50 rounded-lg transition-all duration-200 hover:scale-105">
                      <div className="text-lg sm:text-2xl font-bold text-blue-600">
                        {player.totalScore}
                      </div>
                      <div className="text-xs text-gray-500">Total</div>
                    </div>
                    <div className="text-center p-2 sm:p-3 bg-green-50 rounded-lg transition-all duration-200 hover:scale-105">
                      <div className="text-lg sm:text-2xl font-bold text-green-600">
                        {(player.scores || []).length > 0
                          ? (
                              player.totalScore / (player.scores || []).length
                            ).toFixed(1)
                          : "0.0"}
                      </div>
                      <div className="text-xs text-gray-500">Moyenne</div>
                    </div>
                    <div className="text-center p-2 sm:p-3 bg-yellow-50 rounded-lg transition-all duration-200 hover:scale-105">
                      <div className="text-lg sm:text-2xl font-bold text-yellow-600">
                        {(player.scores || []).length > 0
                          ? Math.max(...(player.scores || []))
                          : 0}
                      </div>
                      <div className="text-xs text-gray-500">Meilleur</div>
                    </div>
                    <div className="text-center p-2 sm:p-3 bg-red-50 rounded-lg transition-all duration-200 hover:scale-105">
                      <div className="text-lg sm:text-2xl font-bold text-red-600">
                        {(player.scores || []).length > 0
                          ? Math.min(...(player.scores || []))
                          : 0}
                      </div>
                      <div className="text-xs text-gray-500">Plus Faible</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
