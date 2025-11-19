"use server";

import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { verifyToken } from "@/app/utils/auth";
import { hasProjectAccess } from "@/app/utils/permissions";
import {
  sendSuccess,
  sendError,
  sendAuthError,
  sendServerError,
} from "@/app/utils/response";

export async function getCommentsAction(taskId: string, projectId: string) {
  try {
    const authToken = (await cookies()).get("auth_token")?.value;
    if (!authToken) return sendAuthError();

    const user = await verifyToken(authToken);
    if (!user) return sendAuthError();

    const hasAccess = await hasProjectAccess(user.userId, projectId);
    if (!hasAccess) return sendError("Accès refusé", "FORBIDDEN", 403);

    const comments = await prisma.comment.findMany({
      where: { taskId },
      include: {
        author: { select: { id: true, name: true, email: true } },
        task: { select: { id: true, title: true } },
      },
      orderBy: { createdAt: "asc" },
    });

    return sendSuccess("Commentaires récupérés", { comments });
  } catch (err: any) {
    console.error(err);
    return sendServerError(err.message);
  }
}
