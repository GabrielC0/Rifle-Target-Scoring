"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useScoring } from "@/contexts/scoring-context"
import { Target, Plus } from "lucide-react"

export function ScoreEntry() {
  const { state, dispatch, addScoreAsync } = useScoring()
  const [scoreInput, setScoreInput] = useState("")

  const currentPlayer = state.players.find((p) => p.id === state.currentPlayerId)

  const handleAddScore = async () => {
    if (!currentPlayer || !scoreInput.trim()) return

    const score = Number.parseFloat(scoreInput)
    if (isNaN(score) || score < 0 || score > 10) return

    try {
      await addScoreAsync(currentPlayer.id, score)
      setScoreInput("")
    } catch (error) {
      console.error('Erreur lors de l\'ajout du score:', error)
      // Fallback sur dispatch en cas d'erreur
      dispatch({
        type: "ADD_SCORE",
        payload: { playerId: currentPlayer.id, score },
      })
      setScoreInput("")
    }
  }

  const handleQuickScore = async (score: number) => {
    if (!currentPlayer) return

    try {
      await addScoreAsync(currentPlayer.id, score)
    } catch (error) {
      console.error('Erreur lors de l\'ajout du score:', error)
      // Fallback sur dispatch en cas d'erreur
      dispatch({
        type: "ADD_SCORE",
        payload: { playerId: currentPlayer.id, score },
      })
    }
  }

  if (!currentPlayer) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
            <Target className="w-4 h-4 sm:w-5 sm:h-5" />
            Saisie des Scores
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-500 py-8 text-sm">Sélectionnez un tireur pour commencer à scorer</div>
        </CardContent>
      </Card>
    )
  }

  const canAddScore = currentPlayer.currentShot < currentPlayer.totalShots

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
          <Target className="w-4 h-4 sm:w-5 sm:h-5" />
          Saisie des Scores
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Player Info */}
        <div className="p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium text-blue-900 text-sm sm:text-base truncate">{currentPlayer.name}</span>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs">
              Tir {currentPlayer.currentShot + 1}/{currentPlayer.totalShots}
            </Badge>
          </div>
          <div className="text-sm text-blue-700">
            Total Actuel: <span className="font-bold">{currentPlayer.totalScore}</span>
          </div>
        </div>

        {canAddScore ? (
          <>
            {/* Manual Score Entry */}
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
                  onKeyPress={(e) => e.key === "Enter" && handleAddScore()}
                  className="text-sm"
                />
                <Button onClick={handleAddScore} disabled={!scoreInput.trim()}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Quick Score Buttons */}
            <div className="space-y-2">
              <div className="text-sm font-medium text-gray-700">Scores Rapides:</div>
              <div className="grid grid-cols-5 sm:grid-cols-6 gap-1 sm:gap-2">
                {[10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0].map((score) => (
                  <Button
                    key={score}
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickScore(score)}
                    className="h-8 sm:h-10 text-xs sm:text-sm"
                  >
                    {score}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickScore(0)}
                  className="h-8 sm:h-10 text-xs sm:text-sm text-red-600 col-span-1"
                >
                  Raté
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center text-gray-500 py-4 text-sm">Tous les tirs terminés pour {currentPlayer.name}</div>
        )}

        {/* Recent Scores */}
        {currentPlayer.scores.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-700">Scores Récents:</div>
            <div className="flex flex-wrap gap-1">
              {currentPlayer.scores.slice(-10).map((score, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className={`text-xs ${
                    score >= 9
                      ? "bg-green-100 text-green-800"
                      : score >= 7
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                  }`}
                >
                  {score}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
