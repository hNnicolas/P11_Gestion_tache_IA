export const runtime = "nodejs";

("use server");

import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";
import { validateUpdateProfileData } from "@/app/utils/validation";

const JWT_SECRET = process.env.JWT_SECRET || "secret";

interface UpdateProfileInput {
  name?: string;
  email?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

export async function updateProfileAction({
  name,
  email,
}: UpdateProfileInput): Promise<User> {
  console.log("[updateProfileAction] Start");

  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  if (!token) {
    console.error("[updateProfileAction] Utilisateur non authentifié");
    throw new Error("Utilisateur non authentifié");
  }

  let decoded: { userId: string; email: string; name?: string };
  try {
    decoded = jwt.verify(token, JWT_SECRET) as typeof decoded;
    console.log("[updateProfileAction] Token décodé:", decoded);
  } catch (err) {
    console.error("[updateProfileAction] JWT invalide", err);
    throw new Error("Token invalide");
  }

  const errors = validateUpdateProfileData({ name, email });
  if (errors.length > 0) {
    console.error("[updateProfileAction] Erreurs de validation:", errors);
    throw new Error(errors[0].message);
  }

  if (email && email.toLowerCase() !== decoded.email.toLowerCase()) {
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
    if (existingUser) {
      console.error(
        "[updateProfileAction] Email déjà utilisé:",
        email.toLowerCase()
      );
      throw new Error("Un utilisateur avec cet email existe déjà");
    }
  }

  let updatedUserRaw;
  try {
    updatedUserRaw = await prisma.user.update({
      where: { id: decoded.userId },
      data: {
        name: name?.trim() ?? decoded.name ?? "",
        email: email?.toLowerCase() ?? decoded.email,
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  } catch (err) {
    console.error("[updateProfileAction] Erreur prisma.update", err);
    throw new Error("Erreur lors de la mise à jour du profil");
  }

  const updatedUser: User = {
    ...updatedUserRaw,
    name: updatedUserRaw.name ?? "",
  };

  console.log("[updateProfileAction] Utilisateur mis à jour:", updatedUser);
  console.log("[updateProfileAction] Fin avec succès");

  return updatedUser;
}
