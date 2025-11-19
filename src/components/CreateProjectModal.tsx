"use client";

import { useState, useEffect } from "react";
import { Dialog } from "@headlessui/react";
import { getUsers } from "@/app/actions/getUsersAction"; // action pour récupérer tous les users
import { createProjectAction } from "@/app/actions/createProjectAction"; // action pour créer un projet

interface User {
  id: string;
  name: string;
  email: string;
}

interface CreateProjectModalProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onProjectCreated: () => void;
}

export default function CreateProjectModal({
  isOpen,
  setIsOpen,
  onProjectCreated,
}: CreateProjectModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [contributors, setContributors] = useState<string[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const users = await getUsers();
        setAllUsers(users);
      } catch (error) {
        console.error("Impossible de récupérer les utilisateurs", error);
      }
    };
    fetchUsers();
  }, []);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await createProjectAction({ name: title, description, contributors });
      setTitle("");
      setDescription("");
      setContributors([]);
      setIsOpen(false);
      onProjectCreated();
    } catch (error) {
      console.error("Erreur lors de la création du projet", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={() => setIsOpen(false)}
      className="relative z-50"
    >
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-md bg-white rounded-lg p-6 shadow-lg">
          <Dialog.Title className="text-lg font-semibold mb-4">
            Créer un projet
          </Dialog.Title>

          {/* Titre */}
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Titre*
          </label>
          <input
            type="text"
            className="w-full mb-4 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Titre du projet"
          />

          {/* Description */}
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Description*
          </label>
          <input
            type="text"
            className="w-full mb-4 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description du projet"
          />

          {/* Contributeurs */}
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Contributeurs
          </label>
          <select
            multiple
            className="w-full mb-4 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400"
            value={contributors}
            onChange={(e) =>
              setContributors(
                Array.from(e.target.selectedOptions, (option) => option.value)
              )
            }
          >
            <option disabled>Choisir un ou plusieurs collaborateurs</option>
            {allUsers.map((user) => (
              <option key={user.id} value={user.email}>
                {user.name} ({user.email})
              </option>
            ))}
          </select>

          <button
            onClick={handleSubmit}
            disabled={loading || !title.trim() || !description.trim()}
            className="w-full py-2 rounded-[10px] text-gray-400 bg-gray-200 font-medium hover:opacity-90 transition disabled:opacity-50"
          >
            {loading ? "Création..." : "Ajouter un projet"}
          </button>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
