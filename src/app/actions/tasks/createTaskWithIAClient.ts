"use client";

export async function createTaskWithIAClient({
  prompt,
  projectId,
  assigneeIds = [],
}: {
  prompt: string;
  projectId: string;
  assigneeIds?: string[];
}) {
  try {
    const res = await fetch("/api/auth/tasks/ia", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, projectId, assigneeIds }),
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      console.error(
        "❌ createTaskWithIAClient - HTTP error:",
        res.status,
        data
      );
      return { success: false, status: res.status, ...data };
    }

    return { success: true, ...data };
  } catch (err: any) {
    console.error("❌ createTaskWithIAClient error:", err);
    return { success: false, error: err?.message || "network_error" };
  }
}
