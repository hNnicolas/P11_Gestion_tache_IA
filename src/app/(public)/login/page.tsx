"use client";

import Link from "next/link";
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
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Erreur de connexion");

      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      className="flex flex-col md:flex-row h-screen w-full bg-#F9FAFB!"
      role="main"
      aria-label="Page de connexion"
    >
      <section
        className="flex flex-col justify-center items-center md:w-1/2 w-full bg-[#F9FAFB] px-8 md:px-20 py-12"
        role="region"
        aria-labelledby="login-title"
        tabIndex={0}
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
          />
        </div>

        <div
          className="w-full max-w-sm"
          tabIndex={0}
          aria-labelledby="login-title"
        >
          <h1
            id="login-title"
            className="text-[45px]! md:text-[64px] font-semibold text-[#DB7433] mb-8 md:mb-10 text-center"
            tabIndex={0}
          >
            Connexion
          </h1>

          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-5"
            aria-labelledby="login-title"
            role="form"
          >
            <label
              htmlFor="email"
              className="text-[14px] font-medium text-black"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder=""
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              aria-required="true"
              aria-label="Adresse email"
              autoComplete="username"
              className="border border-gray-300 rounded-md px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-[#DB7433]"
            />
            <label
              htmlFor="password"
              className="text-[14px]font-medium text-black"
            >
              Mot de passe
            </label>
            <input
              id="password"
              type="password"
              placeholder=""
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              aria-required="true"
              aria-label="Mot de passe"
              autoComplete="current-password"
              className="border border-gray-300 rounded-md px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-[#DB7433]"
            />

            <button
              type="submit"
              disabled={loading}
              aria-busy={loading}
              aria-label="Bouton de connexion"
              className="bg-black text-white py-4 px-28 rounded-[15px] hover:bg-gray-800 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#DB7433] mx-auto block w-fit"
            >
              {loading ? "Connexion en cours..." : "Se connecter"}
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
            Pas encore inscrit ?{" "}
            <Link
              href="/signup"
              className="text-[#DB7433] hover:underline font-medium focus:outline-none focus:ring-2 focus:ring-[#DB7433]"
              aria-label="Créer un compte"
            >
              Créer un compte
            </Link>
          </p>
        </div>
      </section>

      <div className="relative md:w-1/2 w-full h-screen">
        <Image
          src="/images/login-page.jpg"
          alt="Login illustration"
          fill
          className="object-cover"
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>
    </main>
  );
}
