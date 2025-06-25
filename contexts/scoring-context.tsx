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
  | { type: "LOAD_STATE"; payload: ScoringState }
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

function scoringReducer(
  state: ScoringState,
  action: ScoringAction
): ScoringState {
  switch (action.type) {
    case "SET_LOADING":
      return {
        ...state,
        isLoading: action.payload,
      };

    case "SET_ERROR":
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };

    case "LOAD_PLAYERS":
      const newState = {
        ...state,
        players: action.payload,
        isLoading: false,
        error: null,
      };
      return updateTopScorer(newState);

    case "ADD_PLAYER": {
      const newPlayer: Player = {
        id: Date.now().toString(),
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

    case "LOAD_STATE":
      return action.payload;

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

const ScoringContext = createContext<{
  state: ScoringState;
  dispatch: React.Dispatch<ScoringAction>;
  // Nouvelles fonctions async pour la base de données
  addPlayerAsync: (name: string, totalShots: number) => Promise<void>;
  removePlayerAsync: (id: string) => Promise<void>;
  addScoreAsync: (playerId: string, score: number) => Promise<void>;
  resetPlayerScoresAsync: (id: string) => Promise<void>;
  loadPlayersAsync: () => Promise<void>;
} | null>(null);

export function ScoringProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(scoringReducer, initialState);
  const [isInitialized, setIsInitialized] = useState(false);

  // Fonction pour convertir un DbPlayer en Player
  const convertDbPlayerToPlayer = (dbPlayer: DbPlayer): Player => ({
    id: dbPlayer.id,
    name: dbPlayer.name,
    totalShots: 10, // Par défaut
    currentShot: dbPlayer.scores.length,
    scores: dbPlayer.scores,
    totalScore: dbPlayer.totalScore,
  });

  // Charger les joueurs depuis la base de données
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
      // Fallback sur localStorage en cas d'erreur
      loadFromLocalStorage();
    }
  };

  // Ajouter un joueur avec persistance en base
  const addPlayerAsync = async (name: string, totalShots: number) => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      const dbPlayer = await apiService.createPlayer(name);
      const player = convertDbPlayerToPlayer(dbPlayer);
      player.totalShots = totalShots; // Appliquer le nombre de tirs

      // Mettre à jour l'état local
      dispatch({ type: "ADD_PLAYER", payload: { name, totalShots } });
      // Recharger pour être sûr d'avoir l'état synchronisé
      await loadPlayersAsync();
    } catch (error) {
      console.error("Erreur lors de l'ajout du joueur:", error);
      dispatch({
        type: "SET_ERROR",
        payload: "Erreur lors de l'ajout du joueur",
      });
      // Fallback sur localStorage
      dispatch({ type: "ADD_PLAYER", payload: { name, totalShots } });
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
      // Fallback sur localStorage
      dispatch({ type: "REMOVE_PLAYER", payload: { id } });
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
      // Fallback sur localStorage
      dispatch({ type: "ADD_SCORE", payload: { playerId, score } });
    }
  };

  // Réinitialiser les scores d'un joueur avec persistance en base
  const resetPlayerScoresAsync = async (id: string) => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      await apiService.resetPlayerScores(id);
      dispatch({ type: "RESET_PLAYER_SCORES", payload: { id } });
      dispatch({ type: "SET_LOADING", payload: false });
    } catch (error) {
      console.error("Erreur lors de la réinitialisation des scores:", error);
      dispatch({
        type: "SET_ERROR",
        payload: "Erreur lors de la réinitialisation des scores",
      });
      // Fallback sur localStorage
      dispatch({ type: "RESET_PLAYER_SCORES", payload: { id } });
    }
  };

  // Charger depuis localStorage (fallback)
  const loadFromLocalStorage = () => {
    const saved = localStorage.getItem("donnees-tir-carabine");
    if (saved) {
      try {
        const parsedState = JSON.parse(saved);
        dispatch({ type: "LOAD_STATE", payload: parsedState });
      } catch (error) {
        console.error("Failed to load saved data:", error);
      }
    }
  };

  // Initialisation
  useEffect(() => {
    const initializeApp = async () => {
      if (isInitialized) return;

      try {
        // D'abord essayer de synchroniser depuis localStorage
        await apiService.syncFromLocalStorage();
        // Puis charger les données depuis la base
        await loadPlayersAsync();
      } catch (error) {
        console.error("Erreur lors de l'initialisation:", error);
        // Fallback sur localStorage
        loadFromLocalStorage();
      } finally {
        setIsInitialized(true);
      }
    };

    initializeApp();
  }, [isInitialized]);

  // Sauvegarder en localStorage en plus de la base (pour la compatibilité)
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem("donnees-tir-carabine", JSON.stringify(state));
    }
  }, [state, isInitialized]);

  return (
    <ScoringContext.Provider
      value={{
        state,
        dispatch,
        addPlayerAsync,
        removePlayerAsync,
        addScoreAsync,
        resetPlayerScoresAsync,
        loadPlayersAsync,
      }}
    >
      {children}
    </ScoringContext.Provider>
  );
}

export function useScoring() {
  const context = useContext(ScoringContext);
  if (!context) {
    throw new Error("useScoring must be used within a ScoringProvider");
  }
  return context;
}
