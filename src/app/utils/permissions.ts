import { prisma } from "@/lib/prisma";

// Type des rôles
export type Role = "OWNER" | "ADMIN" | "CONTRIBUTOR";

/**
 * Récupère le rôle de l'utilisateur dans un projet
 * @param userId - ID de l'utilisateur
 * @param projectId - ID du projet
 * @returns Role ou null si l'utilisateur n'a pas accès
 */
export async function getUserProjectRole(
  userId: string | null | undefined,
  projectId: string | null | undefined
): Promise<Role | null> {
  if (!userId || !projectId) return null;

  // Vérifie si l'utilisateur est propriétaire
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { ownerId: true },
  });

  if (!project) return null;
  if (project.ownerId === userId) return "OWNER";

  // Vérifie si l'utilisateur est membre
  const member = await prisma.projectMember.findFirst({
    where: { userId, projectId },
    select: { role: true },
  });

  // Cast du rôle en type Role pour la sécurité TypeScript
  if (member?.role === "ADMIN" || member?.role === "CONTRIBUTOR") {
    return member.role as Role;
  }

  return null;
}

/**
 * Vérifie si un utilisateur a accès à un projet
 * @param userId - ID de l'utilisateur
 * @param projectId - ID du projet
 * @returns true si l'utilisateur est propriétaire ou membre
 */
export async function hasProjectAccess(
  userId: string | null | undefined,
  projectId: string | null | undefined
): Promise<boolean> {
  const role = await getUserProjectRole(userId, projectId);
  return role !== null;
}
