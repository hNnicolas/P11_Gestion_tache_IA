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

  // Vérifie si l'utilisateur est propriétaire → OWNER
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { ownerId: true },
  });
  if (!project) return null;
  if (project.ownerId === userId) return "OWNER";

  // Vérifie si l'utilisateur est membre → ADMIN ou CONTRIBUTOR
  const member = await prisma.projectMember.findFirst({
    where: { userId, projectId },
    select: { role: true },
  });

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

/**
 * Vérifie si un utilisateur peut créer des tâches
 * Seuls OWNER et ADMIN peuvent créer des tâches
 */
export async function canCreateTasks(
  userId: string | null | undefined,
  projectId: string | null | undefined
): Promise<boolean> {
  const role = await getUserProjectRole(userId, projectId);
  return role === "OWNER" || role === "ADMIN"; // Seuls OWNER et ADMIN peuvent créer des tâches
}

/**
 * Vérifie si un utilisateur peut modifier ou supprimer des tâches
 * Seuls OWNER et ADMIN peuvent modifier
 */
export async function canModifyTasks(
  userId: string | null | undefined,
  projectId: string | null | undefined
): Promise<boolean> {
  const role = await getUserProjectRole(userId, projectId);
  return role === "OWNER" || role === "ADMIN";
}

/**
 * Vérifie si un utilisateur peut modifier un projet (OWNER ou ADMIN)
 */
export async function canModifyProject(
  userId: string | null | undefined,
  projectId: string | null | undefined
): Promise<boolean> {
  const role = await getUserProjectRole(userId, projectId);
  return role === "OWNER" || role === "ADMIN";
}

/**
 * Vérifie si un utilisateur peut supprimer un projet (seul OWNER)
 */
export async function canDeleteProject(
  userId: string | null | undefined,
  projectId: string | null | undefined
): Promise<boolean> {
  if (!userId || !projectId) return false;

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { ownerId: true },
  });

  return project?.ownerId === userId;
}
