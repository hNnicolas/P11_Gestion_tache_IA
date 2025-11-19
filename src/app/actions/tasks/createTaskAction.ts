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

  // console.log("🔹 UserId extrait du token:", userId);

  const allowed = await canCreateTasks(userId, projectId);
  if (!allowed)
    throw new Error("Vous n'avez pas la permission de créer une tâche.");

  // Filtrage des assignés valides
  let validAssigneeIds = (data.assigneeIds || []).filter((id) =>
    projectMembers.some((member) => member.userId === id)
  );

  // Création de la tâche avec mapping du statut
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
        create: validAssigneeIds.map((id) => ({
          userId: id,
        })),
      },
    },
    include: {
      assignees: { include: { user: true } },
    },
  });

  console.log("✅ Tâche créée avec succès !", task);
  return task;
};
