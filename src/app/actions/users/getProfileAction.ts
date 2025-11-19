"use server";

import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { verifyToken } from "@/app/utils/auth";
import {
  getUserProjectRole,
  hasProjectAccess,
  Role,
} from "@/app/utils/permissions";

export const getProjectByIdAction = async (projectId: string) => {
  if (!projectId) throw new Error("ID du projet manquant");

  // 🔐 Authentification
  const cookieStore = await cookies();
  const authToken = cookieStore.get("auth_token")?.value;
  if (!authToken) throw new Error("Non authentifié");

  const user = await verifyToken(authToken);
  if (!user) throw new Error("Token invalide");

  // console.log("DEBUG authToken:", authToken);
  // console.log("DEBUG verifyToken result:", user);

  // 🔎 Vérification d’accès
  const access = await hasProjectAccess(user.userId, projectId);
  // console.log("DEBUG getProjectByIdAction - Access granted:", access);

  if (!access) throw new Error("Accès refusé au projet");

  // 📦 Requête principale avec toutes les relations nécessaires
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      owner: { select: { id: true, name: true, email: true } },
      members: {
        include: { user: { select: { id: true, name: true, email: true } } },
      },
      tasks: {
        include: {
          creator: { select: { id: true, name: true, email: true } },
          assignees: {
            include: {
              user: { select: { id: true, name: true, email: true } },
            },
          },
          comments: {
            include: {
              author: { select: { id: true, name: true, email: true } },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      },
      _count: { select: { tasks: true } },
    },
  });

  if (!project) throw new Error("Projet non trouvé");

  const role: Role | null = await getUserProjectRole(user.userId, projectId);
  // console.log("DEBUG getProjectByIdAction - User role:", role);

  return { ...project, userRole: role };
};
