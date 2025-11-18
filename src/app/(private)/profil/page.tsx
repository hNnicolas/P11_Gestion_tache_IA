"use client";

import { useEffect, useState } from "react";
import { updateProfileAction } from "@/app/actions/updateProfileAction";
import { updatePasswordAction } from "@/app/actions/updatePasswordAction";

interface User {
  id: string;
  name: string;
  email: string;
}

export default function ProfilPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [prenom, setPrenom] = useState("");
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  // --- Récupérer le profil de l'utilisateur ---
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/auth/profile", {
          method: "GET",
          credentials: "include",
        });

        if (!res.ok) throw new Error("Utilisateur non authentifié");

        const data = await res.json();
        setUser(data.user);

        const [p, n] = data.user.name.split(" ");
        setPrenom(p);
        setNom(n || "");
        setEmail(data.user.email);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  // --- Bouton unique pour mettre à jour profil + mot de passe ---
  const handleUpdateAll = async () => {
    if (!prenom || !nom || !email) {
      alert("Veuillez remplir les champs de nom, prénom et email.");
      return;
    }

    try {
      // 1️⃣ Mettre à jour le profil
      const updatedUser = await updateProfileAction({
        name: `${prenom} ${nom}`,
        email,
      });
      setUser(updatedUser);

      // 2️⃣ Mettre à jour le mot de passe seulement si les champs sont remplis
      if (currentPassword && newPassword) {
        await updatePasswordAction({ currentPassword, newPassword });
        setCurrentPassword("");
        setNewPassword("");
        alert("Profil et mot de passe mis à jour !");
      } else {
        alert("Profil mis à jour !");
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) return <p className="text-center mt-10">Chargement...</p>;
  if (!user)
    return (
      <p className="text-center mt-10 text-red-500">
        Vous devez être connecté pour voir cette page.
      </p>
    );

  return (
    <div className="min-h-screen bg-[#F9FAFB] p-6 pb-50">
      <section
        className="max-w-[1500px] mx-auto mt-10 bg-white p-12 rounded-[10px] border border-[#E5E7EB] shadow-sm"
        aria-labelledby="profil-title"
      >
        <h2 id="profil-title" className="text-black font-semibold text-xl">
          Mon compte
        </h2>
        <p className="mt-1 mb-10 text-[--color-sous-texte]">
          {prenom} {nom}
        </p>

        <form
          className="flex flex-col gap-6"
          onSubmit={(e) => {
            e.preventDefault();
            handleUpdateAll();
          }}
        >
          {/* Nom */}
          <div>
            <label htmlFor="nom" className="small-text block mb-2">
              Nom
            </label>
            <input
              id="nom"
              type="text"
              className="w-full h-12 px-4 rounded-lg border border-[#E5E7EB]"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              aria-label="Nom"
              required
            />
          </div>

          {/* Prénom */}
          <div>
            <label htmlFor="prenom" className="small-text block mb-2">
              Prénom
            </label>
            <input
              id="prenom"
              type="text"
              className="w-full h-12 px-4 rounded-lg border border-[#E5E7EB]"
              value={prenom}
              onChange={(e) => setPrenom(e.target.value)}
              aria-label="Prénom"
              required
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="small-text block mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              className="w-full h-12 px-4 rounded-lg border border-[#E5E7EB]"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-label="Email"
              required
            />
          </div>

          {/* Mot de passe */}
          <fieldset
            className="mt-8 flex flex-col gap-4"
            aria-labelledby="password-fieldset"
          >
            <div>
              <label
                htmlFor="currentPassword"
                className="small-text block mb-2"
              >
                Mot de passe actuel
              </label>
              <input
                id="currentPassword"
                type="password"
                className="w-full h-12 px-4 rounded-lg border border-[#E5E7EB]"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                aria-label="Mot de passe actuel"
              />
            </div>

            <div>
              <label htmlFor="newPassword" className="small-text block mb-2">
                Nouveau mot de passe
              </label>
              <input
                id="newPassword"
                type="password"
                className="w-full h-12 px-4 rounded-lg border border-[#E5E7EB]"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                aria-label="Nouveau mot de passe"
              />
            </div>
          </fieldset>

          {/* Bouton unique pour tout mettre à jour */}
          <button
            type="submit"
            className="mt-6 bg-black text-white! px-6 py-3 rounded-lg small-text w-fit hover:bg-[#1c1c1c]"
          >
            Modifier les informations
          </button>
        </form>
      </section>
    </div>
  );
}
