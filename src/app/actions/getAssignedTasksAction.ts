"use server";

import { ITask } from "@/lib/prisma";
import { PrismaClient } from "@prisma/client";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

const STATUS_VALUES = ["TODO", "IN_PROGRESS", "DONE", "CANCELLED"] as const;
const PRIORITY_VALUES = ["LOW", "MEDIUM", "HIGH", "URGENT"] as const;

export async function getAssignedTasksAction(): Promise<ITask[]> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      console.error("Aucun token trouvé dans les cookies !");
      return [];
    }

    let userId: string;
    try {
      const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
      userId = decoded.userId;
    } catch (err) {
      console.error("Erreur jwt.verify :", err);
      return [];
    }

    const tasks = await prisma.task.findMany({
      where: { assignees: { some: { userId } } },
      include: {
        project: { select: { id: true, name: true, description: true } },
        assignees: {
          include: { user: { select: { id: true, name: true, email: true } } },
        },
        comments: {
          include: { author: { select: { id: true, name: true } } },
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: [{ priority: "asc" }, { dueDate: "asc" }],
    });

    return tasks.map((task) => ({
      ...task,
      // Forcer le typage des valeurs
      status: STATUS_VALUES.includes(task.status as any)
        ? (task.status as ITask["status"])
        : "TODO",
      priority: PRIORITY_VALUES.includes(task.priority as any)
        ? (task.priority as ITask["priority"])
        : "MEDIUM",
      project: {
        ...task.project,
        description: task.project.description ?? "",
      },
      assignees: task.assignees.map((a) => ({
        ...a,
        user: {
          ...a.user,
          name: a.user.name ?? "",
        },
      })),
    }));
  } catch (err) {
    console.error("Erreur getAssignedTasksAction:", err);
    return [];
  }
}
