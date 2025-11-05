// src/app/actions/user.ts
import { prisma } from "@/lib/prisma";

export async function getUser() {
  const user = await prisma.user.findFirst();
  return user;
}
