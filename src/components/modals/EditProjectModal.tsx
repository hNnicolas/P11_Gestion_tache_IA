"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  updateProjectAction,
  UpdateProjectInput,
} from "@/app/actions/projects/updateProjectAction";

export default function EditProjectModal({
  isOpen,
  setIsOpen,
  project,
  onUpdate,
}: {
  isOpen: boolean;
  setIsOpen: (v: boolean) => void;
  project: any;
  onUpdate: (updatedProject: any) => void;
}) {
  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description);
  const [showContributors, setShowContributors] = useState(false);

  const contributorCount = project.members.length + 1;

  useEffect(() => {
    setName(project.name);
    setDescription(project.description);
  }, [project]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    if (isOpen) window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, setIsOpen]);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    try {
      const input: UpdateProjectInput = {
        projectId: project.id,
        name,
        description,
      };
      const updatedProject = await updateProjectAction(input);
      onUpdate(updatedProject);
      setIsOpen(false);
    } catch (error: any) {
      console.error("Erreur lors de la mise à jour :", error.message);
    }
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
          <h2 id="edit-project-title" className="text-xl font-bold">
            Modifier le projet
          </h2>
          <button
            onClick={() => setIsOpen(false)}
            aria-label="Fermer la modale"
            className="p-1 rounded hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <Image
              src="/images/icons/close-modal.png"
              width={20}
              height={20}
              alt="Fermer"
            />
          </button>
        </div>

        <label className="text-sm font-medium">Nom du projet</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm mb-3 w-full"
          style={{ color: "var(--color-sous-texte)" }}
        />

        <label className="text-sm font-medium">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full mb-3"
          style={{ color: "var(--color-sous-texte)" }}
        />

        <label className="text-sm font-medium mb-1 block">Contributeurs</label>
        <div className="relative w-full mb-5">
          <input
            type="text"
            value={`${contributorCount} Contributeurs`}
            readOnly
            onClick={() => setShowContributors(!showContributors)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full pr-8 cursor-pointer"
            style={{ color: "var(--color-sous-texte)" }}
          />

          {/* Flèche à droite */}
          <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
            <svg
              className={`w-4 h-4 text-gray-500 transition-transform ${
                showContributors ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>

          {/* Liste déroulante des noms */}
          {showContributors && (
            <ul className="mt-2 border border-gray-200 rounded-md bg-white shadow-sm p-2 max-h-40 overflow-auto text-sm text-gray-700 absolute w-full z-10">
              <li className="font-semibold">
                {project.owner.name} (Propriétaire)
              </li>
              {project.members.map((member: any) => (
                <li key={member.user.id}>{member.user.name}</li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex justify-start mt-2 gap-3">
          <button
            onClick={handleSubmit}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-gray-200 text-gray-600 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-gray-400"
          >
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
}
