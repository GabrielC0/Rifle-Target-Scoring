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
    const totalScore = player.scores.reduce(
      (sum, score) => sum + score.value,
      0
    );
    const shotCount = player.scores.length;
    const averageScore = shotCount > 0 ? totalScore / shotCount : 0;

    const playerWithStats = {
      id: player.id,
      name: player.name,
      totalScore,
      averageScore: Number(averageScore.toFixed(2)),
      shotCount,
      scores: player.scores.map((score) => score.value),
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
