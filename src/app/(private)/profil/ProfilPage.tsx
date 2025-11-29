"use client";

import { useState, useEffect } from "react";
import { updateProfileAction } from "@/app/actions/users/updateProfileAction";
import ApiMessage from "@/components/ApiMessage";
import ChangePasswordModal from "@/components/ChangePasswordModal";
import { ApiResponse } from "@/types";
import { useUser } from "@/context/UserContext";

interface User {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

export default function ProfilPageClient({
  initialUser,
}: {
  initialUser: User;
}) {
  const { user: contextUser, setUser } = useUser(); // context
  const [prenom, setPrenom] = useState("");
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [apiResponse, setApiResponse] = useState<ApiResponse | null>(null);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  // Initialiser les champs du formulaire avec initialUser ou contextUser
  useEffect(() => {
    const currentUser = contextUser || initialUser;
    if (currentUser) {
      const nameParts = currentUser.name.split(" ");
      setPrenom(nameParts.shift() || "");
      setNom(nameParts.join(" ") || "");
      setEmail(currentUser.email);

      // Met à jour le context au chargement initial
      if (!contextUser) setUser(currentUser);
    }
  }, [initialUser, contextUser, setUser]);

  const handleUpdateProfile = async () => {
    if (!prenom || !nom || !email) {
      setApiResponse({
        success: false,
        message: "Veuillez remplir tous les champs.",
      });
      return;
    }

    try {
      const updated = await updateProfileAction({
        name: `${prenom} ${nom}`,
        email,
      });

      // Met à jour le context => Header se met à jour instantanément
      setUser(updated);

      setApiResponse({ success: true, message: "Profil mis à jour !" });
    } catch (err: any) {
      setApiResponse({
        success: false,
        message: "Impossible de mettre à jour le profil",
        error: err.message,
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] p-6 pb-50">
      <ApiMessage response={apiResponse} />

      <section className="max-w-[1500px] mx-auto mt-10 bg-white p-12 rounded-[10px] border border-[#E5E7EB] shadow-sm">
        <h1 className="text-black font-semibold text-xl">Mon compte</h1>
        <p className="mt-1 mb-10 text-[--color-sous-texte]">
          {prenom} {nom}
        </p>

        <form
          className="flex flex-col gap-6"
          onSubmit={(e) => {
            e.preventDefault();
            handleUpdateProfile();
          }}
        >
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
              required
            />
          </div>

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
              required
            />
          </div>

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
              required
            />
          </div>

          <button
            type="submit"
            className="mt-6 bg-black text-white! px-6 py-3 rounded-lg small-text w-fit hover:bg-[#1c1c1c]"
          >
            Modifier les informations
          </button>
        </form>

        <div className="mt-12 border-t pt-8">
          <button
            type="button"
            onClick={() => setIsPasswordModalOpen(true)}
            className="px-6 py-3 rounded-lg small-text hover bg-gray-200 text-gray-800"
          >
            Changer le mot de passe
          </button>
        </div>
      </section>

      {isPasswordModalOpen && (
        <ChangePasswordModal onClose={() => setIsPasswordModalOpen(false)} />
      )}
    </div>
  );
}
