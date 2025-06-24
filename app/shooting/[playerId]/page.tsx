"use client"

import { useParams, useRouter } from "next/navigation"
import { useEffect, useState, useRef } from "react"
import { gsap } from "gsap"
import { ScoringProvider, useScoring } from "@/contexts/scoring-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Target, ArrowLeft, Home } from "lucide-react"

function ShootingPageContent() {
  const params = useParams()
  const router = useRouter()
  const { state, dispatch } = useScoring()
  const [scoreInput, setScoreInput] = useState("")
  const headerRef = useRef<HTMLDivElement>(null)
  const leftPanelRef = useRef<HTMLDivElement>(null)
  const rightPanelRef = useRef<HTMLDivElement>(null)
  const scoreButtonsRef = useRef<HTMLDivElement>(null)

  const playerId = params.playerId as string
  const player = state.players.find((p) => p.id === playerId)

  useEffect(() => {
    if (player) {
      dispatch({ type: "SET_CURRENT_PLAYER", payload: { id: player.id } })
    }
  }, [player, dispatch])

  useEffect(() => {
    // Animation d'entrée de la page
    const tl = gsap.timeline()

    tl.fromTo(headerRef.current, { y: -30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: "power2.out" })
      .fromTo(
        leftPanelRef.current,
        { x: -50, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.6, ease: "power2.out" },
        "-=0.3",
      )
      .fromTo(
        rightPanelRef.current,
        { x: 50, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.6, ease: "power2.out" },
        "-=0.6",
      )

    // Animation des boutons de score
    if (scoreButtonsRef.current) {
      const buttons = scoreButtonsRef.current.children
      gsap.fromTo(
        buttons,
        { scale: 0, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.3, stagger: 0.05, ease: "back.out(1.7)", delay: 0.8 },
      )
    }
  }, [])

  if (!player) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-8">
            <p className="text-gray-500 mb-4">Tireur non trouvé</p>
            <Button onClick={() => router.push("/")} variant="outline">
              <Home className="w-4 h-4 mr-2" />
              Retour à l'accueil
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const handleAddScore = () => {
    if (!scoreInput.trim()) return

    const score = Number.parseFloat(scoreInput)
    if (isNaN(score) || score < 0 || score > 10) return

    // Animation du score ajouté
    const inputElement = document.querySelector("[data-score-input]")
    if (inputElement) {
      gsap.to(inputElement, {
        scale: 1.1,
        duration: 0.1,
        yoyo: true,
        repeat: 1,
        ease: "power2.inOut",
      })
    }

    dispatch({
      type: "ADD_SCORE",
      payload: { playerId: player.id, score },
    })
    setScoreInput("")

    // Animation de célébration pour les bons scores
    if (score >= 9) {
      gsap.to(document.body, {
        backgroundColor: "#f0fdf4",
        duration: 0.3,
        yoyo: true,
        repeat: 1,
      })
    }

    // Si tous les tirs sont terminés, rediriger vers les résultats
    if (player.currentShot + 1 >= player.totalShots) {
      setTimeout(() => {
        router.push(`/results/${player.id}`)
      }, 1000)
    }
  }

  const handleQuickScore = (score: number) => {
    const button = document.querySelector(`[data-quick-score="${score}"]`)
    if (button) {
      gsap.to(button, {
        scale: 1.2,
        duration: 0.1,
        yoyo: true,
        repeat: 1,
        ease: "power2.inOut",
      })
    }

    dispatch({
      type: "ADD_SCORE",
      payload: { playerId: player.id, score },
    })

    // Animation de célébration pour les bons scores
    if (score >= 9) {
      gsap.to(document.body, {
        backgroundColor: "#f0fdf4",
        duration: 0.3,
        yoyo: true,
        repeat: 1,
      })
    } else if (score === 0) {
      gsap.to(document.body, {
        backgroundColor: "#fef2f2",
        duration: 0.3,
        yoyo: true,
        repeat: 1,
      })
    }

    // Si tous les tirs sont terminés, rediriger vers les résultats
    if (player.currentShot + 1 >= player.totalShots) {
      setTimeout(() => {
        router.push(`/results/${player.id}`)
      }, 1000)
    }
  }

  const canAddScore = player.currentShot < player.totalShots
  const completionPercentage = Math.round((player.currentShot / player.totalShots) * 100)

  // Prepare chart data
  const chartData = player.scores.map((score, index) => {
    const cumulativeScore = player.scores.slice(0, index + 1).reduce((sum, s) => sum + s, 0)
    return {
      shot: index + 1,
      score: score,
      cumulative: cumulativeScore,
      average: cumulativeScore / (index + 1),
    }
  })

  return (
    <div className="min-h-screen bg-gray-50 p-2 sm:p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div ref={headerRef} className="flex items-center gap-4 mb-6">
          <Button
            variant="outline"
            onClick={() => router.push("/")}
            size="sm"
            className="transition-all duration-200 hover:scale-105"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>
          <div className="flex-1">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">🎯 Session de Tir - {player.name}</h1>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Score Entry Panel */}
          <div ref={leftPanelRef} className="space-y-6">
            {/* Player Info */}
            <Card className="transition-all duration-300 hover:shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-blue-500" />
                  Informations du Tireur
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-blue-900 text-lg">{player.name}</span>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800 animate-pulse">
                      Tir {player.currentShot + 1}/{player.totalShots}
                    </Badge>
                  </div>
                  <div className="text-sm text-blue-700 mb-3">
                    Score Total: <span className="font-bold text-xl">{player.totalScore}</span>
                    {player.scores.length > 0 && (
                      <span className="ml-4">
                        Moyenne:{" "}
                        <span className="font-bold">{(player.totalScore / player.scores.length).toFixed(1)}</span>
                      </span>
                    )}
                  </div>
                  <Progress value={completionPercentage} className="h-2" />
                  <div className="text-xs text-blue-600 mt-1">{completionPercentage}% terminé</div>
                </div>
              </CardContent>
            </Card>

            {/* Score Entry */}
            <Card className="transition-all duration-300 hover:shadow-lg">
              <CardHeader>
                <CardTitle>Saisie du Score</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
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
                          className="text-lg transition-all duration-200 focus:scale-[1.02]"
                          autoFocus
                          data-score-input
                        />
                        <Button
                          onClick={handleAddScore}
                          disabled={!scoreInput.trim()}
                          size="lg"
                          className="transition-all duration-200 hover:scale-105"
                        >
                          Valider
                        </Button>
                      </div>
                    </div>

                    {/* Quick Score Buttons */}
                    <div className="space-y-3">
                      <div className="text-sm font-medium text-gray-700">Scores Rapides:</div>
                      <div ref={scoreButtonsRef} className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                        {[10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0].map((score) => (
                          <Button
                            key={score}
                            variant="outline"
                            size="lg"
                            onClick={() => handleQuickScore(score)}
                            data-quick-score={score}
                            className={`h-12 text-lg font-bold transition-all duration-200 hover:scale-110 ${
                              score >= 9
                                ? "border-green-500 text-green-700 hover:bg-green-50"
                                : score >= 7
                                  ? "border-yellow-500 text-yellow-700 hover:bg-yellow-50"
                                  : "border-red-500 text-red-700 hover:bg-red-50"
                            }`}
                          >
                            {score}
                          </Button>
                        ))}
                        <Button
                          variant="outline"
                          size="lg"
                          onClick={() => handleQuickScore(0)}
                          data-quick-score={0}
                          className="h-12 text-lg font-bold border-red-500 text-red-700 hover:bg-red-50 col-span-2 transition-all duration-200 hover:scale-110"
                        >
                          Raté
                        </Button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-green-600 text-xl font-bold mb-2 animate-bounce">🎉 Session Terminée !</div>
                    <p className="text-gray-600 mb-4">Tous les tirs ont été effectués</p>
                    <Button
                      onClick={() => router.push(`/results/${player.id}`)}
                      size="lg"
                      className="transition-all duration-200 hover:scale-105"
                    >
                      Voir les Résultats Détaillés
                    </Button>
                  </div>
                )}

                {/* Recent Scores */}
                {player.scores.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-gray-700">Scores de cette session:</div>
                    <div className="flex flex-wrap gap-2">
                      {player.scores.map((score, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className={`text-sm transition-all duration-200 hover:scale-110 ${
                            score >= 9
                              ? "bg-green-100 text-green-800 border-green-300"
                              : score >= 7
                                ? "bg-yellow-100 text-yellow-800 border-yellow-300"
                                : "bg-red-100 text-red-800 border-red-300"
                          }`}
                        >
                          #{index + 1}: {score}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Live Chart */}
          <div ref={rightPanelRef} className="space-y-6">
            <Card className="transition-all duration-300 hover:shadow-lg">
              <CardHeader>
                <CardTitle>Évolution en Temps Réel</CardTitle>
              </CardHeader>
              <CardContent>
                {chartData.length > 0 ? (
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="shot" label={{ value: "N° Tir", position: "insideBottom", offset: -5 }} />
                        <YAxis label={{ value: "Score", angle: -90, position: "insideLeft" }} domain={[0, 10]} />
                        <Tooltip
                          formatter={(value, name) => [
                            value,
                            name === "score" ? "Score du Tir" : name === "cumulative" ? "Score Total" : "Moyenne",
                          ]}
                          labelFormatter={(label) => `Tir ${label}`}
                        />
                        <Line
                          type="monotone"
                          dataKey="score"
                          stroke="#3b82f6"
                          strokeWidth={3}
                          dot={{ fill: "#3b82f6", strokeWidth: 2, r: 5 }}
                          name="score"
                        />
                        <Line
                          type="monotone"
                          dataKey="average"
                          stroke="#10b981"
                          strokeWidth={2}
                          strokeDasharray="5 5"
                          dot={false}
                          name="average"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-80 flex items-center justify-center text-gray-500">
                    <div className="text-center">
                      <Target className="w-16 h-16 mx-auto mb-4 text-gray-300 animate-pulse" />
                      <p>Commencez à tirer pour voir l'évolution</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            {player.scores.length > 0 && (
              <Card className="transition-all duration-300 hover:shadow-lg">
                <CardHeader>
                  <CardTitle>Statistiques Actuelles</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg transition-all duration-200 hover:scale-105">
                      <div className="text-2xl font-bold text-blue-600">{player.totalScore}</div>
                      <div className="text-xs text-gray-500">Total</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg transition-all duration-200 hover:scale-105">
                      <div className="text-2xl font-bold text-green-600">
                        {(player.totalScore / player.scores.length).toFixed(1)}
                      </div>
                      <div className="text-xs text-gray-500">Moyenne</div>
                    </div>
                    <div className="text-center p-3 bg-yellow-50 rounded-lg transition-all duration-200 hover:scale-105">
                      <div className="text-2xl font-bold text-yellow-600">{Math.max(...player.scores)}</div>
                      <div className="text-xs text-gray-500">Meilleur</div>
                    </div>
                    <div className="text-center p-3 bg-red-50 rounded-lg transition-all duration-200 hover:scale-105">
                      <div className="text-2xl font-bold text-red-600">{Math.min(...player.scores)}</div>
                      <div className="text-xs text-gray-500">Plus Faible</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ShootingPage() {
  return (
    <ScoringProvider>
      <ShootingPageContent />
    </ScoringProvider>
  )
}
