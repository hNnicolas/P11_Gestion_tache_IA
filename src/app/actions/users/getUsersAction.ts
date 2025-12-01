import { prisma } from "@/lib/prisma";
import { IUser } from "@/lib/prisma";

export async function getUsers(): Promise<IUser[]> {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
    },
  });

  return users.map((u) => ({
    id: u.id,
    email: u.email,
    name: u.name || "",
  }));
}
