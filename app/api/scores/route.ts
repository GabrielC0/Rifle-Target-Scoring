import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { playerId, score, shotNumber, x, y, ring } = await request.json();

    if (!playerId || score === undefined || shotNumber === undefined) {
      return NextResponse.json(
        { error: "playerId, score et shotNumber sont requis" },
        { status: 400 }
      );
    }

    // Vérifier que le joueur existe
    const player = await prisma.player.findUnique({
      where: { id: playerId },
    });

    if (!player) {
      return NextResponse.json({ error: "Joueur non trouvé" }, { status: 404 });
    }

    // Calculer la précision (distance du centre en pourcentage)
    let precision = 0;
    if (x !== undefined && y !== undefined) {
      const distance = Math.sqrt(x * x + y * y);
      const maxDistance = 5; // Rayon maximum de la cible
      precision = Math.max(0, 100 - (distance / maxDistance) * 100);
    } else {
      // Si pas de coordonnées, estimer la précision basée sur le score
      precision = (score / 10) * 100;
    }

    const newScore = await prisma.score.create({
      data: {
        playerId,
        shotNumber,
        value: score,
        x,
        y,
        precision: Number(precision.toFixed(2)),
        ring,
      },
    });

    return NextResponse.json(newScore, { status: 201 });
  } catch (error) {
    console.error("Erreur lors de la création du score:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création du score" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { playerId } = await request.json();

    if (!playerId) {
      return NextResponse.json(
        { error: "playerId est requis" },
        { status: 400 }
      );
    }

    // Supprimer tous les scores du joueur
    await prisma.score.deleteMany({
      where: { playerId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur lors de la suppression des scores:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression des scores" },
      { status: 500 }
    );
  }
}
