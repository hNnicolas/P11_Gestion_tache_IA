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
import { getUser } from "@/app/actions/user";

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
  // ⚡ Récupération automatique de l'utilisateur depuis le cookie
  const user = await getUser();
  if (!user?.id) throw new Error("Utilisateur non authentifié");
  const userId = user.id;

  console.log("=== DEBUG updateTaskAction ===");
  console.log("userId:", userId);
  console.log("projectId:", projectId);
  console.log("taskId:", taskId);
  console.log("data:", data);

  // Vérifie le rôle de l'utilisateur
  const role = await getUserProjectRole(userId, projectId);
  console.log("Role de l'utilisateur dans le projet:", role);

  // 1️⃣ Vérifie les permissions
  const access = await hasProjectAccess(userId, projectId);
  console.log("hasProjectAccess:", access);
  if (!access) throw new Error("Accès refusé au projet");

  const modify = await canModifyTasks(userId, projectId);
  console.log("canModifyTasks:", modify);
  if (!modify)
    throw new Error("Vous n'avez pas les permissions pour modifier la tâche");

  // 2️⃣ Validation des données
  const errors = validateUpdateTaskData(data);
  console.log("Erreurs validation:", errors);
  if (errors.length > 0) {
    throw new Error(errors.map((e) => e.message).join(", "));
  }

  // 3️⃣ Vérifie que la tâche existe
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: { assignees: true },
  });
  console.log("Tâche trouvée:", task);
  if (!task || task.projectId !== projectId) {
    throw new Error("Tâche introuvable");
  }

  // 4️⃣ Vérifie que les utilisateurs assignés sont membres du projet
  if (data.assigneeIds && data.assigneeIds.length > 0) {
    const allMembersValid = await validateProjectMembers(
      projectId,
      data.assigneeIds
    );
    console.log("Tous les membres assignés sont valides:", allMembersValid);
    if (!allMembersValid) {
      throw new Error(
        "Certains utilisateurs assignés ne sont pas membres du projet"
      );
    }
  }

  // 5️⃣ Prépare le payload de mise à jour
  const updatePayload: any = {};
  if (data.title !== undefined) updatePayload.title = data.title.trim();
  if (data.description !== undefined)
    updatePayload.description = data.description?.trim() || "";
  if (data.status !== undefined) updatePayload.status = data.status;
  if (data.priority !== undefined) updatePayload.priority = data.priority;
  if (data.dueDate !== undefined)
    updatePayload.dueDate = data.dueDate ? new Date(data.dueDate) : null;

  console.log("Payload de mise à jour:", updatePayload);

  // 6️⃣ Mise à jour principale
  await prisma.task.update({
    where: { id: taskId },
    data: updatePayload,
  });

  // 7️⃣ Mise à jour des assignations
  if (data.assigneeIds !== undefined) {
    await updateTaskAssignments(taskId, data.assigneeIds);
  }

  // 8️⃣ Récupère la tâche complète avec relations
  const fullTask = await prisma.task.findUnique({
    where: { id: taskId },
    include: {
      project: true,
      creator: true,
      assignees: { include: { user: true } },
      comments: { include: { author: true }, orderBy: { createdAt: "asc" } },
    },
  });
  console.log("Tâche complète après update:", fullTask);

  if (!fullTask) throw new Error("Erreur lors du rechargement de la tâche");

  return {
    ...fullTask,
    description: fullTask.description || "",
    status: fullTask.status || "TODO",
    priority: fullTask.priority || "LOW",
  };
};
