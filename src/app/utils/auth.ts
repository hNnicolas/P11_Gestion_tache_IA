import jwt from "jsonwebtoken";

export interface UserPayload {
  userId: string;
  email: string;
  name?: string;
  iat?: number;
  exp?: number;
}

export async function verifyToken(token: string): Promise<UserPayload | null> {
  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET manquant");

    const decoded = jwt.verify(token, secret) as UserPayload;
    return decoded;
  } catch (err) {
    console.error("Token invalide:", err);
    return null;
  }
}
