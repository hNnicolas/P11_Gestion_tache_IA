"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export type UpdateProjectInput = {
  projectId: string;
  name?: string;
  description?: string;
};

export async function updateProjectAction(input: UpdateProjectInput) {
  const { projectId, name, description } = input;

  // Vérifier que le projet existe
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      owner: true,
      members: {
        include: {
          user: true,
        },
      },
    },
  });

  if (!project) throw new Error("Projet non trouvé");

  // Mettre à jour le projet
  const updatedProject = await prisma.project.update({
    where: { id: projectId },
    data: {
      name: name?.trim(),
      description: description?.trim() || null,
    },
    include: {
      owner: true,
      members: {
        include: { user: true },
      },
    },
  });

  // console.log("Projet après mise à jour:", updatedProject);

  revalidatePath(`/projects/${projectId}`);

  return updatedProject;
}
