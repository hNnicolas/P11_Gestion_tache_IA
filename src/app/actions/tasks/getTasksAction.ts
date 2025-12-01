"use server";

import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { verifyToken } from "@/app/utils/auth";
import { hasProjectAccess, Role } from "@/app/utils/permissions";
import { getTaskAssignments } from "@/app/utils/taskAssigments";
import { getTaskComments } from "@/app/utils/taskComments";

export async function getTasks(projectId: string) {
  if (!projectId) throw new Error("ID du projet manquant");

  try {
    const cookieStore = await cookies();
    const authToken = cookieStore.get("auth_token")?.value;
    if (!authToken) throw new Error("Utilisateur non connecté");

    const user = await verifyToken(authToken);
    if (!user) throw new Error("Token invalide");

    const access = await hasProjectAccess(user.userId, projectId);
    if (!access) throw new Error("Vous n'avez pas accès à ce projet");

    const tasks = await prisma.task.findMany({
      where: { projectId },
      orderBy: { createdAt: "asc" },
      include: {
        project: {
          select: { id: true, name: true, description: true },
        },
        creator: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    const enrichedTasks = await Promise.all(
      tasks.map(async (task) => {
        const assignees = await getTaskAssignments(task.id);
        const comments = await getTaskComments(task.id);

        return {
          ...task,
          status: task.status as "TODO" | "IN_PROGRESS" | "DONE" | "CANCELLED",
          priority: task.priority as "LOW" | "MEDIUM" | "HIGH" | "URGENT",
          assignees,
          comments,
        };
      })
    );

    return enrichedTasks;
  } catch (err) {
    console.error("Erreur getTasks:", err);
    throw err;
  }
}
