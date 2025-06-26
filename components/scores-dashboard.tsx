"use client";

import { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useScoring } from "@/contexts/scoring-context";
import { SimpleLineChart } from "@/components/simple-charts";
import {
  Trophy,
  Users,
  GitCompare,
  Target,
  Palette,
  X,
  CheckSquare,
  Square,
  Maximize2,
  Minimize2,
  BarChart3,
  TrendingUp,
  Award,
} from "lucide-react";
import { getPlayerColor } from "@/utils/colors";

export function ScoresDashboard() {
  const { state } = useScoring();
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "comparison">("grid");

  const headerRef = useRef<HTMLDivElement>(null);
  const rankingRef = useRef<HTMLDivElement>(null);
  const comparisonRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Animation d'entrée
    const tl = gsap.timeline();

    tl.fromTo(
      headerRef.current,
      { y: -30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, ease: "power2.out" }
    )
      .fromTo(
        rankingRef.current,
        { x: -50, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.6, ease: "power2.out" },
        "-=0.3"
      )
      .fromTo(
        statsRef.current,
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: "power2.out" },
        "-=0.3"
      );
  }, []);

  // Calcul des données de classement
  const sortedPlayers = [...state.players]
    .map((player) => {
      const allScores = player.scores || [];

      const bestScore = allScores.length > 0 ? Math.max(...allScores) : 0;
      const averageScore =
        allScores.length > 0
          ? allScores.reduce((sum: number, score: number) => sum + score, 0) /
            allScores.length
          : 0;
      const totalShots = player.totalShots || allScores.length;

      return {
        ...player,
        bestScore,
        averageScore,
        totalShots,
        allScores,
      };
    })
    .sort((a, b) => b.bestScore - a.bestScore);

  const handlePlayerToggle = (playerId: string, checked: boolean) => {
    if (checked) {
      if (selectedPlayers.length < 6) {
        setSelectedPlayers([...selectedPlayers, playerId]);
      }
    } else {
      setSelectedPlayers(selectedPlayers.filter((id) => id !== playerId));
    }
  };

  const handleSelectAll = () => {
    const topPlayers = sortedPlayers.slice(0, 6).map((p) => p.id);
    setSelectedPlayers(topPlayers);
  };

  const clearSelection = () => {
    setSelectedPlayers([]);
  };

  const selectedPlayersData = sortedPlayers.filter((p) =>
    selectedPlayers.includes(p.id)
  );

  // Données pour les graphiques de comparaison
  const comparisonData =
    selectedPlayersData.length > 0
      ? selectedPlayersData
          .map((player, index) => {
            return player.allScores.map((score: number, shotIndex: number) => ({
              shot: shotIndex + 1,
              [`${player.name}`]: score,
              [`${player.name}_color`]: getPlayerColor(index).primary,
            }));
          })
          .reduce((acc: any[], playerData) => {
            playerData.forEach((shot: any, index: number) => {
              if (!acc[index]) acc[index] = { shot: shot.shot };
              Object.assign(acc[index], shot);
            });
            return acc;
          }, [])
      : [];

  // Statistiques globales
  const globalStats = {
    totalPlayers: state.players.length,
    totalShots: state.players.reduce(
      (sum: number, p) => sum + (p.scores?.length || 0),
      0
    ),
    bestScore: sortedPlayers[0]?.bestScore || 0,
    averageScore:
      sortedPlayers.reduce((sum: number, p) => sum + p.averageScore, 0) /
      (sortedPlayers.length || 1),
  };

  return (
    <div
      className={`transition-all duration-300 ${
        isFullscreen ? "fixed inset-0 z-50 bg-white overflow-auto p-4" : ""
      }`}
    >
      {/* Header avec contrôles */}
      <div ref={headerRef} className="mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("grid")}
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Vue grille
              </Button>
              <Button
                variant={viewMode === "comparison" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("comparison")}
              >
                <GitCompare className="w-4 h-4 mr-2" />
                Comparaison
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={
                selectedPlayers.length > 0 ? clearSelection : handleSelectAll
              }
            >
              {selectedPlayers.length > 0 ? (
                <>
                  <X className="w-4 h-4 mr-2" />
                  Désélectionner ({selectedPlayers.length})
                </>
              ) : (
                <>
                  <CheckSquare className="w-4 h-4 mr-2" />
                  Sélectionner Top 6
                </>
              )}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsFullscreen(!isFullscreen)}
            >
              {isFullscreen ? (
                <Minimize2 className="w-4 h-4" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Statistiques globales */}
      <div
        ref={statsRef}
        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6"
      >
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Tireurs</p>
                <p className="text-xl font-bold">{globalStats.totalPlayers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-purple-500" />
              <div>
                <p className="text-sm text-gray-600">Tirs totaux</p>
                <p className="text-xl font-bold">{globalStats.totalShots}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-yellow-500" />
              <div>
                <p className="text-sm text-gray-600">Meilleur score</p>
                <p className="text-xl font-bold">
                  {globalStats.bestScore.toFixed(1)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-orange-500" />
              <div>
                <p className="text-sm text-gray-600">Moyenne</p>
                <p className="text-xl font-bold">
                  {globalStats.averageScore.toFixed(1)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Classement des joueurs */}
        <div ref={rankingRef} className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                Classement Global
                <Badge variant="secondary">
                  {sortedPlayers.length} tireurs
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {sortedPlayers.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Aucun tireur enregistré</p>
                </div>
              ) : (
                sortedPlayers.map((player, index) => (
                  <div
                    key={player.id}
                    data-player-card={player.id}
                    className={`flex items-center justify-between p-3 rounded-lg border transition-all duration-200 ${
                      selectedPlayers.includes(player.id)
                        ? "border-blue-300 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          checked={selectedPlayers.includes(player.id)}
                          onCheckedChange={(checked) =>
                            handlePlayerToggle(player.id, checked as boolean)
                          }
                          disabled={
                            !selectedPlayers.includes(player.id) &&
                            selectedPlayers.length >= 6
                          }
                        />
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{
                            backgroundColor: getPlayerColor(
                              selectedPlayers.indexOf(player.id)
                            ).primary,
                          }}
                        />
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900">
                            #{index + 1}
                          </span>
                          <span className="font-semibold text-gray-800">
                            {player.name}
                          </span>
                          {index === 0 && (
                            <Trophy className="w-4 h-4 text-yellow-500" />
                          )}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          <div className="flex justify-between">
                            <span>Meilleur: {player.bestScore.toFixed(1)}</span>
                            <span>Moy: {player.averageScore.toFixed(1)}</span>
                          </div>
                          <div className="flex justify-between mt-1">
                            <span>{player.allScores.length} tirs</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Graphiques et comparaisons */}
        <div ref={comparisonRef} className="lg:col-span-2">
          {viewMode === "comparison" && selectedPlayersData.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GitCompare className="w-5 h-5 text-blue-500" />
                  Comparaison des Performances
                  <Badge variant="secondary">
                    {selectedPlayersData.length} tireur
                    {selectedPlayersData.length > 1 ? "s" : ""}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Joueurs sélectionnés */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {selectedPlayersData.map((player, index) => (
                    <div
                      key={player.id}
                      data-player-chip={player.id}
                      className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full text-sm"
                    >
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{
                          backgroundColor: getPlayerColor(index).primary,
                        }}
                      />
                      <span className="font-medium">{player.name}</span>
                      <button
                        onClick={() =>
                          setSelectedPlayers(
                            selectedPlayers.filter((id) => id !== player.id)
                          )
                        }
                        className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Graphique de comparaison */}
                {comparisonData.length > 0 && (
                  <div className="bg-white p-4 rounded-lg border">
                    {" "}
                    <SimpleLineChart
                      data={comparisonData}
                      lines={selectedPlayersData.map((player, index) => ({
                        dataKey: player.name,
                        stroke: getPlayerColor(index).primary,
                        name: player.name,
                        strokeWidth: 2,
                      }))}
                      width={700}
                      height={400}
                      xAxisKey="shot"
                      xAxisLabel="Numéro de tir"
                      yAxisLabel="Score"
                    />
                  </div>
                )}

                {/* Statistiques de comparaison */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                  {selectedPlayersData.map((player, index) => (
                    <Card key={player.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{
                              backgroundColor: getPlayerColor(index).primary,
                            }}
                          />
                          <span className="font-semibold">{player.name}</span>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Meilleur score:</span>
                            <span className="font-medium">
                              {player.bestScore.toFixed(1)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Score moyen:</span>
                            <span className="font-medium">
                              {player.averageScore.toFixed(1)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Total tirs:</span>
                            <span className="font-medium">
                              {player.totalShots}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-green-500" />
                  Sélectionnez des tireurs pour comparer
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-gray-500">
                  <GitCompare className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg mb-2">Comparaison des performances</p>
                  <p className="text-sm">
                    Cochez les cases à côté des tireurs dans le classement pour
                    voir leurs graphiques de performance et statistiques
                    comparatives.
                  </p>
                  <p className="text-xs mt-2 text-gray-400">
                    Maximum 6 tireurs peuvent être sélectionnés simultanément
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
