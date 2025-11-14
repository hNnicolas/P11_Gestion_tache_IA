// Fonction pour appeler ton endpoint IA depuis le frontend
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

    if (!res.ok) {
      const errorText = await res.text();
      console.error("❌ Erreur création tâche IA :", errorText);
      throw new Error(errorText);
    }

    const data = await res.json();
    return data;
  } catch (err: any) {
    console.error("❌ createTaskWithIAClient :", err.message || err);
    throw err;
  }
}
