"use server";

import { PrismaClient } from "@prisma/client";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

export async function getAssignedTasks() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  console.log("Token côté dashboard :", token); // debug

  if (!token) {
    console.log("Aucun token trouvé !");
    return [];
  }
  // Décoder le token pour récupérer l'ID utilisateur
  let userId: string | null = null;
  try {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    userId = decoded.id;
    console.log("Décodage token OK :", decoded);
  } catch (err) {
    console.error("Erreur jwt.verify :", err);
    return [];
  }

  if (!userId) return [];

  try {
    // Récupérer directement les tâches assignées à l'utilisateur
    const tasks = await prisma.task.findMany({
      where: {
        assignees: {
          some: { userId },
        },
      },
      include: {
        project: { select: { id: true, name: true, description: true } }, // inclure description
        assignees: {
          include: { user: { select: { id: true, name: true, email: true } } },
        },
        comments: {
          include: { author: { select: { id: true, name: true } } },
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: [{ priority: "asc" }, { dueDate: "asc" }],
    });

    // Convertir description null en string vide pour TypeScript
    return tasks.map((task) => ({
      ...task,
      project: {
        ...task.project,
        description: task.project.description ?? "", // <- ici
      },
    }));
  } catch (err) {
    console.error("Erreur getAssignedTasks:", err);
    return [];
  }
}
