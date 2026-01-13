export const runtime = "nodejs";
// prettier-ignore
"use server";

import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export interface CreateProjectInput {
  name: string;
  description?: string;
  contributors?: string[];
}

// Enum local au serveur
enum Role {
  OWNER = "OWNER",
  ADMIN = "ADMIN",
  CONTRIBUTOR = "CONTRIBUTOR",
}

// Payload minimal du JWT côté serveur
interface JwtPayload {
  userId: string;
  email: string;
  role?: Role;
}

export async function createProjectAction(input: CreateProjectInput) {
  const { name, description, contributors } = input;

  // Récupérer le token HTTP-only
  const cookieStore = await cookies();
  const authToken = cookieStore.get("auth_token")?.value;
  if (!authToken) throw new Error("Non authentifié");

  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET manquant");

  // Décoder le token côté serveur
  let decoded: JwtPayload;
  try {
    decoded = jwt.verify(authToken, secret) as JwtPayload;
  } catch {
    throw new Error("Token invalide ou expiré");
  }

  const userId = decoded.userId;

  // Créer le projet
  const project = await prisma.project.create({
    data: {
      name: name.trim(),
      description: description?.trim() || null,
      ownerId: userId,
    },
    include: {
      owner: { select: { id: true, name: true, email: true } },
      members: {
        include: { user: { select: { id: true, name: true, email: true } } },
      },
      _count: { select: { tasks: true } },
    },
  });

  console.log(
    `Projet "${project.name}" créé avec succès par l'utilisateur ${decoded.email}`
  );

  // Ajouter les contributeurs
  if (contributors && contributors.length > 0) {
    const contributorUsers = await prisma.user.findMany({
      where: { email: { in: contributors.map((e) => e.toLowerCase()) } },
      select: { id: true, email: true },
    });

    for (const user of contributorUsers) {
      try {
        await prisma.projectMember.create({
          data: {
            userId: user.id,
            projectId: project.id,
            role: Role.CONTRIBUTOR,
          },
        });
      } catch {
        console.log(`Utilisateur ${user.email} déjà membre`);
      }
    }
  }

  return project;
}
