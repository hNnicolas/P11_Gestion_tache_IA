import { prisma } from "@/lib/prisma";

export const getTaskComments = async (taskId: string) => {
  const comments = await prisma.comment.findMany({
    where: { taskId },
    include: { author: { select: { id: true, name: true, email: true } } },
    orderBy: { createdAt: "asc" },
  });
  return comments.map((c) => ({
    id: c.id,
    content: c.content,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
    author: c.author,
  }));
};
