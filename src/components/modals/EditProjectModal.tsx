"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

export default function EditProjectModal({
  isOpen,
  setIsOpen,
  project,
}: {
  isOpen: boolean;
  setIsOpen: (v: boolean) => void;
  project: any;
}) {
  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description);
  const [showDropdown, setShowDropdown] = useState(false);

  // Nombre de contributeurs récupéré dynamiquement
  const contributorCount = project.members.length;

  // Fermer la modale avec la touche Esc
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    if (isOpen) window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, setIsOpen]);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    console.log("Update project:", { name, description });
    setIsOpen(false);
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/40 z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-project-title"
    >
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        {/* Header avec croix */}
        <div className="flex justify-between items-center mb-4">
          <h2
            id="edit-project-title"
            className="text-xl font-bold text-(--color-text)"
          >
            Modifier le projet
          </h2>
          <button
            onClick={() => setIsOpen(false)}
            aria-label="Fermer la modale"
            className="p-1 rounded hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-(--color-principal)"
          >
            <Image
              src="/images/icons/close-modal.png"
              width={20}
              height={20}
              alt="Fermer"
            />
          </button>
        </div>

        {/* Nom du projet */}
        <label className="text-sm font-medium">Nom du projet</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm mb-3 w-full"
        />

        {/* Description */}
        <label className="text-sm font-medium">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full mb-3"
        />

        {/* Contributeur */}
        <label className="text-sm font-medium">Contributeur</label>
        <div className="relative mb-5">
          <input
            type="number"
            value={contributorCount}
            readOnly
            placeholder="Contributeurs"
            className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full pr-10
              [&::-webkit-inner-spin-button]:appearance-none
              [&::-webkit-outer-spin-button]:appearance-none
              [-moz-appearance]:textfield"
            aria-label="Nombre de contributeurs"
          />

          {/* Flèche à droite de l'input */}
          <button
            type="button"
            onClick={() => setShowDropdown(!showDropdown)}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 focus:outline-none"
            aria-label="Ouvrir la liste des contributeurs"
          >
            <Image
              src="/images/icons/onglet.png"
              width={16}
              height={16}
              alt="Flèche"
            />
          </button>

          {/* Dropdown */}
          {showDropdown && (
            <ul className="absolute z-10 bg-white border border-gray-300 w-full mt-1 rounded-md shadow-md max-h-40 overflow-auto">
              {project.members.map((member: any) => (
                <li
                  key={member.user.id}
                  className="px-3 py-1 text-sm cursor-pointer hover:bg-gray-100"
                >
                  {member.user.name}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer - bouton à gauche */}
        <div className="flex justify-start mt-2 gap-3">
          <button
            onClick={handleSubmit}
            className="px-4 py-2 text-sm font-medium rounded-[10px] bg-[#E5E7EB] text-[#9CA3AF] hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#9CA3AF]"
          >
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
}
