"use client"

import type React from "react"
import { createContext, useContext, useReducer, useEffect } from "react"

export interface Player {
  id: string
  name: string
  totalShots: number
  currentShot: number
  scores: number[]
  totalScore: number
}

interface ScoringState {
  players: Player[]
  currentPlayerId: string | null
  topScorerId: string | null
}

type ScoringAction =
  | { type: "ADD_PLAYER"; payload: { name: string; totalShots: number } }
  | { type: "REMOVE_PLAYER"; payload: { id: string } }
  | { type: "SET_CURRENT_PLAYER"; payload: { id: string } }
  | { type: "ADD_SCORE"; payload: { playerId: string; score: number } }
  | { type: "UPDATE_PLAYER_SHOTS"; payload: { id: string; totalShots: number } }
  | { type: "RESET_PLAYER_SCORES"; payload: { id: string } }
  | { type: "LOAD_STATE"; payload: ScoringState }

const initialState: ScoringState = {
  players: [],
  currentPlayerId: null,
  topScorerId: null,
}

function scoringReducer(state: ScoringState, action: ScoringAction): ScoringState {
  switch (action.type) {
    case "ADD_PLAYER": {
      const newPlayer: Player = {
        id: Date.now().toString(),
        name: action.payload.name,
        totalShots: action.payload.totalShots,
        currentShot: 0,
        scores: [],
        totalScore: 0,
      }
      const newState = {
        ...state,
        players: [...state.players, newPlayer],
      }
      return updateTopScorer(newState)
    }

    case "REMOVE_PLAYER": {
      const newState = {
        ...state,
        players: state.players.filter((p) => p.id !== action.payload.id),
        currentPlayerId: state.currentPlayerId === action.payload.id ? null : state.currentPlayerId,
      }
      return updateTopScorer(newState)
    }

    case "SET_CURRENT_PLAYER":
      return {
        ...state,
        currentPlayerId: action.payload.id,
      }

    case "ADD_SCORE": {
      const newState = {
        ...state,
        players: state.players.map((player) => {
          if (player.id === action.payload.playerId && player.currentShot < player.totalShots) {
            const newScores = [...player.scores, action.payload.score]
            const newCurrentShot = Math.min(player.currentShot + 1, player.totalShots)
            return {
              ...player,
              scores: newScores,
              currentShot: newCurrentShot,
              totalScore: newScores.reduce((sum, score) => sum + score, 0),
            }
          }
          return player
        }),
      }
      return updateTopScorer(newState)
    }

    case "UPDATE_PLAYER_SHOTS": {
      const newState = {
        ...state,
        players: state.players.map((player) => {
          if (player.id === action.payload.id) {
            const newTotalShots = action.payload.totalShots
            const newScores = player.scores.slice(0, newTotalShots)
            return {
              ...player,
              totalShots: newTotalShots,
              scores: newScores,
              currentShot: Math.min(player.currentShot, newTotalShots),
              totalScore: newScores.reduce((sum, score) => sum + score, 0),
            }
          }
          return player
        }),
      }
      return updateTopScorer(newState)
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
            }
          }
          return player
        }),
      }
      return updateTopScorer(newState)
    }

    case "LOAD_STATE":
      return action.payload

    default:
      return state
  }
}

function updateTopScorer(state: ScoringState): ScoringState {
  const topScorer = state.players.reduce(
    (top, player) => {
      if (!top || player.totalScore > top.totalScore) {
        return player
      }
      return top
    },
    null as Player | null,
  )

  return {
    ...state,
    topScorerId: topScorer?.id || null,
  }
}

const ScoringContext = createContext<{
  state: ScoringState
  dispatch: React.Dispatch<ScoringAction>
} | null>(null)

export function ScoringProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(scoringReducer, initialState)

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("donnees-tir-carabine")
    if (saved) {
      try {
        const parsedState = JSON.parse(saved)
        dispatch({ type: "LOAD_STATE", payload: parsedState })
      } catch (error) {
        console.error("Failed to load saved data:", error)
      }
    }
  }, [])

  // Save to localStorage on state changes
  useEffect(() => {
    localStorage.setItem("donnees-tir-carabine", JSON.stringify(state))
  }, [state])

  return <ScoringContext.Provider value={{ state, dispatch }}>{children}</ScoringContext.Provider>
}

export function useScoring() {
  const context = useContext(ScoringContext)
  if (!context) {
    throw new Error("useScoring must be used within a ScoringProvider")
  }
  return context
}
