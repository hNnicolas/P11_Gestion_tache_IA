"use server";

import { prisma } from "@/lib/prisma";
import { hasProjectAccess, canModifyTasks } from "@/app/utils/permissions";
import { validateUpdateTaskData } from "@/app/utils/validation";
import {
  updateTaskAssignments,
  getTaskAssignments,
} from "@/app/utils/taskAssigments";
import { getTaskComments } from "@/app/utils/taskComments";

export type UpdateTaskInput = {
  title?: string;
  description?: string;
  status?: "TODO" | "IN_PROGRESS" | "DONE" | "CANCELLED";
  priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  dueDate?: string;
  assigneeIds?: string[];
};

export const updateTaskAction = async (
  userId: string,
  projectId: string,
  taskId: string,
  data: UpdateTaskInput
) => {
  // 1️⃣ Vérifier les permissions
  const hasAccess = await hasProjectAccess(userId, projectId);
  if (!hasAccess) throw new Error("Accès refusé au projet");

  const canModify = await canModifyTasks(userId, projectId);
  if (!canModify)
    throw new Error(
      "Vous n'avez pas les permissions pour modifier cette tâche"
    );

  // 2️⃣ Valider les données
  const validationErrors = validateUpdateTaskData(data);
  if (validationErrors.length > 0) {
    throw new Error(
      `Données invalides: ${validationErrors.map((e) => e.message).join(", ")}`
    );
  }

  // 3️⃣ Vérifier que la tâche existe
  const existingTask = await prisma.task.findFirst({
    where: { id: taskId, projectId },
  });
  if (!existingTask) throw new Error("Tâche non trouvée");

  // 4️⃣ Préparer les données à mettre à jour
  const updateData: any = {};
  if (data.title !== undefined) updateData.title = data.title.trim();
  if (data.description !== undefined)
    updateData.description = data.description?.trim() || null;
  if (data.status !== undefined) updateData.status = data.status;
  if (data.priority !== undefined) updateData.priority = data.priority;
  if (data.dueDate !== undefined)
    updateData.dueDate = data.dueDate ? new Date(data.dueDate) : null;

  // 5️⃣ Mettre à jour la tâche
  const updatedTask = await prisma.task.update({
    where: { id: taskId },
    data: updateData,
  });

  // 6️⃣ Mettre à jour les assignations si fournies
  if (data.assigneeIds !== undefined) {
    await updateTaskAssignments(taskId, data.assigneeIds);
  }

  // 7️⃣ Récupérer la tâche complète avec assignations et commentaires
  const assignees = await getTaskAssignments(taskId);
  const comments = await getTaskComments(taskId);

  return {
    ...updatedTask,
    assignees,
    comments,
  };
};
