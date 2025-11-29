"use server";

import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

/* -------------------- CONFIG -------------------- */
const apiKey = process.env.MISTRAL_API_KEY;
const JWT_SECRET = process.env.JWT_SECRET;

const MODELS = [
  "mistral-small-latest",
  "mistral-medium-latest",
  "mistral-large-latest",
  "open-mistral-nemo",
];

const DEFAULT_STATUS = "TODO";
const DEFAULT_PRIORITY = "MEDIUM";
const MAX_PROMPT_LENGTH = 500;

/* -------------------- UTILITAIRES -------------------- */
function normalizeMistralContent(content: any): string {
  if (!content) return "";
  if (typeof content === "string") return content;
  if (Array.isArray(content))
    return content.map((c) => c?.text ?? "").join(" ");
  return String(content);
}

function generateFallbackTask(prompt: string) {
  const title =
    prompt.split("\n")[0]?.trim().slice(0, 80) ||
    "Tâche générée automatiquement";
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

function verifyJWT(token: string) {
  try {
    if (!JWT_SECRET) throw new Error("JWT_SECRET is not defined");
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

/* -------------------- SERVER ACTION -------------------- */
export async function createTaskWithIAClient(
  prompt: string,
  projectId?: string,
  assigneeIds: string[] = [],
  retries = 3,
  retryDelayMs = 1000
) {
  // Validation du prompt
  if (!prompt.trim()) {
    return {
      success: false,
      message: "Le prompt est vide",
      error: "Prompt vide",
    };
  }

  if (prompt.length > MAX_PROMPT_LENGTH) {
    return {
      success: false,
      message: "Prompt trop long",
      error: `Maximum ${MAX_PROMPT_LENGTH} caractères`,
    };
  }

  // Authentification JWT
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  if (!token) {
    return {
      success: false,
      message: "Non authentifié - token manquant",
      error: "Token JWT manquant dans les cookies",
    };
  }

  const user = verifyJWT(token);
  if (!user) {
    return {
      success: false,
      message: "Token invalide ou expiré",
      error: "JWT verification failed",
    };
  }

  // Validation du projectId
  if (!projectId || typeof projectId !== "string") {
    return {
      success: false,
      message: "projectId manquant",
      error: "projectId is required",
    };
  }

  try {
    // Vérifier que le projet existe
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return {
        success: false,
        message: "Projet inexistant",
        error: "Project not found",
      };
    }

    // Vérifier l'accès au projet
    const membership = await prisma.projectMember.findFirst({
      where: {
        projectId,
        userId: (user as any).id,
      },
    });

    if (!membership) {
      return {
        success: false,
        message: "Accès refusé au projet",
        error: "User is not a member of this project",
      };
    }

    // Créer ou récupérer le System Bot
    let systemUser = await prisma.user.findUnique({
      where: { id: "SYSTEM" },
    });

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

    // Valider les assignees
    const validAssignees = await prisma.user.findMany({
      where: { id: { in: assigneeIds } },
      select: { id: true },
    });
    const validAssigneeIds = validAssignees.map((u) => u.id);

    // Appel Mistral avec retry
    let generatedText: string | null = null;

    for (let attempt = 1; attempt <= retries; attempt++) {
      for (const model of MODELS) {
        try {
          const response = await callMistral(
            model,
            `Génère une tâche claire et concise.\nPremière ligne = Titre (80 caractères max)\nLe reste = Description\nAucun astérisque, aucun markdown.\nSujet : ${prompt}`
          );

          if (!response.ok) {
            console.log(`⚠️ Modèle ${model} a échoué (${response.status})`);
            continue;
          }

          const data = await response.json();
          generatedText = normalizeMistralContent(
            data?.choices?.[0]?.message?.content
          );

          if (generatedText?.trim()) {
            console.log(`Génération réussie avec ${model}`);
            break;
          }
        } catch (err: any) {
          console.error(`❌ Erreur avec ${model}:`, err.message);
          continue;
        }
      }

      if (generatedText?.trim()) break;

      if (attempt < retries) {
        console.log(`⏳ Retry dans ${retryDelayMs}ms...`);
        await new Promise((r) => setTimeout(r, retryDelayMs));
      }
    }

    // Fallback si tous les modèles ont échoué
    if (!generatedText) {
      console.log("⚠️ Utilisation du fallback interne");
      const fb = generateFallbackTask(prompt);
      generatedText = fb.title + "\n" + fb.description;
    }

    // Split titre/description
    const [firstLine, ...rest] = generatedText.split("\n");
    const title = firstLine?.trim().slice(0, 80) || "Nouvelle tâche IA";
    const description = rest.join("\n").trim() || "Aucune description fournie.";

    // Création de la tâche dans la base de données
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
      include: {
        assignees: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        comments: true,
      },
    });

    // console.log("Tâche IA générée avec succès:", task.id);

    return {
      success: true,
      message: "Tâche générée avec succès",
      data: { task },
    };
  } catch (err: any) {
    console.error("🔥 ERREUR dans createTaskWithIAClient:", err);
    return {
      success: false,
      message: "Erreur interne du serveur",
      error: err?.message || "Unknown error",
    };
  }
}
