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
      const newState = {
        ...state,
        players: state.players.map((player) => {
          if (
            player.id === action.payload.playerId &&
            player.currentShot < player.totalShots
          ) {
            const newScores = [...player.scores, action.payload.score];
            const newCurrentShot = Math.min(
              player.currentShot + 1,
              player.totalShots
            );
            return {
              ...player,
              scores: newScores,
              currentShot: newCurrentShot,
              totalScore: newScores.reduce((sum, score) => sum + score, 0),
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
  return {
    id: dbPlayer.id,
    name: dbPlayer.name,
    totalShots: 10, // Valeur par défaut
    currentShot: dbPlayer.shotCount,
    scores: dbPlayer.scores,
    totalScore: dbPlayer.totalScore,
  };
}

export function ScoringProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(scoringReducer, initialState);

  // Charger les joueurs depuis l'API
  const loadPlayersAsync = async () => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      const dbPlayers = await apiService.getPlayers();
      const players = dbPlayers.map(convertDbPlayerToPlayer);
      dispatch({ type: "LOAD_PLAYERS", payload: players });
    } catch (error) {
      console.error("Erreur lors du chargement des joueurs:", error);
      dispatch({
        type: "SET_ERROR",
        payload: "Erreur lors du chargement des joueurs",
      });
    }
  };

  // Ajouter un joueur avec persistance en base
  const addPlayerAsync = async (name: string, totalShots: number = 10) => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      const dbPlayer = await apiService.createPlayer(name);
      const player = convertDbPlayerToPlayer(dbPlayer);
      player.totalShots = totalShots;

      // Recharger tous les joueurs pour être sûr de la synchronisation
      await loadPlayersAsync();
    } catch (error) {
      console.error("Erreur lors de l'ajout du joueur:", error);
      dispatch({
        type: "SET_ERROR",
        payload: "Erreur lors de l'ajout du joueur",
      });
    }
  };

  // Supprimer un joueur avec persistance en base
  const removePlayerAsync = async (id: string) => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      await apiService.deletePlayer(id);
      dispatch({ type: "REMOVE_PLAYER", payload: { id } });
      dispatch({ type: "SET_LOADING", payload: false });
    } catch (error) {
      console.error("Erreur lors de la suppression du joueur:", error);
      dispatch({
        type: "SET_ERROR",
        payload: "Erreur lors de la suppression du joueur",
      });
    }
  };

  // Ajouter un score avec persistance en base
  const addScoreAsync = async (playerId: string, score: number) => {
    try {
      const player = state.players.find((p) => p.id === playerId);
      if (!player) return;

      const shotNumber = player.scores.length + 1;
      await apiService.addScore(playerId, score, shotNumber);
      dispatch({ type: "ADD_SCORE", payload: { playerId, score } });
    } catch (error) {
      console.error("Erreur lors de l'ajout du score:", error);
      dispatch({
        type: "SET_ERROR",
        payload: "Erreur lors de l'ajout du score",
      });
    }
  };

  // Charger les données au montage
  useEffect(() => {
    loadPlayersAsync();
  }, []);

  return (
    <ScoringContext.Provider
      value={{
        state,
        dispatch,
        addPlayerAsync,
        removePlayerAsync,
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
