import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/* Empêche Next de renvoyer du HTML */
export const dynamic = "force-dynamic";

/* -----------------------------------------------------
 * CONFIG
 * ----------------------------------------------------*/
const apiKey = process.env.MISTRAL_API_KEY;

if (!apiKey) {
  console.error("❌ MISTRAL_API_KEY manquante");
  throw new Error("MISTRAL_API_KEY manquante");
}

const MODELS = [
  "mistral-small-latest",
  "mistral-medium-latest",
  "mistral-large-latest",
  "open-mistral-nemo",
];

const DEFAULT_STATUS = "TODO";
const DEFAULT_PRIORITY = "MEDIUM";

/* -----------------------------------------------------
 * UTILS
 * ----------------------------------------------------*/
function normalizeMistralContent(content: any): string {
  if (!content) return "";
  if (typeof content === "string") return content;
  if (Array.isArray(content))
    return content.map((c) => c?.text ?? "").join(" ");
  return String(content);
}

function generateFallbackTask(prompt: string) {
  let title = prompt.split("\n")[0].trim().slice(0, 80);
  if (!title) title = "Tâche générée automatiquement";

  return {
    title,
    description: `Généré automatiquement car le service IA était temporairement indisponible.\n\nContenu fourni :\n${prompt}`,
  };
}

async function callMistral(model: string, prompt: string) {
  const payload = {
    model,
    messages: [{ role: "user", content: prompt }],
    max_tokens: 200,
    temperature: 0.6,
  };

  const response = await fetch("https://api.mistral.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(payload),
  });

  return response;
}

/* -----------------------------------------------------
 * ROUTE API
 * ----------------------------------------------------*/
export async function POST(req: NextRequest) {
  try {
    if (req.headers.get("accept")?.includes("text/html")) {
      return NextResponse.json(
        { success: false, message: "HTML interdit" },
        { status: 406 }
      );
    }

    const raw = await req.text();
    let parsed;

    try {
      parsed = JSON.parse(raw);
    } catch {
      return NextResponse.json(
        { success: false, message: "JSON invalide" },
        { status: 400 }
      );
    }

    const { prompt, projectId, assigneeIds = [] } = parsed;

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json(
        { success: false, message: "Prompt manquant" },
        { status: 400 }
      );
    }

    if (!projectId || typeof projectId !== "string") {
      return NextResponse.json(
        { success: false, message: "projectId manquant" },
        { status: 400 }
      );
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return NextResponse.json(
        { success: false, message: "Projet inexistant" },
        { status: 404 }
      );
    }

    /* -------------------- SYSTEM BOT -------------------- */
    let systemUser = await prisma.user.findUnique({ where: { id: "SYSTEM" } });

    if (!systemUser) {
      systemUser = await prisma.user.create({
        data: {
          id: "SYSTEM",
          email: "system@auto.local",
          name: "System Bot",
          password: "dummy",
        },
      });
    }

    /* ------------------ Assignees valides ------------------ */
    const validAssignees = await prisma.user.findMany({
      where: { id: { in: assigneeIds } },
      select: { id: true },
    });

    const validAssigneeIds = validAssignees.map((u) => u.id);

    /* -----------------------------------------------------
     * APPEL MISTRAL — avec garantie de réponse
     * ----------------------------------------------------*/
    let generatedText: string | null = null;

    for (const model of MODELS) {
      try {
        const response = await callMistral(
          model,
          `Génère une tâche claire et concise.
Première ligne = Titre (80 caractères max)
Le reste = Description
Aucun astérisque, aucun markdown.
Sujet : ${prompt}`
        );

        if (!response.ok) continue;

        const data = await response.json();
        generatedText = normalizeMistralContent(
          data?.choices?.[0]?.message?.content
        );

        if (generatedText && generatedText.trim()) break;
      } catch {
        // On essaie le modèle suivant
      }
    }

    /* --------------------- FALLBACK IA INTERNE --------------------- */
    if (!generatedText) {
      const fb = generateFallbackTask(prompt);
      generatedText = fb.title + "\n" + fb.description;
    }

    /* ------------------ Split titre/description ------------------ */
    const [firstLine, ...rest] = generatedText.split("\n");
    const title = firstLine?.trim().slice(0, 80) || "Nouvelle tâche IA";
    const description = rest.join("\n").trim() || "Aucune description fournie.";

    /* ------------------ Création Prisma ------------------ */
    const task = await prisma.task.create({
      data: {
        title,
        description,
        projectId,
        creatorId: systemUser.id,
        priority: DEFAULT_PRIORITY,
        status: DEFAULT_STATUS,
        assignees: {
          create: validAssigneeIds.map((id) => ({ userId: id })),
        },
      },
      include: { assignees: true, comments: true },
    });

    /* ------------------ Retour ------------------ */
    return NextResponse.json({
      success: true,
      message: "Tâche générée avec succès",
      data: { task },
    });
  } catch (err: any) {
    console.error("🔥 ERREUR API :", err);

    return NextResponse.json(
      { success: false, message: "Erreur interne", error: err?.message },
      { status: 500 }
    );
  }
}
