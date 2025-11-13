"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  CreateTaskInput,
  createTaskAction,
} from "@/app/actions/tasks/createTaskAction";

export default function CreateTaskModal({
  isOpen,
  setIsOpen,
  project,
  currentUserId,
}: {
  isOpen: boolean;
  setIsOpen: (v: boolean) => void;
  project: any;
  currentUserId: string;
}) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    dueDate: "",
    assigneeName: "",
  });
  const [selectedContributorId, setSelectedContributorId] =
    useState<string>("");
  const [showContributors, setShowContributors] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    if (isOpen) window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, setIsOpen]);

  if (!isOpen) return null;

  const handleChange = (e: any) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    if (!project?.id || !currentUserId) return;

    setLoading(true);
    try {
      // Calcul des assigneeIds valides
      const assigneeIds: string[] = selectedContributorId
        ? [selectedContributorId]
        : project.ownerId
        ? [project.ownerId]
        : [];

      if (assigneeIds.length === 0) {
        console.error("❌ Aucun utilisateur valide pour l'assignation");
        setLoading(false);
        return;
      }

      const payload: CreateTaskInput = {
        title: form.title,
        description: form.description || undefined,
        dueDate: form.dueDate
          ? new Date(form.dueDate).toISOString()
          : undefined,
        priority: "MEDIUM",
        assigneeIds,
      };

      console.log("🔹 Payload envoyé au backend: ", payload);

      // Appel de l'action serveur avec l'userId correct
      const task = await createTaskAction(
        project.id,
        payload,
        project.members,
        project.ownerId
      );

      console.log("✅ Tâche créée avec succès :", task);
      setIsOpen(false);
      setForm({ title: "", description: "", dueDate: "", assigneeName: "" });
      setSelectedContributorId("");
    } catch (error) {
      console.error("❌ Erreur lors de la création de la tâche :", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/40 z-50"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-(--color-text)">
            Créer une tâche
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

        <div className="flex flex-col gap-3">
          <label className="text-sm font-medium">Titre*</label>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          />

          <label className="text-sm font-medium">Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          />

          <label className="text-sm font-medium">Échéance</label>
          <div className="relative">
            <input
              type="text"
              name="dueDate"
              placeholder="Sélectionnez une date"
              value={form.dueDate}
              onChange={handleChange}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full pr-10"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
              <Image
                src="/images/icons/icon-calendar.png"
                width={16}
                height={16}
                alt="Échéance"
              />
            </div>
          </div>

          <label className="text-sm font-medium">Assigné à</label>
          <div className="relative">
            <input
              type="text"
              name="assigneeName"
              value={form.assigneeName}
              onChange={handleChange}
              onFocus={() => setShowContributors(true)}
              onBlur={() => setTimeout(() => setShowContributors(false), 150)}
              placeholder="Sélectionner un contributeur"
              className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full pr-10"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 p-1">
              <Image
                src="/images/icons/onglet.png"
                width={16}
                height={16}
                alt="Ouvrir liste contributeurs"
              />
            </div>

            {showContributors && (
              <ul className="absolute z-10 bg-white border border-gray-300 w-full mt-1 rounded-md shadow-md max-h-40 overflow-auto">
                {project.members?.map((member: any) => (
                  <li
                    key={member.userId}
                    className="px-3 py-1 text-sm cursor-pointer hover:bg-gray-100"
                    onClick={() => {
                      setForm({
                        ...form,
                        assigneeName: member.user?.name || member.userId,
                      });
                      setSelectedContributorId(member.userId);
                      setShowContributors(false);
                    }}
                    role="option"
                    aria-selected={
                      form.assigneeName === (member.user?.name || member.userId)
                    }
                  >
                    {member.user?.name || member.userId}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="flex justify-start mt-5">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="text-[#C9CDD5] bg-[#E5E7EB] rounded-[10px] px-4 py-2 text-sm font-medium hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#9CA3AF]"
          >
            {loading ? "Création..." : "+ Ajouter une tâche"}
          </button>
        </div>
      </div>
    </div>
  );
}
