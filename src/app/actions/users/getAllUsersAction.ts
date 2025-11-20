"use server";

import { prisma } from "@/lib/prisma";

export type UserForClient = {
  id: string;
  email: string;
  name: string;
};

export async function getAllUsersAction(): Promise<UserForClient[]> {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true },
      orderBy: { name: "asc" },
    });

    // 🔹 Normalisation + assertion de type
    return users.map((u) => ({
      id: u.id,
      email: u.email,
      name: u.name ?? "Unknown",
    })) as UserForClient[];
  } catch (err) {
    console.error("Erreur getAllUsersAction:", err);
    return [];
  }
}
