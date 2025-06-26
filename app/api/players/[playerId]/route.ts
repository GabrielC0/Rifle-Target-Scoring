import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { playerId: string } }
) {
  try {
    const player = await prisma.player.findUnique({
      where: { id: params.playerId },
      include: {
        scores: {
          orderBy: {
            shotNumber: "asc",
          },
        },
        sessions: {
          include: {
            scores: true,
          },
        },
      },
    });

    if (!player) {
      return NextResponse.json({ error: "Joueur non trouvé" }, { status: 404 });
    }

    // Calculer les statistiques
    const validScores = player.scores || [];
    const totalScore = validScores.reduce(
      (sum, score) => sum + (score.value || 0),
      0
    );
    const shotCount = validScores.length;
    const averageScore = shotCount > 0 ? totalScore / shotCount : 0;

    const playerWithStats = {
      id: player.id,
      name: player.name,
      totalScore,
      averageScore: Number(averageScore.toFixed(2)),
      shotCount,
      scores: validScores.map((score) => score.value || 0),
      totalShots: 10,
      createdAt: player.createdAt,
      updatedAt: player.updatedAt,
    };

    return NextResponse.json(playerWithStats);
  } catch (error) {
    console.error("Erreur lors de la récupération du joueur:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération du joueur" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { playerId: string } }
) {
  try {
    await prisma.player.delete({
      where: { id: params.playerId },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Erreur lors de la suppression du joueur:", error);

    if (error.code === "P2025") {
      return NextResponse.json({ error: "Joueur non trouvé" }, { status: 404 });
    }

    return NextResponse.json(
      { error: "Erreur lors de la suppression du joueur" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { playerId: string } }
) {
  try {
    const { action } = await request.json();

    if (action === "reset-scores") {
      console.log(
        `🔄 Réinitialisation des scores pour le joueur: ${params.playerId}`
      );

      // Supprimer tous les scores du joueur
      await prisma.score.deleteMany({
        where: { playerId: params.playerId },
      });

      // Récupérer le joueur mis à jour
      const player = await prisma.player.findUnique({
        where: { id: params.playerId },
        include: {
          scores: {
            orderBy: {
              shotNumber: "asc",
            },
          },
        },
      });

      if (!player) {
        return NextResponse.json(
          { error: "Joueur non trouvé" },
          { status: 404 }
        );
      }

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

      console.log(`✅ Scores réinitialisés pour ${player.name}`);
      return NextResponse.json(playerWithStats);
    }

    return NextResponse.json(
      { error: "Action non supportée" },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("Erreur lors de la mise à jour du joueur:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour du joueur" },
      { status: 500 }
    );
  }
}
