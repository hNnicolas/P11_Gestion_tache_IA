"use server";

import { cookies } from "next/headers";

const BACKEND_URL =
  process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL;

export type UpdateTaskInput = {
  title?: string;
  description?: string;
  status?: "TODO" | "IN_PROGRESS" | "DONE" | "CANCELLED";
  priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  dueDate?: string;
};

export const updateTaskAction = async (
  projectId: string,
  taskId: string,
  data: UpdateTaskInput
) => {
  // await cookies() car c'est une Promise
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  if (!token) throw new Error("Utilisateur non authentifié");

  const res = await fetch(
    `${BACKEND_URL}/projects/${projectId}/tasks/${taskId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    }
  );

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(
      errorData.message || "Erreur lors de la mise à jour de la tâche"
    );
  }

  const responseData = await res.json();
  return responseData.data.task;
};
