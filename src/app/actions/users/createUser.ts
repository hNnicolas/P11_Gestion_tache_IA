"use client";

import { validateRegisterData, ValidationError } from "@/app/utils/validation";

export async function createUser(data: {
  email: string;
  name: string;
  password: string;
}) {
  const errors: ValidationError[] = validateRegisterData(data);

  if (errors.length > 0) {
    const message = errors.map((e) => `${e.field}: ${e.message}`).join("\n");
    throw new Error(message);
  }

  const { email, name, password } = data;

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
