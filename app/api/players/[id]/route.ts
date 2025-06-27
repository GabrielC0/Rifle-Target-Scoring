import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;

    const player = await prisma.player.findUnique({
      where: { id },
      include: {
        scores: true,
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
      totalScore: Math.round(totalScore * 100) / 100,
      averageScore: Number(averageScore.toFixed(2)),
      shotCount,
      scores: validScores
        .sort((a, b) => a.shotNumber - b.shotNumber)
        .map((score) => Number(score.value.toFixed(1))),
      totalShots: (player as any).totalShots || 10,
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

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;

    // Vérifier que le joueur existe
    const existingPlayer = await prisma.player.findUnique({
      where: { id },
    });

    if (!existingPlayer) {
      return NextResponse.json({ error: "Joueur non trouvé" }, { status: 404 });
    }

    // Supprimer le joueur (les scores et sessions seront supprimés automatiquement via CASCADE)
    await prisma.player.delete({
      where: { id },
    });

    console.log(`🗑️ Joueur supprimé: ${existingPlayer.name} (${id})`);

    return NextResponse.json({
      message: "Joueur supprimé avec succès",
      deletedPlayer: {
        id: existingPlayer.id,
        name: existingPlayer.name,
      },
    });
  } catch (error) {
    console.error("Erreur lors de la suppression du joueur:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression du joueur" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;
    const body = await request.json();

    // Vérifier que le joueur existe
    const existingPlayer = await prisma.player.findUnique({
      where: { id },
      include: {
        scores: true,
      },
    });

    if (!existingPlayer) {
      return NextResponse.json({ error: "Joueur non trouvé" }, { status: 404 });
    }

    // Si c'est une action de reset des scores
    if (body.action === "reset-scores") {
      // Supprimer tous les scores du joueur
      await prisma.score.deleteMany({
        where: { playerId: id },
      });

      console.log(`🔄 Scores réinitialisés pour: ${existingPlayer.name}`);

      // Retourner le joueur avec les statistiques mises à jour
      const updatedPlayer = {
        id: existingPlayer.id,
        name: existingPlayer.name,
        totalScore: 0,
        averageScore: 0,
        shotCount: 0,
        scores: [],
        totalShots: (existingPlayer as any).totalShots || 10,
        createdAt: existingPlayer.createdAt,
        updatedAt: new Date(),
      };

      return NextResponse.json(updatedPlayer);
    }

    // Mise à jour normale du joueur
    const updatedPlayer = await prisma.player.update({
      where: { id },
      data: {
        name: body.name || existingPlayer.name,
        totalShots: body.totalShots || (existingPlayer as any).totalShots || 10,
      },
      include: {
        scores: true,
      },
    });

    // Calculer les statistiques
    const validScores = updatedPlayer.scores || [];
    const totalScore = validScores.reduce(
      (sum, score) => sum + (score.value || 0),
      0
    );
    const shotCount = validScores.length;
    const averageScore = shotCount > 0 ? totalScore / shotCount : 0;

    const playerWithStats = {
      id: updatedPlayer.id,
      name: updatedPlayer.name,
      totalScore: Math.round(totalScore * 100) / 100,
      averageScore: Number(averageScore.toFixed(2)),
      shotCount,
      scores: validScores
        .sort((a, b) => a.shotNumber - b.shotNumber)
        .map((score) => Number(score.value.toFixed(1))),
      totalShots: (updatedPlayer as any).totalShots || 10,
      createdAt: updatedPlayer.createdAt,
      updatedAt: updatedPlayer.updatedAt,
    };

    return NextResponse.json(playerWithStats);
  } catch (error) {
    console.error("Erreur lors de la mise à jour du joueur:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour du joueur" },
      { status: 500 }
    );
  }
}
