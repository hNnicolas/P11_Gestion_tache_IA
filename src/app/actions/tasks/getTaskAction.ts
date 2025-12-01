"use server";

import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/app/utils/auth";
import { hasProjectAccess } from "@/app/utils/permissions";
import { getTaskAssignments } from "@/app/utils/taskAssigments";
import { getTaskComments } from "@/app/utils/taskComments";
import { sendError, sendSuccess } from "@/app/utils/response";

export const getTaskAction = async (projectId: string, taskId: string) => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    if (!token) {
      return sendError("Utilisateur non authentifié", "UNAUTHORIZED", 401);
    }

    const user = await verifyToken(token);
    if (!user) {
      return sendError("Token invalide", "UNAUTHORIZED", 401);
    }

    const userId = user.userId;

    const access = await hasProjectAccess(userId, projectId);
    if (!access) {
      return sendError("Accès refusé au projet", "FORBIDDEN", 403);
    }

    const task = await prisma.task.findFirst({
      where: { id: taskId, projectId },
      include: {
        creator: {
          select: { id: true, email: true, name: true },
        },
        project: {
          select: { id: true, name: true },
        },
      },
    });

    if (!task) {
      return sendError("Tâche non trouvée", "TASK_NOT_FOUND", 404);
    }

    const assignees = await getTaskAssignments(task.id);
    const comments = await getTaskComments(task.id);

    const taskWithDetails = {
      ...task,
      assignees,
      comments,
    };

    return sendSuccess("Tâche récupérée avec succès", {
      task: taskWithDetails,
    });
  } catch (err) {
    console.error("Erreur getTaskAction:", err);
    return sendError("Erreur lors de la récupération de la tâche");
  }
};
