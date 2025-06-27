/**
 * Test de fonctionnement réel de l'API d'authentification
 * Ce script teste l'API en cours d'exécution
 */

const API_BASE_URL = "http://localhost:3000";

async function testAuthAPI() {
  console.log("🔐 Test de l'API d'Authentification");
  console.log("====================================\n");

  // Test 1: Connexion avec identifiants valides
  console.log("📋 Test 1: Connexion avec identifiants valides (root/admin)");
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: "root",
        password: "admin",
      }),
    });

    const data = await response.json();

    if (response.ok && data.success) {
      console.log("✅ PASS - Connexion réussie");
      console.log(`   Token généré: ${data.token.substring(0, 30)}...`);
      console.log(`   Utilisateur: ${data.user.username}`);
    } else {
      console.log("❌ FAIL - Connexion échouée");
      console.log(`   Erreur: ${data.error || "Erreur inconnue"}`);
    }
  } catch (error) {
    console.log("❌ FAIL - Erreur réseau");
    console.log(`   Erreur: ${error.message}`);
  }

  // Test 2: Connexion avec identifiants invalides
  console.log("\n📋 Test 2: Connexion avec identifiants invalides");
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: "wrong",
        password: "wrong",
      }),
    });

    const data = await response.json();

    if (response.status === 401 && data.error === "Identifiants invalides") {
      console.log("✅ PASS - Identifiants invalides correctement rejetés");
    } else {
      console.log("❌ FAIL - Comportement inattendu");
      console.log(`   Status: ${response.status}`);
      console.log(`   Data: ${JSON.stringify(data)}`);
    }
  } catch (error) {
    console.log("❌ FAIL - Erreur réseau");
    console.log(`   Erreur: ${error.message}`);
  }

  // Test 3: Requête sans données
  console.log("\n📋 Test 3: Requête sans identifiants");
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    });

    const data = await response.json();

    if (response.status === 400 && data.error.includes("requis")) {
      console.log("✅ PASS - Champs requis correctement validés");
    } else {
      console.log("❌ FAIL - Validation des champs incorrecte");
      console.log(`   Status: ${response.status}`);
      console.log(`   Data: ${JSON.stringify(data)}`);
    }
  } catch (error) {
    console.log("❌ FAIL - Erreur réseau");
    console.log(`   Erreur: ${error.message}`);
  }

  // Test 4: Test de la route de santé (si elle existe)
  console.log("\n📋 Test 4: Vérification de la route de santé");
  try {
    const response = await fetch(`${API_BASE_URL}/api/health`);

    if (response.ok) {
      const data = await response.json();
      console.log("✅ PASS - API en fonctionnement");
      console.log(`   Status: ${data.status || "OK"}`);
    } else {
      console.log(
        "⚠️  WARN - Route de santé non disponible (normal si pas implémentée)"
      );
    }
  } catch (error) {
    console.log("⚠️  WARN - Route de santé non accessible");
  }

  console.log("\n🏁 Tests terminés!");
  console.log("\n📝 Instructions pour tester manuellement:");
  console.log("1. Démarrer l'application: npm run dev");
  console.log("2. Aller sur http://localhost:3000/test");
  console.log("3. Observer le popup de redirection");
  console.log("4. Aller sur http://localhost:3000/classement");
  console.log("5. Vérifier l'accès libre à la page");
}

// Exécuter les tests si ce script est appelé directement
if (require.main === module) {
  testAuthAPI().catch(console.error);
}

module.exports = { testAuthAPI };
