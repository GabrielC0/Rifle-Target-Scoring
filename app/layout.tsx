import type { Metadata } from "next";
import "./globals.css";
import { ScoringProvider } from "@/contexts/scoring-context";

export const metadata: Metadata = {
  title: "Système de Score de Tir à la Carabine",
  description: "Application de gestion des scores de tir à la carabine",
  generator: "v0.dev",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body>
        <ScoringProvider>{children}</ScoringProvider>
        <script
          dangerouslySetInnerHTML={{
            __html: `
            console.log("🔧 Script de débogage - Test des APIs");

            async function testAPIs() {
              try {
                console.log("🧪 Test de l'API Health Check...");
                const healthResponse = await fetch('/api/health');
                const healthData = await healthResponse.json();
                console.log("💚 Health Check:", healthData);

                console.log("🧪 Test de l'API Players...");
                const playersResponse = await fetch('/api/players');
                const playersData = await playersResponse.json();
                console.log("👥 Players API Response:", playersData);

                console.log("🧪 Test de l'API Scores...");
                const scoresResponse = await fetch('/api/scores');
                const scoresData = await scoresResponse.json();
                console.log("🎯 Scores API Response:", scoresData);

              } catch (error) {
                console.error("❌ Erreur lors du test des APIs:", error);
              }
            }

            window.testAPIs = testAPIs;
            console.log("🚀 Fonctions de test disponibles: window.testAPIs()");
            
            // Test automatique au chargement
            setTimeout(() => {
              console.log("🔄 Test automatique des APIs...");
              testAPIs();
            }, 2000);
          `,
          }}
        />
      </body>
    </html>
  );
}
