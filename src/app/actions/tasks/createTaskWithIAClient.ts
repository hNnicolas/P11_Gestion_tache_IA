export async function createTaskWithIAClient(
  prompt: string,
  projectId?: string,
  assigneeIds: string[] = []
) {
  try {
    const res = await fetch("/api/auth/tasks/ia", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, projectId, assigneeIds }),
    });

    console.log("🌐 CLIENT - Status :", res.status);

    const text = await res.text();
    console.log("🌐 CLIENT - Raw response text :", text);

    let data: any;
    try {
      data = JSON.parse(text);
    } catch (err) {
      console.error("❌ CLIENT - Impossible de parser JSON :", err);
      return {
        success: false,
        message: "JSON invalide renvoyé par le serveur",
        error: text,
      };
    }

    console.log("🌐 CLIENT - Parsed JSON :", data);

    if (!data.success) {
      console.error(
        "❌ CLIENT - Création tâche IA échouée :",
        data.message,
        data.error
      );
    }

    return data;
  } catch (err: any) {
    console.error("💥 CLIENT - ERREUR réseau :", err);
    return {
      success: false,
      message: "Erreur réseau",
      error: err.message,
    };
  }
}
