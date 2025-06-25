import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
    // Configuration optimisée pour Prisma Accelerate
    datasourceUrl: process.env.DATABASE_URL,
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// Fonction pour vérifier la connexion
export async function checkDatabaseConnection() {
  try {
    await prisma.$connect();
    console.log("✅ Base de données connectée via Prisma Accelerate");
    return true;
  } catch (error) {
    console.error("❌ Erreur de connexion à la base de données:", error);
    return false;
  }
}

// Fonction pour obtenir les métriques de performance (spécifique à Accelerate)
export async function getDatabaseMetrics() {
  try {
    const startTime = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    const responseTime = Date.now() - startTime;
    return {
      responseTime,
      status: "connected",
      accelerate: true,
    };
  } catch (error) {
    return {
      responseTime: -1,
      status: "error",
      accelerate: true,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
