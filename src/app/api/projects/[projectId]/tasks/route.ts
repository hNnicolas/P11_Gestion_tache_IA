"use server";

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/app/utils/auth";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    // Résolution de params
    const { projectId } = await params;

    // Récupération des données du body
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { success: false, message: "Body JSON attendu" },
        { status: 400 }
      );
    }

    const { title, description } = body;
    if (!title || !title.trim()) {
      return NextResponse.json(
        { success: false, message: "Titre requis" },
        { status: 400 }
      );
    }

    // Récupération du token depuis les cookies
    const token = (await cookies()).get("auth_token")?.value;
    if (!token) {
      return NextResponse.json(
        { success: false, message: "Non authentifié" },
        { status: 401 }
      );
    }

    // Vérification du token
    const decoded = await verifyToken(token);
    const userId = (decoded as any)?.userId || (decoded as any)?.id;
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Token invalide" },
        { status: 401 }
      );
    }

    // Vérification que le projet existe
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });
    if (!project) {
      return NextResponse.json(
        { success: false, message: "Projet introuvable" },
        { status: 404 }
      );
    }

    // Vérification que l'utilisateur est membre du projet
    const membership = await prisma.projectMember.findFirst({
      where: { projectId, userId },
    });
    if (!membership) {
      return NextResponse.json(
        { success: false, message: "Accès refusé au projet" },
        { status: 403 }
      );
    }

    // Création de la tâche
    const task = await prisma.task.create({
      data: {
        projectId,
        title,
        description: description || "",
        creatorId: userId,
      },
    });

    return NextResponse.json({ success: true, task }, { status: 200 });
  } catch (err: any) {
    console.error("POST /api/projects/[projectId]/tasks error:", err);
    return NextResponse.json(
      { success: false, message: "Erreur interne", error: err?.message },
      { status: 500 }
    );
  }
}
