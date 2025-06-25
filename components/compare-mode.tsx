"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useScoring } from "@/contexts/scoring-context"
import { SimpleLineChart } from "@/components/simple-charts"
import { GitCompare, TrendingUp, TrendingDown, Palette } from "lucide-react"
import { getPlayerColorByIndex } from "@/utils/colors"

export function CompareMode() {
  const { state } = useScoring()

  const currentPlayer = state.players.find((p) => p.id === state.currentPlayerId)
  const topScorer = state.players.find((p) => p.id === state.topScorerId)

  if (
    !currentPlayer ||
    !topScorer ||
    currentPlayer.id === topScorer.id ||
    currentPlayer.scores.length === 0 ||
    topScorer.scores.length === 0
  ) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
            <GitCompare className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500" />
            Mode Comparaison
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-500 py-8 text-sm">
            {!currentPlayer || !topScorer
              ? "Besoin d'un tireur actuel et d'un meilleur tireur"
              : currentPlayer.id === topScorer.id
                ? "Le tireur actuel est déjà le meilleur !"
                : "Besoin de scores des deux tireurs pour comparer"}
          </div>
        </CardContent>
      </Card>
    )
  }

  // Get colors for the two players
  const currentPlayerColor = getPlayerColorByIndex(state.players, currentPlayer.id)
  const topScorerColor = getPlayerColorByIndex(state.players, topScorer.id)

  // Prepare comparison data
  const maxShots = Math.max(currentPlayer.scores.length, topScorer.scores.length)
  const chartData = Array.from({ length: maxShots }, (_, index) => {
    const shotNumber = index + 1

    const currentCumulative = currentPlayer.scores.slice(0, shotNumber).reduce((sum, s) => sum + s, 0)
    const topCumulative = topScorer.scores.slice(0, shotNumber).reduce((sum, s) => sum + s, 0)

    return {
      shot: shotNumber,
      currentScore: currentPlayer.scores[index] || null,
      topScore: topScorer.scores[index] || null,
      currentCumulative: currentPlayer.scores[index] !== undefined ? currentCumulative : null,
      topCumulative: topScorer.scores[index] !== undefined ? topCumulative : null,
      currentAverage: currentPlayer.scores[index] !== undefined ? currentCumulative / shotNumber : null,
      topAverage: topScorer.scores[index] !== undefined ? topCumulative / shotNumber : null,
    }
  })

  // Calculate comparison stats
  const currentAverage = currentPlayer.totalScore / currentPlayer.scores.length
  const topAverage = topScorer.totalScore / topScorer.scores.length
  const scoreDifference = currentPlayer.totalScore - topScorer.totalScore
  const averageDifference = currentAverage - topAverage

  // Find common shots for direct comparison
  const commonShots = Math.min(currentPlayer.scores.length, topScorer.scores.length)
  let betterShots = 0
  let equalShots = 0

  for (let i = 0; i < commonShots; i++) {
    if (currentPlayer.scores[i] > topScorer.scores[i]) betterShots++
    else if (currentPlayer.scores[i] === topScorer.scores[i]) equalShots++
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
          <GitCompare className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500" />
          <span className="truncate">
            Comparaison: {currentPlayer.name} vs {topScorer.name}
          </span>
          <Badge variant="secondary" className="ml-2">
            <Palette className="w-3 h-3 mr-1" />
            Coloré
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Comparison Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div
            className="p-2 sm:p-3 border rounded-lg transition-all duration-200 hover:scale-105"
            style={{
              borderColor: currentPlayerColor.primary + "40",
              backgroundColor: currentPlayerColor.secondary,
            }}
          >
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: currentPlayerColor.primary }} />
                <div className="text-xs sm:text-sm text-gray-600 truncate">{currentPlayer.name}</div>
              </div>
              <div className="text-xl sm:text-2xl font-bold" style={{ color: currentPlayerColor.primary }}>
                {currentPlayer.totalScore}
              </div>
              <div className="text-xs text-gray-500">
                Moy: {currentAverage.toFixed(1)} | {currentPlayer.scores.length} tirs
              </div>
            </div>
          </div>
          <div
            className="p-2 sm:p-3 border rounded-lg transition-all duration-200 hover:scale-105"
            style={{
              borderColor: topScorerColor.primary + "40",
              backgroundColor: topScorerColor.secondary,
            }}
          >
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: topScorerColor.primary }} />
                <div className="text-xs sm:text-sm text-gray-600 truncate">{topScorer.name}</div>
              </div>
              <div className="text-xl sm:text-2xl font-bold" style={{ color: topScorerColor.primary }}>
                {topScorer.totalScore}
              </div>
              <div className="text-xs text-gray-500">
                Moy: {topAverage.toFixed(1)} | {topScorer.scores.length} tirs
              </div>
            </div>
          </div>
        </div>

        {/* Difference Indicators */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center">
          <div className="p-2 rounded-lg bg-gray-50 transition-all duration-200 hover:scale-105">
            <div className={`text-sm sm:text-lg font-bold ${scoreDifference >= 0 ? "text-green-600" : "text-red-600"}`}>
              {scoreDifference >= 0 ? "+" : ""}
              {scoreDifference}
            </div>
            <div className="text-xs text-gray-500">Diff Score</div>
          </div>
          <div className="p-2 rounded-lg bg-gray-50 transition-all duration-200 hover:scale-105">
            <div
              className={`text-sm sm:text-lg font-bold ${averageDifference >= 0 ? "text-green-600" : "text-red-600"}`}
            >
              {averageDifference >= 0 ? "+" : ""}
              {averageDifference.toFixed(1)}
            </div>
            <div className="text-xs text-gray-500">Diff Moy</div>
          </div>
          <div className="p-2 rounded-lg bg-gray-50 transition-all duration-200 hover:scale-105">
            <div className="text-sm sm:text-lg font-bold text-purple-600">
              {betterShots}/{commonShots}
            </div>
            <div className="text-xs text-gray-500">Meilleurs</div>
          </div>
        </div>

        {/* Performance Badge */}
        <div className="flex justify-center">
          <Badge
            variant="outline"
            className={`text-xs transition-all duration-200 hover:scale-105 ${
              scoreDifference > 0
                ? "bg-green-100 text-green-800 border-green-300"
                : scoreDifference === 0
                  ? "bg-yellow-100 text-yellow-800 border-yellow-300"
                  : "bg-red-100 text-red-800 border-red-300"
            }`}
          >
            {scoreDifference > 0 ? (
              <>
                <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                En tête de {scoreDifference} points
              </>
            ) : scoreDifference === 0 ? (
              <>🤝 Égalité</>
            ) : (
              <>
                <TrendingDown className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                Retard de {Math.abs(scoreDifference)} points
              </>
            )}
          </Badge>
        </div>

        {/* Comparison Chart */}
        <div className="h-48 sm:h-64">
          <SimpleLineChart
            data={chartData}
            lines={[
              {
                dataKey: "currentCumulative",
                stroke: currentPlayerColor.primary,
                name: `${currentPlayer.name} Total`,
                strokeWidth: 2,
                dots: true
              },
              {
                dataKey: "topCumulative", 
                stroke: topScorerColor.primary,
                name: `${topScorer.name} Total`,
                strokeWidth: 2,
                dots: true
              },
              {
                dataKey: "currentAverage",
                stroke: currentPlayerColor.primary,
                name: `${currentPlayer.name} Moy`,
                strokeWidth: 1,
                strokeDasharray: "5,5",
                dots: false
              },
              {
                dataKey: "topAverage",
                stroke: topScorerColor.primary, 
                name: `${topScorer.name} Moy`,
                strokeWidth: 1,
                strokeDasharray: "5,5",
                dots: false
              }
            ]}
            xAxisKey="shot"
            xAxisLabel="N° Tir"
            yAxisLabel="Score Cumulé"
            tooltipFormatter={(label: string) => `Après Tir ${label}`}
          />
        </div>

        {/* Shot-by-Shot Comparison */}
        {commonShots > 0 && (
          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-700">Comparaison Tir par Tir:</div>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {Array.from({ length: Math.min(commonShots, 10) }, (_, i) => (
                <div key={i} className="text-center p-2 border rounded">
                  <div className="text-xs text-gray-500">#{i + 1}</div>
                  <div className="flex justify-between text-xs sm:text-sm items-center">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: currentPlayerColor.primary }} />
                      <span
                        className={`${
                          currentPlayer.scores[i] > topScorer.scores[i]
                            ? "font-bold"
                            : currentPlayer.scores[i] === topScorer.scores[i]
                              ? "text-yellow-600"
                              : "text-red-600"
                        }`}
                        style={{
                          color: currentPlayer.scores[i] > topScorer.scores[i] ? currentPlayerColor.primary : undefined,
                        }}
                      >
                        {currentPlayer.scores[i]}
                      </span>
                    </div>
                    <span className="text-gray-400 text-xs">vs</span>
                    <div className="flex items-center gap-1">
                      <span
                        className={`${
                          topScorer.scores[i] > currentPlayer.scores[i]
                            ? "font-bold"
                            : topScorer.scores[i] === currentPlayer.scores[i]
                              ? "text-yellow-600"
                              : "text-red-600"
                        }`}
                        style={{
                          color: topScorer.scores[i] > currentPlayer.scores[i] ? topScorerColor.primary : undefined,
                        }}
                      >
                        {topScorer.scores[i]}
                      </span>
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: topScorerColor.primary }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
