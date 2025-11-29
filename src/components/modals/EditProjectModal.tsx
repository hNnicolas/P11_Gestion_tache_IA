"use client";

import { useState, useEffect, KeyboardEvent } from "react";
import Image from "next/image";
import {
  updateProjectAction,
  UpdateProjectInput,
} from "@/app/actions/projects/updateProjectAction";
import ApiMessage from "@/components/ApiMessage";
import { ApiResponse } from "@/types";

type Props = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  project: any;
  allUsers: any[];
  onUpdate: (updatedProject: any) => void;
};

export default function EditProjectModal({
  isOpen,
  setIsOpen,
  project,
  allUsers,
  onUpdate,
}: Props) {
  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description);
  const [showContributors, setShowContributors] = useState(false);
  const [selectedContributorIds, setSelectedContributorIds] = useState<
    string[]
  >(project.members ? project.members.map((m: any) => m.user.id) : []);

  const [apiResponse, setApiResponse] = useState<ApiResponse | null>(null);

  const contributorCount = selectedContributorIds.length + 1;

  useEffect(() => {
    setName(project.name);
    setDescription(project.description);
    setSelectedContributorIds(
      project.members ? project.members.map((m: any) => m.user.id) : []
    );
  }, [project]);

  useEffect(() => {
    const handleKeyDown = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    if (isOpen) window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, setIsOpen]);

  if (!isOpen) return null;

  const toggleContributor = (userId: string) => {
    setSelectedContributorIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleKeyDownContributor = (
    e: KeyboardEvent<HTMLLIElement>,
    userId: string
  ) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggleContributor(userId);
    }
  };

  const handleSubmit = async () => {
    try {
      const input: UpdateProjectInput & { memberIds?: string[] } = {
        projectId: project.id,
        name,
        description,
        memberIds: selectedContributorIds,
      };

      const updatedProject = await updateProjectAction(input);

      setApiResponse({
        success: true,
        message: "Projet mis à jour avec succès !",
      });

      onUpdate(updatedProject);

      window.dispatchEvent(
        new CustomEvent("projectUpdated", { detail: updatedProject })
      );

      setIsOpen(false);
    } catch (error: any) {
      console.error("Erreur lors de la mise à jour :", error);

      setApiResponse({
        success: false,
        message: "Vous n’avez pas la permission de modifier ce projet.",
        error: error.message || "Erreur inconnue.",
      });
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 flex items-center justify-center bg-black/40 z-50 p-2"
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-project-title"
        tabIndex={-1}
      >
        <div className="bg-white rounded-xl p-6 w-full max-w-md focus:outline-none">
          <div className="flex justify-between items-center mb-4">
            <h2
              id="edit-project-title"
              className="text-xl font-bold"
              tabIndex={0}
            >
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

          <div className="flex flex-col gap-3">
            <label className="text-sm font-medium" htmlFor="project-name">
              Nom du projet
            </label>
            <input
              id="project-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
              style={{ color: "var(--color-sous-texte)" }}
            />

            <label
              className="text-sm font-medium"
              htmlFor="project-description"
            >
              Description
            </label>
            <textarea
              id="project-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
              style={{ color: "var(--color-sous-texte)" }}
            />

            <label className="text-sm font-medium mt-3 block">
              Contributeurs
            </label>
            <div className="relative w-full mb-5">
              <div
                role="button"
                tabIndex={0}
                aria-haspopup="listbox"
                aria-expanded={showContributors}
                aria-label="Sélectionner des contributeurs"
                onClick={() => setShowContributors(!showContributors)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setShowContributors(!showContributors);
                  }
                }}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full pr-8 cursor-pointer"
                style={{ color: "var(--color-sous-texte)" }}
              >
                {`${contributorCount} contributeurs`}
              </div>

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

              {showContributors && (
                <ul
                  role="listbox"
                  aria-label="Liste des contributeurs"
                  className="mt-2 border border-gray-200 rounded-md bg-white shadow-sm p-2 max-h-40 overflow-auto text-sm text-gray-700 absolute w-full z-10"
                >
                  <li className="font-semibold">
                    {project?.owner?.name || "Propriétaire inconnu"}{" "}
                    (Propriétaire)
                  </li>

                  {allUsers.map((user) => (
                    <li
                      key={user.id}
                      role="option"
                      aria-selected={selectedContributorIds.includes(user.id)}
                      tabIndex={0}
                      className={`px-2 py-1 hover:bg-gray-100 cursor-pointer ${
                        user.id === project.owner.id ? "font-semibold" : ""
                      }`}
                      onClick={() => toggleContributor(user.id)}
                      onKeyDown={(e) => handleKeyDownContributor(e, user.id)}
                    >
                      <input
                        type="checkbox"
                        checked={selectedContributorIds.includes(user.id)}
                        readOnly
                        aria-hidden="true"
                        className="mr-2"
                      />
                      {user.name}{" "}
                      {user.id === project.owner.id && "(Propriétaire)"}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="flex justify-start mt-2 gap-3">
            <button
              onClick={handleSubmit}
              className="px-4 py-2 text-sm font-medium rounded-lg bg-gray-200 text-gray-600 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-gray-400"
              aria-label="Enregistrer les modifications"
            >
              Enregistrer
            </button>
          </div>
        </div>
      </div>

      <ApiMessage response={apiResponse} />
    </>
  );
}
