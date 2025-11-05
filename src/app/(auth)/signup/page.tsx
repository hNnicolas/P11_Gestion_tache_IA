"use client";

import Image from "next/image";
import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createUserAction } from "@/app/actions/createUser";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await createUserAction({ email, name, password });
      router.push("/"); // redirige vers le dashboard après inscription
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full bg-white">
      {/* Colonne gauche : formulaire */}
      <div className="flex flex-col justify-center items-center w-1/2 bg-[#F9FAFB] px-20">
        {/* Logo */}
        <div className="mb-12">
          <Image
            src="/images/icons/logo.png"
            alt="Logo Abricot"
            width={160}
            height={50}
            priority
          />
        </div>

        {/* Formulaire */}
        <div className="w-full max-w-sm">
          <h1 className="text-[28px] font-semibold text-[#DB7433] mb-10 text-center">
            Inscription
          </h1>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <input
              type="text"
              placeholder="Nom complet"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:ring-1 focus:ring-[#DB7433]"
            />

            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:ring-1 focus:ring-[#DB7433]"
            />

            <input
              type="password"
              placeholder="Mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:ring-1 focus:ring-[#DB7433]"
            />

            <button
              type="submit"
              disabled={loading}
              className="bg-black text-white py-3 rounded-md hover:bg-gray-800 transition-all"
            >
              {loading ? "Création du compte..." : "S’inscrire"}
            </button>

            {error && (
              <p className="text-red-500 text-center text-sm mt-2">{error}</p>
            )}
          </form>

          <p className="text-center text-sm mt-8 text-gray-600">
            Déjà inscrit ?{" "}
            <a
              href="/login"
              className="text-[#DB7433] hover:underline font-medium"
            >
              Se connecter
            </a>
          </p>
        </div>
      </div>

      {/* Colonne droite : image */}
      <div className="relative w-1/2 h-full">
        <Image
          src="/images/signup-page.png"
          alt="Illustration d'inscription"
          fill
          className="object-cover"
          priority
        />
      </div>
    </div>
  );
}
