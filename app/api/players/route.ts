import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    console.log("🔄 API /players - Début de la requête GET");

    const players = await prisma.player.findMany({
      include: {
        scores: true,
        sessions: {
          include: {
            scores: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    console.log(`📊 ${players.length} joueurs trouvés dans la base`);

    // Calculer les statistiques pour chaque joueur
    const playersWithStats = players.map((player) => {
      const validScores = player.scores || [];
      const totalScore = validScores.reduce(
        (sum, score) => sum + (score.value || 0),
        0
      );
      const shotCount = validScores.length;
      const averageScore = shotCount > 0 ? totalScore / shotCount : 0;

      const result = {
        id: player.id,
        name: player.name,
        totalScore: Math.round(totalScore * 100) / 100, // Arrondir à 2 décimales
        averageScore: Number(averageScore.toFixed(2)),
        shotCount,
        scores: validScores
          .sort((a, b) => a.shotNumber - b.shotNumber) // Trier par numéro de tir
          .map((score) => Number(score.value.toFixed(1))), // Arrondir les scores
        totalShots: 10, // Par défaut
        createdAt: player.createdAt,
        updatedAt: player.updatedAt,
      };

      console.log(
        `👤 Joueur traité: ${
          player.name
        } - ${shotCount} tirs - Score: ${totalScore.toFixed(2)}`
      );
      return result;
    });

    console.log("✅ Données à retourner:", playersWithStats);
    return NextResponse.json(playersWithStats);
  } catch (error) {
    console.error("Erreur lors de la récupération des joueurs:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des joueurs" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name } = await request.json();

    if (!name || typeof name !== "string") {
      return NextResponse.json(
        { error: "Le nom du joueur est requis" },
        { status: 400 }
      );
    }

    const player = await prisma.player.create({
      data: {
        name: name.trim(),
      },
    });

    // Retourner le joueur avec les statistiques par défaut
    const playerWithStats = {
      id: player.id,
      name: player.name,
      totalScore: 0,
      averageScore: 0,
      shotCount: 0,
      scores: [],
      totalShots: 10,
      createdAt: player.createdAt,
      updatedAt: player.updatedAt,
    };

    return NextResponse.json(playerWithStats, { status: 201 });
  } catch (error: any) {
    console.error("Erreur lors de la création du joueur:", error);

    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Un joueur avec ce nom existe déjà" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Erreur lors de la création du joueur" },
      { status: 500 }
    );
  }
}
