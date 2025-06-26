"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface DiagnosticData {
  status: string;
  timestamp: string;
  database?: {
    connected: boolean;
    playerCount: number;
    scoreCount: number;
  };
  players?: Array<{
    id: string;
    name: string;
    scoreCount: number;
    scores: number[];
    createdAt: string;
  }>;
  error?: string;
}

export default function DiagnosticPage() {
  const [diagnostic, setDiagnostic] = useState<DiagnosticData | null>(null);
  const [loading, setLoading] = useState(false);

  const runDiagnostic = async () => {
    setLoading(true);
    try {
      console.log("🔍 Lancement du diagnostic...");
      const response = await fetch("/api/diagnostic");
      const data = await response.json();
      console.log("📊 Résultat diagnostic:", data);
      setDiagnostic(data);
    } catch (error) {
      console.error("❌ Erreur lors du diagnostic:", error);
      setDiagnostic({
        status: "ERROR",
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : "Erreur inconnue",
      });
    } finally {
      setLoading(false);
    }
  };

  const testAPIs = async () => {
    console.log("🧪 Test des APIs...");

    const tests = [
      { name: "Health Check", url: "/api/health" },
      { name: "Players", url: "/api/players" },
      { name: "Scores", url: "/api/scores" },
    ];

    for (const test of tests) {
      try {
        console.log(`🔄 Test ${test.name}...`);
        const response = await fetch(test.url);
        const data = await response.json();
        console.log(`✅ ${test.name}:`, data);
      } catch (error) {
        console.error(`❌ ${test.name}:`, error);
      }
    }
  };

  useEffect(() => {
    runDiagnostic();
  }, []);

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold">🔍 Diagnostic Système</h1>

      <div className="flex gap-2">
        <Button onClick={runDiagnostic} disabled={loading}>
          {loading ? "🔄 Diagnostic..." : "🔍 Relancer Diagnostic"}
        </Button>
        <Button variant="outline" onClick={testAPIs}>
          🧪 Tester APIs
        </Button>
      </div>

      {diagnostic && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>📊 Résultat du Diagnostic</span>
              <Badge
                variant={diagnostic.status === "OK" ? "default" : "destructive"}
              >
                {diagnostic.status}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <strong>Timestamp:</strong>{" "}
              {new Date(diagnostic.timestamp).toLocaleString()}
            </div>

            {diagnostic.error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded">
                <strong className="text-red-800">Erreur:</strong>
                <pre className="text-red-700 text-sm mt-2">
                  {diagnostic.error}
                </pre>
              </div>
            )}

            {diagnostic.database && (
              <div className="space-y-2">
                <h3 className="font-semibold">Base de Données</h3>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <strong>Connexion:</strong>{" "}
                    <Badge
                      variant={
                        diagnostic.database.connected
                          ? "default"
                          : "destructive"
                      }
                    >
                      {diagnostic.database.connected ? "✅ OK" : "❌ KO"}
                    </Badge>
                  </div>
                  <div>
                    <strong>Joueurs:</strong> {diagnostic.database.playerCount}
                  </div>
                  <div>
                    <strong>Scores:</strong> {diagnostic.database.scoreCount}
                  </div>
                </div>
              </div>
            )}

            {diagnostic.players && (
              <div className="space-y-2">
                <h3 className="font-semibold">
                  Joueurs ({diagnostic.players.length})
                </h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {diagnostic.players.map((player) => (
                    <div
                      key={player.id}
                      className="p-2 bg-gray-50 rounded text-sm"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <strong>{player.name}</strong>
                          <div className="text-gray-600">
                            ID: {player.id} | Scores: {player.scoreCount}
                          </div>
                          {player.scores.length > 0 && (
                            <div className="text-gray-600">
                              Derniers scores: [
                              {player.scores.slice(-5).join(", ")}]
                            </div>
                          )}
                        </div>
                        <Badge variant="outline">
                          {new Date(player.createdAt).toLocaleDateString()}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
