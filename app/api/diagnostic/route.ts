import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    console.log("🔍 Démarrage du diagnostic système");

    // Test de connexion Prisma
    const startTime = Date.now();

    // Test simple de requête
    const playerCount = await prisma.player.count();
    const scoreCount = await prisma.score.count();
    const sessionCount = await prisma.session.count();

    const queryTime = Date.now() - startTime;

    // Tester une requête plus complexe
    const complexStartTime = Date.now();
    const playersWithScores = await prisma.player.findMany({
      include: {
        scores: true,
        _count: {
          select: {
            scores: true,
            sessions: true,
          },
        },
      },
      take: 5, // Limiter pour le diagnostic
    });
    const complexQueryTime = Date.now() - complexStartTime;

    // Informations sur le schéma
    const schemaInfo = {
      models: ["Player", "Score", "Session", "Settings"],
      playerFields: ["id", "name", "totalShots", "createdAt", "updatedAt"],
      scoreFields: [
        "id",
        "playerId",
        "sessionId",
        "shotNumber",
        "value",
        "x",
        "y",
        "precision",
        "ring",
        "timestamp",
        "notes",
      ],
      sessionFields: [
        "id",
        "playerId",
        "startTime",
        "endTime",
        "isActive",
        "targetDistance",
        "targetType",
        "maxShots",
      ],
    };

    const diagnostic = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      database: {
        connected: true,
        provider: "postgresql",
        performance: {
          simpleQueryTime: `${queryTime}ms`,
          complexQueryTime: `${complexQueryTime}ms`,
        },
        counts: {
          players: playerCount,
          scores: scoreCount,
          sessions: sessionCount,
        },
        sampleData: {
          playersWithScores: playersWithScores.map((p) => ({
            id: p.id,
            name: p.name,
            totalShots: (p as any).totalShots || 10,
            scoreCount: p._count.scores,
            sessionCount: p._count.sessions,
          })),
        },
      },
      schema: schemaInfo,
      environment: {
        nodeEnv: process.env.NODE_ENV,
        databaseUrl: process.env.DATABASE_URL ? "configured" : "missing",
      },
    };

    console.log("✅ Diagnostic terminé avec succès");
    return NextResponse.json(diagnostic);
  } catch (error) {
    console.error("❌ Erreur lors du diagnostic:", error);

    const errorDiagnostic = {
      status: "error",
      timestamp: new Date().toISOString(),
      error: {
        message: error instanceof Error ? error.message : "Erreur inconnue",
        type: error instanceof Error ? error.constructor.name : "Unknown",
        stack: error instanceof Error ? error.stack : undefined,
      },
      database: {
        connected: false,
      },
      environment: {
        nodeEnv: process.env.NODE_ENV,
        databaseUrl: process.env.DATABASE_URL ? "configured" : "missing",
      },
    };

    return NextResponse.json(errorDiagnostic, { status: 500 });
  }
}
