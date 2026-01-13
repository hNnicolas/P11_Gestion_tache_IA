export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "secret";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("auth_token")?.value;
    if (!token) throw new Error("Non authentifié");

    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: string;
      email: string;
      name: string;
    };

    return NextResponse.json({ user: decoded });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Non authentifié" },
      { status: 401 }
    );
  }
}

// --- PUT ---
export async function PUT(req: NextRequest) {
  try {
    const token = req.cookies.get("auth_token")?.value;
    if (!token) throw new Error("Non authentifié");

    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: string;
      email: string;
      name: string;
    };

    const body = await req.json();
    const updatedName = body.name || decoded.name;
    const updatedEmail = body.email || decoded.email;

    const updatedUser = {
      id: decoded.id,
      name: updatedName,
      email: updatedEmail,
    };

    return NextResponse.json({ user: updatedUser });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 400 });
  }
}
