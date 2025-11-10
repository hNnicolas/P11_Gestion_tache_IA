"use server";

import { cookies } from "next/headers";

const BACKEND_URL =
  process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL;

export const getTaskAction = async (projectId: string, taskId: string) => {
  // await cookies() car c'est une Promise
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  if (!token) throw new Error("Utilisateur non authentifié");

  const res = await fetch(
    `${BACKEND_URL}/projects/${projectId}/tasks/${taskId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(
      errorData.message || "Erreur lors de la récupération de la tâche"
    );
  }

  const responseData = await res.json();
  return responseData.data.task;
};
