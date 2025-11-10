// app/api/auth/password/route.ts
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "secret";

export async function PUT(req: NextRequest) {
  try {
    const token = req.cookies.get("auth_token")?.value;
    if (!token) throw new Error("Non authentifié");

    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: string;
      email: string;
      name: string;
    };

    const { currentPassword, newPassword } = await req.json();

    if (!currentPassword || !newPassword) {
      throw new Error("Veuillez fournir l'ancien et le nouveau mot de passe");
    }

    // Vérifie currentPassword dans la DB
    // Mets à jour avec newPassword

    console.log(
      `Mot de passe pour l'utilisateur ${decoded.email} mis à jour en ${newPassword}`
    );

    return NextResponse.json({ message: "Mot de passe mis à jour !" });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 400 });
  }
}
