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
} from "lucide-react";
import { getPlayerColor } from "@/utils/colors";

export function GlobalRanking() {
  const { state } = useScoring();
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);
  const rankingRef = useRef<HTMLDivElement>(null);
  const comparisonRef = useRef<HTMLDivElement>(null);

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
        comparisonRef.current,
        { x: 50, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.6, ease: "power2.out" },
        "-=0.6"
      );
  }, []);

  useEffect(() => {
    // Animation des cartes de joueurs
    if (rankingRef.current) {
      const playerCards =
        rankingRef.current.querySelectorAll("[data-player-card]");
      gsap.fromTo(
        playerCards,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4, stagger: 0.1, ease: "power2.out" }
      );
    }
  }, [state.players]);

  const sortedPlayers = [...state.players].sort((a, b) => {
    // Sort by total score descending, then by completion percentage, then by average
    if (b.totalScore !== a.totalScore) {
      return b.totalScore - a.totalScore;
    }
    const aCompletion = a.totalShots > 0 ? a.currentShot / a.totalShots : 0;
    const bCompletion = b.totalShots > 0 ? b.currentShot / b.totalShots : 0;
    if (bCompletion !== aCompletion) {
      return bCompletion - aCompletion;
    }
    const aAverage = a.scores.length > 0 ? a.totalScore / a.scores.length : 0;
    const bAverage = b.scores.length > 0 ? b.totalScore / b.scores.length : 0;
    return bAverage - aAverage;
  });

  const handlePlayerSelection = (playerId: string, checked: boolean) => {
    if (checked) {
      setSelectedPlayers([...selectedPlayers, playerId]);

      // Animation de sélection
      const playerCard = document.querySelector(
        `[data-player-card="${playerId}"]`
      );
      if (playerCard) {
        gsap.to(playerCard, {
          scale: 1.02,
          duration: 0.2,
          yoyo: true,
          repeat: 1,
          ease: "power2.inOut",
        });
      }
    } else {
      setSelectedPlayers(selectedPlayers.filter((id) => id !== playerId));
    }
  };

  const handleSelectAll = () => {
    setSelectedPlayers(sortedPlayers.map((p) => p.id));

    // Animation de sélection
    sortedPlayers.forEach((player, index) => {
      const playerCard = document.querySelector(
        `[data-player-card="${player.id}"]`
      );
      if (playerCard) {
        gsap.to(playerCard, {
          scale: 1.02,
          duration: 0.2,
          yoyo: true,
          repeat: 1,
          ease: "power2.inOut",
          delay: index * 0.05,
        });
      }
    });
  };

  const handleRemovePlayer = (playerId: string) => {
    setSelectedPlayers(selectedPlayers.filter((id) => id !== playerId));

    // Animation de suppression
    const playerChip = document.querySelector(
      `[data-player-chip="${playerId}"]`
    );
    if (playerChip) {
      gsap.to(playerChip, {
        scale: 0,
        opacity: 0,
        duration: 0.2,
        ease: "power2.in",
      });
    }
  };

  const clearSelection = () => {
    // Animation de désélection
    selectedPlayers.forEach((playerId) => {
      const playerCard = document.querySelector(
        `[data-player-card="${playerId}"]`
      );
      if (playerCard) {
        gsap.to(playerCard, {
          scale: 0.98,
          duration: 0.2,
          yoyo: true,
          repeat: 1,
          ease: "power2.inOut",
        });
      }
    });

    setSelectedPlayers([]);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);

    // Animation de transition
    if (!isFullscreen) {
      gsap.to(document.body, {
        scale: 1.02,
        duration: 0.2,
        yoyo: true,
        repeat: 1,
        ease: "power2.inOut",
      });
    }
  };

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return "🥇";
      case 1:
        return "🥈";
      case 2:
        return "🥉";
      default:
        return `#${index + 1}`;
    }
  };

  const getAverageScore = (player: any) => {
    if (player.scores.length === 0) return 0;
    return player.totalScore / player.scores.length;
  };

  const getPlayerStats = (player: any) => {
    const scores = player.scores;
    if (scores.length === 0) return { best: 0, worst: 0, consistency: 0 };

    const best = Math.max(...scores);
    const worst = Math.min(...scores);
    const average = player.totalScore / scores.length;
    const consistency =
      scores.length > 1
        ? Math.sqrt(
            scores.reduce(
              (sum, score) => sum + Math.pow(score - average, 2),
              0
            ) / scores.length
          )
        : 0;

    return { best, worst, consistency };
  };

  // Prepare comparison data for multiple players
  const comparisonData =
    selectedPlayers.length > 0
      ? (() => {
          const selectedPlayersData = selectedPlayers
            .map((id) => state.players.find((p) => p.id === id))
            .filter(Boolean);

          if (selectedPlayersData.length === 0) return null;

          const maxShots = Math.max(
            ...selectedPlayersData.map((p) => p.scores.length)
          );

          return Array.from({ length: maxShots }, (_, index) => {
            const shotNumber = index + 1;
            const dataPoint: any = { shot: shotNumber };

            selectedPlayersData.forEach((player) => {
              const cumulative = player.scores
                .slice(0, shotNumber)
                .reduce((sum, s) => sum + s, 0);
              dataPoint[player.name] =
                player.scores[index] !== undefined ? cumulative : null;
              dataPoint[`${player.name}_individual`] =
                player.scores[index] || null;
            });

            return dataPoint;
          });
        })()
      : null;

  const selectedPlayersData = selectedPlayers
    .map((id) => state.players.find((p) => p.id === id))
    .filter(Boolean);

  const allSelected =
    selectedPlayers.length === sortedPlayers.length && sortedPlayers.length > 0;

  // Render Player Card Component
  const PlayerCard = ({
    player,
    index,
    isCompact = false,
  }: {
    player: any;
    index: number;
    isCompact?: boolean;
  }) => {
    const completionPercentage =
      player.totalShots > 0
        ? Math.round((player.currentShot / player.totalShots) * 100)
        : 0;
    const averageScore = getAverageScore(player);
    const stats = getPlayerStats(player);
    const isSelected = selectedPlayers.includes(player.id);
    const selectedIndex = selectedPlayers.indexOf(player.id);
    const playerColor = isSelected ? getPlayerColor(selectedIndex) : null;

    return (
      <div
        key={player.id}
        data-player-card={player.id}
        className={`p-2 sm:p-3 border rounded-lg transition-all duration-300 hover:shadow-md hover:scale-[1.01] ${
          isSelected
            ? "ring-2 ring-opacity-50"
            : index === 0
            ? "border-yellow-400 bg-yellow-50"
            : index === 1
            ? "border-gray-400 bg-gray-50"
            : index === 2
            ? "border-orange-400 bg-orange-50"
            : "border-gray-200 hover:border-gray-300"
        }`}
        style={
          isSelected
            ? {
                borderColor: playerColor?.primary,
                backgroundColor: playerColor?.secondary,
                ringColor: playerColor?.primary,
              }
            : {}
        }
      >
        <div
          className={`flex items-center gap-2 ${isCompact ? "mb-2" : "mb-3"}`}
        >
          <Checkbox
            checked={isSelected}
            onCheckedChange={(checked) =>
              handlePlayerSelection(player.id, checked as boolean)
            }
            className="transition-all duration-200 hover:scale-110 flex-shrink-0"
          />
          {isSelected && (
            <div
              className={`${
                isCompact ? "w-3 h-3" : "w-4 h-4"
              } rounded-full border border-white shadow-sm flex-shrink-0`}
              style={{ backgroundColor: playerColor?.primary }}
            />
          )}
          <span
            className={`${
              isCompact ? "text-sm" : "text-base sm:text-lg"
            } font-bold flex-shrink-0`}
          >
            {getRankIcon(index)}
          </span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1 sm:gap-2">
              <span
                className={`font-medium ${
                  isCompact ? "text-sm" : "text-sm sm:text-base"
                } truncate`}
              >
                {player.name}
              </span>
              {player.id === state.currentPlayerId && (
                <Badge
                  variant="secondary"
                  className="bg-blue-100 text-blue-800 text-xs animate-pulse flex-shrink-0"
                >
                  <Target className="w-3 h-3 mr-1" />
                  <span className="hidden sm:inline">En cours</span>
                  <span className="sm:hidden">●</span>
                </Badge>
              )}
            </div>
            <div
              className={`${
                isCompact ? "text-xs" : "text-xs sm:text-sm"
              } text-gray-600`}
            >
              {player.currentShot}/{player.totalShots} tirs •{" "}
              {completionPercentage}%
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <div
              className={`${
                isCompact ? "text-base sm:text-lg" : "text-lg sm:text-xl"
              } font-bold text-gray-900`}
            >
              {player.totalScore}
            </div>
            <div className="text-xs text-gray-500">pts</div>
          </div>
        </div>

        <div
          className={`grid grid-cols-4 gap-1 sm:gap-${
            isCompact ? "2" : "3"
          } text-xs sm:text-sm`}
        >
          <div
            className={`text-center p-1 sm:p-${
              isCompact ? "1" : "2"
            } bg-blue-50 rounded transition-all duration-200 hover:scale-105`}
          >
            <div className="font-medium text-blue-600 text-xs sm:text-sm">
              {averageScore.toFixed(1)}
            </div>
            <div className="text-xs text-gray-500">Moy</div>
          </div>
          <div
            className={`text-center p-1 sm:p-${
              isCompact ? "1" : "2"
            } bg-green-50 rounded transition-all duration-200 hover:scale-105`}
          >
            <div className="font-medium text-green-600 text-xs sm:text-sm">
              {stats.best}
            </div>
            <div className="text-xs text-gray-500">Max</div>
          </div>
          <div
            className={`text-center p-1 sm:p-${
              isCompact ? "1" : "2"
            } bg-red-50 rounded transition-all duration-200 hover:scale-105`}
          >
            <div className="font-medium text-red-600 text-xs sm:text-sm">
              {stats.worst || "-"}
            </div>
            <div className="text-xs text-gray-500">Min</div>
          </div>
          <div
            className={`text-center p-1 sm:p-${
              isCompact ? "1" : "2"
            } bg-purple-50 rounded transition-all duration-200 hover:scale-105`}
          >
            <div className="font-medium text-purple-600 text-xs sm:text-sm">
              {stats.consistency.toFixed(1)}
            </div>
            <div className="text-xs text-gray-500">σ</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className={`mt-2 sm:mt-${isCompact ? "2" : "3"}`}>
          <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2 overflow-hidden">
            <div
              className="h-1.5 sm:h-2 rounded-full transition-all duration-500 ease-out"
              style={{
                width: `${completionPercentage}%`,
                backgroundColor: isSelected
                  ? playerColor?.primary
                  : index === 0
                  ? "#eab308"
                  : index === 1
                  ? "#6b7280"
                  : index === 2
                  ? "#f97316"
                  : "#9ca3af",
              }}
            />
          </div>
        </div>

        {/* Recent scores */}
        {player.scores.length > 0 && !isCompact && (
          <div className="mt-2">
            <div className="flex flex-wrap gap-1">
              {player.scores.slice(-4).map((score, idx) => (
                <Badge
                  key={idx}
                  variant="outline"
                  className={`text-xs transition-all duration-200 hover:scale-110 ${
                    score >= 9
                      ? "bg-green-100 text-green-800 border-green-300"
                      : score >= 7
                      ? "bg-yellow-100 text-yellow-800 border-yellow-300"
                      : "bg-red-100 text-red-800 border-red-300"
                  }`}
                >
                  {score}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  if (isFullscreen) {
    return (
      <>
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-[9998]"
          onClick={toggleFullscreen}
        />
        <div className="fixed inset-2 sm:inset-4 lg:inset-8 bg-white z-[9999] rounded-lg shadow-2xl flex flex-col lg:flex-row overflow-hidden">
          {/* Left Panel - Player List */}
          <div className="w-full lg:w-2/5 border-b lg:border-b-0 lg:border-r bg-gray-50 flex flex-col max-h-1/2 lg:max-h-full">
            {/* Header */}
            <div className="p-3 sm:p-4 border-b bg-white flex-shrink-0">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h2 className="text-base sm:text-lg font-bold flex items-center gap-2">
                  <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500" />
                  <span className="hidden sm:inline">Classement Global</span>
                  <span className="sm:hidden">Classement</span>
                </h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleFullscreen}
                  className="transition-all duration-200 hover:scale-105 text-xs sm:text-sm"
                >
                  <Minimize2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Quitter</span>
                  <span className="sm:hidden">×</span>
                </Button>
              </div>

              {/* Controls */}
              <div className="flex flex-wrap items-center gap-2 mb-3 sm:mb-4">
                {sortedPlayers.length > 0 && (
                  <>
                    {selectedPlayers.length === 0 ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleSelectAll}
                        className="transition-all duration-200 hover:scale-105 text-xs sm:text-sm"
                      >
                        <CheckSquare className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                        <span className="hidden sm:inline">
                          Sélectionner tous
                        </span>
                        <span className="sm:hidden">Tous</span>
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedPlayers([])}
                        className="transition-all duration-200 hover:scale-105 text-xs sm:text-sm"
                      >
                        <Square className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                        <span className="hidden sm:inline">
                          Désélectionner tous
                        </span>
                        <span className="sm:hidden">Aucun</span>
                      </Button>
                    )}
                  </>
                )}
                <Badge variant="secondary" className="animate-pulse text-xs">
                  <Users className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                  {state.players.length}
                </Badge>
              </div>

              {/* Selected Players Chips */}
              {selectedPlayers.length > 0 && (
                <div className="flex flex-wrap gap-1 sm:gap-2 max-h-20 overflow-y-auto">
                  {selectedPlayers.map((playerId, index) => {
                    const player = state.players.find((p) => p.id === playerId);
                    const color = getPlayerColor(index);

                    if (!player) return null;

                    return (
                      <div
                        key={playerId}
                        data-player-chip={playerId}
                        className="flex items-center gap-1 sm:gap-2 px-2 py-1 rounded-full text-xs font-medium transition-all duration-200 hover:scale-105"
                        style={{
                          backgroundColor: color.secondary,
                          color: color.primary,
                          border: `1px solid ${color.primary}20`,
                        }}
                      >
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: color.primary }}
                        />
                        <span className="truncate max-w-16 sm:max-w-20">
                          {player.name}
                        </span>
                        <button
                          onClick={() => handleRemovePlayer(playerId)}
                          className="ml-1 hover:bg-white hover:bg-opacity-50 rounded-full p-0.5 transition-all duration-200"
                        >
                          <X className="w-2 h-2" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Player List */}
            <div className="flex-1 overflow-y-auto p-2 sm:p-4">
              {sortedPlayers.length > 0 ? (
                <div className="space-y-2 sm:space-y-3">
                  {sortedPlayers.map((player, index) => (
                    <PlayerCard
                      key={player.id}
                      player={player}
                      index={index}
                      isCompact={true}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <Target className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 text-gray-300 animate-bounce" />
                  <p className="text-sm">Aucun tireur à afficher</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Comparison Chart */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {selectedPlayers.length > 0 ? (
              <>
                {/* Header */}
                <div className="p-3 sm:p-6 border-b bg-white flex-shrink-0">
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <div className="flex items-center gap-2">
                      <GitCompare className="w-4 h-4 sm:w-6 sm:h-6 text-purple-500" />
                      <h2 className="text-base sm:text-xl font-bold">
                        <span className="hidden sm:inline">
                          Comparaison Multi-Joueurs
                        </span>
                        <span className="sm:hidden">Comparaison</span>
                      </h2>
                      <Badge variant="secondary" className="ml-2 text-xs">
                        <Palette className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                        {selectedPlayers.length}
                      </Badge>
                    </div>
                  </div>

                  {/* Players Summary Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-3">
                    {selectedPlayersData.map((player, idx) => {
                      const color = getPlayerColor(idx);
                      const averageScore =
                        player.scores.length > 0
                          ? player.totalScore / player.scores.length
                          : 0;

                      return (
                        <div
                          key={player.id}
                          className="p-2 sm:p-3 border rounded-lg transition-all duration-200 hover:scale-105"
                          style={{
                            borderColor: color.primary + "40",
                            backgroundColor: color.secondary,
                          }}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <div
                              className="w-3 h-3 sm:w-4 sm:h-4 rounded-full"
                              style={{ backgroundColor: color.primary }}
                            />
                            <span
                              className="font-medium text-xs sm:text-sm truncate"
                              style={{ color: color.primary }}
                            >
                              {player.name}
                            </span>
                          </div>
                          <div className="grid grid-cols-3 gap-1 sm:gap-2 text-xs">
                            <div className="text-center">
                              <div
                                className="font-bold text-sm sm:text-lg"
                                style={{ color: color.primary }}
                              >
                                {player.totalScore}
                              </div>
                              <div className="text-gray-500 text-xs">Total</div>
                            </div>
                            <div className="text-center">
                              <div
                                className="font-bold text-sm sm:text-lg"
                                style={{ color: color.primary }}
                              >
                                {averageScore.toFixed(1)}
                              </div>
                              <div className="text-gray-500 text-xs">Moy</div>
                            </div>
                            <div className="text-center">
                              <div
                                className="font-bold text-sm sm:text-lg"
                                style={{ color: color.primary }}
                              >
                                {player.scores.length}
                              </div>
                              <div className="text-gray-500 text-xs">Tirs</div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Ranking within selection */}
                  <div className="p-2 sm:p-3 bg-gray-50 rounded-lg mt-3 sm:mt-4">
                    <h4 className="font-medium text-gray-900 mb-2 text-xs sm:text-sm">
                      Classement de la Sélection:
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1 sm:gap-2">
                      {[...selectedPlayersData]
                        .sort((a, b) => b.totalScore - a.totalScore)
                        .map((player, idx) => {
                          const originalIndex = selectedPlayers.indexOf(
                            player.id
                          );
                          const color = getPlayerColor(originalIndex);

                          return (
                            <div
                              key={player.id}
                              className="flex items-center gap-2 text-xs sm:text-sm"
                            >
                              <span className="font-bold w-4 sm:w-6">
                                {getRankIcon(idx)}
                              </span>
                              <div
                                className="w-2 h-2 sm:w-3 sm:h-3 rounded-full"
                                style={{ backgroundColor: color.primary }}
                              />
                              <span className="flex-1 truncate">
                                {player.name}
                              </span>
                              <span
                                className="font-bold"
                                style={{ color: color.primary }}
                              >
                                {player.totalScore}
                              </span>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                </div>

                {/* Large Comparison Chart */}
                <div className="flex-1 p-3 sm:p-6 min-h-0">
                  {comparisonData && (
                    <div className="h-full w-full">
                      <SimpleLineChart
                        data={comparisonData}
                        lines={selectedPlayersData.map((player, idx) => {
                          const color = getPlayerColor(idx);
                          return {
                            dataKey: player.name,
                            stroke: color.primary,
                            name: player.name,
                            strokeWidth: 3,
                            dots: true,
                          };
                        })}
                        xAxisKey="shot"
                        xAxisLabel="N° Tir"
                        yAxisLabel="Score Cumulé"
                        tooltipFormatter={(label: string) =>
                          `Après Tir ${label}`
                        }
                      />
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center p-4">
                <div className="text-center text-gray-500">
                  <Palette className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 text-gray-300" />
                  <p className="text-sm sm:text-xl mb-2">
                    <span className="hidden sm:inline">
                      Sélectionnez des joueurs pour voir la comparaison
                    </span>
                    <span className="sm:hidden">Sélectionnez des joueurs</span>
                  </p>
                  <p className="text-xs sm:text-sm text-gray-400">
                    <span className="hidden sm:inline">
                      Utilisez les cases à cocher dans la liste de gauche
                    </span>
                    <span className="sm:hidden">Cases à cocher ci-dessus</span>
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header with selection info */}
      <Card
        ref={headerRef}
        className="transition-all duration-300 hover:shadow-lg"
      >
        <CardHeader className="pb-3 sm:pb-6">
          <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-2">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500" />
              <span className="text-base sm:text-lg">Classement Global</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {sortedPlayers.length > 0 && (
                <>
                  {selectedPlayers.length === 0 ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSelectAll}
                      className="transition-all duration-200 hover:scale-105 text-xs sm:text-sm"
                    >
                      <CheckSquare className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                      <span className="hidden sm:inline">
                        Sélectionner tous
                      </span>
                      <span className="sm:hidden">Tous</span>
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedPlayers([])}
                      className="transition-all duration-200 hover:scale-105 text-xs sm:text-sm"
                    >
                      <Square className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                      <span className="hidden sm:inline">
                        Désélectionner tous
                      </span>
                      <span className="sm:hidden">Aucun</span>
                    </Button>
                  )}
                </>
              )}
              {selectedPlayers.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearSelection}
                  className="transition-all duration-200 hover:scale-105 text-xs sm:text-sm"
                >
                  <span className="hidden sm:inline">Effacer sélection</span>
                  <span className="sm:hidden">Effacer</span>
                </Button>
              )}
              <Badge variant="secondary" className="animate-pulse text-xs">
                <Users className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                {state.players.length}
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3">
            <div className="text-xs sm:text-sm text-gray-600">
              {selectedPlayers.length === 0 && (
                <>
                  <span className="hidden sm:inline">
                    Sélectionnez des tireurs pour les comparer (nombre illimité)
                  </span>
                  <span className="sm:hidden">
                    Sélectionnez des tireurs pour les comparer
                  </span>
                </>
              )}
              {selectedPlayers.length === 1 &&
                "Ajoutez d'autres tireurs pour la comparaison"}
              {selectedPlayers.length > 1 &&
                `Comparaison de ${selectedPlayers.length} tireurs active`}
            </div>

            {/* Selected Players Chips */}
            {selectedPlayers.length > 0 && (
              <div className="flex flex-wrap gap-1 sm:gap-2">
                {selectedPlayers.map((playerId, index) => {
                  const player = state.players.find((p) => p.id === playerId);
                  const color = getPlayerColor(index);

                  if (!player) return null;

                  return (
                    <div
                      key={playerId}
                      data-player-chip={playerId}
                      className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 hover:scale-105"
                      style={{
                        backgroundColor: color.secondary,
                        color: color.primary,
                        border: `1px solid ${color.primary}20`,
                      }}
                    >
                      <div
                        className="w-2 h-2 sm:w-3 sm:h-3 rounded-full"
                        style={{ backgroundColor: color.primary }}
                      />
                      <span className="truncate max-w-16 sm:max-w-24">
                        {player.name}
                      </span>
                      <button
                        onClick={() => handleRemovePlayer(playerId)}
                        className="ml-1 hover:bg-white hover:bg-opacity-50 rounded-full p-0.5 transition-all duration-200"
                      >
                        <X className="w-2 h-2 sm:w-3 sm:h-3" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
        {/* Global Ranking */}
        <Card
          ref={rankingRef}
          className="transition-all duration-300 hover:shadow-lg"
        >
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Trophy className="w-4 h-4 sm:w-5 sm:h-5" />
              Classement Complet
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {sortedPlayers.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <Target className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 text-gray-300 animate-bounce" />
                <p className="text-sm">Aucun tireur à afficher</p>
              </div>
            ) : (
              <div className="space-y-2 sm:space-y-3">
                {sortedPlayers.map((player, index) => (
                  <PlayerCard key={player.id} player={player} index={index} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Comparison Panel */}
        <div ref={comparisonRef} className="space-y-4 sm:space-y-6">
          {selectedPlayers.length > 0 ? (
            <>
              {/* Multi-Player Comparison Stats */}
              <Card className="transition-all duration-300 hover:shadow-lg">
                <CardHeader className="pb-3 sm:pb-6">
                  <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-2">
                    <div className="flex items-center gap-2">
                      <GitCompare className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500" />
                      <span className="text-base sm:text-lg">
                        <span className="hidden sm:inline">
                          Comparaison Multi-Joueurs
                        </span>
                        <span className="sm:hidden">Comparaison</span>
                      </span>
                      <Badge variant="secondary" className="ml-2 text-xs">
                        <Palette className="w-3 h-3 mr-1" />
                        {selectedPlayers.length}
                      </Badge>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={toggleFullscreen}
                      className="transition-all duration-200 hover:scale-105 text-xs sm:text-sm"
                    >
                      <Maximize2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                      <span className="hidden sm:inline">Plein écran</span>
                      <span className="sm:hidden">⛶</span>
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4 pt-0">
                  {/* Players Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                    {selectedPlayersData.map((player, idx) => {
                      const color = getPlayerColor(idx);
                      const averageScore =
                        player.scores.length > 0
                          ? player.totalScore / player.scores.length
                          : 0;

                      return (
                        <div
                          key={player.id}
                          className="p-2 sm:p-3 border rounded-lg transition-all duration-200 hover:scale-105"
                          style={{
                            borderColor: color.primary + "40",
                            backgroundColor: color.secondary,
                          }}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <div
                              className="w-3 h-3 sm:w-4 sm:h-4 rounded-full"
                              style={{ backgroundColor: color.primary }}
                            />
                            <span
                              className="font-medium text-xs sm:text-sm truncate"
                              style={{ color: color.primary }}
                            >
                              {player.name}
                            </span>
                          </div>
                          <div className="grid grid-cols-3 gap-1 sm:gap-2 text-xs">
                            <div className="text-center">
                              <div
                                className="font-bold text-sm sm:text-lg"
                                style={{ color: color.primary }}
                              >
                                {player.totalScore}
                              </div>
                              <div className="text-gray-500 text-xs">Total</div>
                            </div>
                            <div className="text-center">
                              <div
                                className="font-bold text-sm sm:text-lg"
                                style={{ color: color.primary }}
                              >
                                {averageScore.toFixed(1)}
                              </div>
                              <div className="text-gray-500 text-xs">Moy</div>
                            </div>
                            <div className="text-center">
                              <div
                                className="font-bold text-sm sm:text-lg"
                                style={{ color: color.primary }}
                              >
                                {player.scores.length}
                              </div>
                              <div className="text-gray-500 text-xs">Tirs</div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Ranking within selection */}
                  <div className="p-2 sm:p-3 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2 text-xs sm:text-sm">
                      Classement de la Sélection:
                    </h4>
                    <div className="space-y-1">
                      {[...selectedPlayersData]
                        .sort((a, b) => b.totalScore - a.totalScore)
                        .map((player, idx) => {
                          const originalIndex = selectedPlayers.indexOf(
                            player.id
                          );
                          const color = getPlayerColor(originalIndex);

                          return (
                            <div
                              key={player.id}
                              className="flex items-center gap-2 text-xs sm:text-sm"
                            >
                              <span className="font-bold w-4 sm:w-6">
                                {getRankIcon(idx)}
                              </span>
                              <div
                                className="w-2 h-2 sm:w-3 sm:h-3 rounded-full"
                                style={{ backgroundColor: color.primary }}
                              />
                              <span className="flex-1 truncate">
                                {player.name}
                              </span>
                              <span
                                className="font-bold"
                                style={{ color: color.primary }}
                              >
                                {player.totalScore}
                              </span>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Multi-Player Comparison Chart */}
              {comparisonData && (
                <Card className="transition-all duration-300 hover:shadow-lg">
                  <CardHeader className="pb-3 sm:pb-6">
                    <CardTitle className="text-sm sm:text-base">
                      Évolution Comparative des Scores
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="h-64 sm:h-80">
                      <SimpleLineChart
                        data={comparisonData}
                        lines={selectedPlayersData.map((player, idx) => {
                          const color = getPlayerColor(idx);
                          return {
                            dataKey: player?.name || "",
                            stroke: color.primary,
                            name: player?.name || "",
                            strokeWidth: 2,
                            dots: true,
                          };
                        })}
                        xAxisKey="shot"
                        xAxisLabel="N° Tir"
                        yAxisLabel="Score Cumulé"
                        tooltipFormatter={(label: string) =>
                          `Après Tir ${label}`
                        }
                      />
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <Card className="transition-all duration-300 hover:shadow-lg">
              <CardHeader className="pb-3 sm:pb-6">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <GitCompare className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                  <span className="hidden sm:inline">
                    Comparaison Multi-Joueurs
                  </span>
                  <span className="sm:hidden">Comparaison</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-center text-gray-500 py-8 sm:py-12">
                  <div className="flex justify-center mb-4">
                    <Palette className="w-8 h-8 sm:w-12 sm:h-12 text-gray-300 animate-pulse" />
                  </div>
                  <p className="text-xs sm:text-sm">
                    <span className="hidden sm:inline">
                      Sélectionnez des tireurs dans le classement
                      <br />
                      pour voir leur comparaison détaillée
                    </span>
                    <span className="sm:hidden">
                      Sélectionnez des tireurs
                      <br />
                      pour les comparer
                    </span>
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
                    <span className="hidden sm:inline">
                      Nombre illimité de joueurs supporté
                    </span>
                    <span className="sm:hidden">Nombre illimité</span>
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
