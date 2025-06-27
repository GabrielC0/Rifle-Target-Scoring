import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: "Nom d'utilisateur et mot de passe requis" },
        { status: 400 }
      );
    }

    // Vérifier les identifiants (hardcodé pour root/admin)
    if (username === "root" && password === "admin") {
      // Générer un token simple
      const token = `auth_token_${Date.now()}_${Math.random()}`;

      return NextResponse.json({
        success: true,
        token,
        user: { username: "root", id: "root" },
      });
    }

    return NextResponse.json(
      { error: "Identifiants invalides" },
      { status: 401 }
    );
  } catch (error) {
    console.error("Erreur de connexion:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
