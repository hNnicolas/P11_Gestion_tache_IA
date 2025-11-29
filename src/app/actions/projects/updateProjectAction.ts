"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { canModifyProject } from "@/app/utils/permissions";
import { verifyToken } from "@/app/utils/auth";
import { cookies } from "next/headers";

export type UpdateProjectInput = {
  projectId: string;
  name?: string;
  description?: string;
  memberIds?: string[];
};

export async function updateProjectAction(input: UpdateProjectInput) {
  const { projectId, name, description, memberIds } = input;

  // Récupére le token JWT
  const cookieStore = cookies();
  const token = (await cookieStore).get("auth_token")?.value;

  if (!token) {
    throw new Error("Token manquant. Veuillez vous reconnecter.");
  }

  // Vérifie et décode le token
  const session = await verifyToken(token);

  if (!session?.userId) {
    throw new Error("Token invalide ou expiré.");
  }

  const userId = session.userId;

  // Vérifie si l'utilisateur a le droit de modifier le projet
  const allowed = await canModifyProject(userId, projectId);

  if (!allowed) {
    throw new Error("Vous n'avez pas les droits pour modifier ce projet.");
  }

  // Vérifie après : existence du projet
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { owner: true, members: { include: { user: true } } },
  });

  if (!project) throw new Error("Projet non trouvé.");

  // Exécute la mise à jour
  const updatedProject = await prisma.project.update({
    where: { id: projectId },
    data: {
      name: name?.trim(),
      description: description?.trim() || null,
      members: memberIds
        ? {
            deleteMany: { userId: { notIn: memberIds } },
            connectOrCreate: memberIds.map((id) => ({
              where: { userId_projectId: { userId: id, projectId } },
              create: { userId: id, role: "CONTRIBUTOR" },
            })),
          }
        : undefined,
    },
    include: {
      owner: true,
      members: { include: { user: true } },
    },
  });

  revalidatePath(`/projects/${projectId}`);

  const allUsers = await prisma.user.findMany({
    select: { id: true, name: true, email: true },
  });

  return { updatedProject, allUsers };
}
