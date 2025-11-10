// src/app/actions/updateProfileAction.ts
"use server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "secret";

interface UpdateProfileInput {
  name?: string;
  email?: string;
}

interface User {
  id: string;
  name: string;
  email: string;
}

export async function updateProfileAction({
  name,
  email,
}: UpdateProfileInput): Promise<User> {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  if (!token) throw new Error("Non authentifié");

  const decoded = jwt.verify(token, JWT_SECRET) as {
    id: string;
    email: string;
    name: string;
  };

  const updatedUser: User = {
    id: decoded.id,
    name: name || decoded.name,
    email: email || decoded.email,
  };

  return updatedUser;
}
