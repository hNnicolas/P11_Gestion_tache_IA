import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET || "secret";

export async function getUser() {
  try {
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get("auth_token");

    if (!tokenCookie) {
      return null;
    }

    const token = tokenCookie.value;

    const payload = jwt.verify(token, JWT_SECRET) as { email: string };

    if (!payload?.email) {
      return null;
    }

    const user = await prisma.user.findUnique({
      where: { email: payload.email },
      select: { id: true, name: true, email: true },
    });

    return user;
  } catch (err) {
    console.error("Erreur getUser:", err);
    return null;
  }
}

export async function getAllUsers() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
      },
      orderBy: { name: "asc" },
    });
    return users;
  } catch (err) {
    console.error("Erreur getAllUsers:", err);
    return [];
  }
}
