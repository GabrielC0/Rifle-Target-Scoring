import type { Metadata } from "next";
import "./globals.css";
import { ScoringProvider } from "@/contexts/scoring-context";
import { Navigation } from "@/components/navigation";

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
        <ScoringProvider>
          <Navigation />
          <div className="pb-20">{children}</div>
        </ScoringProvider>
      </body>
    </html>
  );
}
