// src/app/actions/user.ts
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET || "secret";

export async function getUser() {
  try {
    // Récupération du cookie HTTP-only
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get("auth_token");

    if (!tokenCookie) {
      return null; // pas connecté
    }

    const token = tokenCookie.value;

    // Vérification et décodage du JWT
    const payload = jwt.verify(token, JWT_SECRET) as { email: string };

    if (!payload?.email) {
      return null;
    }

    // Récupération de l'utilisateur depuis la base
    const user = await prisma.user.findUnique({
      where: { email: payload.email },
      select: { id: true, name: true, email: true },
    });

    return user;
  } catch (err) {
    console.error("Erreur getUser:", err);
    return null;
  }
}
