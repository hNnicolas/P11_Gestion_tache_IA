"use server";

import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "changeme";

export const getProjectsAction = async () => {
  const cookieStore = await cookies();
  const authToken = cookieStore.get("auth_token")?.value;

  if (!authToken) throw new Error("Non authentifié");

  // Décoder le token JWT
  let user: { id: string; email: string; name: string };
  try {
    user = jwt.verify(authToken, JWT_SECRET) as any;
  } catch (err) {
    throw new Error("Token invalide");
  }

  const projects = await prisma.project.findMany({
    where: {
      OR: [
        { ownerId: user.id },
        {
          members: { some: { userId: user.id } },
        },
      ],
    },
    include: {
      tasks: true,
      owner: { select: { id: true, email: true, name: true } },
      members: {
        include: { user: { select: { id: true, email: true, name: true } } },
      },
      _count: { select: { tasks: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return projects;
};
