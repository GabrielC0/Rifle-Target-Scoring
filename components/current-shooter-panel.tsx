"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useScoring } from "@/contexts/scoring-context"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Target, Activity } from "lucide-react"

export function CurrentShoterPanel() {
  const { state } = useScoring()

  const currentPlayer = state.players.find((p) => p.id === state.currentPlayerId)

  if (!currentPlayer) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
            <Target className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
            Tireur Actuel
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-500 py-8 text-sm">Aucun tireur actif sélectionné</div>
        </CardContent>
      </Card>
    )
  }

  if (currentPlayer.scores.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
            <Target className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
            <span className="truncate">Actuel: {currentPlayer.name}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-500 py-8 text-sm">
            Prêt à commencer !<div className="mt-2 text-xs">{currentPlayer.totalShots} tirs prévus</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Prepare chart data with cumulative scores
  const chartData = currentPlayer.scores.map((score, index) => {
    const cumulativeScore = currentPlayer.scores.slice(0, index + 1).reduce((sum, s) => sum + s, 0)
    return {
      shot: index + 1,
      score: score,
      cumulative: cumulativeScore,
      average: cumulativeScore / (index + 1),
    }
  })

  const averageScore = currentPlayer.totalScore / currentPlayer.scores.length
  const lastShot = currentPlayer.scores[currentPlayer.scores.length - 1]
  const trend =
    currentPlayer.scores.length >= 3
      ? currentPlayer.scores.slice(-3).reduce((sum, score) => sum + score, 0) / 3
      : averageScore

  const completionPercentage = Math.round((currentPlayer.currentShot / currentPlayer.totalShots) * 100)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
          <Target className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
          <span className="truncate">Actuel: {currentPlayer.name}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
          <div className="text-center">
            <div className="text-lg sm:text-2xl font-bold text-blue-600">{currentPlayer.totalScore}</div>
            <div className="text-xs text-gray-500">Total</div>
          </div>
          <div className="text-center">
            <div className="text-lg sm:text-2xl font-bold text-green-600">{averageScore.toFixed(1)}</div>
            <div className="text-xs text-gray-500">Moyenne</div>
          </div>
          <div className="text-center">
            <div className="text-lg sm:text-2xl font-bold text-purple-600">{lastShot}</div>
            <div className="text-xs text-gray-500">Dernier</div>
          </div>
          <div className="text-center">
            <div className="text-lg sm:text-2xl font-bold text-orange-600">{trend.toFixed(1)}</div>
            <div className="text-xs text-gray-500">Tendance</div>
          </div>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm text-gray-600">
              Tir {currentPlayer.currentShot}/{currentPlayer.totalShots}
            </span>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs">
              <Activity className="w-3 h-3 mr-1" />
              {completionPercentage}% Fini
            </Badge>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2">
            <div
              className="bg-blue-500 h-1.5 sm:h-2 rounded-full transition-all duration-300"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>

        {/* Chart */}
        <div className="h-48 sm:h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="shot"
                label={{ value: "N° Tir", position: "insideBottom", offset: -5 }}
                tick={{ fontSize: 12 }}
              />
              <YAxis
                label={{ value: "Score", angle: -90, position: "insideLeft" }}
                domain={[0, 10]}
                tick={{ fontSize: 12 }}
              />
              <Tooltip
                formatter={(value, name) => [
                  value,
                  name === "score" ? "Score Tir" : name === "cumulative" ? "Score Total" : "Moyenne",
                ]}
                labelFormatter={(label) => `Tir ${label}`}
              />
              <Line
                type="monotone"
                dataKey="score"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: "#3b82f6", strokeWidth: 2, r: 3 }}
                name="score"
              />
              <Line
                type="monotone"
                dataKey="average"
                stroke="#10b981"
                strokeWidth={1}
                strokeDasharray="5 5"
                dot={false}
                name="average"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Performance Indicator */}
        <div className="p-2 sm:p-3 rounded-lg bg-gray-50">
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-medium">Performance</span>
            <Badge
              variant="outline"
              className={`text-xs ${
                averageScore >= 8
                  ? "bg-green-100 text-green-800 border-green-300"
                  : averageScore >= 6
                    ? "bg-yellow-100 text-yellow-800 border-yellow-300"
                    : "bg-red-100 text-red-800 border-red-300"
              }`}
            >
              {averageScore >= 8 ? "🎯 Excellent" : averageScore >= 6 ? "👍 Bien" : "📈 En progrès"}
            </Badge>
          </div>
        </div>

        {/* Next Shot Prediction */}
        {currentPlayer.currentShot < currentPlayer.totalShots && (
          <div className="text-center text-xs sm:text-sm text-gray-600">
            Prochain tir: #{currentPlayer.currentShot + 1}
            {trend > averageScore && <span className="text-green-600 ml-2">📈 En hausse !</span>}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
