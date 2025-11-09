// src/app/actions/createUser.ts
"use client";

export async function createUserAction(data: {
  email: string;
  name: string;
  password: string;
}) {
  const { email, name, password } = data;

  if (!email || !name || !password) {
    throw new Error("Tous les champs sont requis.");
  }

  // Appel du backend Next.js pour créer l'utilisateur
  const res = await fetch("/api/auth/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, name, password }),
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json.error || "Erreur lors de la création du compte");
  }

  console.log("Utilisateur créé via le backend :", json.user);

  return json.user;
}
