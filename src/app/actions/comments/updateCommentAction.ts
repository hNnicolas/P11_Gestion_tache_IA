"use server";

import { IComment, prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { verifyToken } from "@/app/utils/auth";
import { hasProjectAccess, canModifyTasks } from "@/app/utils/permissions";
import {
  sendSuccess,
  sendError,
  sendAuthError,
  sendServerError,
} from "@/app/utils/response";
import { validateUpdateCommentData } from "@/app/utils/validation";

/**
 * Mettre à jour un commentaire
 * @param commentId
 * @param content
 */
export async function updateCommentAction(commentId: string, content: string) {
  try {
    const authToken = (await cookies()).get("auth_token")?.value;
    if (!authToken) return sendAuthError("Non authentifié");

    const user = await verifyToken(authToken);
    if (!user) return sendAuthError("Token invalide");

    // Validation du contenu
    const validationErrors = validateUpdateCommentData({ content });
    if (validationErrors.length > 0)
      return sendError("Données invalides", "Validation failed");

    // Vérifier que le commentaire existe
    const existingComment = await prisma.comment.findUnique({
      where: { id: commentId },
      include: {
        task: true, // nécessaire pour récupérer projectId
      },
    });

    if (!existingComment)
      return sendError("Commentaire introuvable", "Not Found", 404);

    // Vérifier l'accès au projet
    const hasAccess = await hasProjectAccess(
      user.userId,
      existingComment.task.projectId
    );
    if (!hasAccess)
      return sendError("Accès refusé au projet", "Forbidden", 403);

    // Vérifier que l'utilisateur est l'auteur
    if (existingComment.authorId !== user.userId)
      return sendError(
        "Vous ne pouvez modifier que vos propres commentaires",
        "Forbidden",
        403
      );

    // Mise à jour
    const updatedComment = await prisma.comment.update({
      where: { id: commentId },
      data: { content: content.trim() },
      include: {
        author: { select: { id: true, name: true } },
        task: { select: { id: true } },
      },
    });

    // Normalisation pour correspondre à IComment
    const normalizedComment: IComment = {
      id: updatedComment.id,
      taskId: updatedComment.taskId,
      content: updatedComment.content,
      createdAt: new Date(updatedComment.createdAt),
      updatedAt: new Date(updatedComment.updatedAt),
      author: {
        id: updatedComment.author.id,
        name: updatedComment.author.name ?? null,
      },
    };

    console.log("Commentaire mis à jour :", updatedComment);

    return sendSuccess("Commentaire mis à jour avec succès", {
      comment: normalizedComment,
    });
  } catch (err: any) {
    console.error("updateCommentAction error:", err);
    return sendServerError("Erreur interne du serveur", err.message);
  }
}
