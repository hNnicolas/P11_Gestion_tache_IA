import ProfilPageClient from "@/app/(private)/profil/ProfilPage";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

const JWT_SECRET = process.env.JWT_SECRET || "secret";

export default async function ProfilPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  if (!token) {
    return (
      <p className="text-center mt-10 text-red-500">
        Vous devez être connecté pour voir cette page.
      </p>
    );
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: string;
      email: string;
    };

    // Récupérer l'utilisateur depuis Prisma
    const userFromDb = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!userFromDb) {
      return (
        <p className="text-center mt-10 text-red-500">
          Utilisateur introuvable
        </p>
      );
    }

    // Normaliser name pour qu'il ne soit jamais null
    const user = {
      ...userFromDb,
      name: userFromDb.name ?? "",
    };

    return <ProfilPageClient initialUser={user} />;
  } catch (err) {
    console.error("JWT invalide", err);
    return (
      <p className="text-center mt-10 text-red-500">
        Token invalide, vous devez vous reconnecter
      </p>
    );
  }
}
