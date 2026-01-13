export const runtime = "nodejs";
// prettier-ignore
"use server";

import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";
import { validateUpdatePasswordData } from "@/app/utils/validation";

const JWT_SECRET = process.env.JWT_SECRET!;

export async function updatePasswordAction({
  currentPassword,
  newPassword,
}: {
  currentPassword: string;
  newPassword: string;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  if (!token) throw new Error("Utilisateur non authentifié");

  const decodedRaw = jwt.verify(token, JWT_SECRET) as any;

  const userId = decodedRaw.id ?? decodedRaw.userId;
  if (!userId) throw new Error("Token JWT invalide : ID manquant");

  const errors = validateUpdatePasswordData({ currentPassword, newPassword });
  if (errors.length > 0) throw new Error(errors[0].message);

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("Utilisateur non trouvé");

  const isValid = await bcrypt.compare(currentPassword, user.password);
  if (!isValid) throw new Error("Mot de passe actuel incorrect");

  const hashed = await bcrypt.hash(newPassword, 12);

  await prisma.user.update({
    where: { id: userId },
    data: { password: hashed },
  });

  console.log(
    "[updatePasswordAction] Mot de passe mis à jour pour :",
    user.email
  );

  return { success: true };
}
