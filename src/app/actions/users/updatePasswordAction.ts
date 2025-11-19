"use server";

import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const JWT_SECRET = process.env.JWT_SECRET || "secret";

interface UpdatePasswordInput {
  currentPassword: string;
  newPassword: string;
}

export async function updatePasswordAction({
  currentPassword,
  newPassword,
}: UpdatePasswordInput) {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  if (!token) throw new Error("Non authentifié");

  const decoded = jwt.verify(token, JWT_SECRET) as {
    id: string;
    email: string;
  };

  const schema = z.object({
    currentPassword: z.string().min(6),
    newPassword: z.string().min(6),
  });
  schema.parse({ currentPassword, newPassword });

  const user = await prisma.user.findUnique({ where: { id: decoded.id } });
  if (!user) throw new Error("Utilisateur non trouvé");

  const isValid = await bcrypt.compare(currentPassword, user.password);
  if (!isValid) throw new Error("Mot de passe actuel incorrect");

  const hashedPassword = await bcrypt.hash(newPassword, 12);

  await prisma.user.update({
    where: { id: decoded.id },
    data: { password: hashedPassword },
  });

  return true;
}
