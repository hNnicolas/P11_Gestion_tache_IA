"use server";

import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { verifyToken } from "@/app/utils/auth";
import { canDeleteProject, hasProjectAccess } from "@/app/utils/permissions";
import {
  sendSuccess,
  sendError,
  sendAuthError,
  sendServerError,
} from "@/app/utils/response";

/**
 * Supprime un projet si l'utilisateur est OWNER
 * @param projectId
 * @returns ApiResponse
 */
export async function deleteProjectAction(projectId: string) {
  try {
    // Récupérer le token d'auth
    const authToken = (await cookies()).get("auth_token")?.value;
    if (!authToken) return sendAuthError("Non authentifié");

    const user = await verifyToken(authToken);
    if (!user) return sendAuthError("Token invalide");

    // Vérifier l'accès au projet
    const hasAccess = await hasProjectAccess(user.userId, projectId);
    if (!hasAccess)
      return sendError("Accès refusé au projet", "Forbidden", 403);

    // Vérifier si l'utilisateur peut supprimer le projet (OWNER)
    const canDelete = await canDeleteProject(user.userId, projectId);
    if (!canDelete) return sendError("Permission refusée", "Forbidden", 403);

    // Vérifier si le projet existe
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });
    if (!project) return sendError("Projet introuvable", "Not Found", 404);

    // Supprimer le projet (les tâches et membres liés seront supprimés si onDelete: Cascade)
    await prisma.project.delete({
      where: { id: projectId },
    });

    console.log(
      `[PROJECT DELETE SUCCESS] projectId=${projectId} userId=${user.userId}`
    );

    return sendSuccess("Projet supprimé avec succès");
  } catch (err: any) {
    console.error("deleteProjectAction error:", err);
    return sendServerError("Erreur interne du serveur", err.message);
  }
}
