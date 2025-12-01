"use server";

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { callMistral, normalizeMistralContent } from "@/lib/mistral";
import { verifyToken } from "@/app/utils/auth";

function parseGeneratedIntoTasks(generated: string) {
  const lines = generated
    .split("\n")
    .map((l) => l.replace(/\r/g, "").trimEnd());
  const joined = lines.join("\n");

  let blocks = joined
    .split(/\n-{3,}\n/)
    .map((b) => b.trim())
    .filter(Boolean);

  if (blocks.length <= 1) {
    blocks = joined
      .split(/\n\s*\n/)
      .map((b) => b.trim())
      .filter(Boolean);
  }

  if (blocks.length <= 1) {
    const numbered = joined
      .split(/\n(?=\d+[).\s])/)
      .map((b) => b.trim())
      .filter(Boolean);
    if (numbered.length > 1) blocks = numbered;
  }

  const tasks = blocks.map((block) => {
    const [first, ...restLines] = block.split("\n");
    const title =
      first
        ?.trim()
        .replace(/^[-\d.)\s]+/, "")
        .slice(0, 80) || "Tâche IA";
    const description = restLines.join("\n").trim();
    return { title, description };
  });

  return tasks;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { success: false, message: "Body JSON attendu" },
        { status: 400 }
      );
    }

    const { prompt, projectId } = body as {
      prompt?: string;
      projectId?: string;
    };
    if (!prompt || !prompt.trim())
      return NextResponse.json(
        { success: false, message: "Prompt manquant" },
        { status: 400 }
      );
    if (!projectId)
      return NextResponse.json(
        { success: false, message: "projectId manquant" },
        { status: 400 }
      );

    const cookieStore = cookies();
    const token = (await cookieStore).get("auth_token")?.value;
    if (!token)
      return NextResponse.json(
        { success: false, message: "Non authentifié" },
        { status: 401 }
      );

    const decoded = await verifyToken(token);
    if (!decoded)
      return NextResponse.json(
        { success: false, message: "Token invalide" },
        { status: 401 }
      );

    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });
    if (!project)
      return NextResponse.json(
        { success: false, message: "Projet introuvable" },
        { status: 404 }
      );

    const userId = (decoded as any).userId || (decoded as any).id;
    const membership = await prisma.projectMember.findFirst({
      where: { projectId, userId },
    });
    if (!membership)
      return NextResponse.json(
        { success: false, message: "Accès refusé au projet" },
        { status: 403 }
      );

    const existing = await prisma.task.findMany({
      where: { projectId },
      select: { title: true, description: true },
      orderBy: { createdAt: "desc" },
      take: 200,
    });

    // Vérification locale exacte pour éviter les faux positifs
    const isDuplicate = existing.some(
      (t) => t.title.toLowerCase().trim() === prompt.toLowerCase().trim()
    );
    if (isDuplicate) {
      return NextResponse.json(
        { success: true, duplicate: true, message: "DOUBLON" },
        { status: 200 }
      );
    }

    const contextLines = existing.map(
      (t) =>
        `- ${t.title}${
          t.description ? `: ${t.description.replace(/\n/g, " ")}` : ""
        }`
    );
    const context = contextLines.join("\n").slice(0, 4000);

    const INSTRUCTIONS = [
      "Génère de nouvelles tâches à partir du prompt.",
      "Chaque tâche : Ligne 1 = titre (max 80 chars), lignes suivantes = description (pas de markdown).",
      "Sépare les tâches par une ligne vide ou par '---'.",
      "Ne réponds DOUBLON que si le titre correspond exactement à une tâche existante (cette vérification est déjà faite côté serveur).",
    ].join("\n");

    const fullPrompt = [
      "CONTEXTE :",
      context || "Aucune tâche existante.",
      "",
      "INSTRUCTIONS :",
      INSTRUCTIONS,
      "",
      "PROMPT :",
      prompt,
    ].join("\n");

    const MODELS = [
      "mistral-small-latest",
      "mistral-medium-latest",
      "mistral-large-latest",
      "open-mistral-nemo",
    ];

    let generated: string | null = null;
    for (const model of MODELS) {
      try {
        const out = await callMistral(model, fullPrompt, {
          retries: 3,
          timeoutMs: 20000,
          maxPromptChars: 6000,
        });
        if (!out) continue;
        const cleaned = await normalizeMistralContent(out);
        if (cleaned.trim()) {
          generated = cleaned;
          console.log(`[IA] generated with ${model}`);
          break;
        }
      } catch (err: any) {
        console.warn(`[IA] model ${model} failed:`, err?.message || err);
      }
    }

    if (!generated) {
      const fallbackTitle =
        prompt.split("\n")[0]?.slice(0, 80) || "Nouvelle tâche IA";
      const fallbackDesc = `Généré automatiquement — le service IA était indisponible. Contenu: ${prompt}`;
      return NextResponse.json(
        {
          success: true,
          tasks: [{ title: fallbackTitle, description: fallbackDesc }],
        },
        { status: 200 }
      );
    }

    const parsed = parseGeneratedIntoTasks(generated);
    if (!parsed.length) {
      const fallbackTitle =
        prompt.split("\n")[0]?.slice(0, 80) || "Nouvelle tâche IA";
      return NextResponse.json(
        {
          success: true,
          tasks: [
            {
              title: fallbackTitle,
              description: "Aucune description fournie.",
            },
          ],
        },
        { status: 200 }
      );
    }

    return NextResponse.json({ success: true, tasks: parsed }, { status: 200 });
  } catch (err: any) {
    console.error("/api/auth/tasks/ia error:", err);
    return NextResponse.json(
      { success: false, message: "Erreur interne", error: err?.message },
      { status: 500 }
    );
  }
}
