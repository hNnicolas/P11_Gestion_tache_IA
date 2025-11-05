"use client";

import Image from "next/image";
import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Erreur de connexion");

      // Le cookie HTTP-only est déjà créé côté serveur
      console.log("✅ Connexion réussie :", data.user);

      // Redirection page accueil
      router.push("/");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full bg-white">
      <div className="flex flex-col justify-center items-center w-1/2 bg-[#F9FAFB] px-20">
        <div className="mb-12">
          <Image
            src="/images/icons/logo.png"
            alt="Logo Abricot"
            width={160}
            height={50}
            priority
          />
        </div>

        <div className="w-full max-w-sm">
          <h1 className="text-[28px] font-semibold text-[#DB7433] mb-10 text-center">
            Connexion
          </h1>

          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-5"
            aria-labelledby="login-form-title"
          >
            {/* Label associé et champ focusable */}
            <label htmlFor="email" className="sr-only">
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              aria-required="true"
              aria-label="Email"
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
              required
              aria-required="true"
              aria-label="Mot de passe"
              className="border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#DB7433]"
            />

            <button
              type="submit"
              disabled={loading}
              className="bg-black text-white py-3 rounded-md hover:bg-gray-800 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#DB7433]"
              aria-busy={loading}
            >
              {loading ? "Connexion en cours..." : "Se connecter"}
            </button>

            {error && (
              <p
                className="text-red-500 text-center text-sm mt-2"
                role="alert"
                aria-live="assertive"
              >
                {error}
              </p>
            )}
          </form>

          <p className="text-center text-sm mt-8 text-gray-600">
            Pas encore inscrit ?{" "}
            <a
              href="/signup"
              className="text-[#DB7433] hover:underline font-medium"
            >
              Créer un compte
            </a>
          </p>
        </div>
      </div>

      {/* Colonne droite : image */}
      <div className="w-1/2 h-full flex items-center justify-center">
        <Image
          src="/images/login-page.png"
          alt="Illustration représentant la page de connexion"
          width={1000}
          height={2000}
          className="object-cover"
          priority
        />
      </div>
    </div>
  );
}
