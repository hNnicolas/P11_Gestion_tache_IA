"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export type UpdateProjectInput = {
  projectId: string;
  name?: string;
  description?: string;
  memberIds?: string[];
};

export async function updateProjectAction(input: UpdateProjectInput) {
  const { projectId, name, description, memberIds } = input;

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { owner: true, members: { include: { user: true } } },
  });

  if (!project) throw new Error("Projet non trouvé");

  const updatedProject = await prisma.project.update({
    where: { id: projectId },
    data: {
      name: name?.trim(),
      description: description?.trim() || null,
      members: memberIds
        ? {
            // Supprime les membres qui ne sont plus sélectionnés
            deleteMany: {
              userId: { notIn: memberIds },
            },
            // Ajoute les nouveaux membres
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

  /* console.log(
    "Updated project members:",
    updatedProject.members.map((m) => m.userId)
  ); */

  return { updatedProject, allUsers };
}
