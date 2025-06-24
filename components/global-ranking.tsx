"use client"

import { useState, useEffect, useRef } from "react"
import { gsap } from "gsap"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { useScoring } from "@/contexts/scoring-context"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Trophy, Users, GitCompare, Target, Palette, X } from "lucide-react"
import { getPlayerColor } from "@/utils/colors"

export function GlobalRanking() {
  const { state } = useScoring()
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([])
  const headerRef = useRef<HTMLDivElement>(null)
  const rankingRef = useRef<HTMLDivElement>(null)
  const comparisonRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Animation d'entrée
    const tl = gsap.timeline()

    tl.fromTo(headerRef.current, { y: -30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: "power2.out" })
      .fromTo(
        rankingRef.current,
        { x: -50, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.6, ease: "power2.out" },
        "-=0.3",
      )
      .fromTo(
        comparisonRef.current,
        { x: 50, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.6, ease: "power2.out" },
        "-=0.6",
      )
  }, [])

  useEffect(() => {
    // Animation des cartes de joueurs
    if (rankingRef.current) {
      const playerCards = rankingRef.current.querySelectorAll("[data-player-card]")
      gsap.fromTo(
        playerCards,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4, stagger: 0.1, ease: "power2.out" },
      )
    }
  }, [state.players])

  const sortedPlayers = [...state.players].sort((a, b) => {
    // Sort by total score descending, then by completion percentage, then by average
    if (b.totalScore !== a.totalScore) {
      return b.totalScore - a.totalScore
    }
    const aCompletion = a.totalShots > 0 ? a.currentShot / a.totalShots : 0
    const bCompletion = b.totalShots > 0 ? b.currentShot / b.totalShots : 0
    if (bCompletion !== aCompletion) {
      return bCompletion - aCompletion
    }
    const aAverage = a.scores.length > 0 ? a.totalScore / a.scores.length : 0
    const bAverage = b.scores.length > 0 ? b.totalScore / b.scores.length : 0
    return bAverage - aAverage
  })

  const handlePlayerSelection = (playerId: string, checked: boolean) => {
    if (checked) {
      setSelectedPlayers([...selectedPlayers, playerId])

      // Animation de sélection
      const playerCard = document.querySelector(`[data-player-card="${playerId}"]`)
      if (playerCard) {
        gsap.to(playerCard, {
          scale: 1.02,
          duration: 0.2,
          yoyo: true,
          repeat: 1,
          ease: "power2.inOut",
        })
      }
    } else {
      setSelectedPlayers(selectedPlayers.filter((id) => id !== playerId))
    }
  }

  const handleRemovePlayer = (playerId: string) => {
    setSelectedPlayers(selectedPlayers.filter((id) => id !== playerId))

    // Animation de suppression
    const playerChip = document.querySelector(`[data-player-chip="${playerId}"]`)
    if (playerChip) {
      gsap.to(playerChip, {
        scale: 0,
        opacity: 0,
        duration: 0.2,
        ease: "power2.in",
      })
    }
  }

  const clearSelection = () => {
    // Animation de désélection
    selectedPlayers.forEach((playerId) => {
      const playerCard = document.querySelector(`[data-player-card="${playerId}"]`)
      if (playerCard) {
        gsap.to(playerCard, {
          scale: 0.98,
          duration: 0.2,
          yoyo: true,
          repeat: 1,
          ease: "power2.inOut",
        })
      }
    })

    setSelectedPlayers([])
  }

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

  const getPlayerStats = (player: any) => {
    const scores = player.scores
    if (scores.length === 0) return { best: 0, worst: 0, consistency: 0 }

    const best = Math.max(...scores)
    const worst = Math.min(...scores)
    const average = player.totalScore / scores.length
    const consistency =
      scores.length > 1
        ? Math.sqrt(scores.reduce((sum, score) => sum + Math.pow(score - average, 2), 0) / scores.length)
        : 0

    return { best, worst, consistency }
  }

  // Prepare comparison data for multiple players
  const comparisonData =
    selectedPlayers.length > 0
      ? (() => {
          const selectedPlayersData = selectedPlayers
            .map((id) => state.players.find((p) => p.id === id))
            .filter(Boolean)

          if (selectedPlayersData.length === 0) return null

          const maxShots = Math.max(...selectedPlayersData.map((p) => p.scores.length))

          return Array.from({ length: maxShots }, (_, index) => {
            const shotNumber = index + 1
            const dataPoint: any = { shot: shotNumber }

            selectedPlayersData.forEach((player) => {
              const cumulative = player.scores.slice(0, shotNumber).reduce((sum, s) => sum + s, 0)
              dataPoint[player.name] = player.scores[index] !== undefined ? cumulative : null
              dataPoint[`${player.name}_individual`] = player.scores[index] || null
            })

            return dataPoint
          })
        })()
      : null

  const selectedPlayersData = selectedPlayers.map((id) => state.players.find((p) => p.id === id)).filter(Boolean)

  return (
    <div className="space-y-6">
      {/* Header with selection info */}
      <Card ref={headerRef} className="transition-all duration-300 hover:shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              Classement Global
            </div>
            <div className="flex items-center gap-2">
              {selectedPlayers.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearSelection}
                  className="transition-all duration-200 hover:scale-105"
                >
                  Effacer sélection
                </Button>
              )}
              <Badge variant="secondary" className="animate-pulse">
                <Users className="w-4 h-4 mr-1" />
                {state.players.length} tireurs
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="text-sm text-gray-600">
              {selectedPlayers.length === 0 && "Sélectionnez des tireurs pour les comparer (nombre illimité)"}
              {selectedPlayers.length === 1 && "Ajoutez d'autres tireurs pour la comparaison"}
              {selectedPlayers.length > 1 && `Comparaison de ${selectedPlayers.length} tireurs active`}
            </div>

            {/* Selected Players Chips */}
            {selectedPlayers.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedPlayers.map((playerId, index) => {
                  const player = state.players.find((p) => p.id === playerId)
                  const color = getPlayerColor(index)

                  if (!player) return null

                  return (
                    <div
                      key={playerId}
                      data-player-chip={playerId}
                      className="flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 hover:scale-105"
                      style={{
                        backgroundColor: color.secondary,
                        color: color.primary,
                        border: `1px solid ${color.primary}20`,
                      }}
                    >
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color.primary }} />
                      <span className="truncate max-w-24">{player.name}</span>
                      <button
                        onClick={() => handleRemovePlayer(playerId)}
                        className="ml-1 hover:bg-white hover:bg-opacity-50 rounded-full p-0.5 transition-all duration-200"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Global Ranking */}
        <Card ref={rankingRef} className="transition-all duration-300 hover:shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              Classement Complet
            </CardTitle>
          </CardHeader>
          <CardContent>
            {sortedPlayers.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <Target className="w-16 h-16 mx-auto mb-4 text-gray-300 animate-bounce" />
                <p>Aucun tireur à afficher</p>
              </div>
            ) : (
              <div className="space-y-3">
                {sortedPlayers.map((player, index) => {
                  const completionPercentage =
                    player.totalShots > 0 ? Math.round((player.currentShot / player.totalShots) * 100) : 0
                  const averageScore = getAverageScore(player)
                  const stats = getPlayerStats(player)
                  const isSelected = selectedPlayers.includes(player.id)
                  const selectedIndex = selectedPlayers.indexOf(player.id)
                  const playerColor = isSelected ? getPlayerColor(selectedIndex) : null

                  return (
                    <div
                      key={player.id}
                      data-player-card={player.id}
                      className={`p-3 border rounded-lg transition-all duration-300 hover:shadow-md hover:scale-[1.01] ${
                        isSelected
                          ? "ring-2 ring-opacity-50"
                          : index === 0
                            ? "border-yellow-400 bg-yellow-50"
                            : index === 1
                              ? "border-gray-400 bg-gray-50"
                              : index === 2
                                ? "border-orange-400 bg-orange-50"
                                : "border-gray-200 hover:border-gray-300"
                      }`}
                      style={
                        isSelected
                          ? {
                              borderColor: playerColor?.primary,
                              backgroundColor: playerColor?.secondary,
                              ringColor: playerColor?.primary,
                            }
                          : {}
                      }
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={(checked) => handlePlayerSelection(player.id, checked as boolean)}
                          className="transition-all duration-200 hover:scale-110"
                        />
                        {isSelected && (
                          <div
                            className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                            style={{ backgroundColor: playerColor?.primary }}
                          />
                        )}
                        <span className="text-lg font-bold">{getRankIcon(index)}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium truncate">{player.name}</span>
                            {player.id === state.currentPlayerId && (
                              <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs animate-pulse">
                                <Target className="w-3 h-3 mr-1" />
                                En cours
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-gray-600">
                            {player.currentShot}/{player.totalShots} tirs • {completionPercentage}% terminé
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-bold text-gray-900">{player.totalScore}</div>
                          <div className="text-xs text-gray-500">points</div>
                        </div>
                      </div>

                      <div className="grid grid-cols-4 gap-3 text-sm">
                        <div className="text-center p-2 bg-blue-50 rounded transition-all duration-200 hover:scale-105">
                          <div className="font-medium text-blue-600">{averageScore.toFixed(1)}</div>
                          <div className="text-xs text-gray-500">Moyenne</div>
                        </div>
                        <div className="text-center p-2 bg-green-50 rounded transition-all duration-200 hover:scale-105">
                          <div className="font-medium text-green-600">{stats.best}</div>
                          <div className="text-xs text-gray-500">Meilleur</div>
                        </div>
                        <div className="text-center p-2 bg-red-50 rounded transition-all duration-200 hover:scale-105">
                          <div className="font-medium text-red-600">{stats.worst || "-"}</div>
                          <div className="text-xs text-gray-500">Pire</div>
                        </div>
                        <div className="text-center p-2 bg-purple-50 rounded transition-all duration-200 hover:scale-105">
                          <div className="font-medium text-purple-600">{stats.consistency.toFixed(1)}</div>
                          <div className="text-xs text-gray-500">Régularité</div>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="mt-3">
                        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                          <div
                            className="h-2 rounded-full transition-all duration-500 ease-out"
                            style={{
                              width: `${completionPercentage}%`,
                              backgroundColor: isSelected
                                ? playerColor?.primary
                                : index === 0
                                  ? "#eab308"
                                  : index === 1
                                    ? "#6b7280"
                                    : index === 2
                                      ? "#f97316"
                                      : "#9ca3af",
                            }}
                          />
                        </div>
                      </div>

                      {/* Recent scores */}
                      {player.scores.length > 0 && (
                        <div className="mt-2">
                          <div className="flex flex-wrap gap-1">
                            {player.scores.slice(-6).map((score, idx) => (
                              <Badge
                                key={idx}
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
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Comparison Panel */}
        <div ref={comparisonRef} className="space-y-6">
          {selectedPlayers.length > 0 ? (
            <>
              {/* Multi-Player Comparison Stats */}
              <Card className="transition-all duration-300 hover:shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GitCompare className="w-5 h-5 text-purple-500" />
                    Comparaison Multi-Joueurs
                    <Badge variant="secondary" className="ml-2">
                      <Palette className="w-3 h-3 mr-1" />
                      {selectedPlayers.length} joueurs
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Players Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {selectedPlayersData.map((player, idx) => {
                      const color = getPlayerColor(idx)
                      const averageScore = player.scores.length > 0 ? player.totalScore / player.scores.length : 0

                      return (
                        <div
                          key={player.id}
                          className="p-3 border rounded-lg transition-all duration-200 hover:scale-105"
                          style={{
                            borderColor: color.primary + "40",
                            backgroundColor: color.secondary,
                          }}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: color.primary }} />
                            <span className="font-medium text-sm truncate" style={{ color: color.primary }}>
                              {player.name}
                            </span>
                          </div>
                          <div className="grid grid-cols-3 gap-2 text-xs">
                            <div className="text-center">
                              <div className="font-bold text-lg" style={{ color: color.primary }}>
                                {player.totalScore}
                              </div>
                              <div className="text-gray-500">Total</div>
                            </div>
                            <div className="text-center">
                              <div className="font-bold text-lg" style={{ color: color.primary }}>
                                {averageScore.toFixed(1)}
                              </div>
                              <div className="text-gray-500">Moy</div>
                            </div>
                            <div className="text-center">
                              <div className="font-bold text-lg" style={{ color: color.primary }}>
                                {player.scores.length}
                              </div>
                              <div className="text-gray-500">Tirs</div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Ranking within selection */}
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2 text-sm">Classement de la Sélection:</h4>
                    <div className="space-y-1">
                      {[...selectedPlayersData]
                        .sort((a, b) => b.totalScore - a.totalScore)
                        .map((player, idx) => {
                          const originalIndex = selectedPlayers.indexOf(player.id)
                          const color = getPlayerColor(originalIndex)

                          return (
                            <div key={player.id} className="flex items-center gap-2 text-sm">
                              <span className="font-bold w-6">{getRankIcon(idx)}</span>
                              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color.primary }} />
                              <span className="flex-1 truncate">{player.name}</span>
                              <span className="font-bold" style={{ color: color.primary }}>
                                {player.totalScore}
                              </span>
                            </div>
                          )
                        })}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Multi-Player Comparison Chart */}
              {comparisonData && (
                <Card className="transition-all duration-300 hover:shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-base">Évolution Comparative des Scores</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={comparisonData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis
                            dataKey="shot"
                            label={{ value: "N° Tir", position: "insideBottom", offset: -5 }}
                            tick={{ fontSize: 12 }}
                          />
                          <YAxis
                            label={{ value: "Score Cumulé", angle: -90, position: "insideLeft" }}
                            tick={{ fontSize: 12 }}
                          />
                          <Tooltip
                            formatter={(value, name) => [value, name]}
                            labelFormatter={(label) => `Après Tir ${label}`}
                          />
                          {selectedPlayersData.map((player, idx) => {
                            const color = getPlayerColor(idx)
                            return (
                              <Line
                                key={player.id}
                                type="monotone"
                                dataKey={player.name}
                                stroke={color.primary}
                                strokeWidth={3}
                                dot={{ fill: color.primary, strokeWidth: 2, r: 4 }}
                                connectNulls={false}
                              />
                            )
                          })}
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Individual Scores Comparison */}
              {selectedPlayersData.length > 1 && (
                <Card className="transition-all duration-300 hover:shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-base">Comparaison Tir par Tir</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 max-h-60 overflow-y-auto">
                      {Array.from(
                        { length: Math.max(...selectedPlayersData.map((p) => p.scores.length)) },
                        (_, shotIndex) => (
                          <div key={shotIndex} className="p-2 border rounded-lg bg-gray-50">
                            <div className="font-medium text-sm mb-2">Tir #{shotIndex + 1}</div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                              {selectedPlayersData.map((player, playerIndex) => {
                                const color = getPlayerColor(playerIndex)
                                const score = player.scores[shotIndex]

                                return (
                                  <div key={player.id} className="flex items-center gap-2 text-sm">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color.primary }} />
                                    <span className="truncate flex-1">{player.name}</span>
                                    <Badge
                                      variant="outline"
                                      className={`text-xs ${
                                        score === undefined
                                          ? "bg-gray-100 text-gray-500"
                                          : score >= 9
                                            ? "bg-green-100 text-green-800 border-green-300"
                                            : score >= 7
                                              ? "bg-yellow-100 text-yellow-800 border-yellow-300"
                                              : "bg-red-100 text-red-800 border-red-300"
                                      }`}
                                    >
                                      {score !== undefined ? score : "-"}
                                    </Badge>
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        ),
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <Card className="transition-all duration-300 hover:shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GitCompare className="w-5 h-5 text-gray-400" />
                  Comparaison Multi-Joueurs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center text-gray-500 py-12">
                  <div className="flex justify-center mb-4">
                    <Palette className="w-12 h-12 text-gray-300 animate-pulse" />
                  </div>
                  <p className="text-sm">
                    Sélectionnez des tireurs dans le classement
                    <br />
                    pour voir leur comparaison détaillée
                  </p>
                  <p className="text-xs text-gray-400 mt-2">Nombre illimité de joueurs supporté</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
