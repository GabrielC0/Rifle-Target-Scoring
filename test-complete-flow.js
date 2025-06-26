const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient({
  log: ["query", "error", "warn"],
  datasourceUrl: process.env.DATABASE_URL,
});

async function testCompleteFlow() {
  try {
    console.log("🧪 Test complet du flux de données...");

    // 1. Nettoyer les données existantes
    console.log("🧹 Nettoyage des données...");
    await prisma.score.deleteMany();
    await prisma.player.deleteMany();

    // 2. Créer un nouveau joueur
    console.log("👤 Création d'un joueur de test...");
    const player = await prisma.player.create({
      data: {
        name: "TestPlayer",
      },
    });
    console.log(`✅ Joueur créé: ${player.name} (${player.id})`);

    // 3. Ajouter des scores de test
    console.log("🎯 Ajout de scores de test...");
    const testScores = [9.5, 8.2, 10.0, 7.8, 9.1];

    for (let i = 0; i < testScores.length; i++) {
      const score = await prisma.score.create({
        data: {
          playerId: player.id,
          shotNumber: i + 1,
          value: testScores[i],
          precision: (testScores[i] / 10) * 100,
        },
      });
      console.log(`✅ Score ${i + 1}: ${testScores[i]} ajouté`);
    }

    // 4. Vérifier les données via l'API
    console.log("📊 Vérification via requête API...");
    const playerWithScores = await prisma.player.findUnique({
      where: { id: player.id },
      include: {
        scores: {
          orderBy: {
            shotNumber: "asc",
          },
        },
      },
    });

    const totalScore = playerWithScores.scores.reduce(
      (sum, s) => sum + s.value,
      0
    );
    const shotCount = playerWithScores.scores.length;
    const averageScore = shotCount > 0 ? totalScore / shotCount : 0;

    console.log("📈 Statistiques calculées:");
    console.log(`  - Nom: ${playerWithScores.name}`);
    console.log(`  - Nombre de tirs: ${shotCount}`);
    console.log(`  - Score total: ${totalScore.toFixed(2)}`);
    console.log(`  - Moyenne: ${averageScore.toFixed(2)}`);
    console.log(
      `  - Scores individuels: [${playerWithScores.scores
        .map((s) => s.value)
        .join(", ")}]`
    );

    // 5. Test de reset
    console.log("🔄 Test de reset...");
    await prisma.score.deleteMany({
      where: { playerId: player.id },
    });

    const playerAfterReset = await prisma.player.findUnique({
      where: { id: player.id },
      include: { scores: true },
    });

    console.log(`✅ Après reset: ${playerAfterReset.scores.length} scores`);

    // 6. Test de limite de tirs
    console.log("🚫 Test de limite de tirs (10 maximum)...");
    for (let i = 0; i < 12; i++) {
      // Essayer d'ajouter 12 tirs
      try {
        await prisma.score.create({
          data: {
            playerId: player.id,
            shotNumber: i + 1,
            value: Math.random() * 10,
            precision: Math.random() * 100,
          },
        });
        console.log(`✅ Tir ${i + 1} ajouté`);
      } catch (error) {
        console.log(`❌ Tir ${i + 1} échoué: ${error.message}`);
      }
    }

    const finalCheck = await prisma.player.findUnique({
      where: { id: player.id },
      include: { scores: true },
    });

    console.log(`📊 Nombre final de scores: ${finalCheck.scores.length}`);
    console.log("✅ Test complet terminé !");
  } catch (error) {
    console.error("❌ Erreur dans le test:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testCompleteFlow();
