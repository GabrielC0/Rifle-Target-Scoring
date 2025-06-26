// Script de débogage pour tester le chargement des données
console.log("🔧 Script de débogage - Test des APIs");

async function testAPIs() {
  try {
    console.log("🧪 Test de l'API Health Check...");
    const healthResponse = await fetch("/api/health");
    const healthData = await healthResponse.json();
    console.log("💚 Health Check:", healthData);

    console.log("🧪 Test de l'API Players...");
    const playersResponse = await fetch("/api/players");
    const playersData = await playersResponse.json();
    console.log("👥 Players API Response:", playersData);

    console.log("🧪 Test de l'API Scores...");
    const scoresResponse = await fetch("/api/scores");
    const scoresData = await scoresResponse.json();
    console.log("🎯 Scores API Response:", scoresData);
  } catch (error) {
    console.error("❌ Erreur lors du test des APIs:", error);
  }
}

// Lancer le test quand la page est chargée
if (typeof window !== "undefined") {
  window.testAPIs = testAPIs;
  console.log("🚀 Fonctions de test disponibles: window.testAPIs()");
}
