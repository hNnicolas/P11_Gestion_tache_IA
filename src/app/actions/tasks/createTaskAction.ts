"use server";

import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";
import { canCreateTasks } from "@/app/utils/permissions";

export type CreateTaskInput = {
  title: string;
  description?: string;
  dueDate?: string;
  priority?: "LOW" | "MEDIUM" | "HIGH";
  assigneeIds: string[];
  status?: "A faire" | "En cours" | "Terminées";
};

export async function getUserProjectRole(
  userId: string | null | undefined,
  projectId: string | null | undefined
): Promise<"OWNER" | "ADMIN" | "CONTRIBUTOR" | null> {
  if (!userId || !projectId) return null;

  const membership = await prisma.projectMember.findFirst({
    where: { userId, projectId },
  });

  if (!membership) return null;

  return membership.role as "OWNER" | "ADMIN" | "CONTRIBUTOR";
}

// Mapping frontend -> DB
const mapStatusToDB = (status?: "A faire" | "En cours" | "Terminées") => {
  switch (status) {
    case "A faire":
      return "TODO";
    case "En cours":
      return "IN_PROGRESS";
    case "Terminées":
      return "DONE";
    default:
      return "TODO";
  }
};

// Mapping DB -> frontend
const mapDBStatusToFrontend = (
  status: string
): "A faire" | "En cours" | "Terminées" => {
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

// Mapping couleur pour le badge
const statusColorMap: Record<string, string> = {
  "A faire": "var(--color-tag1)",
  "En cours": "var(--color-tag2)",
  Terminées: "var(--color-tag3)",
};

// Helpers pour assignés et commentaires
const getTaskAssignments = async (taskId: string) => {
  const assignees = await prisma.taskAssignee.findMany({
    where: { taskId },
    include: { user: { select: { id: true, name: true, email: true } } },
  });
  return assignees.map((a) => ({
    id: a.id,
    assignedAt: a.assignedAt,
    user: a.user,
  }));
};

const getTaskComments = async (taskId: string) => {
  const comments = await prisma.comment.findMany({
    where: { taskId },
    include: { author: { select: { id: true, name: true, email: true } } },
    orderBy: { createdAt: "asc" },
  });
  return comments.map((c) => ({
    id: c.id,
    content: c.content,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
    author: c.author,
  }));
};

export const createTaskAction = async (
  projectId: string,
  data: CreateTaskInput,
  projectMembers: { userId: string; name: string }[] = [],
  projectOwnerId?: string
) => {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  if (!token) throw new Error("Utilisateur non authentifié");

  const decoded: any = jwt.decode(token);
  const userId = decoded?.sub || decoded?.userId;
  if (!userId) throw new Error("Impossible de déterminer l'utilisateur");

  const allowed = await canCreateTasks(userId, projectId);
  if (!allowed)
    throw new Error("Vous n'avez pas la permission de créer une tâche.");

  // Filtrage assignés valides
  let validAssigneeIds = (data.assigneeIds || []).filter((id) =>
    projectMembers.some((member) => member.userId === id)
  );

  if (validAssigneeIds.length === 0) validAssigneeIds = [userId];

  // Création de la tâche
  const task = await prisma.task.create({
    data: {
      title: data.title,
      description: data.description,
      priority: data.priority || "MEDIUM",
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      status: mapStatusToDB(data.status),
      projectId,
      creatorId: userId,
      assignees: { create: validAssigneeIds.map((id) => ({ userId: id })) },
    },
  });

  const assigneesFormatted = await getTaskAssignments(task.id);
  const commentsFormatted = await getTaskComments(task.id);
  const frontendStatus: "A faire" | "En cours" | "Terminées" =
    mapDBStatusToFrontend(task.status);
  const color = statusColorMap[frontendStatus];

  return {
    ...task,
    status: frontendStatus,
    assignees: assigneesFormatted,
    comments: commentsFormatted,
    color,
  };
};
