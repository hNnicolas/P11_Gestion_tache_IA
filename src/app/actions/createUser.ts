"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { ICreateUser } from "@/lib/prisma";

export async function createUserAction(data: ICreateUser) {
  const { email, name, password } = data;

  if (!email || !password || !name) {
    throw new Error("Tous les champs sont requis.");
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new Error("Cet utilisateur existe déjà.");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      name,
      password: hashedPassword,
    },
  });

  // 🔹 Log pour vérifier l'enregistrement
  console.log("Nouvel utilisateur créé dans Prisma :", user);

  return { id: user.id, email: user.email, name: user.name };
}
