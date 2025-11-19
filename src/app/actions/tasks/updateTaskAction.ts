"use server";

import { prisma } from "@/lib/prisma";
import {
  hasProjectAccess,
  canModifyTasks,
  getUserProjectRole,
} from "@/app/utils/permissions";
import { validateUpdateTaskData } from "@/app/utils/validation";
import {
  updateTaskAssignments,
  validateProjectMembers,
} from "@/app/utils/taskAssigments";
import { getUser } from "@/app/actions/users/user";

import {
  sendSuccess,
  sendError,
  sendValidationError,
  sendServerError,
  sendAuthError,
} from "@/app/utils/response";

export type UpdateTaskInput = {
  title?: string;
  description?: string;
  status?: "TODO" | "IN_PROGRESS" | "DONE" | "CANCELLED";
  priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  dueDate?: string;
  assigneeIds?: string[];
};

export const updateTaskAction = async (
  projectId: string,
  taskId: string,
  data: UpdateTaskInput
) => {
  try {
    // --- Auth ---
    const user = await getUser();
    if (!user?.id) return sendAuthError("Utilisateur non authentifié");
    const userId = user.id;

    // --- Rôle ---
    const role = await getUserProjectRole(userId, projectId);

    // --- Permissions ---
    const access = await hasProjectAccess(userId, projectId);
    if (!access) return sendError("Accès refusé au projet");

    const modify = await canModifyTasks(userId, projectId);
    if (!modify)
      return sendError(
        "Vous n'avez pas les permissions pour modifier la tâche",
        undefined,
        403
      );

    // --- Validation ---
    const errors = validateUpdateTaskData(data);
    if (errors.length > 0) {
      return sendValidationError(
        "Erreur de validation dans les données envoyées",
        errors
      );
    }

    // --- Vérification tâche ---
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { assignees: true },
    });

    if (!task || task.projectId !== projectId) {
      return sendError("Tâche introuvable", undefined, 404);
    }

    // --- Vérification assignations ---
    if (data.assigneeIds && data.assigneeIds.length > 0) {
      const validMembers = await validateProjectMembers(
        projectId,
        data.assigneeIds
      );
      if (!validMembers) {
        return sendError(
          "Certains utilisateurs assignés ne sont pas membres du projet"
        );
      }
    }

    // --- Prépare payload ---
    const updatePayload: any = {};
    if (data.title !== undefined) updatePayload.title = data.title.trim();
    if (data.description !== undefined)
      updatePayload.description = data.description?.trim() || "";
    if (data.status !== undefined) updatePayload.status = data.status;
    if (data.priority !== undefined) updatePayload.priority = data.priority;
    if (data.dueDate !== undefined)
      updatePayload.dueDate = data.dueDate ? new Date(data.dueDate) : null;

    // --- Mise à jour tâche ---
    await prisma.task.update({
      where: { id: taskId },
      data: updatePayload,
    });

    // --- Mise à jour assignations ---
    if (data.assigneeIds !== undefined) {
      await updateTaskAssignments(taskId, data.assigneeIds);
    }

    // --- Retourne tâche complète ---
    const fullTask = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        project: true,
        creator: true,
        assignees: { include: { user: true } },
        comments: { include: { author: true }, orderBy: { createdAt: "asc" } },
      },
    });

    if (!fullTask) return sendServerError("Erreur lors du rechargement");

    console.log(
      `[TASK UPDATE SUCCESS] taskId=${taskId} projectId=${projectId}`
    );

    return sendSuccess("Tâche mise à jour avec succès", {
      ...fullTask,
      description: fullTask.description || "",
      status: fullTask.status || "TODO",
      priority: fullTask.priority || "LOW",
    });
  } catch (err: any) {
    return sendServerError("Erreur serveur", err.message);
  }
};
