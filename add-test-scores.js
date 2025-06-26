const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient({
  log: ["query", "error", "warn"],
  datasourceUrl: process.env.DATABASE_URL,
});

async function addTestScores() {
  try {
    console.log("🎯 Ajout de scores de test...");

    // Trouver le joueur
    const player = await prisma.player.findFirst();
    if (!player) {
      console.log("❌ Aucun joueur trouvé");
      return;
    }

    console.log(`👤 Joueur: ${player.name}`);

    // Ajouter quelques scores
    const scores = [9, 8, 10, 7, 9];

    for (let i = 0; i < scores.length; i++) {
      await prisma.score.create({
        data: {
          playerId: player.id,
          shotNumber: i + 1,
          value: scores[i],
          precision: (scores[i] / 10) * 100,
        },
      });
      console.log(`✅ Score ${i + 1}: ${scores[i]}`);
    }

    console.log("✅ Scores de test ajoutés !");
  } catch (error) {
    console.error("❌ Erreur:", error);
  } finally {
    await prisma.$disconnect();
  }
}

addTestScores();
