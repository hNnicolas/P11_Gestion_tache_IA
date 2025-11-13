"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  createProjectAction,
  CreateProjectInput,
} from "@/app/actions/createProjectAction";

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
    contributors: [currentUser.email],
    contributorName: "",
  });

  const [showContributors, setShowContributors] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
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

  const handleSubmit = async () => {
    if (!form.name.trim()) return;
    setLoading(true);

    try {
      const payload: CreateProjectInput = {
        name: form.name,
        description: form.description || undefined,
        contributors: [...form.contributors, currentUser.email],
      };

      const newProject = await createProjectAction(payload);
      onProjectCreated(newProject);

      setForm({
        name: "",
        description: "",
        contributors: [],
        contributorName: "",
      });
      setShowContributors(false);
      setIsOpen(false);
    } catch (error) {
      console.error("Erreur création projet:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = allUsers.filter(
    (user) =>
      !form.contributors.includes(user.email) &&
      user.name.toLowerCase().includes(form.contributorName.toLowerCase())
  );

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/40 z-50"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Créer un projet</h2>
          <button
            onClick={() => setIsOpen(false)}
            aria-label="Fermer"
            className="p-1 rounded hover:bg-gray-200"
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
          <label
            className="text-sm font-medium"
            style={{ color: "var(--color-sous-texte)" }}
          >
            Titre*
          </label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            className="border p-2 rounded w-full"
          />

          <label
            className="text-sm font-medium"
            style={{ color: "var(--color-sous-texte)" }}
          >
            Description*
          </label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            className="border p-2 rounded w-full"
          />

          <label
            className="text-sm font-medium"
            style={{ color: "var(--color-sous-texte)" }}
          >
            Contributeurs
          </label>
          <div className="relative">
            <input
              type="text"
              name="contributorName"
              value={form.contributorName}
              onChange={(e) =>
                setForm({ ...form, contributorName: e.target.value })
              }
              onFocus={() => setShowContributors(true)}
              onBlur={() => setTimeout(() => setShowContributors(false), 150)}
              placeholder="Choisir un ou plusieurs collaborateurs"
              className="border p-2 rounded w-full pr-10"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 p-1">
              <Image
                src="/images/icons/onglet.png"
                width={16}
                height={16}
                alt="Ouvrir liste contributeurs"
              />
            </div>

            {showContributors && filteredUsers.length > 0 && (
              <ul className="absolute z-10 bg-white border w-full mt-1 rounded-md shadow-md max-h-40 overflow-auto">
                {filteredUsers.map((user) => (
                  <li
                    key={user.id}
                    className="px-3 py-1 text-sm cursor-pointer hover:bg-gray-100"
                    onClick={() =>
                      setForm({
                        ...form,
                        contributors: [...form.contributors, user.email],
                        contributorName: "",
                      })
                    }
                  >
                    {user.name}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {form.contributors.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-1">
              {form.contributors.map((email) => {
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
          >
            {loading ? "Création..." : "+ Ajouter un projet"}
          </button>
        </div>
      </div>
    </div>
  );
}
