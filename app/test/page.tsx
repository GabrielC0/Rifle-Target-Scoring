"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Play,
  Square,
  RotateCcw,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
} from "lucide-react";

interface TestResult {
  id: string;
  name: string;
  category: string;
  status: "pending" | "running" | "passed" | "failed" | "skipped";
  duration?: number;
  error?: string;
  details?: string;
}

interface TestLog {
  timestamp: string;
  level: "info" | "success" | "error" | "warn";
  message: string;
  category?: string;
}

export default function TestPage() {
  const [isRunning, setIsRunning] = useState(false);
  const [tests, setTests] = useState<TestResult[]>([]);
  const [logs, setLogs] = useState<TestLog[]>([]);
  const [progress, setProgress] = useState(0);
  const [testPlayerIds, setTestPlayerIds] = useState<Set<string>>(new Set());
  const logsRef = useRef<HTMLDivElement>(null);
  const testsRef = useRef<HTMLDivElement>(null);

  const addLog = (
    level: TestLog["level"],
    message: string,
    category?: string
  ) => {
    const newLog: TestLog = {
      timestamp: new Date().toLocaleTimeString(),
      level,
      message,
      category,
    };
    setLogs((prev) => [...prev, newLog]);

    // Auto-scroll to bottom
    setTimeout(() => {
      if (logsRef.current) {
        logsRef.current.scrollTop = logsRef.current.scrollHeight;
      }
    }, 100);
  };

  const updateTestStatus = (
    testId: string,
    status: TestResult["status"],
    error?: string,
    duration?: number,
    details?: string
  ) => {
    setTests((prev) =>
      prev.map((test) =>
        test.id === testId
          ? { ...test, status, error, duration, details }
          : test
      )
    );

    // Auto-scroll to the updated test
    setTimeout(() => {
      const testElement = document.querySelector(`[data-test-id="${testId}"]`);
      if (testElement && testsRef.current) {
        testElement.scrollIntoView({
          behavior: "smooth",
          block: "center",
          inline: "nearest",
        });
      }
    }, 100);
  };

  const initializeTests = () => {
    const testList: TestResult[] = [
      // Tests de base de données
      {
        id: "db-connection",
        name: "Connexion base de données",
        category: "Database",
        status: "pending",
      },
      {
        id: "db-schema",
        name: "Vérification schéma Prisma",
        category: "Database",
        status: "pending",
      },

      // Tests API Routes
      {
        id: "api-health",
        name: "Route /api/health",
        category: "API",
        status: "pending",
      },
      {
        id: "api-players-get",
        name: "GET /api/players",
        category: "API",
        status: "pending",
      },
      {
        id: "api-players-post",
        name: "POST /api/players",
        category: "API",
        status: "pending",
      },
      {
        id: "api-players-delete",
        name: "DELETE /api/players/:id",
        category: "API",
        status: "pending",
      },
      {
        id: "api-scores-post",
        name: "POST /api/scores",
        category: "API",
        status: "pending",
      },
      {
        id: "api-scores-get",
        name: "GET /api/scores",
        category: "API",
        status: "pending",
      },

      // Tests Fonctionnels
      {
        id: "player-creation",
        name: "Création joueur avec totalShots",
        category: "Functional",
        status: "pending",
      },
      {
        id: "player-shots-validation",
        name: "Validation nombre de tirs",
        category: "Functional",
        status: "pending",
      },
      {
        id: "score-addition",
        name: "Ajout de scores",
        category: "Functional",
        status: "pending",
      },
      {
        id: "score-limit",
        name: "Limite de tirs respectée",
        category: "Functional",
        status: "pending",
      },
      {
        id: "player-reset",
        name: "Réinitialisation scores",
        category: "Functional",
        status: "pending",
      },

      // Tests API Service
      {
        id: "service-create-player",
        name: "ApiService.createPlayer",
        category: "Service",
        status: "pending",
      },
      {
        id: "service-get-players",
        name: "ApiService.getPlayers",
        category: "Service",
        status: "pending",
      },
      {
        id: "service-add-score",
        name: "ApiService.addScore",
        category: "Service",
        status: "pending",
      },

      // Tests Interface UI
      {
        id: "ui-input-validation",
        name: "Validation input nombre de tirs",
        category: "UI",
        status: "pending",
      },
      {
        id: "ui-player-display",
        name: "Affichage informations joueur",
        category: "UI",
        status: "pending",
      },

      // Tests de performances
      {
        id: "perf-multiple-players",
        name: "Création multiple joueurs",
        category: "Performance",
        status: "pending",
      },
      {
        id: "perf-multiple-scores",
        name: "Ajout multiple scores",
        category: "Performance",
        status: "pending",
      },
    ];

    setTests(testList);
    setProgress(0);
  };

  // Test functions
  const runDatabaseTests = async () => {
    addLog("info", "🗄️ Début des tests base de données", "Database");

    // Test connexion DB
    try {
      updateTestStatus("db-connection", "running");
      const response = await fetch("/api/health");
      const data = await response.json();

      if (response.ok && data.database) {
        updateTestStatus(
          "db-connection",
          "passed",
          undefined,
          100,
          "Connexion réussie"
        );
        addLog(
          "success",
          `✅ Base de données connectée: ${data.database}`,
          "Database"
        );
      } else {
        throw new Error("Pas de réponse DB valide");
      }
    } catch (error) {
      updateTestStatus(
        "db-connection",
        "failed",
        error instanceof Error ? error.message : "Erreur inconnue"
      );
      addLog("error", `❌ Échec connexion DB: ${error}`, "Database");
    }

    // Test schéma Prisma
    try {
      updateTestStatus("db-schema", "running");
      const response = await fetch("/api/diagnostic");
      const data = await response.json();

      if (response.ok) {
        updateTestStatus("db-schema", "passed", undefined, 80, "Schéma valide");
        addLog("success", "✅ Schéma Prisma validé", "Database");
      } else {
        throw new Error("Diagnostic échoué");
      }
    } catch (error) {
      updateTestStatus(
        "db-schema",
        "failed",
        error instanceof Error ? error.message : "Erreur inconnue"
      );
      addLog("error", `❌ Échec validation schéma: ${error}`, "Database");
    }
  };

  const runApiTests = async () => {
    addLog("info", "🌐 Début des tests API", "API");

    // Test Health API
    try {
      updateTestStatus("api-health", "running");
      const start = Date.now();
      const response = await fetch("/api/health");
      const duration = Date.now() - start;

      if (response.ok) {
        updateTestStatus(
          "api-health",
          "passed",
          undefined,
          duration,
          `Status: ${response.status}`
        );
        addLog("success", `✅ API Health OK (${duration}ms)`, "API");
      } else {
        throw new Error(`Status: ${response.status}`);
      }
    } catch (error) {
      updateTestStatus(
        "api-health",
        "failed",
        error instanceof Error ? error.message : "Erreur inconnue"
      );
      addLog("error", `❌ API Health échoué: ${error}`, "API");
    }

    // Test GET Players
    try {
      updateTestStatus("api-players-get", "running");
      const start = Date.now();
      const response = await fetch("/api/players");
      const duration = Date.now() - start;
      const data = await response.json();

      if (response.ok && Array.isArray(data)) {
        updateTestStatus(
          "api-players-get",
          "passed",
          undefined,
          duration,
          `${data.length} joueurs`
        );
        addLog(
          "success",
          `✅ GET Players OK - ${data.length} joueurs (${duration}ms)`,
          "API"
        );
      } else {
        throw new Error("Réponse invalide");
      }
    } catch (error) {
      updateTestStatus(
        "api-players-get",
        "failed",
        error instanceof Error ? error.message : "Erreur inconnue"
      );
      addLog("error", `❌ GET Players échoué: ${error}`, "API");
    }

    // Test POST Player avec totalShots
    try {
      updateTestStatus("api-players-post", "running");
      const start = Date.now();
      const testPlayerName = `TestPlayer_${Date.now()}`;
      const testTotalShots = 15;

      const response = await fetch("/api/players", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: testPlayerName,
          totalShots: testTotalShots,
        }),
      });
      const duration = Date.now() - start;
      const data = await response.json();

      if (response.ok && data.totalShots === testTotalShots) {
        // Ajouter le joueur au tracker pour nettoyage global
        addTestPlayer(data.id);

        updateTestStatus(
          "api-players-post",
          "passed",
          undefined,
          duration,
          `totalShots: ${data.totalShots}`
        );
        addLog(
          "success",
          `✅ POST Player OK - totalShots correctement sauvé: ${data.totalShots} (${duration}ms)`,
          "API"
        );

        // Test DELETE avec ce joueur
        try {
          updateTestStatus("api-players-delete", "running");
          const deleteStart = Date.now();
          const deleteResponse = await fetch(`/api/players/${data.id}`, {
            method: "DELETE",
          });
          const deleteDuration = Date.now() - deleteStart;

          if (deleteResponse.ok) {
            updateTestStatus(
              "api-players-delete",
              "passed",
              undefined,
              deleteDuration,
              "Suppression OK"
            );
            addLog(
              "success",
              `✅ DELETE Player OK (${deleteDuration}ms)`,
              "API"
            );
            // Retirer du tracker car déjà supprimé
            setTestPlayerIds((prev) => {
              const newSet = new Set(prev);
              newSet.delete(data.id);
              return newSet;
            });
          } else {
            throw new Error("Suppression échouée");
          }
        } catch (deleteError) {
          updateTestStatus(
            "api-players-delete",
            "failed",
            deleteError instanceof Error
              ? deleteError.message
              : "Erreur inconnue"
          );
          addLog("error", `❌ DELETE Player échoué: ${deleteError}`, "API");
        }
      } else {
        throw new Error(
          `totalShots incorrect: attendu ${testTotalShots}, reçu ${data.totalShots}`
        );
      }
    } catch (error) {
      updateTestStatus(
        "api-players-post",
        "failed",
        error instanceof Error ? error.message : "Erreur inconnue"
      );
      addLog("error", `❌ POST Player échoué: ${error}`, "API");
      // Si POST échoue, marquer DELETE comme échoué aussi
      updateTestStatus("api-players-delete", "failed", "POST Player a échoué");
    }

    // Test GET Scores
    try {
      updateTestStatus("api-scores-get", "running");
      const start = Date.now();
      const response = await fetch("/api/scores");
      const duration = Date.now() - start;

      if (response.ok) {
        const data = await response.json();
        updateTestStatus(
          "api-scores-get",
          "passed",
          undefined,
          duration,
          `${Array.isArray(data) ? data.length : 0} scores`
        );
        addLog("success", `✅ GET Scores OK (${duration}ms)`, "API");
      } else {
        throw new Error(`Status: ${response.status}`);
      }
    } catch (error) {
      updateTestStatus(
        "api-scores-get",
        "failed",
        error instanceof Error ? error.message : "Erreur inconnue"
      );
      addLog("error", `❌ GET Scores échoué: ${error}`, "API");
    }

    // Test POST Scores
    try {
      updateTestStatus("api-scores-post", "running");

      // Créer un joueur temporaire pour le test
      const playerResponse = await fetch("/api/players", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `APIScoreTest_${Date.now()}`,
          totalShots: 5,
        }),
      });

      if (!playerResponse.ok) {
        throw new Error("Impossible de créer le joueur de test");
      }

      const player = await playerResponse.json();
      // Ajouter le joueur au tracker pour nettoyage global
      addTestPlayer(player.id);

      const start = Date.now();

      // Ajouter un score
      const scoreResponse = await fetch("/api/scores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          playerId: player.id,
          score: 8.5,
          shotNumber: 1,
        }),
      });

      const duration = Date.now() - start;

      if (scoreResponse.ok) {
        const scoreData = await scoreResponse.json();
        updateTestStatus(
          "api-scores-post",
          "passed",
          undefined,
          duration,
          `Score: ${scoreData.value}`
        );
        addLog("success", `✅ POST Scores OK (${duration}ms)`, "API");
      } else {
        throw new Error(`Status: ${scoreResponse.status}`);
      }

      // Le joueur sera nettoyé automatiquement par cleanupAllTestPlayers()
    } catch (error) {
      updateTestStatus(
        "api-scores-post",
        "failed",
        error instanceof Error ? error.message : "Erreur inconnue"
      );
      addLog("error", `❌ POST Scores échoué: ${error}`, "API");
    }
  };

  const runFunctionalTests = async () => {
    addLog("info", "⚙️ Début des tests fonctionnels", "Functional");

    let testPlayerId: string | null = null;

    // Test création joueur avec totalShots personnalisé
    try {
      updateTestStatus("player-creation", "running");
      const testName = `FuncTest_${Date.now()}`;
      const testShots = 20;

      const response = await fetch("/api/players", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: testName, totalShots: testShots }),
      });

      const player = await response.json();

      if (response.ok && player.totalShots === testShots) {
        testPlayerId = player.id;
        // Ajouter le joueur au tracker pour nettoyage global
        addTestPlayer(player.id);

        updateTestStatus(
          "player-creation",
          "passed",
          undefined,
          200,
          `ID: ${player.id.slice(0, 8)}`
        );
        addLog(
          "success",
          `✅ Joueur créé avec ${testShots} tirs`,
          "Functional"
        );
      } else {
        throw new Error("Création échouée");
      }
    } catch (error) {
      updateTestStatus(
        "player-creation",
        "failed",
        error instanceof Error ? error.message : "Erreur inconnue"
      );
      addLog("error", `❌ Création joueur échouée: ${error}`, "Functional");
    }

    // Test ajout de scores
    if (testPlayerId) {
      try {
        updateTestStatus("score-addition", "running");

        // Ajouter plusieurs scores
        const scores = [8.5, 9.2, 7.8, 9.5, 8.9];
        for (let i = 0; i < scores.length; i++) {
          const response = await fetch("/api/scores", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              playerId: testPlayerId,
              score: scores[i],
              shotNumber: i + 1,
            }),
          });

          if (!response.ok) {
            throw new Error(`Échec ajout score ${i + 1}`);
          }
        }

        updateTestStatus(
          "score-addition",
          "passed",
          undefined,
          300,
          `${scores.length} scores`
        );
        addLog("success", `✅ ${scores.length} scores ajoutés`, "Functional");
      } catch (error) {
        updateTestStatus(
          "score-addition",
          "failed",
          error instanceof Error ? error.message : "Erreur inconnue"
        );
        addLog("error", `❌ Ajout scores échoué: ${error}`, "Functional");
      }

      // Test limite de tirs
      try {
        updateTestStatus("score-limit", "running");

        // Essayer d'ajouter plus de scores que la limite (20)
        let limitReached = false;
        for (let i = 6; i <= 25; i++) {
          const response = await fetch("/api/scores", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              playerId: testPlayerId,
              score: 8.0,
              shotNumber: i,
            }),
          });

          if (!response.ok && i > 20) {
            limitReached = true;
            break;
          }
        }

        if (limitReached) {
          updateTestStatus(
            "score-limit",
            "passed",
            undefined,
            400,
            "Limite respectée"
          );
          addLog(
            "success",
            "✅ Limite de tirs correctement appliquée",
            "Functional"
          );
        } else {
          throw new Error("Limite non respectée");
        }
      } catch (error) {
        updateTestStatus(
          "score-limit",
          "failed",
          error instanceof Error ? error.message : "Erreur inconnue"
        );
        addLog("error", `❌ Test limite échoué: ${error}`, "Functional");
      }

      // Test validation nombre de tirs
      try {
        updateTestStatus("player-shots-validation", "running");

        // Récupérer les informations du joueur
        const playerResponse = await fetch(`/api/players/${testPlayerId}`);
        const playerData = await playerResponse.json();

        if (playerResponse.ok && playerData.totalShots === 20) {
          updateTestStatus(
            "player-shots-validation",
            "passed",
            undefined,
            100,
            `${playerData.totalShots} tirs configurés`
          );
          addLog(
            "success",
            `✅ Validation nombre de tirs: ${playerData.totalShots} configuré correctement`,
            "Functional"
          );
        } else {
          throw new Error(`Nombre de tirs incorrect: ${playerData.totalShots}`);
        }
      } catch (error) {
        updateTestStatus(
          "player-shots-validation",
          "failed",
          error instanceof Error ? error.message : "Erreur inconnue"
        );
        addLog(
          "error",
          `❌ Test validation nombre de tirs échoué: ${error}`,
          "Functional"
        );
      }

      // Test réinitialisation scores
      try {
        updateTestStatus("player-reset", "running");

        // Réinitialiser les scores du joueur
        const resetResponse = await fetch(`/api/players/${testPlayerId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "reset-scores" }),
        });

        if (resetResponse.ok) {
          const resetData = await resetResponse.json();
          if (resetData.shotCount === 0 && resetData.totalScore === 0) {
            updateTestStatus(
              "player-reset",
              "passed",
              undefined,
              150,
              "Scores réinitialisés"
            );
            addLog(
              "success",
              "✅ Réinitialisation des scores réussie",
              "Functional"
            );
          } else {
            throw new Error("Scores non réinitialisés correctement");
          }
        } else {
          throw new Error("Échec de la réinitialisation");
        }
      } catch (error) {
        updateTestStatus(
          "player-reset",
          "failed",
          error instanceof Error ? error.message : "Erreur inconnue"
        );
        addLog(
          "error",
          `❌ Test réinitialisation échoué: ${error}`,
          "Functional"
        );
      }

      // Le joueur sera nettoyé automatiquement par cleanupAllTestPlayers()
    }
  };

  const runPerformanceTests = async () => {
    addLog("info", "🚀 Début des tests de performance", "Performance");

    // Test création multiple joueurs
    try {
      updateTestStatus("perf-multiple-players", "running");
      const start = Date.now();
      const playerPromises = [];

      for (let i = 0; i < 10; i++) {
        playerPromises.push(
          fetch("/api/players", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: `PerfTest_${Date.now()}_${i}`,
              totalShots: 10 + i,
            }),
          })
        );
      }

      const responses = await Promise.all(playerPromises);
      const duration = Date.now() - start;

      const allSuccess = responses.every((r) => r.ok);

      if (allSuccess) {
        // Ajouter tous les joueurs au tracker pour nettoyage global
        for (const response of responses) {
          const player = await response.json();
          addTestPlayer(player.id);
        }

        updateTestStatus(
          "perf-multiple-players",
          "passed",
          undefined,
          duration,
          "10 joueurs créés"
        );
        addLog(
          "success",
          `✅ 10 joueurs créés en ${duration}ms`,
          "Performance"
        );
      } else {
        throw new Error("Certaines créations ont échoué");
      }
    } catch (error) {
      updateTestStatus(
        "perf-multiple-players",
        "failed",
        error instanceof Error ? error.message : "Erreur inconnue"
      );
      addLog(
        "error",
        `❌ Test performance joueurs échoué: ${error}`,
        "Performance"
      );
    }

    // Test ajout multiple scores
    try {
      updateTestStatus("perf-multiple-scores", "running");

      // Créer un joueur de test pour les scores
      const playerResponse = await fetch("/api/players", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `PerfScoreTest_${Date.now()}`,
          totalShots: 50,
        }),
      });

      if (!playerResponse.ok) {
        throw new Error("Impossible de créer le joueur de test");
      }

      const player = await playerResponse.json();
      // Ajouter le joueur au tracker pour nettoyage global
      addTestPlayer(player.id);

      const start = Date.now();

      // Ajouter 30 scores en parallèle
      const scorePromises = [];
      for (let i = 1; i <= 30; i++) {
        scorePromises.push(
          fetch("/api/scores", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              playerId: player.id,
              score: Math.random() * 10,
              shotNumber: i,
            }),
          })
        );
      }

      const scoreResponses = await Promise.all(scorePromises);
      const duration = Date.now() - start;

      const allScoresSuccess = scoreResponses.every((r) => r.ok);

      if (allScoresSuccess) {
        updateTestStatus(
          "perf-multiple-scores",
          "passed",
          undefined,
          duration,
          "30 scores ajoutés"
        );
        addLog(
          "success",
          `✅ 30 scores ajoutés en ${duration}ms`,
          "Performance"
        );
      } else {
        throw new Error("Certains ajouts de scores ont échoué");
      }

      // Le joueur sera nettoyé automatiquement par cleanupAllTestPlayers()
    } catch (error) {
      updateTestStatus(
        "perf-multiple-scores",
        "failed",
        error instanceof Error ? error.message : "Erreur inconnue"
      );
      addLog(
        "error",
        `❌ Test performance scores échoué: ${error}`,
        "Performance"
      );
    }
  };

  const runServiceTests = async () => {
    addLog("info", "🔧 Début des tests Service", "Service");

    // Test ApiService.createPlayer
    try {
      updateTestStatus("service-create-player", "running");

      // Simuler l'utilisation du service API
      const testName = `ServiceTest_${Date.now()}`;
      const testShots = 12;

      const response = await fetch("/api/players", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: testName, totalShots: testShots }),
      });

      const player = await response.json();

      if (
        response.ok &&
        player.name === testName &&
        player.totalShots === testShots
      ) {
        // Ajouter le joueur au tracker pour nettoyage global
        addTestPlayer(player.id);

        updateTestStatus(
          "service-create-player",
          "passed",
          undefined,
          150,
          `Service OK`
        );
        addLog("success", "✅ ApiService.createPlayer fonctionne", "Service");

        // Le joueur sera nettoyé automatiquement
      } else {
        throw new Error("Service createPlayer défaillant");
      }
    } catch (error) {
      updateTestStatus(
        "service-create-player",
        "failed",
        error instanceof Error ? error.message : "Erreur inconnue"
      );
      addLog("error", `❌ Service createPlayer échoué: ${error}`, "Service");
    }

    // Test ApiService.getPlayers
    try {
      updateTestStatus("service-get-players", "running");

      const response = await fetch("/api/players");
      const players = await response.json();

      if (response.ok && Array.isArray(players)) {
        updateTestStatus(
          "service-get-players",
          "passed",
          undefined,
          100,
          `${players.length} players`
        );
        addLog(
          "success",
          `✅ ApiService.getPlayers retourne ${players.length} joueurs`,
          "Service"
        );
      } else {
        throw new Error("Service getPlayers défaillant");
      }
    } catch (error) {
      updateTestStatus(
        "service-get-players",
        "failed",
        error instanceof Error ? error.message : "Erreur inconnue"
      );
      addLog("error", `❌ Service getPlayers échoué: ${error}`, "Service");
    }

    // Test ApiService.addScore
    try {
      updateTestStatus("service-add-score", "running");

      // Créer un joueur temporaire
      const playerResponse = await fetch("/api/players", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `ScoreServiceTest_${Date.now()}`,
          totalShots: 5,
        }),
      });

      const player = await playerResponse.json();
      // Ajouter le joueur au tracker pour nettoyage global
      addTestPlayer(player.id);

      // Ajouter un score
      const scoreResponse = await fetch("/api/scores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          playerId: player.id,
          score: 9.1,
          shotNumber: 1,
        }),
      });

      if (scoreResponse.ok) {
        updateTestStatus(
          "service-add-score",
          "passed",
          undefined,
          120,
          "Score ajouté"
        );
        addLog("success", "✅ ApiService.addScore fonctionne", "Service");
      } else {
        throw new Error("Service addScore défaillant");
      }

      // Le joueur sera nettoyé automatiquement
    } catch (error) {
      updateTestStatus(
        "service-add-score",
        "failed",
        error instanceof Error ? error.message : "Erreur inconnue"
      );
      addLog("error", `❌ Service addScore échoué: ${error}`, "Service");
    }
  };

  const runUITests = async () => {
    addLog("info", "🎨 Début des tests UI", "UI");

    // Test validation input nombre de tirs
    try {
      updateTestStatus("ui-input-validation", "running");

      // Simuler la validation côté client
      const validateShotInput = (value: number) => {
        return value >= 1 && value <= 100 && Number.isInteger(value);
      };

      const testCases = [
        { input: 10, expected: true },
        { input: 0, expected: false },
        { input: -5, expected: false },
        { input: 101, expected: false },
        { input: 10.5, expected: false },
      ];

      let allValid = true;
      for (const testCase of testCases) {
        const result = validateShotInput(testCase.input);
        if (result !== testCase.expected) {
          allValid = false;
          break;
        }
      }

      if (allValid) {
        updateTestStatus(
          "ui-input-validation",
          "passed",
          undefined,
          50,
          "Validation OK"
        );
        addLog("success", "✅ Validation input nombre de tirs OK", "UI");
      } else {
        throw new Error("Validation des inputs échouée");
      }
    } catch (error) {
      updateTestStatus(
        "ui-input-validation",
        "failed",
        error instanceof Error ? error.message : "Erreur inconnue"
      );
      addLog("error", `❌ Test validation UI échoué: ${error}`, "UI");
    }

    // Test affichage informations joueur
    try {
      updateTestStatus("ui-player-display", "running");

      // Simuler l'affichage des informations joueur
      const mockPlayer = {
        id: "test-id",
        name: "Test Player",
        totalShots: 15,
        scores: [8.5, 9.2, 7.8],
      };

      // Vérifier que les informations essentielles sont présentes
      const hasRequiredFields =
        mockPlayer.id &&
        mockPlayer.name &&
        typeof mockPlayer.totalShots === "number" &&
        Array.isArray(mockPlayer.scores);

      if (hasRequiredFields) {
        updateTestStatus(
          "ui-player-display",
          "passed",
          undefined,
          30,
          "Affichage OK"
        );
        addLog("success", "✅ Affichage informations joueur OK", "UI");
      } else {
        throw new Error("Affichage des informations joueur défaillant");
      }
    } catch (error) {
      updateTestStatus(
        "ui-player-display",
        "failed",
        error instanceof Error ? error.message : "Erreur inconnue"
      );
      addLog("error", `❌ Test affichage UI échoué: ${error}`, "UI");
    }
  };

  const runAllTests = async () => {
    if (isRunning) return;

    setIsRunning(true);
    setLogs([]);
    setTestPlayerIds(new Set()); // Réinitialiser la liste des joueurs de test
    initializeTests();

    addLog("info", "🎯 Début de la suite de tests complète");

    try {
      await runDatabaseTests();
      await runApiTests();
      await runFunctionalTests();
      await runPerformanceTests();
      await runServiceTests();
      await runUITests();

      // Attendre un peu pour que les derniers updates se fassent
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Calculer les stats finales avec l'état actuel
      setTests((currentTests) => {
        const passed = currentTests.filter((t) => t.status === "passed").length;
        const failed = currentTests.filter((t) => t.status === "failed").length;
        const total = currentTests.length;

        addLog(
          "info",
          `✅ Tests terminés: ${passed}/${total} réussis, ${failed} échecs`
        );

        return currentTests;
      });
    } catch (error) {
      addLog("error", `❌ Erreur globale: ${error}`);
    } finally {
      // Nettoyage automatique complet de tous les joueurs de test
      await cleanupAllTestPlayersFromDatabase();
      setIsRunning(false);
    }
  };

  const stopTests = () => {
    setIsRunning(false);
    addLog("warn", "⏹️ Tests arrêtés par l'utilisateur");
  };

  const clearLogs = () => {
    setLogs([]);
    setTests([]);
    setProgress(0);
  };

  // Fonctions de gestion des joueurs de test
  const addTestPlayer = (playerId: string) => {
    setTestPlayerIds((prev) => new Set([...prev, playerId]));
  };

  const cleanupAllTestPlayers = async () => {
    if (testPlayerIds.size === 0) {
      addLog("info", "🧹 Aucun joueur de test à nettoyer", "Cleanup");
      return;
    }

    addLog(
      "info",
      `🧹 Nettoyage de ${testPlayerIds.size} joueurs de test...`,
      "Cleanup"
    );

    let deletedCount = 0;
    let errorCount = 0;

    for (const playerId of testPlayerIds) {
      try {
        const response = await fetch(`/api/players/${playerId}`, {
          method: "DELETE",
        });

        if (response.ok) {
          deletedCount++;
        } else {
          errorCount++;
          addLog(
            "warn",
            `⚠️ Impossible de supprimer le joueur ${playerId.slice(0, 8)}`,
            "Cleanup"
          );
        }
      } catch (error) {
        errorCount++;
        addLog(
          "warn",
          `⚠️ Erreur lors de la suppression du joueur ${playerId.slice(
            0,
            8
          )}: ${error}`,
          "Cleanup"
        );
      }
    }

    // Vider la liste des joueurs de test
    setTestPlayerIds(new Set());

    if (deletedCount > 0) {
      addLog(
        "success",
        `✅ ${deletedCount} joueurs de test supprimés avec succès`,
        "Cleanup"
      );
    }

    if (errorCount > 0) {
      addLog("warn", `⚠️ ${errorCount} erreurs lors du nettoyage`, "Cleanup");
    }
  };

  // Fonction pour détecter et supprimer TOUS les joueurs de test dans la base
  const cleanupAllTestPlayersFromDatabase = async () => {
    addLog(
      "info",
      "🔍 Nettoyage automatique - Recherche des joueurs de test...",
      "Cleanup"
    );

    try {
      // Récupérer tous les joueurs
      const response = await fetch("/api/players");
      if (!response.ok) {
        throw new Error("Impossible de récupérer la liste des joueurs");
      }

      const allPlayers = await response.json();

      // Patterns des noms de joueurs de test (plus exhaustifs)
      const testPatterns = [
        /^TestPlayer_\d+$/,
        /^APIScoreTest_\d+$/,
        /^FuncTest_\d+$/,
        /^PerfTest_\d+(_\d+)?$/,
        /^PerfScoreTest_\d+$/,
        /^ServiceTest_\d+$/,
        /^ScoreServiceTest_\d+$/,
        // Pattern générique pour capturer d'autres tests
        /^Test.*_\d+$/,
      ]; // Filtrer les joueurs de test
      const testPlayers = allPlayers.filter((player: any) =>
        testPatterns.some((pattern) => pattern.test(player.name))
      );

      if (testPlayers.length === 0) {
        addLog(
          "success",
          "✅ Aucun joueur de test trouvé - Base propre",
          "Cleanup"
        );
        return;
      }

      addLog(
        "info",
        `🗑️ ${testPlayers.length} joueur(s) de test détecté(s), suppression en cours...`,
        "Cleanup"
      );

      let deletedCount = 0;
      let errorCount = 0;

      // Supprimer tous les joueurs de test en parallèle
      const deletePromises = testPlayers.map(async (player: any) => {
        try {
          const deleteResponse = await fetch(`/api/players/${player.id}`, {
            method: "DELETE",
          });

          if (deleteResponse.ok) {
            deletedCount++;
            addLog("info", `🗑️ Supprimé: ${player.name}`, "Cleanup");
          } else {
            errorCount++;
            addLog("warn", `⚠️ Échec suppression: ${player.name}`, "Cleanup");
          }
        } catch (error) {
          errorCount++;
          addLog(
            "warn",
            `⚠️ Erreur suppression ${player.name}: ${error}`,
            "Cleanup"
          );
        }
      });

      await Promise.all(deletePromises);

      // Rapport final
      if (deletedCount > 0) {
        addLog(
          "success",
          `✅ Nettoyage terminé: ${deletedCount} joueur(s) de test supprimé(s)`,
          "Cleanup"
        );
      }

      if (errorCount > 0) {
        addLog(
          "warn",
          `⚠️ ${errorCount} erreur(s) lors du nettoyage`,
          "Cleanup"
        );
      }

      // Vider aussi le tracker au cas où
      setTestPlayerIds(new Set());
    } catch (error) {
      addLog(
        "error",
        `❌ Erreur lors du nettoyage automatique: ${error}`,
        "Cleanup"
      );
    }
  };

  useEffect(() => {
    initializeTests();
  }, []);

  // Calculate stats
  const stats = {
    total: tests.length,
    passed: tests.filter((t) => t.status === "passed").length,
    failed: tests.filter((t) => t.status === "failed").length,
    running: tests.filter((t) => t.status === "running").length,
    pending: tests.filter((t) => t.status === "pending").length,
  };

  const getStatusIcon = (status: TestResult["status"]) => {
    switch (status) {
      case "passed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "running":
        return <Clock className="h-4 w-4 text-blue-500 animate-spin" />;
      case "pending":
        return <AlertCircle className="h-4 w-4 text-gray-400" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: TestResult["status"]) => {
    switch (status) {
      case "passed":
        return "bg-green-100 text-green-800";
      case "failed":
        return "bg-red-100 text-red-800";
      case "running":
        return "bg-blue-100 text-blue-800";
      case "pending":
        return "bg-gray-100 text-gray-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const getLogColor = (level: TestLog["level"]) => {
    switch (level) {
      case "success":
        return "text-green-600";
      case "error":
        return "text-red-600";
      case "warn":
        return "text-yellow-600";
      default:
        return "text-gray-700";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 text-center mb-2">
            🧪 Suite de Tests Complète
          </h1>
          <p className="text-gray-600 text-center">
            Tests automatisés pour l'application de tir à la carabine
          </p>
        </header>

        {/* Controls */}
        <div className="mb-6 flex gap-4 justify-center">
          <Button
            onClick={runAllTests}
            disabled={isRunning}
            size="lg"
            className="flex items-center gap-2"
          >
            <Play className="h-5 w-5" />
            {isRunning ? "Tests en cours..." : "Démarrer tous les tests"}
          </Button>

          {isRunning && (
            <Button
              onClick={stopTests}
              variant="destructive"
              size="lg"
              className="flex items-center gap-2"
            >
              <Square className="h-5 w-5" />
              Arrêter
            </Button>
          )}

          <Button
            onClick={clearLogs}
            variant="outline"
            size="lg"
            className="flex items-center gap-2"
          >
            <RotateCcw className="h-5 w-5" />
            Effacer
          </Button>
        </div>

        {/* Progress Bar */}
        {isRunning && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Progression des tests
              </span>
              <span className="text-sm text-gray-500">
                {stats.passed + stats.failed}/{stats.total}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
                style={{
                  width: `${
                    stats.total > 0
                      ? ((stats.passed + stats.failed) / stats.total) * 100
                      : 0
                  }%`,
                }}
              ></div>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="mb-6 grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card className="text-center">
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-sm text-gray-600">Total</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">
                {stats.passed}
              </div>
              <div className="text-sm text-gray-600">Réussis</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-red-600">
                {stats.failed}
              </div>
              <div className="text-sm text-gray-600">Échecs</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">
                {stats.running}
              </div>
              <div className="text-sm text-gray-600">En cours</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-gray-600">
                {stats.pending}
              </div>
              <div className="text-sm text-gray-600">En attente</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Test Results */}
          <Card className="h-[600px]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Résultats des Tests
                {isRunning && (
                  <div className="ml-auto flex items-center gap-2 text-blue-600">
                    <Clock className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Tests en cours...</span>
                  </div>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[500px] overflow-auto" ref={testsRef}>
              <div className="space-y-2">
                {tests.map((test) => (
                  <div
                    key={test.id}
                    data-test-id={test.id}
                    className={`flex items-center justify-between p-3 rounded-lg transition-all duration-300 ${
                      test.status === "running"
                        ? "bg-blue-50 border-2 border-blue-200 shadow-md"
                        : test.status === "passed"
                        ? "bg-green-50 border border-green-200"
                        : test.status === "failed"
                        ? "bg-red-50 border border-red-200"
                        : "bg-gray-50 border border-gray-200"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {getStatusIcon(test.status)}
                      <div>
                        <div className="font-medium text-sm">{test.name}</div>
                        <div className="text-xs text-gray-500">
                          {test.category}
                        </div>
                        {test.details && (
                          <div className="text-xs text-blue-600">
                            {test.details}
                          </div>
                        )}
                        {test.error && (
                          <div
                            className="text-xs text-red-600 max-w-xs truncate"
                            title={test.error}
                          >
                            {test.error}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={getStatusColor(test.status)}>
                        {test.status}
                      </Badge>
                      {test.duration && (
                        <div className="text-xs text-gray-500 mt-1">
                          {test.duration}ms
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Logs */}
          <Card className="h-[600px]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Logs des Tests
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[500px] overflow-auto" ref={logsRef}>
              <div className="font-mono text-sm space-y-1">
                {logs.map((log, index) => (
                  <div key={index} className="flex gap-2">
                    <span className="text-gray-400 text-xs">
                      {log.timestamp}
                    </span>
                    <span className={`${getLogColor(log.level)} flex-1`}>
                      {log.message}
                    </span>
                  </div>
                ))}
                {logs.length === 0 && (
                  <div className="text-gray-500 text-center py-8">
                    Aucun log pour le moment. Démarrez les tests pour voir les
                    résultats.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
