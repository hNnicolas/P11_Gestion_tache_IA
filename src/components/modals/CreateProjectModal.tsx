"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  createProjectAction,
  CreateProjectInput,
} from "@/app/actions/projects/createProjectAction";

type Props = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  currentUser: { id: string; name: string; email: string };
  allUsers: { id: string; name: string; email: string }[];
  onProjectCreated: (project: any) => void;
};

export default function CreateProjectModal({
  isOpen,
  setIsOpen,
  currentUser,
  allUsers,
  onProjectCreated,
}: Props) {
  const [form, setForm] = useState({
    name: "",
    description: "",
  });

  const [selectedContributorEmails, setSelectedContributorEmails] = useState<
    string[]
  >([currentUser.email]);

  const [showContributors, setShowContributors] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    if (isOpen) window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const toggleContributor = (email: string) => {
    setSelectedContributorEmails((prev) =>
      prev.includes(email) ? prev.filter((e) => e !== email) : [...prev, email]
    );
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) return;
    setLoading(true);

    try {
      const payload: CreateProjectInput = {
        name: form.name,
        description: form.description || undefined,
        contributors: [...selectedContributorEmails, currentUser.email],
      };

      const newProject = await createProjectAction(payload);
      onProjectCreated(newProject);

      setForm({ name: "", description: "" });
      setSelectedContributorEmails([currentUser.email]);
      setShowContributors(false);
      setIsOpen(false);
    } catch (error) {
      console.error("Erreur création projet:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/40 z-50 p-2"
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-project-title"
    >
      <div className="bg-white rounded-xl p-6 w-full max-w-md relative focus:outline-none">
        <div className="flex justify-between items-center mb-4">
          <h2
            id="create-project-title"
            className="text-xl font-bold"
            tabIndex={0}
          >
            Créer un projet
          </h2>
          <button
            onClick={() => setIsOpen(false)}
            aria-label="Fermer la modale"
            className="p-1 rounded hover:bg-gray-200"
          >
            <Image
              src="/images/icons/close-modal.png"
              width={20}
              height={20}
              alt="Fermer"
              style={{ width: "auto", height: "auto" }}
            />
          </button>
        </div>

        <div className="flex flex-col gap-3">
          <label htmlFor="project-name" className="text-sm font-medium">
            Titre*
          </label>
          <input
            id="project-name"
            name="name"
            value={form.name}
            onChange={handleChange}
            className="border p-2 rounded w-full"
            required
            aria-required="true"
          />

          <label htmlFor="project-description" className="text-sm font-medium">
            Description
          </label>
          <textarea
            id="project-description"
            name="description"
            value={form.description}
            onChange={handleChange}
            className="border p-2 rounded w-full"
          />

          <label className="text-sm font-medium mt-3 block">
            Contributeurs
          </label>
          <div className="relative w-full mb-5">
            <div
              role="button"
              tabIndex={0}
              aria-label="Sélectionner des contributeurs"
              aria-haspopup="listbox"
              aria-expanded={showContributors}
              onClick={() => setShowContributors(!showContributors)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setShowContributors(!showContributors);
                }
              }}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full pr-8 cursor-pointer flex justify-between items-center"
              style={{ color: "var(--color-sous-texte)" }}
            >
              <span style={{ color: "#9095A0" }}>
                Choisir un ou plusieurs collaborateurs
              </span>{" "}
              <Image
                src="/images/icons/onglet.png"
                width={16}
                height={16}
                alt="Ouvrir liste contributeurs"
              />
            </div>

            {showContributors && (
              <ul
                role="listbox"
                aria-label="Liste des contributeurs"
                className="mt-2 border border-gray-200 rounded-md bg-white shadow-sm p-2 max-h-40 overflow-auto text-sm text-gray-700 absolute w-full z-10"
              >
                {allUsers.map((user) => (
                  <li
                    key={user.email}
                    role="option"
                    aria-selected={selectedContributorEmails.includes(
                      user.email
                    )}
                    tabIndex={0}
                    className="px-2 py-1 hover:bg-gray-100 cursor-pointer flex items-center"
                    onClick={() => toggleContributor(user.email)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        toggleContributor(user.email);
                      }
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={selectedContributorEmails.includes(user.email)}
                      readOnly
                      className="mr-2"
                      aria-hidden="true"
                    />
                    {user.name}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {selectedContributorEmails.length > 0 && (
            <div
              className="flex flex-wrap gap-2 mt-1"
              aria-label="Contributeurs sélectionnés"
            >
              {selectedContributorEmails.map((email) => {
                const user = allUsers.find((u) => u.email === email);
                return (
                  <span
                    key={email}
                    className="px-2 py-0.5 bg-gray-200 text-gray-700 rounded-full text-xs font-medium"
                  >
                    {user?.name || email}
                  </span>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex justify-start mt-5">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="text-[#9CA3AF] bg-[#E5E7EB] rounded-[10px] px-4 py-2 text-sm font-medium"
            aria-label="Ajouter le projet"
            aria-busy={loading}
            tabIndex={0}
          >
            {loading ? "Création..." : "Ajouter un projet"}
          </button>
        </div>
      </div>
    </div>
  );
}
