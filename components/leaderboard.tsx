"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useScoring } from "@/contexts/scoring-context"
import { Trophy, Target } from "lucide-react"

export function Leaderboard() {
  const { state } = useScoring()

  const sortedPlayers = [...state.players].sort((a, b) => {
    // Sort by total score descending, then by completion percentage
    if (b.totalScore !== a.totalScore) {
      return b.totalScore - a.totalScore
    }
    const aCompletion = a.totalShots > 0 ? a.currentShot / a.totalShots : 0
    const bCompletion = b.totalShots > 0 ? b.currentShot / b.totalShots : 0
    return bCompletion - aCompletion
  })

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return "🥇"
      case 1:
        return "🥈"
      case 2:
        return "🥉"
      default:
        return `#${index + 1}`
    }
  }

  const getAverageScore = (player: any) => {
    if (player.scores.length === 0) return 0
    return player.totalScore / player.scores.length
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
          <Trophy className="w-4 h-4 sm:w-5 sm:h-5" />
          Classement en Direct
        </CardTitle>
      </CardHeader>
      <CardContent>
        {sortedPlayers.length === 0 ? (
          <div className="text-center text-gray-500 py-4 text-sm">Aucun tireur à afficher</div>
        ) : (
          <div className="space-y-2 sm:space-y-3">
            {sortedPlayers.map((player, index) => {
              const completionPercentage =
                player.totalShots > 0 ? Math.round((player.currentShot / player.totalShots) * 100) : 0
              const averageScore = getAverageScore(player)

              return (
                <div
                  key={player.id}
                  className={`p-2 sm:p-3 border rounded-lg ${
                    index === 0
                      ? "border-yellow-400 bg-yellow-50"
                      : index === 1
                        ? "border-gray-400 bg-gray-50"
                        : index === 2
                          ? "border-orange-400 bg-orange-50"
                          : "border-gray-200"
                  } ${player.id === state.currentPlayerId ? "ring-2 ring-blue-300" : ""}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <span className="text-sm sm:text-lg font-bold">{getRankIcon(index)}</span>
                      <span className="font-medium text-sm sm:text-base truncate">{player.name}</span>
                      {player.id === state.currentPlayerId && (
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs">
                          <Target className="w-3 h-3 mr-1" />
                          Actif
                        </Badge>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-900">{player.totalScore}</div>
                      <div className="text-xs text-gray-500">Points</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 sm:gap-4 text-xs sm:text-sm">
                    <div className="text-center">
                      <div className="font-medium text-gray-900">
                        {player.currentShot}/{player.totalShots}
                      </div>
                      <div className="text-xs text-gray-500">Tirs</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-gray-900">{averageScore.toFixed(1)}</div>
                      <div className="text-xs text-gray-500">Moy</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-gray-900">{completionPercentage}%</div>
                      <div className="text-xs text-gray-500">Fini</div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2">
                      <div
                        className={`h-1.5 sm:h-2 rounded-full transition-all duration-300 ${
                          index === 0
                            ? "bg-yellow-500"
                            : index === 1
                              ? "bg-gray-500"
                              : index === 2
                                ? "bg-orange-500"
                                : "bg-blue-500"
                        }`}
                        style={{ width: `${completionPercentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
