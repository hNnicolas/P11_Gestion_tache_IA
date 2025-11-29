"use client";

import { useState, useEffect, KeyboardEvent } from "react";
import Image from "next/image";
import {
  CreateTaskInput,
  createTaskAction,
} from "@/app/actions/tasks/createTaskAction";
import { UserForClient } from "@/app/actions/users/getAllUsersAction";

type Props = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  project: any;
  currentUserId: string;
  onTaskCreated: (task: any) => void;
  allUsers: UserForClient[];
};

export default function CreateTaskModal({
  isOpen,
  setIsOpen,
  project,
  currentUserId,
  onTaskCreated,
  allUsers = [],
}: Props) {
  const [form, setForm] = useState({ title: "", description: "", dueDate: "" });
  const [selectedContributorIds, setSelectedContributorIds] = useState<
    string[]
  >([]);
  const [showContributors, setShowContributors] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<
    "A faire" | "En cours" | "Terminées"
  >("A faire");
  const [loading, setLoading] = useState(false);

  const statusOptions = [
    { label: "A faire", bg: "var(--color-tag1-bg)", text: "var(--color-tag1)" },
    {
      label: "En cours",
      bg: "var(--color-tag2-bg)",
      text: "var(--color-tag2)",
    },
    {
      label: "Terminées",
      bg: "var(--color-tag3-bg)",
      text: "var(--color-tag3)",
    },
  ];

  const toggleContributor = (userId: string) => {
    setSelectedContributorIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleChange = (e: any) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    if (!project?.id || !currentUserId) return;

    setLoading(true);
    try {
      const assigneeIds =
        selectedContributorIds.length > 0
          ? selectedContributorIds
          : [project.ownerId];

      const payload: CreateTaskInput = {
        title: form.title,
        description: form.description || undefined,
        dueDate: form.dueDate
          ? new Date(form.dueDate).toISOString()
          : undefined,
        priority: "MEDIUM",
        assigneeIds,
        status: selectedStatus,
      };

      const newTask = await createTaskAction(
        project.id,
        payload,
        project.members,
        project.ownerId
      );
      onTaskCreated(newTask);

      setForm({ title: "", description: "", dueDate: "" });
      setSelectedContributorIds([]);
      setSelectedStatus("A faire");
      setIsOpen(false);
    } catch (error) {
      console.error("Erreur création tâche :", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    if (isOpen) window.addEventListener("keydown", handleKeyDown as any);
    return () => window.removeEventListener("keydown", handleKeyDown as any);
  }, [isOpen, setIsOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/40 z-50"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 id="modal-title" className="text-xl font-bold">
            Créer une tâche
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
            />
          </button>
        </div>

        <div className="flex flex-col gap-3">
          <label htmlFor="title" className="text-sm font-medium">
            Titre*
          </label>{" "}
          <input
            id="title"
            name="title"
            value={form.title}
            onChange={handleChange}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full"
            required
          />
          <label
            htmlFor="description"
            className="block text-sm font-medium mb-1"
          >
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={form.description}
            onChange={handleChange}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full"
          />
          <label htmlFor="dueDate" className="text-sm font-medium">
            Échéance
          </label>{" "}
          <div className="relative">
            <input
              type="text"
              id="dueDate"
              name="dueDate"
              placeholder="Sélectionnez une date"
              value={form.dueDate}
              onChange={handleChange}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full pr-10"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
              {" "}
              <Image
                src="/images/icons/icon-calendar.png"
                width={16}
                height={16}
                alt="Icône calendrier"
              />{" "}
            </div>
          </div>
          <label htmlFor="assigne" className="text-sm font-medium mt-3 block">
            Assigné à
          </label>
          <input
            id="assigne"
            type="text"
            className="sr-only"
            aria-hidden="true"
            tabIndex={-1}
          />
          <div className="relative w-full">
            <div
              role="button"
              tabIndex={0}
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
            >
              <span className="text-xs text-gray-700">
                Choisir un ou plusieurs collaborateurs
              </span>
              <Image
                src="/images/icons/onglet.png"
                width={16}
                height={16}
                alt="Contributeurs"
              />
            </div>

            {showContributors && (
              <ul
                className="mt-2 border border-gray-200 rounded-md bg-white shadow-sm p-2 max-h-40 overflow-auto text-sm text-gray-700 absolute w-full z-10"
                role="listbox"
              >
                {allUsers.map((user) => (
                  <li
                    key={user.id}
                    role="option"
                    aria-selected={selectedContributorIds.includes(user.id)}
                    tabIndex={0}
                    className={`px-2 py-1 hover:bg-gray-100 cursor-pointer ${
                      user.id === project?.owner?.id ? "font-semibold" : ""
                    }`}
                    onClick={() => toggleContributor(user.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        toggleContributor(user.id);
                      }
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={selectedContributorIds.includes(user.id)}
                      readOnly
                      className="mr-2"
                      aria-hidden="true"
                    />
                    {user.name}{" "}
                    {user.id === project?.owner?.id && "(Propriétaire)"}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <label htmlFor="status" className="text-sm font-medium mt-3 block">
            Statut :
          </label>
          <input
            id="status"
            type="text"
            className="sr-only"
            aria-hidden="true"
            tabIndex={-1}
          />
          <div className="flex gap-2 mt-1" role="radiogroup">
            {statusOptions.map((status) => (
              <span
                key={status.label}
                role="radio"
                aria-checked={selectedStatus === status.label}
                tabIndex={0}
                className={`px-2 py-1 rounded-full text-sm font-medium cursor-pointer select-none ${
                  selectedStatus === status.label ? "ring-2 ring-offset-1" : ""
                }`}
                style={{ backgroundColor: status.bg, color: status.text }}
                onClick={() =>
                  setSelectedStatus(
                    status.label as "A faire" | "En cours" | "Terminées"
                  )
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ")
                    setSelectedStatus(
                      status.label as "A faire" | "En cours" | "Terminées"
                    );
                }}
              >
                {status.label}
              </span>
            ))}
          </div>
        </div>

        <div className="flex justify-start mt-5">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`rounded-[10px] px-4 py-2 text-sm font-medium ${
              loading
                ? "bg-gray-300 text-gray-600"
                : "bg-[#E5E7EB] text-[#1f1f1f] hover:opacity-90"
            }`}
          >
            {" "}
            {loading ? "Création..." : "+ Ajouter une tâche"}{" "}
          </button>
        </div>
      </div>
    </div>
  );
}
