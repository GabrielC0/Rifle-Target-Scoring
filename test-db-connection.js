const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient({
  log: ["query", "error", "warn"],
  datasourceUrl: process.env.DATABASE_URL,
});

async function testConnection() {
  try {
    console.log("🔄 Test de connexion à Prisma Accelerate...");
    console.log(
      "DATABASE_URL:",
      process.env.DATABASE_URL ? "Configuré" : "Non configuré"
    );

    // Test de connexion simple
    await prisma.$connect();
    console.log("✅ Connexion réussie !");

    // Test d'une requête simple
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log("✅ Requête test réussie:", result);

    // Compter les joueurs
    const playerCount = await prisma.player.count();
    console.log(`📊 Nombre de joueurs: ${playerCount}`);

    // Lister les joueurs
    const players = await prisma.player.findMany({
      include: {
        scores: true,
      },
    });
    console.log("👥 Joueurs:", players);
  } catch (error) {
    console.error("❌ Erreur:", error);
    if (error.message) {
      console.error("Message:", error.message);
    }
    if (error.code) {
      console.error("Code:", error.code);
    }
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
