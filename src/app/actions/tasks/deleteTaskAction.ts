"use server";

import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { verifyToken } from "@/app/utils/auth";
import { hasProjectAccess, canModifyTasks } from "@/app/utils/permissions";
import {
  sendSuccess,
  sendError,
  sendAuthError,
  sendServerError,
} from "@/app/utils/response";

export async function deleteTaskAction(projectId: string, taskId: string) {
  try {
    const authToken = (await cookies()).get("auth_token")?.value;
    if (!authToken) return sendAuthError("Non authentifié");

    const user = await verifyToken(authToken);
    if (!user) return sendAuthError("Token invalide");

    const canAccess = await hasProjectAccess(user.userId, projectId);
    if (!canAccess) return sendError("Accès refusé", "Forbidden", 403);

    const canEdit = await canModifyTasks(user.userId, projectId);
    if (!canEdit) return sendError("Permission refusée", "Forbidden", 403);

    const task = await prisma.task.findFirst({
      where: { id: taskId, projectId },
    });
    if (!task) return sendError("Tâche introuvable", "Not Found", 404);

    await prisma.task.delete({ where: { id: taskId } });

    console.log(
      `[TASK DELETE SUCCESS] taskId=${taskId} projectId=${projectId} userId=${user.userId}`
    );

    return sendSuccess("Tâche supprimée avec succès");
  } catch (err: any) {
    console.error("deleteTaskAction error:", err);
    return sendServerError("Erreur interne du serveur", err.message);
  }
}
