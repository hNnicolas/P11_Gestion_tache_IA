"use server";

import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";
import { canCreateTasks } from "@/app/utils/permissions";

export type CreateTaskInput = {
  title: string;
  description?: string;
  priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  dueDate?: string;
  assigneeIds?: string[];
};

export const createTaskAction = async (
  projectId: string,
  data: CreateTaskInput,
  projectMembers: { userId: string; name: string }[] = [],
  projectOwnerId?: string
) => {
  // ✅ Récupère le token depuis les cookies
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  if (!token) throw new Error("Utilisateur non authentifié");

  // ✅ Décode le JWT pour obtenir l'userId
  const decoded: any = jwt.decode(token);
  const userId = decoded?.sub || decoded?.userId;
  if (!userId) throw new Error("Impossible de déterminer l'utilisateur");

  console.log("🔹 UserId extrait du token:", userId);

  // ✅ Vérifie les permissions côté serveur
  const allowed = await canCreateTasks(userId, projectId);
  if (!allowed)
    throw new Error("Vous n'avez pas la permission de créer une tâche.");

  // ✅ Filtrage des assignés valides (membres du projet)
  let validAssigneeIds = (data.assigneeIds || []).filter((id) =>
    projectMembers.some((member) => member.userId === id)
  );

  // Si aucun assigné valide → propriétaire par défaut
  if (validAssigneeIds.length === 0 && projectOwnerId) {
    console.warn(
      "⚠️ Aucun assignee valide, assignation automatique au propriétaire :",
      projectOwnerId
    );
    validAssigneeIds = [projectOwnerId];
  }

  // ✅ Création directe de la tâche dans Prisma
  const task = await prisma.task.create({
    data: {
      title: data.title,
      description: data.description,
      priority: data.priority || "MEDIUM",
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
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
