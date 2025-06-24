"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { gsap } from "gsap"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useScoring } from "@/contexts/scoring-context"
import { UserPlus, Trash2, Target, RotateCcw, BarChart3 } from "lucide-react"

export function PlayerManagement() {
  const router = useRouter()
  const { state, dispatch } = useScoring()
  const [newPlayerName, setNewPlayerName] = useState("")
  const [newPlayerShots, setNewPlayerShots] = useState(10)
  const cardRef = useRef<HTMLDivElement>(null)
  const playersRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Animation d'entrée de la carte
    gsap.fromTo(
      cardRef.current,
      { scale: 0.9, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.6, ease: "back.out(1.7)" },
    )
  }, [])

  useEffect(() => {
    // Animation des joueurs quand la liste change
    if (playersRef.current) {
      const playerCards = playersRef.current.children
      gsap.fromTo(
        playerCards,
        { x: -30, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.5, stagger: 0.1, ease: "power2.out" },
      )
    }
  }, [state.players.length])

  const handleAddPlayer = () => {
    if (newPlayerName.trim()) {
      dispatch({
        type: "ADD_PLAYER",
        payload: { name: newPlayerName.trim(), totalShots: newPlayerShots },
      })
      setNewPlayerName("")

      // Animation du bouton d'ajout
      const addButton = document.querySelector("[data-add-button]")
      if (addButton) {
        gsap.to(addButton, {
          scale: 1.1,
          duration: 0.1,
          yoyo: true,
          repeat: 1,
          ease: "power2.inOut",
        })
      }
    }
  }

  const handleRemovePlayer = (id: string) => {
    const playerCard = document.querySelector(`[data-player-id="${id}"]`)
    if (playerCard) {
      gsap.to(playerCard, {
        x: 100,
        opacity: 0,
        duration: 0.3,
        ease: "power2.in",
        onComplete: () => {
          dispatch({ type: "REMOVE_PLAYER", payload: { id } })
        },
      })
    }
  }

  const handleResetPlayer = (id: string) => {
    dispatch({ type: "RESET_PLAYER_SCORES", payload: { id } })

    // Animation de reset
    const playerCard = document.querySelector(`[data-player-id="${id}"]`)
    if (playerCard) {
      gsap.to(playerCard, {
        rotationY: 360,
        duration: 0.6,
        ease: "power2.inOut",
      })
    }
  }

  const handleUpdateShots = (id: string, totalShots: number) => {
    dispatch({ type: "UPDATE_PLAYER_SHOTS", payload: { id, totalShots } })
  }

  const handleStartShooting = (playerId: string) => {
    const button = document.querySelector(`[data-start-button="${playerId}"]`)
    if (button) {
      gsap.to(button, {
        scale: 0.95,
        duration: 0.1,
        yoyo: true,
        repeat: 1,
        ease: "power2.inOut",
        onComplete: () => {
          router.push(`/shooting/${playerId}`)
        },
      })
    }
  }

  const handleViewResults = (playerId: string) => {
    const button = document.querySelector(`[data-results-button="${playerId}"]`)
    if (button) {
      gsap.to(button, {
        scale: 0.95,
        duration: 0.1,
        yoyo: true,
        repeat: 1,
        ease: "power2.inOut",
        onComplete: () => {
          router.push(`/results/${playerId}`)
        },
      })
    }
  }

  return (
    <Card ref={cardRef}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
          <UserPlus className="w-4 h-4 sm:w-5 sm:h-5" />
          Gestion des Tireurs
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add New Player */}
        <div className="space-y-2">
          <Input
            placeholder="Nom du tireur"
            value={newPlayerName}
            onChange={(e) => setNewPlayerName(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleAddPlayer()}
            className="text-sm transition-all duration-200 focus:scale-[1.02]"
          />
          <div className="flex gap-2">
            <Input
              type="number"
              min="1"
              max="50"
              value={newPlayerShots}
              onChange={(e) => setNewPlayerShots(Number.parseInt(e.target.value) || 10)}
              className="w-20 text-sm transition-all duration-200 focus:scale-[1.02]"
              placeholder="Tirs"
            />
            <Button
              onClick={handleAddPlayer}
              className="flex-1 text-sm transition-all duration-200 hover:scale-[1.02]"
              data-add-button
            >
              Ajouter Tireur
            </Button>
          </div>
        </div>

        {/* Player List */}
        <div ref={playersRef} className="space-y-3">
          {state.players.map((player) => {
            const isCompleted = player.currentShot >= player.totalShots
            const completionPercentage = Math.round((player.currentShot / player.totalShots) * 100)

            return (
              <div
                key={player.id}
                data-player-id={player.id}
                className="p-4 border rounded-lg bg-white shadow-sm transition-all duration-300 hover:shadow-md hover:scale-[1.01]"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span className="font-medium text-base truncate">{player.name}</span>
                    {player.id === state.topScorerId && (
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 text-xs animate-pulse">
                        🏆 Leader
                      </Badge>
                    )}
                    {isCompleted && (
                      <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                        ✅ Terminé
                      </Badge>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleResetPlayer(player.id)}
                      className="transition-all duration-200 hover:scale-110"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRemovePlayer(player.id)}
                      className="transition-all duration-200 hover:scale-110 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-sm text-gray-600 mb-3">
                  <div>
                    <span className="font-medium">Progression:</span>
                    <div className="text-lg font-bold text-gray-900">
                      {player.currentShot}/{player.totalShots}
                    </div>
                  </div>
                  <div>
                    <span className="font-medium">Score Total:</span>
                    <div className="text-lg font-bold text-blue-600">{player.totalScore}</div>
                  </div>
                  <div>
                    <span className="font-medium">Moyenne:</span>
                    <div className="text-lg font-bold text-green-600">
                      {player.scores.length > 0 ? (player.totalScore / player.scores.length).toFixed(1) : "0.0"}
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-3">
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ease-out ${
                        isCompleted ? "bg-green-500" : "bg-blue-500"
                      }`}
                      style={{ width: `${completionPercentage}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-500 mt-1">{completionPercentage}% terminé</div>
                </div>

                <div className="flex gap-2">
                  <Input
                    type="number"
                    min="1"
                    max="50"
                    value={player.totalShots}
                    onChange={(e) => handleUpdateShots(player.id, Number.parseInt(e.target.value) || 10)}
                    className="w-20 h-9 text-sm transition-all duration-200 focus:scale-[1.05]"
                  />

                  {isCompleted ? (
                    <Button
                      onClick={() => handleViewResults(player.id)}
                      className="flex-1 bg-green-600 hover:bg-green-700 transition-all duration-200 hover:scale-[1.02]"
                      data-results-button={player.id}
                    >
                      <BarChart3 className="w-4 h-4 mr-2" />
                      Voir les Résultats
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handleStartShooting(player.id)}
                      className="flex-1 transition-all duration-200 hover:scale-[1.02]"
                      data-start-button={player.id}
                    >
                      <Target className="w-4 h-4 mr-2" />
                      Démarrer
                    </Button>
                  )}
                </div>

                {/* Recent Scores Preview */}
                {player.scores.length > 0 && (
                  <div className="mt-3 pt-3 border-t">
                    <div className="text-xs text-gray-600 mb-1">Derniers scores:</div>
                    <div className="flex flex-wrap gap-1">
                      {player.scores.slice(-5).map((score, index) => (
                        <Badge
                          key={index}
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

        {state.players.length === 0 && (
          <div className="text-center text-gray-500 py-8 text-sm">
            <Target className="w-12 h-12 mx-auto mb-4 text-gray-300 animate-bounce" />
            <p>Aucun tireur ajouté.</p>
            <p>Ajoutez votre premier tireur ci-dessus !</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
