"use server";

import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { verifyToken } from "@/app/utils/auth";
import { hasProjectAccess } from "@/app/utils/permissions";
import { revalidatePath } from "next/cache";

export async function createCommentAction(
  projectId: string,
  taskId: string,
  content: string
) {
  try {
    if (!content || content.trim().length === 0) {
      throw new Error("Le contenu du commentaire est obligatoire");
    }

    // 1️⃣ Récupération du JWT dans les cookies
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    // 🚨 FIX : on vérifie AVANT d'appeler verifyToken
    if (!token) {
      throw new Error("Utilisateur non authentifié");
    }

    // 2️⃣ Décoder le token → obtenir userId
    const decoded = await verifyToken(token);
    if (!decoded || !decoded.userId) {
      throw new Error("Token invalide ou expiré");
    }

    const userId = decoded.userId;

    // 3️⃣ Vérification des permissions d'accès au projet
    const access = await hasProjectAccess(userId, projectId);
    if (!access) throw new Error("Accès refusé au projet");

    // 4️⃣ Vérifier que la tâche appartient bien au projet
    const task = await prisma.task.findFirst({
      where: { id: taskId, projectId },
      select: { id: true },
    });

    if (!task) throw new Error("Tâche introuvable dans ce projet");

    // 5️⃣ Création du commentaire
    const comment = await prisma.comment.create({
      data: {
        taskId,
        content: content.trim(),
        authorId: userId,
      },
      include: {
        author: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    // 6️⃣ Revalidate path → rafraîchir la page
    revalidatePath(`/projects/${projectId}`);

    return {
      success: true,
      message: "Commentaire ajouté",
      comment,
    };
  } catch (err: any) {
    console.error("Erreur createCommentAction:", err);
    return {
      success: false,
      message: err.message || "Erreur interne serveur",
    };
  }
}
