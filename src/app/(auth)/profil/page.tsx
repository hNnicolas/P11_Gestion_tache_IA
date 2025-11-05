"use client";

import { useState } from "react";

export default function ProfilPage() {
  const [nom, setNom] = useState("Amélie");
  const [prenom, setPrenom] = useState("Amélie");
  const [email, setEmail] = useState("a.dupont@mail.com");
  const [password, setPassword] = useState("***********");

  return (
    <section className="max-w-[1100px] mx-auto mt-10 bg-white p-12 rounded-[10px] border border-[#E5E7EB] shadow-sm">
      <h2 className="text-black font-semibold text-xl">Mon compte</h2>
      <p className="mt-1 mb-10 text-[--color-sous-texte] small-text">
        Alice Martin
      </p>

      {/* form */}
      <div className="flex flex-col gap-6">
        {/* nom */}
        <div>
          <label className="small-text block mb-2">Nom</label>
          <input
            type="text"
            className="w-full h-12 px-4 rounded-lg border border-[#E5E7EB]"
            value={nom}
            onChange={(e) => setNom(e.target.value)}
          />
        </div>

        {/* prenom */}
        <div>
          <label className="small-text block mb-2">Prénom</label>
          <input
            type="text"
            className="w-full h-12 px-4 rounded-lg border border-[#E5E7EB]"
            value={prenom}
            onChange={(e) => setPrenom(e.target.value)}
          />
        </div>

        {/* email */}
        <div>
          <label className="small-text block mb-2">Email</label>
          <input
            type="email"
            className="w-full h-12 px-4 rounded-lg border border-[#E5E7EB]"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {/* password */}
        <div>
          <label className="small-text block mb-2">Mot de passe</label>
          <input
            type="password"
            className="w-full h-12 px-4 rounded-lg border border-[#E5E7EB]"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {/* bouton */}
        <button className="mt-4 bg-black text-white px-6 py-3 rounded-lg small-text w-fit hover:bg-[#1c1c1c]">
          Modifier les informations
        </button>
      </div>
    </section>
  );
}
