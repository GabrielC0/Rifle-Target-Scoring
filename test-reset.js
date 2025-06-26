const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient({
  log: ["query", "error", "warn"],
  datasourceUrl: process.env.DATABASE_URL,
});

async function testResetFunction() {
  try {
    console.log("🔄 Test de la fonction reset...");

    // Trouver le premier joueur
    const players = await prisma.player.findMany({
      include: {
        scores: true,
      },
    });

    if (players.length === 0) {
      console.log("❌ Aucun joueur trouvé");
      return;
    }

    const player = players[0];
    console.log(
      `👤 Joueur trouvé: ${player.name} avec ${player.scores.length} scores`
    );

    // Réinitialiser les scores
    console.log("🗑️ Suppression des scores...");
    await prisma.score.deleteMany({
      where: { playerId: player.id },
    });

    // Vérifier que les scores ont été supprimés
    const updatedPlayer = await prisma.player.findUnique({
      where: { id: player.id },
      include: {
        scores: true,
      },
    });

    console.log(`✅ Scores après reset: ${updatedPlayer.scores.length}`);

    if (updatedPlayer.scores.length === 0) {
      console.log("✅ Reset réussi !");
    } else {
      console.log("❌ Reset échoué");
    }
  } catch (error) {
    console.error("❌ Erreur:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testResetFunction();
