"use server";

import { prisma } from "@/lib/prisma";
import { hasProjectAccess, canModifyTasks } from "@/app/utils/permissions";
import { validateUpdateTaskData } from "@/app/utils/validation";

export type UpdateTaskInput = {
  title?: string;
  description?: string;
  status?: "TODO" | "IN_PROGRESS" | "DONE" | "CANCELLED";
  priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  dueDate?: string;
  assigneeIds?: string[];
};

const validStatuses = ["TODO", "IN_PROGRESS", "DONE", "CANCELLED"] as const;
type TaskStatus = (typeof validStatuses)[number];
const validPriorities = ["LOW", "MEDIUM", "HIGH", "URGENT"] as const;
type TaskPriority = (typeof validPriorities)[number];

const castStatus = (status: string): TaskStatus =>
  validStatuses.includes(status as TaskStatus)
    ? (status as TaskStatus)
    : "TODO";

const castPriority = (priority: string | null | undefined): TaskPriority =>
  priority && validPriorities.includes(priority as TaskPriority)
    ? (priority as TaskPriority)
    : "LOW";

export const updateTaskAction = async (
  userId: string,
  projectId: string,
  taskId: string,
  data: UpdateTaskInput
) => {
  // vérifie les permissions
  const access = await hasProjectAccess(userId, projectId);
  if (!access) throw new Error("Accès refusé au projet");

  const modify = await canModifyTasks(userId, projectId);
  if (!modify)
    throw new Error("Vous n'avez pas les permissions pour modifier la tâche");

  // validation
  const errors = validateUpdateTaskData(data);
  if (errors.length > 0) {
    throw new Error(errors.map((e) => e.message).join(", "));
  }

  // vérifie la tâche
  const taskExists = await prisma.task.findFirst({
    where: { id: taskId, projectId },
  });
  if (!taskExists) throw new Error("Tâche introuvable");

  // build update payload
  const updatePayload: any = {};
  if (data.title !== undefined) updatePayload.title = data.title.trim();
  if (data.description !== undefined)
    updatePayload.description = data.description?.trim() || null;
  if (data.status !== undefined) updatePayload.status = data.status;
  if (data.priority !== undefined) updatePayload.priority = data.priority;
  if (data.dueDate !== undefined)
    updatePayload.dueDate = data.dueDate ? new Date(data.dueDate) : null;

  // update la tâche principal
  await prisma.task.update({
    where: { id: taskId },
    data: updatePayload,
  });

  // update les assignations
  if (data.assigneeIds !== undefined) {
    await prisma.taskAssignee.deleteMany({ where: { taskId } });
    if (data.assigneeIds.length > 0) {
      await prisma.taskAssignee.createMany({
        data: data.assigneeIds.map((id) => ({ userId: id, taskId })),
      });
    }
  }

  // Récupère la tâche au complet
  const fullTask = await prisma.task.findUnique({
    where: { id: taskId },
    include: {
      project: true,
      creator: true,
      assignees: { include: { user: true } },
      comments: { include: { author: true }, orderBy: { createdAt: "asc" } },
    },
  });

  if (!fullTask) throw new Error("Erreur lors du rechargement de la tâche");

  // 🔹 LOG pour debug
  // console.log("fullTask raw from Prisma:", fullTask);

  // 8️⃣ Cast status et priority pour TypeScript
  return {
    ...fullTask,
    status: castStatus(fullTask.status),
    priority: castPriority(fullTask.priority),
  };
};
