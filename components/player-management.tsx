"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { gsap } from "gsap";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useScoring } from "@/contexts/scoring-context";
import {
  UserPlus,
  Trash2,
  Target,
  RotateCcw,
  BarChart3,
  Filter,
  SortAsc,
  SortDesc,
} from "lucide-react";

type FilterType = "all" | "completed" | "in-progress" | "not-started";
type SortType =
  | "score-desc"
  | "score-asc"
  | "average-desc"
  | "average-asc"
  | "name-asc"
  | "name-desc"
  | "completion-desc"
  | "completion-asc";

export function PlayerManagement() {
  const router = useRouter();
  const {
    state,
    dispatch,
    addPlayerAsync,
    removePlayerAsync,
    resetPlayerScoresAsync,
  } = useScoring();
  const [newPlayerName, setNewPlayerName] = useState("");
  const [newPlayerShots, setNewPlayerShots] = useState(10);
  const [filter, setFilter] = useState<FilterType>("all");
  const [sort, setSort] = useState<SortType>("score-desc");
  const cardRef = useRef<HTMLDivElement>(null);
  const playersRef = useRef<HTMLDivElement>(null);
  const filtersRef = useRef<HTMLDivElement>(null);

  // Load filters from localStorage on mount
  useEffect(() => {
    const savedFilter = localStorage.getItem("player-filter");
    const savedSort = localStorage.getItem("player-sort");

    if (
      savedFilter &&
      ["all", "completed", "in-progress", "not-started"].includes(savedFilter)
    ) {
      setFilter(savedFilter as FilterType);
    }

    if (
      savedSort &&
      [
        "score-desc",
        "score-asc",
        "average-desc",
        "average-asc",
        "name-asc",
        "name-desc",
        "completion-desc",
        "completion-asc",
      ].includes(savedSort)
    ) {
      setSort(savedSort as SortType);
    }
  }, []);

  // Save filters to localStorage when they change
  useEffect(() => {
    localStorage.setItem("player-filter", filter);
  }, [filter]);

  useEffect(() => {
    localStorage.setItem("player-sort", sort);
  }, [sort]);

  useEffect(() => {
    // Animation d'entrée de la carte
    gsap.fromTo(
      cardRef.current,
      { scale: 0.9, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.6, ease: "back.out(1.7)" }
    );

    // Animation des filtres
    gsap.fromTo(
      filtersRef.current,
      { y: -20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, ease: "power2.out", delay: 0.2 }
    );
  }, []);

  useEffect(() => {
    // Animation des joueurs quand la liste change
    if (playersRef.current) {
      const playerCards = playersRef.current.children;
      gsap.fromTo(
        playerCards,
        { x: -30, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.5, stagger: 0.1, ease: "power2.out" }
      );
    }
  }, [state.players.length, filter, sort]);

  const handleAddPlayer = async () => {
    if (newPlayerName.trim()) {
      try {
        await addPlayerAsync(newPlayerName.trim(), newPlayerShots);
        setNewPlayerName("");

        // Animation du bouton d'ajout
        const addButton = document.querySelector("[data-add-button]");
        if (addButton) {
          gsap.to(addButton, {
            scale: 1.1,
            duration: 0.1,
            yoyo: true,
            repeat: 1,
            ease: "power2.inOut",
          });
        }
      } catch (error) {
        console.error("Erreur lors de l'ajout du joueur:", error);
        // Fallback sur dispatch en cas d'erreur
        dispatch({
          type: "ADD_PLAYER",
          payload: { name: newPlayerName.trim(), totalShots: newPlayerShots },
        });
        setNewPlayerName("");
      }
    }
  };

  const handleRemovePlayer = async (id: string) => {
    const playerCard = document.querySelector(`[data-player-id="${id}"]`);
    if (playerCard) {
      gsap.to(playerCard, {
        x: 100,
        opacity: 0,
        duration: 0.3,
        ease: "power2.in",
        onComplete: async () => {
          try {
            await removePlayerAsync(id);
          } catch (error) {
            console.error("Erreur lors de la suppression du joueur:", error);
            // Fallback sur dispatch en cas d'erreur
            dispatch({ type: "REMOVE_PLAYER", payload: { id } });
          }
        },
      });
    }
  };

  const handleResetPlayer = async (id: string) => {
    try {
      await resetPlayerScoresAsync(id);
    } catch (error) {
      console.error("Erreur lors de la réinitialisation des scores:", error);
      // Fallback sur dispatch en cas d'erreur
      dispatch({ type: "RESET_PLAYER_SCORES", payload: { id } });
    }

    // Animation de reset
    const playerCard = document.querySelector(`[data-player-id="${id}"]`);
    if (playerCard) {
      gsap.to(playerCard, {
        rotationY: 360,
        duration: 0.6,
        ease: "power2.inOut",
      });
    }
  };

  const handleUpdateShots = (id: string, totalShots: number) => {
    dispatch({ type: "UPDATE_PLAYER_SHOTS", payload: { id, totalShots } });
  };

  const handleStartShooting = (playerId: string) => {
    const button = document.querySelector(`[data-start-button="${playerId}"]`);
    if (button) {
      gsap.to(button, {
        scale: 0.95,
        duration: 0.1,
        yoyo: true,
        repeat: 1,
        ease: "power2.inOut",
        onComplete: () => {
          router.push(`/shooting/${playerId}`);
        },
      });
    }
  };

  const handleViewResults = (playerId: string) => {
    const button = document.querySelector(
      `[data-results-button="${playerId}"]`
    );
    if (button) {
      gsap.to(button, {
        scale: 0.95,
        duration: 0.1,
        yoyo: true,
        repeat: 1,
        ease: "power2.inOut",
        onComplete: () => {
          router.push(`/results/${playerId}`);
        },
      });
    }
  };

  const handleResetFilters = () => {
    setFilter("all");
    setSort("score-desc");

    // Animation de reset des filtres
    if (filtersRef.current) {
      gsap.to(filtersRef.current, {
        scale: 1.05,
        duration: 0.2,
        yoyo: true,
        repeat: 1,
        ease: "power2.inOut",
      });
    }
  };

  // Filter and sort players
  const filteredAndSortedPlayers = state.players
    .filter((player) => {
      switch (filter) {
        case "completed":
          return player.currentShot >= player.totalShots;
        case "in-progress":
          return (
            player.currentShot > 0 && player.currentShot < player.totalShots
          );
        case "not-started":
          return player.currentShot === 0;
        default:
          return true;
      }
    })
    .sort((a, b) => {
      const aAverage = a.scores.length > 0 ? a.totalScore / a.scores.length : 0;
      const bAverage = b.scores.length > 0 ? b.totalScore / b.scores.length : 0;
      const aCompletion =
        a.totalShots > 0 ? (a.currentShot / a.totalShots) * 100 : 0;
      const bCompletion =
        b.totalShots > 0 ? (b.currentShot / b.totalShots) * 100 : 0;

      switch (sort) {
        case "score-desc":
          return b.totalScore - a.totalScore;
        case "score-asc":
          return a.totalScore - b.totalScore;
        case "average-desc":
          return bAverage - aAverage;
        case "average-asc":
          return aAverage - bAverage;
        case "name-asc":
          return a.name.localeCompare(b.name);
        case "name-desc":
          return b.name.localeCompare(a.name);
        case "completion-desc":
          return bCompletion - aCompletion;
        case "completion-asc":
          return aCompletion - bCompletion;
        default:
          return b.totalScore - a.totalScore;
      }
    });

  const getFilterLabel = (filterType: FilterType) => {
    switch (filterType) {
      case "all":
        return "Tous les tireurs";
      case "completed":
        return "Sessions terminées";
      case "in-progress":
        return "En cours de tir";
      case "not-started":
        return "Pas encore commencé";
      default:
        return "Tous";
    }
  };

  const getSortLabel = (sortType: SortType) => {
    switch (sortType) {
      case "score-desc":
        return "Score (décroissant)";
      case "score-asc":
        return "Score (croissant)";
      case "average-desc":
        return "Moyenne (décroissante)";
      case "average-asc":
        return "Moyenne (croissante)";
      case "name-asc":
        return "Nom (A-Z)";
      case "name-desc":
        return "Nom (Z-A)";
      case "completion-desc":
        return "Progression (décroissante)";
      case "completion-asc":
        return "Progression (croissante)";
      default:
        return "Score (décroissant)";
    }
  };

  const getFilterStats = () => {
    const completed = state.players.filter(
      (p) => p.currentShot >= p.totalShots
    ).length;
    const inProgress = state.players.filter(
      (p) => p.currentShot > 0 && p.currentShot < p.totalShots
    ).length;
    const notStarted = state.players.filter((p) => p.currentShot === 0).length;

    return { completed, inProgress, notStarted, total: state.players.length };
  };

  const stats = getFilterStats();

  return (
    <Card ref={cardRef}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
          <UserPlus className="w-4 h-4 sm:w-5 sm:h-5" />
          Gestion des Tireurs
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add New Player */}
        <div className="space-y-2">
          <Input
            placeholder="Nom du tireur"
            value={newPlayerName}
            onChange={(e) => setNewPlayerName(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleAddPlayer()}
            className="text-sm transition-all duration-200 focus:scale-[1.02]"
          />
          <div className="flex gap-2">
            <Input
              type="number"
              min="1"
              max="50"
              value={newPlayerShots}
              onChange={(e) =>
                setNewPlayerShots(Number.parseInt(e.target.value) || 10)
              }
              className="w-20 text-sm transition-all duration-200 focus:scale-[1.02]"
              placeholder="Tirs"
            />
            <Button
              onClick={handleAddPlayer}
              className="flex-1 text-sm transition-all duration-200 hover:scale-[1.02]"
              data-add-button
            >
              Ajouter Tireur
            </Button>
          </div>
        </div>

        {/* Filters and Sorting */}
        {state.players.length > 0 && (
          <div ref={filtersRef} className="space-y-3 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">
                  Filtres et Tri
                </span>
                <Badge
                  variant="outline"
                  className="text-xs bg-green-100 text-green-800"
                >
                  💾 Sauvegardé
                </Badge>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResetFilters}
                className="text-xs transition-all duration-200 hover:scale-105"
              >
                Réinitialiser
              </Button>
            </div>

            {/* Filter Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="text-center p-2 bg-white rounded border">
                <div className="font-bold text-blue-600">{stats.total}</div>
                <div className="text-gray-500">Total</div>
              </div>
              <div className="text-center p-2 bg-white rounded border">
                <div className="font-bold text-green-600">
                  {stats.completed}
                </div>
                <div className="text-gray-500">Terminés</div>
              </div>
              <div className="text-center p-2 bg-white rounded border">
                <div className="font-bold text-orange-600">
                  {stats.inProgress}
                </div>
                <div className="text-gray-500">En cours</div>
              </div>
              <div className="text-center p-2 bg-white rounded border">
                <div className="font-bold text-gray-600">
                  {stats.notStarted}
                </div>
                <div className="text-gray-500">À commencer</div>
              </div>
            </div>

            {/* Filter and Sort Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <Select
                value={filter}
                onValueChange={(value: FilterType) => setFilter(value)}
              >
                <SelectTrigger className="text-sm">
                  <SelectValue placeholder="Filtrer par statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    Tous les tireurs ({stats.total})
                  </SelectItem>
                  <SelectItem value="completed">
                    Sessions terminées ({stats.completed})
                  </SelectItem>
                  <SelectItem value="in-progress">
                    En cours de tir ({stats.inProgress})
                  </SelectItem>
                  <SelectItem value="not-started">
                    Pas encore commencé ({stats.notStarted})
                  </SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={sort}
                onValueChange={(value: SortType) => setSort(value)}
              >
                <SelectTrigger className="text-sm">
                  <SelectValue placeholder="Trier par" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="score-desc">
                    <div className="flex items-center gap-2">
                      <SortDesc className="w-3 h-3" />
                      Score (décroissant)
                    </div>
                  </SelectItem>
                  <SelectItem value="score-asc">
                    <div className="flex items-center gap-2">
                      <SortAsc className="w-3 h-3" />
                      Score (croissant)
                    </div>
                  </SelectItem>
                  <SelectItem value="average-desc">
                    <div className="flex items-center gap-2">
                      <SortDesc className="w-3 h-3" />
                      Moyenne (décroissante)
                    </div>
                  </SelectItem>
                  <SelectItem value="average-asc">
                    <div className="flex items-center gap-2">
                      <SortAsc className="w-3 h-3" />
                      Moyenne (croissante)
                    </div>
                  </SelectItem>
                  <SelectItem value="completion-desc">
                    <div className="flex items-center gap-2">
                      <SortDesc className="w-3 h-3" />
                      Progression (décroissante)
                    </div>
                  </SelectItem>
                  <SelectItem value="completion-asc">
                    <div className="flex items-center gap-2">
                      <SortAsc className="w-3 h-3" />
                      Progression (croissante)
                    </div>
                  </SelectItem>
                  <SelectItem value="name-asc">
                    <div className="flex items-center gap-2">
                      <SortAsc className="w-3 h-3" />
                      Nom (A-Z)
                    </div>
                  </SelectItem>
                  <SelectItem value="name-desc">
                    <div className="flex items-center gap-2">
                      <SortDesc className="w-3 h-3" />
                      Nom (Z-A)
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Active Filter Display */}
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <span>Affichage:</span>
              <Badge variant="outline" className="text-xs">
                {getFilterLabel(filter)}
              </Badge>
              <span>•</span>
              <Badge variant="outline" className="text-xs">
                {getSortLabel(sort)}
              </Badge>
              <span>•</span>
              <Badge variant="secondary" className="text-xs">
                {filteredAndSortedPlayers.length} résultat
                {filteredAndSortedPlayers.length > 1 ? "s" : ""}
              </Badge>
            </div>
          </div>
        )}

        {/* Player List */}
        <div ref={playersRef} className="space-y-3">
          {filteredAndSortedPlayers.map((player) => {
            const isCompleted = player.currentShot >= player.totalShots;
            const completionPercentage = Math.round(
              (player.currentShot / player.totalShots) * 100
            );

            return (
              <div
                key={player.id}
                data-player-id={player.id}
                className="p-4 border rounded-lg bg-white shadow-sm transition-all duration-300 hover:shadow-md hover:scale-[1.01]"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span className="font-medium text-base truncate">
                      {player.name}
                    </span>
                    {player.id === state.topScorerId && (
                      <Badge
                        variant="secondary"
                        className="bg-yellow-100 text-yellow-800 text-xs animate-pulse"
                      >
                        🏆 Leader
                      </Badge>
                    )}
                    {isCompleted && (
                      <Badge
                        variant="secondary"
                        className="bg-green-100 text-green-800 text-xs"
                      >
                        ✅ Terminé
                      </Badge>
                    )}
                    {player.currentShot > 0 && !isCompleted && (
                      <Badge
                        variant="secondary"
                        className="bg-orange-100 text-orange-800 text-xs"
                      >
                        🎯 En cours
                      </Badge>
                    )}
                    {player.currentShot === 0 && (
                      <Badge
                        variant="secondary"
                        className="bg-gray-100 text-gray-800 text-xs"
                      >
                        ⏳ À commencer
                      </Badge>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleResetPlayer(player.id)}
                      className="transition-all duration-200 hover:scale-110"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRemovePlayer(player.id)}
                      className="transition-all duration-200 hover:scale-110 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-sm text-gray-600 mb-3">
                  <div>
                    <span className="font-medium">Progression:</span>
                    <div className="text-lg font-bold text-gray-900">
                      {player.currentShot}/{player.totalShots}
                    </div>
                  </div>
                  <div>
                    <span className="font-medium">Score Total:</span>
                    <div className="text-lg font-bold text-blue-600">
                      {player.totalScore}
                    </div>
                  </div>
                  <div>
                    <span className="font-medium">Moyenne:</span>
                    <div className="text-lg font-bold text-green-600">
                      {player.scores.length > 0
                        ? (player.totalScore / player.scores.length).toFixed(1)
                        : "0.0"}
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-3">
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ease-out ${
                        isCompleted
                          ? "bg-green-500"
                          : player.currentShot > 0
                          ? "bg-orange-500"
                          : "bg-gray-400"
                      }`}
                      style={{ width: `${completionPercentage}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {completionPercentage}% terminé
                  </div>
                </div>

                <div className="flex gap-2">
                  <Input
                    type="number"
                    min="1"
                    max="50"
                    value={player.totalShots}
                    onChange={(e) =>
                      handleUpdateShots(
                        player.id,
                        Number.parseInt(e.target.value) || 10
                      )
                    }
                    className="w-20 h-9 text-sm transition-all duration-200 focus:scale-[1.05]"
                  />

                  {isCompleted ? (
                    <Button
                      onClick={() => handleViewResults(player.id)}
                      className="flex-1 bg-green-600 hover:bg-green-700 transition-all duration-200 hover:scale-[1.02]"
                      data-results-button={player.id}
                    >
                      <BarChart3 className="w-4 h-4 mr-2" />
                      Voir les Résultats
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handleStartShooting(player.id)}
                      className="flex-1 transition-all duration-200 hover:scale-[1.02]"
                      data-start-button={player.id}
                    >
                      <Target className="w-4 h-4 mr-2" />
                      {player.currentShot > 0 ? "Continuer" : "Démarrer"}
                    </Button>
                  )}
                </div>

                {/* Recent Scores Preview */}
                {player.scores.length > 0 && (
                  <div className="mt-3 pt-3 border-t">
                    <div className="text-xs text-gray-600 mb-1">
                      Derniers scores:
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {player.scores.slice(-5).map((score, index) => (
                        <Badge
                          key={index}
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
          })}
        </div>

        {filteredAndSortedPlayers.length === 0 && state.players.length > 0 && (
          <div className="text-center text-gray-500 py-8 text-sm">
            <Filter className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>Aucun tireur ne correspond aux filtres sélectionnés.</p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetFilters}
              className="mt-4 transition-all duration-200 hover:scale-105"
            >
              Réinitialiser les filtres
            </Button>
          </div>
        )}

        {state.players.length === 0 && (
          <div className="text-center text-gray-500 py-8 text-sm">
            <Target className="w-12 h-12 mx-auto mb-4 text-gray-300 animate-bounce" />
            <p>Aucun tireur ajouté.</p>
            <p>Ajoutez votre premier tireur ci-dessus !</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
