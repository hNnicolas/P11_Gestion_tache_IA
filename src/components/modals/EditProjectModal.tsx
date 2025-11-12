"use client";

import { useState } from "react";

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

  if (!isOpen) return null;

  const handleSubmit = async () => {
    // Appel à updateProjectAction
    console.log("Update project:", { name, description });
    setIsOpen(false);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Modifier le projet</h2>

        <label className="text-sm font-medium">Nom du projet</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm mb-3 w-full"
        />

        <label className="text-sm font-medium">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full"
        />

        <div className="flex justify-end mt-5 gap-3">
          <button
            onClick={() => setIsOpen(false)}
            className="px-4 py-2 text-sm border rounded-md text-gray-600"
          >
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            className="bg-[#d3580b] text-white rounded-[10px] px-4 py-2 text-sm font-medium"
          >
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
}
