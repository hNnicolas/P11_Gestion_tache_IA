"use client";

import { useState } from "react";

export default function CreateTaskModal({
  isOpen,
  setIsOpen,
  projectId,
}: {
  isOpen: boolean;
  setIsOpen: (v: boolean) => void;
  projectId: string;
}) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    dueDate: "",
    assignees: "",
    status: "A faire",
  });

  if (!isOpen) return null;

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    // ici tu appelleras ta server action createTaskAction
    console.log("Création tâche:", { ...form, projectId });
    setIsOpen(false);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Créer une tâche</h2>

        <div className="flex flex-col gap-3">
          <label className="text-sm font-medium">Titre*</label>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          />

          <label className="text-sm font-medium">Description*</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          />

          <label className="text-sm font-medium">Échéance*</label>
          <input
            type="date"
            name="dueDate"
            value={form.dueDate}
            onChange={handleChange}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          />

          <label className="text-sm font-medium">Assigné à*</label>
          <select
            name="assignees"
            value={form.assignees}
            onChange={handleChange}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          >
            <option value="">Choisir un ou plusieurs collaborateurs</option>
          </select>

          <label className="text-sm font-medium">Status</label>
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          >
            <option value="A faire">A faire</option>
            <option value="En cours">En cours</option>
            <option value="Terminée">Terminée</option>
          </select>
        </div>

        <div className="flex justify-end mt-5 gap-3">
          <button
            onClick={() => setIsOpen(false)}
            className="px-4 py-2 text-sm border rounded-md text-gray-600"
          >
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            className="text-[#C9CDD5] bg-[#E5E7EB] rounded-[10px] px-4 py-2 text-sm font-medium"
          >
            + Ajouter une tâche
          </button>
        </div>
      </div>
    </div>
  );
}
