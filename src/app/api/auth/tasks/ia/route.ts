import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendSuccess, sendError } from "@/app/utils/response";

const apiKey = process.env.MISTRAL_API_KEY;
if (!apiKey) throw new Error("❌ MISTRAL_API_KEY manquant dans .env.local");

/* --------------------- Constants --------------------- */
const MODELS = [
  "mistral-small-latest",
  "mistral-medium-latest",
  "mistral-large-latest",
  "open-mistral-nemo",
];

const DEFAULT_STATUS = "TODO";
const DEFAULT_PRIORITY = "MEDIUM";

/* --------------------- Helpers --------------------- */
function normalizeMistralContent(content: any): string {
  if (!content) return "";
  if (typeof content === "string") return content;
  if (Array.isArray(content))
    return content.map((c) => c?.text ?? "").join(" ");
  return String(content);
}

async function fetchWithTimeout(url: string, options: any, timeout = 15000) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error("⏳ Timeout API Mistral")),
      timeout
    );
    fetch(url, options)
      .then((res) => {
        clearTimeout(timer);
        resolve(res);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

async function callMistral(model: string, prompt: string) {
  const payload = {
    model,
    messages: [{ role: "user", content: prompt }],
    max_tokens: 200,
    temperature: 0.6,
  };

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const response: any = await fetchWithTimeout(
        "https://api.mistral.ai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify(payload),
        },
        15000
      );
      return response;
    } catch {
      await new Promise((r) => setTimeout(r, 300 * attempt));
    }
  }
  throw new Error(`❌ Échec appels Mistral avec modèle ${model}`);
}

/* --------------------- Route --------------------- */
export async function POST(req: NextRequest) {
  try {
    const raw = await req.text();
    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return NextResponse.json(sendError("JSON invalide", undefined, 400), {
        status: 400,
      });
    }

    const { prompt, projectId, assigneeIds = [] } = parsed;

    if (!prompt || typeof prompt !== "string")
      return NextResponse.json(
        sendError("Prompt manquant ou invalide", undefined, 400),
        { status: 400 }
      );

    if (!projectId || typeof projectId !== "string")
      return NextResponse.json(
        sendError("projectId manquant", undefined, 400),
        { status: 400 }
      );

    // Vérification projet
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });
    if (!project)
      return NextResponse.json(sendError("Projet inexistant", undefined, 404), {
        status: 404,
      });

    // Création ou récupération du SYSTEM user
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

    // Vérification assignés valides
    const validAssignees = await prisma.user.findMany({
      where: { id: { in: assigneeIds } },
      select: { id: true },
    });
    const validAssigneeIds = validAssignees.map((u) => u.id);

    // Appel IA Mistral avec fallback modèles
    let response: any = null;
    for (const model of MODELS) {
      try {
        response = await callMistral(
          model,
          `Génère une tâche claire et concise.
La première ligne sera le titre et le reste la description.
⚠️ Ne mets aucun astérisque, aucun Markdown, aucun "Titre:" ou "Description:".
Sujet : ${prompt}`
        );
        if (response.ok) break;
      } catch {}
    }

    if (!response || !response.ok)
      return NextResponse.json(
        sendError(
          "Impossible de générer une tâche via Mistral",
          undefined,
          502
        ),
        { status: 502 }
      );

    const data = await response.json();
    const rawContent = data?.choices?.[0]?.message?.content;
    const generatedText = normalizeMistralContent(rawContent);

    // Découpage texte en titre et description
    const [firstLine, ...rest] = generatedText.split("\n");
    const title = firstLine?.slice(0, 80).trim() || "Nouvelle tâche IA";
    const description = rest.join("\n").trim() || generatedText;

    // Création tâche dans Prisma
    const task = await prisma.task.create({
      data: {
        title,
        description,
        projectId,
        creatorId: systemUser.id,
        priority: DEFAULT_PRIORITY,
        status: DEFAULT_STATUS,
        assignees: {
          create: validAssigneeIds.map((userId) => ({ userId })),
        },
      },
      include: { assignees: true, comments: true },
    });

    // Retourne un ApiResponse complet
    return NextResponse.json(
      sendSuccess("Tâche IA créée avec succès", { task })
    );
  } catch (err: any) {
    console.error("ERREUR GLOBALE :", err);
    return NextResponse.json(
      sendError(err?.message || "Erreur serveur", undefined, 500),
      { status: 500 }
    );
  }
}
