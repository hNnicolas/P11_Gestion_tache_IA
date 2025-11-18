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
    <div className="flex flex-col md:flex-row h-screen w-full bg-white">
      <div className="flex flex-col justify-center items-center md:w-1/2 w-full bg-[#F9FAFB] px-8 md:px-20 py-12">
        {/* Logo */}
        <div className="mb-8 md:mb-12">
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
          <h1 className="text-2xl md:text-[28px] font-semibold text-[#DB7433] mb-8 md:mb-10 text-center">
            Inscription
          </h1>

          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-4 md:gap-5"
          >
            <label htmlFor="name" className="sr-only">
              Nom complet
            </label>
            <input
              id="name"
              type="text"
              placeholder="Nom complet"
              value={name}
              onChange={(e) => setName(e.target.value)}
              aria-label="Nom complet"
              required
              className="border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:ring-1 focus:ring-[#DB7433]"
            />

            <label htmlFor="email" className="sr-only">
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-label="Email"
              required
              className="border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:ring-1 focus:ring-[#DB7433]"
            />

            <label htmlFor="password" className="sr-only">
              Mot de passe
            </label>
            <input
              id="password"
              type="password"
              placeholder="Mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-label="Mot de passe"
              required
              className="border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:ring-1 focus:ring-[#DB7433]"
            />

            <button
              type="submit"
              disabled={loading}
              aria-busy={loading}
              className="bg-black text-white py-3 rounded-md hover:bg-gray-800 transition-all focus:outline-none focus:ring-2 focus:ring-[#DB7433]"
            >
              {loading ? "Création du compte..." : "S’inscrire"}
            </button>

            {error && (
              <p className="text-red-500 text-center text-sm mt-2" role="alert">
                {error}
              </p>
            )}
          </form>

          <p className="text-center text-sm mt-6 md:mt-8 text-gray-600">
            Déjà inscrit ?{" "}
            <a
              href="/login"
              className="text-[#DB7433] hover:underline font-medium focus:outline-none focus:ring-1 focus:ring-[#DB7433]"
            >
              Se connecter
            </a>
          </p>
        </div>
      </div>

      <div className="relative md:w-1/2 w-full h-64 md:h-full">
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
