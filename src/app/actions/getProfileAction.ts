"use server";

import { cookies } from "next/headers";

export async function getProfileAction() {
  // ✅ attendre le résultat de cookies()
  const cookieStore = await cookies();
  const authToken = cookieStore.get("auth_token")?.value;

  if (!authToken) throw new Error("Non authentifié");

  const res = await fetch(`${process.env.BACKEND_URL}/auth/profile`, {
    method: "GET",
    headers: {
      // si ton backend lit le token depuis le header Authorization
      Authorization: `Bearer ${authToken}`,
    },
    credentials: "include",
  });

  const data = await res.json();

  if (!res.ok)
    throw new Error(data?.message || "Impossible de récupérer le profil");

  return data.data.user;
}
