"use server";

import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { verifyToken } from "@/app/utils/auth";
import { hasProjectAccess, canModifyTasks } from "@/app/utils/permissions";
import {
  sendSuccess,
  sendError,
  sendAuthError,
  sendServerError,
} from "@/app/utils/response";

/**
 * Supprimer un commentaire
 * @param commentId
 */
export async function deleteCommentAction(commentId: string) {
  try {
    const authToken = (await cookies()).get("auth_token")?.value;
    if (!authToken) return sendAuthError("Non authentifié");

    const user = await verifyToken(authToken);
    if (!user) return sendAuthError("Token invalide");

    const existingComment = await prisma.comment.findUnique({
      where: { id: commentId },
      include: { task: true },
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

    // Vérifier si l'utilisateur peut supprimer (auteur ou modérateur)
    const canModify = await canModifyTasks(
      user.userId,
      existingComment.task.projectId
    );
    if (existingComment.authorId !== user.userId && !canModify)
      return sendError(
        "Vous ne pouvez supprimer que vos propres commentaires",
        "Forbidden",
        403
      );

    await prisma.comment.delete({ where: { id: commentId } });

    // console.log(`✔️ Commentaire ${commentId} supprimé avec succès (200)`);

    return sendSuccess("Commentaire supprimé avec succès");
  } catch (err: any) {
    console.error("deleteCommentAction error:", err);
    return sendServerError("Erreur interne du serveur", err.message);
  }
}
