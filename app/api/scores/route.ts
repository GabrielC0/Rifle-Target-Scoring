import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { playerId, score, shotNumber, x, y, ring } = await request.json();

    console.log("🎯 Ajout de score:", {
      playerId,
      score,
      shotNumber,
      x,
      y,
      ring,
    });

    // Validation des données
    if (!playerId || score === undefined || shotNumber === undefined) {
      return NextResponse.json(
        { error: "playerId, score et shotNumber sont requis" },
        { status: 400 }
      );
    }

    // Validation du score (doit être entre 0 et 10)
    const numericScore = Number(score);
    if (isNaN(numericScore) || numericScore < 0 || numericScore > 10) {
      return NextResponse.json(
        { error: "Le score doit être un nombre entre 0 et 10" },
        { status: 400 }
      );
    }

    // Validation du numéro de tir
    const numericShotNumber = Number(shotNumber);
    if (isNaN(numericShotNumber) || numericShotNumber < 1) {
      return NextResponse.json(
        { error: "Le numéro de tir doit être un nombre positif" },
        { status: 400 }
      );
    }

    // Vérifier que le joueur existe
    const player = await prisma.player.findUnique({
      where: { id: playerId },
      include: { scores: true },
    });

    if (!player) {
      return NextResponse.json({ error: "Joueur non trouvé" }, { status: 404 });
    }

    // Vérifier qu'on ne dépasse pas le nombre maximum de tirs
    const existingScores = player.scores.length;
    console.log(`📊 Joueur ${player.name} a déjà ${existingScores} scores`);

    if (existingScores >= 10) {
      return NextResponse.json(
        { error: "Le nombre maximum de tirs (10) a été atteint" },
        { status: 400 }
      );
    }

    // Calculer la précision (distance du centre en pourcentage)
    let precision = 0;
    if (x !== undefined && y !== undefined) {
      const distance = Math.sqrt(x * x + y * y);
      const maxDistance = 5; // Rayon maximum de la cible
      precision = Math.max(0, 100 - (distance / maxDistance) * 100);
    } else {
      // Si pas de coordonnées, estimer la précision basée sur le score
      precision = (numericScore / 10) * 100;
    }

    const newScore = await prisma.score.create({
      data: {
        playerId,
        shotNumber: numericShotNumber,
        value: numericScore,
        x: x ? Number(x) : null,
        y: y ? Number(y) : null,
        precision: Number(precision.toFixed(2)),
        ring: ring ? Number(ring) : null,
      },
    });

    console.log("✅ Score créé:", newScore);
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
