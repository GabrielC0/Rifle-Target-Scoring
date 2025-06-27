"use client";

import type React from "react";
import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useState,
} from "react";
import { apiService, type Player as DbPlayer } from "@/lib/api-service";

export interface Player {
  id: string;
  name: string;
  totalShots: number;
  currentShot: number;
  scores: number[];
  totalScore: number;
}

interface ScoringState {
  players: Player[];
  currentPlayerId: string | null;
  topScorerId: string | null;
  isLoading: boolean;
  error: string | null;
}

type ScoringAction =
  | { type: "ADD_PLAYER"; payload: { name: string; totalShots: number } }
  | { type: "REMOVE_PLAYER"; payload: { id: string } }
  | { type: "SET_CURRENT_PLAYER"; payload: { id: string } }
  | { type: "ADD_SCORE"; payload: { playerId: string; score: number } }
  | { type: "UPDATE_PLAYER_SHOTS"; payload: { id: string; totalShots: number } }
  | { type: "RESET_PLAYER_SCORES"; payload: { id: string } }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "LOAD_PLAYERS"; payload: Player[] }
  | {
      type: "SET_DB_STATUS";
      payload: { connected: boolean; message?: string };
    };

const initialState: ScoringState = {
  players: [],
  currentPlayerId: null,
  topScorerId: null,
  isLoading: false,
  error: null,
};

interface ScoringContextType {
  state: ScoringState;
  dispatch: React.Dispatch<ScoringAction>;
  addPlayerAsync: (name: string, totalShots?: number) => Promise<void>;
  removePlayerAsync: (id: string) => Promise<void>;
  resetPlayerScoresAsync: (id: string) => Promise<void>;
  addScoreAsync: (playerId: string, score: number) => Promise<void>;
  loadPlayersAsync: () => Promise<void>;
}

const ScoringContext = createContext<ScoringContextType | undefined>(undefined);

function scoringReducer(
  state: ScoringState,
  action: ScoringAction
): ScoringState {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };

    case "SET_ERROR":
      return { ...state, error: action.payload, isLoading: false };

    case "LOAD_PLAYERS": {
      const newState = {
        ...state,
        players: action.payload,
        isLoading: false,
        error: null,
      };
      return updateTopScorer(newState);
    }

    case "ADD_PLAYER": {
      const newPlayer: Player = {
        id: Math.random().toString(36).substr(2, 9),
        name: action.payload.name,
        totalShots: action.payload.totalShots,
        currentShot: 0,
        scores: [],
        totalScore: 0,
      };
      const newState = {
        ...state,
        players: [...state.players, newPlayer],
      };
      return updateTopScorer(newState);
    }

    case "REMOVE_PLAYER": {
      const newState = {
        ...state,
        players: state.players.filter((p) => p.id !== action.payload.id),
        currentPlayerId:
          state.currentPlayerId === action.payload.id
            ? null
            : state.currentPlayerId,
      };
      return updateTopScorer(newState);
    }

    case "SET_CURRENT_PLAYER":
      return {
        ...state,
        currentPlayerId: action.payload.id,
      };

    case "ADD_SCORE": {
      console.log("🔄 Reducer ADD_SCORE:", action.payload);

      const newState = {
        ...state,
        players: state.players.map((player) => {
          if (player.id === action.payload.playerId) {
            // Vérifier qu'on ne dépasse pas le nombre maximum de tirs
            if (player.currentShot >= player.totalShots) {
              console.warn(
                `⚠️ Nombre maximum de tirs atteint pour ${player.name}: ${player.currentShot}/${player.totalShots}`
              );
              return player; // Ne pas ajouter le score
            }

            const newScores = [...player.scores, action.payload.score];
            const newCurrentShot = newScores.length; // currentShot = nombre de tirs effectués
            const newTotalScore = newScores.reduce(
              (sum, score) => sum + score,
              0
            );

            console.log(`📊 Mise à jour joueur ${player.name}:`, {
              oldCurrentShot: player.currentShot,
              newCurrentShot,
              oldScores: player.scores.length,
              newScores: newScores.length,
              newTotalScore,
              progress: `${newCurrentShot}/${player.totalShots}`,
            });

            return {
              ...player,
              scores: newScores,
              currentShot: newCurrentShot,
              totalScore: newTotalScore,
            };
          }
          return player;
        }),
      };
      return updateTopScorer(newState);
    }

    case "UPDATE_PLAYER_SHOTS": {
      const newState = {
        ...state,
        players: state.players.map((player) => {
          if (player.id === action.payload.id) {
            const newTotalShots = action.payload.totalShots;
            const newScores = player.scores.slice(0, newTotalShots);
            return {
              ...player,
              totalShots: newTotalShots,
              scores: newScores,
              currentShot: Math.min(player.currentShot, newTotalShots),
              totalScore: newScores.reduce((sum, score) => sum + score, 0),
            };
          }
          return player;
        }),
      };
      return updateTopScorer(newState);
    }

    case "RESET_PLAYER_SCORES": {
      const newState = {
        ...state,
        players: state.players.map((player) => {
          if (player.id === action.payload.id) {
            return {
              ...player,
              scores: [],
              currentShot: 0,
              totalScore: 0,
            };
          }
          return player;
        }),
      };
      return updateTopScorer(newState);
    }

    default:
      return state;
  }
}

function updateTopScorer(state: ScoringState): ScoringState {
  const topScorer = state.players.reduce((top, player) => {
    if (!top || player.totalScore > top.totalScore) {
      return player;
    }
    return top;
  }, null as Player | null);

  return {
    ...state,
    topScorerId: topScorer?.id || null,
  };
}

// Fonction utilitaire pour convertir les données DB en format Player
function convertDbPlayerToPlayer(dbPlayer: DbPlayer): Player {
  console.log("🔄 Conversion du joueur DB:", dbPlayer);

  // S'assurer que les scores sont correctement triés et convertis
  const sortedScores = (dbPlayer.scores || []).sort((a, b) => a - b); // Trier les scores si nécessaire

  const converted = {
    id: dbPlayer.id,
    name: dbPlayer.name,
    totalShots: dbPlayer.totalShots || 10, // Utiliser la valeur de la DB ou 10 par défaut
    currentShot: dbPlayer.shotCount, // shotCount = nombre de tirs déjà effectués
    scores: sortedScores,
    totalScore: dbPlayer.totalScore,
  };

  console.log("✅ Joueur converti:", {
    ...converted,
    scoresLength: converted.scores.length,
    calculatedTotal: converted.scores.reduce((sum, score) => sum + score, 0),
    currentShot: converted.currentShot,
    progress: `${converted.currentShot}/${converted.totalShots}`,
  });

  return converted;
}

export function ScoringProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(scoringReducer, initialState);

  // Charger les joueurs depuis l'API
  const loadPlayersAsync = async () => {
    try {
      console.log("🔄 Chargement des joueurs depuis l'API...");
      dispatch({ type: "SET_LOADING", payload: true });

      // Test de l'API de diagnostic d'abord
      try {
        const diagnosticResponse = await fetch("/api/diagnostic");
        const diagnosticData = await diagnosticResponse.json();
        console.log("🔍 Diagnostic de la DB:", diagnosticData);
      } catch (diagError) {
        console.warn("⚠️ Impossible d'accéder au diagnostic:", diagError);
      }

      const dbPlayers = await apiService.getPlayers();
      console.log("📦 Données reçues de l'API:", dbPlayers);

      if (!Array.isArray(dbPlayers)) {
        console.error(
          "❌ Les données reçues ne sont pas un tableau:",
          dbPlayers
        );
        dispatch({ type: "LOAD_PLAYERS", payload: [] });
        return;
      }

      const players = dbPlayers.map(convertDbPlayerToPlayer);
      console.log("🎯 Joueurs convertis:", players);
      dispatch({ type: "LOAD_PLAYERS", payload: players });
      console.log("✅ Joueurs chargés avec succès");
    } catch (error) {
      console.error("❌ Erreur lors du chargement des joueurs:", error);
      console.error("Stack trace:", error instanceof Error ? error.stack : "");
      dispatch({
        type: "SET_ERROR",
        payload: `Erreur lors du chargement des joueurs: ${
          error instanceof Error ? error.message : "Erreur inconnue"
        }`,
      });
      // Charger une liste vide en cas d'erreur pour éviter que l'app plante
      dispatch({ type: "LOAD_PLAYERS", payload: [] });
    }
  };

  // Ajouter un joueur avec persistance en base
  const addPlayerAsync = async (name: string, totalShots: number = 10) => {
    try {
      console.log(`🎯 Ajout du joueur: ${name} avec ${totalShots} tirs`);
      dispatch({ type: "SET_LOADING", payload: true });
      const dbPlayer = await apiService.createPlayer(name, totalShots);
      console.log("✅ Joueur créé:", dbPlayer);
      const player = convertDbPlayerToPlayer(dbPlayer);

      // Recharger tous les joueurs pour être sûr de la synchronisation
      await loadPlayersAsync();
    } catch (error) {
      console.error("❌ Erreur lors de l'ajout du joueur:", error);
      dispatch({
        type: "SET_ERROR",
        payload: "Erreur lors de l'ajout du joueur",
      });
    }
  };

  // Supprimer un joueur avec persistance en base
  const removePlayerAsync = async (id: string) => {
    try {
      console.log(`🗑️ Suppression du joueur: ${id}`);
      dispatch({ type: "SET_LOADING", payload: true });
      await apiService.deletePlayer(id);
      dispatch({ type: "REMOVE_PLAYER", payload: { id } });
      dispatch({ type: "SET_LOADING", payload: false });
      console.log("✅ Joueur supprimé avec succès");
    } catch (error) {
      console.error("❌ Erreur lors de la suppression du joueur:", error);
      dispatch({
        type: "SET_ERROR",
        payload: "Erreur lors de la suppression du joueur",
      });
    }
  };

  // Réinitialiser les scores d'un joueur avec persistance en base
  const resetPlayerScoresAsync = async (id: string) => {
    try {
      console.log(`🔄 Réinitialisation des scores pour le joueur: ${id}`);
      dispatch({ type: "SET_LOADING", payload: true });
      const updatedPlayer = await apiService.resetPlayerScores(id);
      console.log("✅ Scores réinitialisés:", updatedPlayer);

      // Recharger tous les joueurs pour être sûr de la synchronisation
      await loadPlayersAsync();
    } catch (error) {
      console.error("❌ Erreur lors de la réinitialisation des scores:", error);
      dispatch({
        type: "SET_ERROR",
        payload: "Erreur lors de la réinitialisation des scores",
      });
      // Fallback sur dispatch en cas d'erreur
      dispatch({ type: "RESET_PLAYER_SCORES", payload: { id } });
    }
  };

  // Ajouter un score avec persistance en base
  const addScoreAsync = async (playerId: string, score: number) => {
    try {
      console.log(`🎯 Ajout du score ${score} pour le joueur ${playerId}`);

      const player = state.players.find((p) => p.id === playerId);
      if (!player) {
        console.error("❌ Joueur non trouvé dans le state");
        return;
      }

      // Calculer le numéro de tir basé sur les scores existants + 1
      const shotNumber = player.scores.length + 1;
      console.log(
        `📊 Numéro de tir calculé: ${shotNumber} (scores existants: ${player.scores.length})`
      );

      // Vérifier qu'on ne dépasse pas le maximum
      if (shotNumber > player.totalShots) {
        console.error(
          `❌ Nombre maximum de tirs atteint: ${shotNumber} > ${player.totalShots}`
        );
        dispatch({
          type: "SET_ERROR",
          payload: `Nombre maximum de tirs (${player.totalShots}) atteint`,
        });
        return;
      }

      // Appeler l'API pour sauvegarder
      await apiService.addScore(playerId, score, shotNumber);
      console.log(`✅ Score sauvegardé en base: ${score} (tir ${shotNumber})`);

      // Mettre à jour le state local
      dispatch({ type: "ADD_SCORE", payload: { playerId, score } });
      console.log("✅ State local mis à jour");
    } catch (error) {
      console.error("❌ Erreur lors de l'ajout du score:", error);
      dispatch({
        type: "SET_ERROR",
        payload: "Erreur lors de l'ajout du score",
      });
    }
  };

  // Charger les données au montage
  useEffect(() => {
    console.log("🚀 Montage du ScoringProvider - Chargement des joueurs...");
    loadPlayersAsync();
  }, []);

  return (
    <ScoringContext.Provider
      value={{
        state,
        dispatch,
        addPlayerAsync,
        removePlayerAsync,
        resetPlayerScoresAsync,
        addScoreAsync,
        loadPlayersAsync,
      }}
    >
      {children}
    </ScoringContext.Provider>
  );
}

export const useScoring = () => {
  const context = useContext(ScoringContext);
  if (context === undefined) {
    throw new Error("useScoring must be used within a ScoringProvider");
  }
  return context;
};
