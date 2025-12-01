import { PrismaClient } from "@prisma/client";

declare global {
  var prisma: PrismaClient | undefined;
}

export const prisma = globalThis.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = prisma;
}

export interface IUser {
  id: string;
  email: string;
  name: string;
}

export interface IUserInitials {
  initials: string;
}

export interface ITask {
  id: string;
  title: string;
  description: string | null;
  status: "TODO" | "IN_PROGRESS" | "DONE" | "CANCELLED";
  projectId: string;
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

export interface IComment {
  id: string;
  taskId: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  author: {
    id: string;
    name: string | null;
  };
}

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

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}
