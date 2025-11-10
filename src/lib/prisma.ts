import {
  PrismaClient,
  User,
  Project,
  Task,
  Comment,
  TaskAssignee,
  ProjectMember,
} from "@prisma/client";

declare global {
  var prisma: PrismaClient | undefined;
}

export const prisma = globalThis.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = prisma;
}

/* =========================
   Interfaces Frontend
   ========================= */

// Utilisateur
export interface IUser {
  id: string;
  email: string;
  name: string;
}

// Initiales pour l'affichage
export interface IUserInitials {
  initials: string; // "AD" par exemple
}

// Projet
export interface ITask {
  id: string;
  title: string;
  status: "TODO" | "IN_PROGRESS" | "DONE" | "CANCELLED"; // <-- ajouté
  project: {
    id: string;
    name: string;
    description: string | null;
  };
  assignees: {
    user: {
      id: string;
      name: string | null;
      email: string;
    };
  }[];
  comments: {
    id: string;
    content: string;
    author: {
      id: string;
      name: string | null;
    };
    createdAt: Date;
    updatedAt: Date;
  }[];
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  dueDate: Date | null;
  creatorId: string;
}

// Commentaire
export interface IComment {
  id: string;
  content: string;
  author: IUser;
  taskId: string;
}

// Pour la création côté front (utile pour forms)
export interface ICreateUser {
  email: string;
  name: string;
  password: string;
}

export interface ICreateProject {
  name: string;
  description: string;
  ownerId: string;
  contributorsIds: string[];
}

export interface ICreateTask {
  title: string;
  description: string;
  status: "TODO" | "IN_PROGRESS" | "DONE" | "CANCELLED";
  priority: "LOW" | "MEDIUM" | "HIGH";
  dueDate: Date;
  projectId: string;
  assigneesIds: string[];
}

export interface ICreateComment {
  content: string;
  authorId: string;
  taskId: string;
}
