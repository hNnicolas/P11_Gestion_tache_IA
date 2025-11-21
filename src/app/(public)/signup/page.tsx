"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createUserAction } from "@/app/actions/users/createUser";

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
      router.push("/login");
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      className="flex flex-col md:flex-row h-screen w-full bg-white"
      role="main"
      aria-label="Page d'inscription"
    >
      <section
        className="flex flex-col justify-center items-center md:w-1/2 w-full bg-[#F9FAFB] px-8 md:px-20 py-12"
        role="region"
        aria-labelledby="signup-title"
      >
        <div
          className="mt-4 mb-24 md:mb-36 lg:mb-40"
          role="img"
          aria-label="Logo Abricot"
          tabIndex={0}
        >
          <Image
            src="/images/icons/logo.png"
            alt="Logo Abricot"
            width={350}
            height={80}
            style={{ height: "auto" }}
            priority
          />
        </div>

        <div className="w-full max-w-sm">
          <h1
            id="signup-title"
            className="text-[45px]! md:text-[64px] font-bold text-[#DB7433] mb-8 md:mb-10 text-center"
            tabIndex={0}
          >
            Inscription
          </h1>

          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-5"
            role="form"
            aria-labelledby="signup-title"
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
              className="border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#DB7433]"
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
              className="border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#DB7433]"
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
              className="border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#DB7433]"
            />

            <button
              type="submit"
              disabled={loading}
              aria-busy={loading}
              aria-label="Bouton de création de compte"
              className="bg-black text-white py-4 px-28 rounded-[15px] hover:bg-gray-800 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#DB7433] mx-auto block w-fit"
            >
              {loading ? "Création du compte..." : "S’inscrire"}
            </button>

            {error && (
              <p
                className="text-red-500 text-center text-sm mt-2"
                role="alert"
                aria-live="assertive"
                tabIndex={0}
              >
                {error}
              </p>
            )}
          </form>

          <p className="text-center text-sm mt-8 text-gray-600">
            Déjà inscrit ?{" "}
            <Link
              href="/login"
              className="text-[#DB7433] hover:underline font-medium focus:outline-none focus:ring-2 focus:ring-[#DB7433]"
              aria-label="Se connecter"
            >
              Se connecter
            </Link>
          </p>
        </div>
      </section>
      <div className="relative md:w-1/2 w-full h-screen">
        <Image
          src="/images/signup-page.jpg"
          alt="Illustration d'inscription"
          fill
          className="object-cover"
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>
    </main>
  );
}
