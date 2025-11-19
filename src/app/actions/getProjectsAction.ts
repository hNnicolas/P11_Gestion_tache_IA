"use server";

import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { getUserProjectRole, Role } from "@/app/utils/permissions";

const JWT_SECRET = process.env.JWT_SECRET || "changeme";

export const getProjectsAction = async () => {
  const cookieStore = await cookies();
  const authToken = cookieStore.get("auth_token")?.value;

  if (!authToken) throw new Error("Non authentifié");

  // Décoder le token JWT et récupérer le userId
  let user: { userId: string; email: string; name: string };
  try {
    user = jwt.verify(authToken, JWT_SECRET) as any;
  } catch (err) {
    throw new Error("Token invalide");
  }

  const userId = user.userId;

  // Récupérer tous les projets où l'utilisateur est propriétaire ou membre
  const projects = await prisma.project.findMany({
    where: {
      OR: [{ ownerId: userId }, { members: { some: { userId } } }],
    },
    include: {
      tasks: true,
      owner: { select: { id: true, email: true, name: true } },
      members: {
        include: { user: { select: { id: true, email: true, name: true } } },
      },
      _count: { select: { tasks: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  // Annoter chaque projet avec le rôle de l'utilisateur
  const projectsWithRole = await Promise.all(
    projects.map(async (project) => {
      const role: Role | null = await getUserProjectRole(userId, project.id);
      return { ...project, userRole: role };
    })
  );

  // Filtrer les projets auxquels l'utilisateur n'a pas de rôle
  const accessibleProjects = projectsWithRole.filter(
    (project) => project.userRole !== null
  );

  return accessibleProjects;
};
