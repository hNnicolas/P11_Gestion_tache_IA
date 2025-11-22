export async function createTaskWithIAClient(
  prompt: string,
  projectId?: string,
  assigneeIds: string[] = [],
  retries = 3,
  retryDelayMs = 1000
) {
  if (!prompt.trim()) {
    return {
      success: false,
      message: "Le prompt est vide",
      error: "Prompt vide",
    };
  }

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch("/api/auth/tasks/ia", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, projectId, assigneeIds }),
      });

      console.log(`🌐 CLIENT - Attempt ${attempt} - Status :`, res.status);

      const text = await res.text();
      console.log(`🌐 CLIENT - Attempt ${attempt} - Raw response :`, text);

      let data: any;
      try {
        data = JSON.parse(text);
      } catch (err) {
        console.error("❌ CLIENT - JSON invalide :", err);
        return {
          success: false,
          message: "Réponse du serveur invalide",
          error: text,
        };
      }

      if (!res.ok) {
        console.error(
          `❌ CLIENT - HTTP Error (${res.status}) :`,
          data.message || "Unknown",
          data.error
        );
        if (attempt < retries) {
          console.log(`⏳ Retry dans ${retryDelayMs}ms...`);
          await new Promise((r) => setTimeout(r, retryDelayMs));
          continue;
        }
        return {
          success: false,
          message: data.message || "Erreur serveur",
          error: data.error || `HTTP ${res.status}`,
        };
      }

      if (!data.success) {
        console.error(
          "❌ CLIENT - IA task creation failed:",
          data.message,
          data.error
        );
        return {
          success: false,
          message: data.message || "Erreur IA",
          error: data.error || "Unknown",
        };
      }

      console.log("✅ CLIENT - Tâche IA générée avec succès :", data);
      return data;
    } catch (err: any) {
      console.error(`💥 CLIENT - Tentative ${attempt} - Erreur réseau :`, err);
      if (attempt < retries) {
        console.log(`⏳ Retry dans ${retryDelayMs}ms...`);
        await new Promise((r) => setTimeout(r, retryDelayMs));
      } else {
        return {
          success: false,
          message: "Erreur réseau ou serveur IA indisponible",
          error: err.message,
        };
      }
    }
  }

  return {
    success: false,
    message: "Échec après plusieurs tentatives",
    error: "Max retries reached",
  };
}
