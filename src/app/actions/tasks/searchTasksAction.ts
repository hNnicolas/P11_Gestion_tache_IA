"use server";

import { prisma } from "@/lib/prisma";

export const searchTasksAction = async (query: string) => {
  console.log("[searchTasksAction] Query reçue :", query);

  if (!query || query.trim().length < 2) {
    console.log("[searchTasksAction] Recherche trop courte");
    return {
      success: false,
      message: "La recherche doit contenir au moins 2 caractères",
      tasks: [],
    };
  }

  try {
    const searchQuery = query.trim().toLowerCase();

    const tasks = await prisma.task.findMany({
      where: {
        OR: [
          { title: { contains: searchQuery } },
          { description: { contains: searchQuery } },
        ],
      },
      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        dueDate: true,
      },
      take: 10,
      orderBy: [{ title: "asc" }],
    });

    console.log(`[searchTasksAction] ${tasks.length} tâche(s) trouvée(s)`);

    return { success: true, message: "Tâches trouvées", tasks };
  } catch (err) {
    console.error("[searchTasksAction] Erreur :", err);
    return { success: false, message: "Erreur serveur", tasks: [] };
  }
};
