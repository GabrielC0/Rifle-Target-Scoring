import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    console.log("🔍 Diagnostic de la base de données...");

    // Test de connexion
    const dbTest = await prisma.$queryRaw`SELECT 1 as test`;
    console.log("✅ Connexion à la base de données OK:", dbTest);

    // Compter les joueurs
    const playerCount = await prisma.player.count();
    console.log(`📊 Nombre de joueurs: ${playerCount}`);

    // Compter les scores
    const scoreCount = await prisma.score.count();
    console.log(`🎯 Nombre de scores: ${scoreCount}`);

    // Lister tous les joueurs avec leurs scores
    const players = await prisma.player.findMany({
      include: {
        scores: {
          orderBy: {
            shotNumber: "asc",
          },
        },
      },
    });

    console.log("👥 Joueurs détaillés:");
    players.forEach((player) => {
      console.log(`- Joueur: ${player.name} (${player.id})`);
      console.log(`  Scores dans la DB: ${player.scores.length}`);
      console.log(`  Scores détaillés:`, player.scores);
    });

    const diagnostic = {
      status: "OK",
      timestamp: new Date().toISOString(),
      database: {
        connected: true,
        playerCount,
        scoreCount,
      },
      players: players.map((player) => ({
        id: player.id,
        name: player.name,
        scoreCount: player.scores.length,
        scores: player.scores.map((s) => s.value),
        rawScoreData: player.scores, // Ajout des données brutes pour debug
        createdAt: player.createdAt,
      })),
    };

    return NextResponse.json(diagnostic);
  } catch (error) {
    console.error("❌ Erreur lors du diagnostic:", error);
    return NextResponse.json(
      {
        status: "ERROR",
        error: error instanceof Error ? error.message : "Erreur inconnue",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
