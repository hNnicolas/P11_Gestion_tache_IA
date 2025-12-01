import { prisma } from "@/lib/prisma";

// Type des rôles
export type Role = "OWNER" | "ADMIN" | "CONTRIBUTOR";

// Récupère le rôle de l'utilisateur dans un projet
export async function getUserProjectRole(
  userId: string | null | undefined,
  projectId: string | null | undefined
): Promise<Role | null> {
  if (!userId || !projectId) return null;

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { ownerId: true },
  });
  if (!project) return null;
  if (project.ownerId === userId) return "OWNER";

  const member = await prisma.projectMember.findFirst({
    where: { userId, projectId },
    select: { role: true },
  });

  if (member?.role) return member.role as Role;

  return null;
}

// OWNER, ADMIN, CONTRIBUTEUR
export async function hasProjectAccess(
  userId: string | null | undefined,
  projectId: string | null | undefined
): Promise<boolean> {
  const role = await getUserProjectRole(userId, projectId);
  return role !== null;
}

// OWNER + ADMIN + CONTRIBUTOR
export async function canCreateTasks(
  userId: string | null | undefined,
  projectId: string | null | undefined
): Promise<boolean> {
  const role = await getUserProjectRole(userId, projectId);
  return role === "OWNER" || role === "ADMIN" || role === "CONTRIBUTOR";
}

// OWNER + CONTRIBUTOR
export async function canModifyTasks(
  userId: string | null | undefined,
  projectId: string | null | undefined
): Promise<boolean> {
  const role = await getUserProjectRole(userId, projectId);
  return role === "OWNER" || role === "CONTRIBUTOR";
}

export async function canModifyProject(
  userId: string | null | undefined,
  projectId: string | null | undefined
): Promise<boolean> {
  const role = await getUserProjectRole(userId, projectId);
  return role === "OWNER" || role === "ADMIN";
}

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
