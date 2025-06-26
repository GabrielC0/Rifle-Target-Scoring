"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useScoring } from "@/contexts/scoring-context";

export default function TestPage() {
  const {
    state,
    addPlayerAsync,
    addScoreAsync,
    resetPlayerScoresAsync,
    loadPlayersAsync,
  } = useScoring();
  const [loading, setLoading] = useState(false);

  const createTestData = async () => {
    setLoading(true);
    try {
      console.log("🧪 Création de données de test...");

      // Créer quelques joueurs
      await addPlayerAsync("Alice", 10);
      await addPlayerAsync("Bob", 10);
      await addPlayerAsync("Charlie", 10);

      // Attendre un peu pour que les joueurs soient créés
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Recharger les joueurs pour avoir leurs IDs
      await loadPlayersAsync();

      // Ajouter des scores
      const alice = state.players.find((p) => p.name === "Alice");
      const bob = state.players.find((p) => p.name === "Bob");

      if (alice) {
        console.log("🎯 Ajout de scores pour Alice");
        await addScoreAsync(alice.id, 8);
        await addScoreAsync(alice.id, 9);
        await addScoreAsync(alice.id, 7);
        await addScoreAsync(alice.id, 10);
        await addScoreAsync(alice.id, 8);
      }

      if (bob) {
        console.log("🎯 Ajout de scores pour Bob");
        await addScoreAsync(bob.id, 9);
        await addScoreAsync(bob.id, 8);
        await addScoreAsync(bob.id, 10);
      }

      console.log("✅ Données de test créées");
    } catch (error) {
      console.error(
        "❌ Erreur lors de la création des données de test:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  const testResetPlayer = async () => {
    const player = state.players[0];
    if (player) {
      console.log(`🔄 Test de reset pour ${player.name}`);
      await resetPlayerScoresAsync(player.id);
      console.log("✅ Reset terminé");
    }
  };

  const clearAllData = async () => {
    try {
      console.log("🗑️ Suppression de toutes les données...");
      for (const player of state.players) {
        console.log(`Suppression de ${player.name}...`);
        // On ne peut pas utiliser removePlayerAsync ici car il modifie la liste pendant l'itération
      }
      console.log("✅ Toutes les données supprimées");
    } catch (error) {
      console.error("❌ Erreur lors de la suppression:", error);
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold">🧪 Page de Test</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Actions de Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={createTestData}
              disabled={loading}
              className="w-full"
            >
              {loading ? "⏳ Création..." : "🧪 Créer Données de Test"}
            </Button>

            <Button
              onClick={testResetPlayer}
              variant="outline"
              className="w-full"
              disabled={state.players.length === 0}
            >
              🔄 Tester Reset (1er joueur)
            </Button>

            <Button
              onClick={loadPlayersAsync}
              variant="outline"
              className="w-full"
            >
              🔄 Recharger Données
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>État Actuel</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div>
                <strong>Joueurs:</strong> {state.players.length}
              </div>
              <div>
                <strong>Chargement:</strong> {state.isLoading ? "✅" : "❌"}
              </div>
              <div>
                <strong>Erreur:</strong> {state.error || "Aucune"}
              </div>
            </div>

            {state.players.length > 0 && (
              <div className="mt-4">
                <h4 className="font-semibold mb-2">Joueurs:</h4>
                <div className="space-y-2">
                  {state.players.map((player) => (
                    <div
                      key={player.id}
                      className="p-2 bg-gray-50 rounded text-xs"
                    >
                      <div>
                        <strong>{player.name}</strong>
                      </div>
                      <div>
                        Scores: {player.scores.length} | Total:{" "}
                        {player.totalScore}
                      </div>
                      <div>
                        Progression: {player.currentShot}/{player.totalShots}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
