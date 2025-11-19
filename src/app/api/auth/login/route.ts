import { NextRequest, NextResponse } from "next/server";
import { loginUserAction } from "@/app/actions/users/loginUserAction";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    const { user, token } = await loginUserAction({ email, password });

    // Crée une réponse vide
    const res = NextResponse.json({ user });

    res.cookies.set({
      name: "auth_token",
      value: token,
      httpOnly: true,
      path: "/",
      secure: false,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
    });

    return res;
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Erreur serveur" },
      { status: 400 }
    );
  }
}
