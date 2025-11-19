"use server";

import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { verifyToken } from "@/app/utils/auth";
import { hasProjectAccess } from "@/app/utils/permissions";
import { revalidatePath } from "next/cache";
import { ApiResponse } from "@/app/utils/response";

export async function createCommentAction(
  projectId: string,
  taskId: string,
  content: string
): Promise<ApiResponse<{ comment: any }>> {
  try {
    if (!content || content.trim().length === 0) {
      return {
        success: false,
        message: "Le contenu du commentaire est obligatoire",
      };
    }

    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      throw new Error("Utilisateur non authentifié");
    }

    const decoded = await verifyToken(token);
    if (!decoded || !decoded.userId) {
      return { success: false, message: "Token invalide ou expiré" };
    }

    const userId = decoded.userId;

    const access = await hasProjectAccess(userId, projectId);
    if (!access) return { success: false, message: "Accès refusé au projet" };

    const task = await prisma.task.findFirst({
      where: { id: taskId, projectId },
      select: { id: true },
    });

    if (!task)
      return { success: false, message: "Tâche introuvable dans ce projet" };

    const comment = await prisma.comment.create({
      data: { taskId, content: content.trim(), authorId: userId },
      include: { author: { select: { id: true, name: true, email: true } } },
    });

    revalidatePath(`/projects/${projectId}`);

    // console.log("Commentaire créé avec succès :", comment);

    return {
      success: true,
      message: "Commentaire ajouté",
      data: { comment },
    };
  } catch (err: any) {
    console.error("Erreur createCommentAction:", err);
    return { success: false, message: err.message || "Erreur serveur" };
  }
}
