"use client";

import { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { useScoring } from "@/contexts/scoring-context";
import { SimpleLineChart } from "@/components/simple-charts";
import {
  Trophy,
  Users,
  GitCompare,
  Target,
  X,
  BarChart3,
  TrendingUp,
  Award,
  Search,
  CheckSquare,
  Square,
} from "lucide-react";
import { getPlayerColor } from "@/utils/colors";

interface ClassementDashboardProps {
  preselectedPlayerId?: string | null;
}

export function ClassementDashboard({
  preselectedPlayerId,
}: ClassementDashboardProps) {
  const { state } = useScoring();
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

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
    );
  }, []);

  // Effet pour présélectionner un joueur si fourni
  useEffect(() => {
    if (
      preselectedPlayerId &&
      state.players.some((p) => p.id === preselectedPlayerId)
    ) {
      setSelectedPlayers([preselectedPlayerId]);
    }
  }, [preselectedPlayerId, state.players]);

  // Calcul des données de classement avec filtrage par recherche
  const sortedPlayers = [...state.players]
    .map((player) => {
      const allScores = player.scores || [];
      const bestScore = allScores.length > 0 ? Math.max(...allScores) : 0;
      const averageScore =
        allScores.length > 0
          ? allScores.reduce((sum: number, score: number) => sum + score, 0) /
            allScores.length
          : 0;

      return {
        ...player,
        bestScore,
        averageScore,
        allScores,
      };
    })
    .filter((player) =>
      player.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
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
    // Sélectionner seulement les joueurs visibles (filtrés) jusqu'à la limite de 6
    const visiblePlayerIds = sortedPlayers.slice(0, 6).map((p) => p.id);
    setSelectedPlayers(visiblePlayerIds);
  };

  const handleDeselectAll = () => {
    setSelectedPlayers([]);
  };

  // Vérifier si tous les joueurs visibles sont sélectionnés
  const visiblePlayerIds = sortedPlayers.slice(0, 6).map((p) => p.id);
  const isAllSelected =
    visiblePlayerIds.length > 0 &&
    visiblePlayerIds.every((id) => selectedPlayers.includes(id)) &&
    selectedPlayers.filter((id) => visiblePlayerIds.includes(id)).length ===
      visiblePlayerIds.length;

  const selectedPlayersData = sortedPlayers.filter((p) =>
    selectedPlayers.includes(p.id)
  );

  // Données pour les graphiques de comparaison
  const comparisonData =
    selectedPlayersData.length > 0
      ? selectedPlayersData.reduce((acc: any[], player, playerIndex) => {
          player.allScores.forEach((score: number, shotIndex: number) => {
            if (!acc[shotIndex]) {
              acc[shotIndex] = { shot: shotIndex + 1 };
            }
            acc[shotIndex][player.name] = score;
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
      sortedPlayers.length > 0
        ? sortedPlayers.reduce((sum: number, p) => sum + p.averageScore, 0) /
          sortedPlayers.length
        : 0,
  };

  return (
    <div className="transition-all duration-300">
      {/* Notification de présélection */}
      {preselectedPlayerId && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2 text-sm text-green-800">
            <Target className="w-4 h-4" />
            <span className="font-medium">
              Tireur sélectionné automatiquement
            </span>
          </div>
          <p className="text-xs text-green-700 mt-1">
            Le tireur a été présélectionné suite à votre consultation des
            résultats.
          </p>
        </div>
      )}

      {/* Header avec contrôles */}
      <div ref={headerRef} className="mb-6">
        {/* Header simplifié sans boutons de contrôle */}
      </div>

      {/* Statistiques globales */}
      <div
        ref={statsRef}
        className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8"
      >
        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardContent className="p-3 sm:p-4 lg:p-5">
            <div className="flex items-center gap-2 sm:gap-3">
              <Users className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-blue-500 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-gray-600 truncate">
                  Tireurs
                </p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                  {globalStats.totalPlayers}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardContent className="p-3 sm:p-4 lg:p-5">
            <div className="flex items-center gap-2 sm:gap-3">
              <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-purple-500 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-gray-600 truncate">
                  Tirs totaux
                </p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                  {globalStats.totalShots}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardContent className="p-3 sm:p-4 lg:p-5">
            <div className="flex items-center gap-2 sm:gap-3">
              <Award className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-yellow-500 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-gray-600 truncate">
                  Meilleur score
                </p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                  {globalStats.bestScore.toFixed(1)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardContent className="p-3 sm:p-4 lg:p-5">
            <div className="flex items-center gap-2 sm:gap-3">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-orange-500 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-gray-600 truncate">
                  Moyenne
                </p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                  {globalStats.averageScore.toFixed(1)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
        {/* Classement des joueurs */}
        <div ref={rankingRef} className="lg:col-span-1 order-2 lg:order-1">
          <Card className="h-fit">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500" />
                <span className="hidden sm:inline">Classement Global</span>
                <span className="sm:hidden">Classement</span>
                <Badge variant="secondary" className="text-xs">
                  {sortedPlayers.length}
                  {searchTerm
                    ? ` résultat${sortedPlayers.length > 1 ? "s" : ""}`
                    : ""}
                </Badge>
              </CardTitle>

              {/* Contrôles de recherche et sélection */}
              <div className="space-y-3 pt-3">
                {/* Barre de recherche */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Rechercher par prénom..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 text-sm"
                  />
                </div>

                {/* Boutons de sélection */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={
                      isAllSelected ? handleDeselectAll : handleSelectAll
                    }
                    disabled={sortedPlayers.length === 0}
                    className="flex items-center gap-2 text-xs"
                  >
                    {isAllSelected ? (
                      <>
                        <Square className="w-3 h-3" />
                        <span className="hidden sm:inline">
                          Désélectionner tout
                        </span>
                        <span className="sm:hidden">Désél. tout</span>
                      </>
                    ) : (
                      <>
                        <CheckSquare className="w-3 h-3" />
                        <span className="hidden sm:inline">
                          Sélectionner tout
                        </span>
                        <span className="sm:hidden">Sél. tout</span>
                      </>
                    )}
                  </Button>

                  {selectedPlayers.length > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {selectedPlayers.length}/6 sélectionnés
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 sm:space-y-3 max-h-[600px] lg:max-h-[800px] overflow-y-auto">
              {sortedPlayers.length === 0 ? (
                <div className="text-center py-6 sm:py-8 text-gray-500">
                  {searchTerm ? (
                    <>
                      <Search className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-2 opacity-50" />
                      <p className="text-sm sm:text-base mb-2">
                        Aucun tireur trouvé pour "{searchTerm}"
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSearchTerm("")}
                        className="text-xs"
                      >
                        Effacer la recherche
                      </Button>
                    </>
                  ) : (
                    <>
                      <Users className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-2 opacity-50" />
                      <p className="text-sm sm:text-base">
                        Aucun tireur enregistré
                      </p>
                    </>
                  )}
                </div>
              ) : (
                sortedPlayers.map((player, index) => (
                  <div
                    key={player.id}
                    className={`flex items-center p-2 sm:p-3 rounded-lg border transition-all duration-200 hover:shadow-sm ${
                      selectedPlayers.includes(player.id)
                        ? "border-blue-300 bg-blue-50 shadow-sm"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center gap-2 sm:gap-3 w-full">
                      <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                        <Checkbox
                          checked={selectedPlayers.includes(player.id)}
                          onCheckedChange={(checked) =>
                            handlePlayerToggle(player.id, checked as boolean)
                          }
                          disabled={
                            !selectedPlayers.includes(player.id) &&
                            selectedPlayers.length >= 6
                          }
                          className="w-4 h-4"
                        />
                        <div
                          className="w-2 h-2 sm:w-3 sm:h-3 rounded-full flex-shrink-0"
                          style={{
                            backgroundColor: selectedPlayers.includes(player.id)
                              ? getPlayerColor(
                                  selectedPlayers.indexOf(player.id)
                                ).primary
                              : "#e5e7eb",
                          }}
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1 sm:gap-2 mb-1">
                          <span className="text-xs sm:text-sm font-medium text-gray-900 flex-shrink-0">
                            #{index + 1}
                          </span>
                          <span className="text-sm sm:text-base font-semibold text-gray-800 truncate">
                            {player.name}
                          </span>
                          {index === 0 && (
                            <Trophy className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-500 flex-shrink-0" />
                          )}
                          {player.id === preselectedPlayerId && (
                            <Badge
                              variant="secondary"
                              className="text-xs bg-green-100 text-green-800 animate-pulse"
                            >
                              👁️ Sélectionné
                            </Badge>
                          )}
                        </div>
                        <div className="text-xs sm:text-sm text-gray-600 space-y-0.5">
                          <div className="flex justify-between items-center">
                            <span className="truncate">
                              Meilleur: {player.bestScore.toFixed(1)}
                            </span>
                            <span className="ml-2 flex-shrink-0">
                              Moy: {player.averageScore.toFixed(1)}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500">
                            {player.allScores.length} tirs
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
        <div ref={comparisonRef} className="lg:col-span-2 order-1 lg:order-2">
          {selectedPlayersData.length > 0 ? (
            <Card className="h-fit">
              <CardHeader className="pb-4">
                <CardTitle className="flex flex-col sm:flex-row sm:items-center gap-2 text-base sm:text-lg">
                  <div className="flex items-center gap-2">
                    <GitCompare className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
                    <span>Comparaison</span>
                  </div>
                  <Badge variant="secondary" className="text-xs w-fit">
                    {selectedPlayersData.length} tireur
                    {selectedPlayersData.length > 1 ? "s" : ""}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6">
                {/* Joueurs sélectionnés */}
                <div className="flex flex-wrap gap-1 sm:gap-2">
                  {selectedPlayersData.map((player, index) => (
                    <div
                      key={player.id}
                      className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 bg-gray-100 rounded-full text-xs sm:text-sm"
                    >
                      <div
                        className="w-2 h-2 sm:w-3 sm:h-3 rounded-full flex-shrink-0"
                        style={{
                          backgroundColor: getPlayerColor(index).primary,
                        }}
                      />
                      <span className="font-medium truncate max-w-[80px] sm:max-w-none">
                        {player.name}
                      </span>
                      <button
                        onClick={() =>
                          setSelectedPlayers(
                            selectedPlayers.filter((id) => id !== player.id)
                          )
                        }
                        className="ml-1 hover:bg-gray-200 rounded-full p-0.5 flex-shrink-0"
                      >
                        <X className="w-2 h-2 sm:w-3 sm:h-3" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Graphique de comparaison */}
                {comparisonData.length > 0 && (
                  <div className="bg-white p-2 sm:p-4 rounded-lg border overflow-x-auto">
                    <div className="min-w-[600px]">
                      <SimpleLineChart
                        data={comparisonData}
                        lines={selectedPlayersData.map((player, index) => ({
                          dataKey: player.name,
                          stroke: getPlayerColor(index).primary,
                          name: player.name,
                          strokeWidth: 2,
                        }))}
                        width={Math.max(
                          600,
                          window.innerWidth > 1024 ? 800 : 600
                        )}
                        height={300}
                        xAxisKey="shot"
                        xAxisLabel="Numéro de tir"
                        yAxisLabel="Score"
                      />
                    </div>
                  </div>
                )}

                {/* Statistiques de comparaison */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-3 sm:gap-4">
                  {selectedPlayersData.map((player, index) => (
                    <Card
                      key={player.id}
                      className="hover:shadow-lg transition-shadow duration-200"
                    >
                      <CardContent className="p-3 sm:p-4">
                        <div className="flex items-center gap-2 mb-2 sm:mb-3">
                          <div
                            className="w-2 h-2 sm:w-3 sm:h-3 rounded-full flex-shrink-0"
                            style={{
                              backgroundColor: getPlayerColor(index).primary,
                            }}
                          />
                          <span className="font-semibold text-sm sm:text-base truncate">
                            {player.name}
                          </span>
                        </div>
                        <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Meilleur:</span>
                            <span className="font-medium text-gray-900">
                              {player.bestScore.toFixed(1)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Moyenne:</span>
                            <span className="font-medium text-gray-900">
                              {player.averageScore.toFixed(1)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Tirs:</span>
                            <span className="font-medium text-gray-900">
                              {player.allScores.length}
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
            <Card className="h-fit">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Target className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                  <span className="hidden sm:inline">
                    Sélectionnez des tireurs pour comparer
                  </span>
                  <span className="sm:hidden">Sélectionner pour comparer</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 sm:py-12 text-gray-500">
                  <GitCompare className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 opacity-50" />
                  <p className="text-base sm:text-lg mb-2 font-medium">
                    Comparaison des performances
                  </p>
                  <p className="text-xs sm:text-sm px-4">
                    Cochez les cases à côté des tireurs dans le classement pour
                    voir leurs graphiques et statistiques.
                  </p>
                  <p className="text-xs mt-2 text-gray-400">
                    Maximum 6 tireurs simultanément
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
