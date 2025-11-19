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

// Mapping frontend -> DB
const mapStatusToDB = (status?: "A faire" | "En cours" | "Terminées") => {
  switch (status) {
    case "A faire":
      return "TODO";
    case "En cours":
      return "in progress";
    case "Terminées":
      return "Done";
    default:
      return "TODO";
  }
};

// Mapping du statut -> couleur
const statusColorMap: Record<string, string> = {
  "A faire": "var(--color-tag1)", // #f36b6b
  "En cours": "var(--color-tag2)", // #ebb252
  Terminées: "var(--color-tag3)", // #26ad60
};

// Helper pour récupérer les assignés formatés
const getTaskAssignments = async (taskId: string) => {
  const assignees = await prisma.taskAssignee.findMany({
    where: { taskId },
    include: { user: { select: { id: true, name: true, email: true } } },
  });

  return assignees.map((assignee) => ({
    id: assignee.id,
    assignedAt: assignee.assignedAt,
    user: assignee.user,
  }));
};

// Helper pour récupérer les commentaires
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

  // Filtrage des assignés valides
  let validAssigneeIds = (data.assigneeIds || []).filter((id) =>
    projectMembers.some((member) => member.userId === id)
  );

  // Si aucun assigné sélectionné, assigner automatiquement à l'utilisateur connecté
  if (validAssigneeIds.length === 0) {
    validAssigneeIds = [userId];
  }

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
      assignees: {
        create: validAssigneeIds.map((id) => ({ userId: id })),
      },
    },
  });

  // Récupérer assignés et commentaires
  const assigneesFormatted = await getTaskAssignments(task.id);
  const commentsFormatted = await getTaskComments(task.id);

  const color = data.status
    ? statusColorMap[data.status]
    : statusColorMap["A faire"];

  return {
    ...task,
    assignees: assigneesFormatted,
    comments: commentsFormatted,
    color,
  };
};
