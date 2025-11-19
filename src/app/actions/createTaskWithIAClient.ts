// Fonction pour appeler ton endpoint IA depuis le frontend
import { ApiResponse } from "@/app/utils/response";

export async function createTaskWithIAClient(
  prompt: string,
  projectId?: string,
  assigneeIds: string[] = []
): Promise<ApiResponse> {
  try {
    const res = await fetch("/api/auth/tasks/ia", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, projectId, assigneeIds }),
    });

    const data = await res.json();

    // Vérifie le format ApiResponse
    if (!data || typeof data.success !== "boolean") {
      console.error("❌ Réponse inattendue du serveur :", data);
      return {
        success: false,
        message: "Réponse inattendue du serveur",
        error: JSON.stringify(data),
        statusCode: res.status,
      };
    }

    if (!data.success) {
      console.error("❌ Erreur création tâche IA :", data.message, data.error);
      return data;
    }

    console.log("✅ Tâche IA créée avec succès :", data.data);

    return data;
  } catch (err: any) {
    console.error("❌ createTaskWithIAClient :", err.message || err);
    return {
      success: false,
      message: "Erreur lors de la création de la tâche IA",
      error: err.message,
      statusCode: 500,
    };
  }
}
