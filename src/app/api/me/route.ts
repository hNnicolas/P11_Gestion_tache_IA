import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

// Initialisation du client Prisma pour interagir avec la base de données
const prisma = new PrismaClient();

/**
 * GET /api/me
 * Route pour récupérer les informations de l'utilisateur connecté
 * Le token JWT est lu depuis le cookie HTTP-only "auth_token"
 */
export async function GET(req: Request) {
  // Récupération des cookies de la requête
  const cookieHeader = req.headers.get("cookie") || "";

  // Extraction du token JWT depuis le cookie "auth_token"
  const tokenMatch = cookieHeader.match(/auth_token=([^;]+)/);
  const token = tokenMatch ? decodeURIComponent(tokenMatch[1]) : null;

  // Si aucun token n'est présent, l'utilisateur n'est pas connecté
  if (!token) {
    return NextResponse.json({ user: null });
  }

  try {
    // Récupération du secret JWT depuis les variables d'environnement
    const secret = process.env.JWT_SECRET || "secret";

    // Vérification et décodage du token JWT
    // Le payload doit contenir l'email de l'utilisateur
    const payload = jwt.verify(token, secret) as { email: string };

    // Si le token est invalide ou ne contient pas d'email, on considère l'utilisateur comme non connecté
    if (!payload?.email) {
      return NextResponse.json({ user: null });
    }

    // Recherche de l'utilisateur en base via l'email extrait du token
    const user = await prisma.user.findUnique({
      where: { email: payload.email },
      select: { id: true, name: true, email: true },
    });

    // Retour des informations de l'utilisateur au client
    return NextResponse.json({ user });
  } catch (err) {
    // En cas d'erreur (token invalide, problème base de données, etc.), renvoie null
    return NextResponse.json({ user: null });
  }
}
