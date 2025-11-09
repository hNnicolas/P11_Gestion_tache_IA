"use client";

import { useEffect, useState } from "react";

interface User {
  id: string;
  name: string;
  email: string;
}

export default function ProfilPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    // Récupère le user connecté
    fetch("/api/me", { credentials: "include" })
      .then((res) => {
        if (!res.ok) throw new Error("Utilisateur non authentifié");
        return res.json();
      })
      .then((data) => {
        setUser(data.user);
        // Séparer prénom et nom
        const [p, n] = data.user.name.split(" ");
        setPrenom(p);
        setNom(n || "");
        setEmail(data.user.email);
      })
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-center mt-10">Chargement...</p>;

  if (!user)
    return (
      <p className="text-center mt-10 text-red-500">
        Vous devez être connecté pour voir cette page.
      </p>
    );

  const handleUpdate = () => {
    // Ici tu peux ajouter ton fetch PUT/POST pour modifier le user côté backend
    console.log({ nom, prenom, email, password });
  };

  return (
    <section className="max-w-[1100px] mx-auto mt-10 bg-white p-12 rounded-[10px] border border-[#E5E7EB] shadow-sm">
      <h2 className="text-black font-semibold text-xl">Mon compte</h2>
      <p className="mt-1 mb-10 text-[--color-sous-texte]">
        {prenom} {nom}
      </p>

      <div className="flex flex-col gap-6">
        {/* Nom */}
        <div>
          <label className="small-text block mb-2">Nom</label>
          <input
            type="text"
            className="w-full h-12 px-4 rounded-lg border border-[#E5E7EB]"
            value={nom}
            onChange={(e) => setNom(e.target.value)}
          />
        </div>

        {/* Prénom */}
        <div>
          <label className="small-text block mb-2">Prénom</label>
          <input
            type="text"
            className="w-full h-12 px-4 rounded-lg border border-[#E5E7EB]"
            value={prenom}
            onChange={(e) => setPrenom(e.target.value)}
          />
        </div>

        {/* Email */}
        <div>
          <label className="small-text block mb-2">Email</label>
          <input
            type="email"
            className="w-full h-12 px-4 rounded-lg border border-[#E5E7EB]"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {/* Mot de passe */}
        <div>
          <label className="small-text block mb-2">Mot de passe</label>
          <input
            type="password"
            className="w-full h-12 px-4 rounded-lg border border-[#E5E7EB]"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="***********"
          />
        </div>

        {/* Bouton */}
        <button
          onClick={handleUpdate}
          className="mt-4 bg-black text-white px-6 py-3 rounded-lg small-text w-fit hover:bg-[#1c1c1c]"
        >
          Modifier les informations
        </button>
      </div>
    </section>
  );
}
