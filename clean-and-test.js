const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient({
  log: ["query", "error", "warn"],
  datasourceUrl: process.env.DATABASE_URL,
});

async function cleanAndTest() {
  try {
    console.log("🧹 Nettoyage complet de la base...");

    // Supprimer tous les scores
    await prisma.score.deleteMany();
    console.log("✅ Tous les scores supprimés");

    // Supprimer tous les joueurs
    await prisma.player.deleteMany();
    console.log("✅ Tous les joueurs supprimés");

    // Créer un nouveau joueur de test
    const newPlayer = await prisma.player.create({
      data: {
        name: "TestUser",
      },
    });
    console.log(`✅ Nouveau joueur créé: ${newPlayer.name} (${newPlayer.id})`);

    // Ajouter exactement 3 scores pour tester
    const testScores = [8, 9, 7];

    for (let i = 0; i < testScores.length; i++) {
      const score = await prisma.score.create({
        data: {
          playerId: newPlayer.id,
          shotNumber: i + 1,
          value: testScores[i],
          precision: (testScores[i] / 10) * 100,
        },
      });
      console.log(
        `✅ Score ${i + 1}: ${testScores[i]} (precision: ${score.precision}%)`
      );
    }

    // Vérifier le résultat final
    const finalPlayer = await prisma.player.findUnique({
      where: { id: newPlayer.id },
      include: {
        scores: {
          orderBy: {
            shotNumber: "asc",
          },
        },
      },
    });

    console.log("\n📊 État final:");
    console.log(`- Joueur: ${finalPlayer.name}`);
    console.log(`- Nombre de scores: ${finalPlayer.scores.length}`);
    console.log(
      `- Scores: [${finalPlayer.scores.map((s) => s.value).join(", ")}]`
    );
    console.log(
      `- Total calculé: ${finalPlayer.scores.reduce(
        (sum, s) => sum + s.value,
        0
      )}`
    );
    console.log(`- shotCount attendu: ${finalPlayer.scores.length}`);
    console.log(`- currentShot devrait être: ${finalPlayer.scores.length}`);
    console.log(`- Prochain tir serait: ${finalPlayer.scores.length + 1}/10`);

    // Test de l'API players pour voir ce qu'elle retourne
    console.log("\n🧪 Test de l'API:");
    const apiResponse = await fetch("http://localhost:3000/api/players");
    if (apiResponse.ok) {
      const apiData = await apiResponse.json();
      console.log("API Response:", JSON.stringify(apiData, null, 2));
    } else {
      console.log("❌ API non accessible (serveur pas démarré?)");
    }
  } catch (error) {
    console.error("❌ Erreur:", error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanAndTest();
