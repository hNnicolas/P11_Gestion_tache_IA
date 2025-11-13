import { prisma } from "@/lib/prisma";

/**
 * Vérifie que les utilisateurs sont membres du projet
 */
export const validateProjectMembers = async (
  projectId: string,
  userIds: string[]
) => {
  if (userIds.length === 0) return true;
  const members = await prisma.projectMember.findMany({
    where: { projectId, userId: { in: userIds } },
  });
  return members.length === userIds.length;
};

/**
 * Met à jour les assignations d'une tâche
 */
export const updateTaskAssignments = async (
  taskId: string,
  assigneeIds: string[]
) => {
  await prisma.taskAssignee.deleteMany({ where: { taskId } });
  if (assigneeIds.length > 0) {
    await prisma.taskAssignee.createMany({
      data: assigneeIds.map((userId) => ({ taskId, userId })),
    });
  }
};

/**
 * Récupère les assignations d'une tâche
 */
export const getTaskAssignments = async (taskId: string) => {
  const assignees = await prisma.taskAssignee.findMany({
    where: { taskId },
    include: { user: { select: { id: true, name: true, email: true } } },
  });
  return assignees.map((a) => ({
    id: a.id,
    assignedAt: a.assignedAt,
    user: a.user,
  }));
};
