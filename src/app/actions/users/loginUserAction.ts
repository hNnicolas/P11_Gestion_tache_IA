export const runtime = "nodejs";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "secret";

interface ILoginUser {
  email: string;
  password: string;
}

export async function loginUserAction({ email, password }: ILoginUser) {
  if (!email || !password) throw new Error("Tous les champs sont requis.");

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error("Utilisateur non trouvé.");

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) throw new Error("Mot de passe incorrect.");

  const token = jwt.sign(
    { userId: user.id, email: user.email, name: user.name },
    JWT_SECRET,
    { expiresIn: "7d" }
  );

  return {
    user: { id: user.id, email: user.email, name: user.name },
    token,
  };
}
