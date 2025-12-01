"use server";

import { prisma } from "@/lib/prisma";
import { hasProjectAccess, canModifyTasks } from "@/app/utils/permissions";
import { validateUpdateTaskData } from "@/app/utils/validation";
import { updateTaskAssignments } from "@/app/utils/taskAssigments";
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
    const user = await getUser();
    if (!user?.id) return sendAuthError("Utilisateur non authentifié");
    const userId = user.id;

    const access = await hasProjectAccess(userId, projectId);
    if (!access) return sendError("Accès refusé au projet");

    const modify = await canModifyTasks(userId, projectId);
    if (!modify)
      return sendError(
        "Vous n'avez pas les permissions pour modifier la tâche",
        undefined,
        403
      );

    const errors = validateUpdateTaskData(data);
    if (errors.length > 0) {
      return sendValidationError(
        "Erreur de validation dans les données envoyées",
        errors
      );
    }

    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { assignees: true },
    });
    if (!task || task.projectId !== projectId) {
      return sendError("Tâche introuvable", undefined, 404);
    }

    if (data.assigneeIds !== undefined) {
      const projectInfo = await prisma.project.findUnique({
        where: { id: projectId },
        select: {
          ownerId: true,
          members: { select: { userId: true } },
        },
      });

      if (!projectInfo) return sendError("Projet introuvable", undefined, 404);

      const projectMemberIds = [
        projectInfo.ownerId,
        ...projectInfo.members.map((m) => m.userId),
      ];

      const currentAssignees = task.assignees.map((a) => a.userId);

      const newAssignees = data.assigneeIds;

      for (const userId of newAssignees) {
        if (!projectMemberIds.includes(userId)) {
          console.log(`➡ Ajout du contributeur ${userId} au projet`);

          await prisma.projectMember.create({
            data: {
              userId,
              projectId,
              role: "CONTRIBUTOR",
            },
          });

          projectMemberIds.push(userId);
        }
      }

      const removed = currentAssignees.filter(
        (id) => !newAssignees.includes(id)
      );

      for (const userId of removed) {
        console.log(
          `➡ Suppression du contributeur ${userId} du projet (optionnel)`
        );

        await prisma.projectMember.deleteMany({
          where: {
            userId,
            projectId,
          },
        });
      }

      await updateTaskAssignments(taskId, data.assigneeIds);
    }

    const updatePayload: any = {};
    if (data.title !== undefined) updatePayload.title = data.title.trim();
    if (data.description !== undefined)
      updatePayload.description = data.description?.trim() || "";
    if (data.status !== undefined) updatePayload.status = data.status;
    if (data.priority !== undefined) updatePayload.priority = data.priority;
    if (data.dueDate !== undefined)
      updatePayload.dueDate = data.dueDate ? new Date(data.dueDate) : null;

    await prisma.task.update({
      where: { id: taskId },
      data: updatePayload,
    });

    if (data.assigneeIds !== undefined) {
      await updateTaskAssignments(taskId, data.assigneeIds);
    }

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

    const mapDBStatusToFrontend = (status: string) => {
      switch (status) {
        case "TODO":
          return "A faire";
        case "IN_PROGRESS":
          return "En cours";
        case "DONE":
          return "Terminées";
        default:
          return "A faire";
      }
    };

    return sendSuccess("Tâche mise à jour avec succès", {
      ...fullTask,
      description: fullTask.description || "",
      status: fullTask.status,
      statusLabel: mapDBStatusToFrontend(fullTask.status),
      priority: fullTask.priority || "LOW",
    });
  } catch (err: any) {
    console.error("[ERROR updateTaskAction]", err);
    return sendServerError("Erreur serveur", err.message);
  }
};
