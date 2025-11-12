// src/app/actions/createProjectAction.ts
import { prisma } from "@/lib/prisma";

export interface CreateProjectInput {
  name: string;
  description?: string;
  contributors?: string[];
}

export async function createProjectAction(input: CreateProjectInput) {
  const { name, description, contributors } = input;

  // Adapte selon système d'auth
  const userId = "ID_UTILISATEUR_CONNECTÉ";

  // Création du projet
  const project = await prisma.project.create({
    data: {
      name: name.trim(),
      description: description?.trim() || null,
      ownerId: userId,
    },
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      members: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
      _count: {
        select: {
          tasks: true,
        },
      },
    },
  });

  // Ajouter les contributeurs si fournis
  if (contributors && contributors.length > 0) {
    const contributorUsers = await prisma.user.findMany({
      where: {
        email: { in: contributors.map((email) => email.toLowerCase()) },
      },
      select: { id: true, email: true },
    });

    for (const user of contributorUsers) {
      try {
        await prisma.projectMember.create({
          data: {
            userId: user.id,
            projectId: project.id,
            role: "CONTRIBUTOR",
          },
        });
      } catch (error) {
        console.log(`Utilisateur ${user.email} déjà membre du projet`);
      }
    }
  }

  return project;
}
