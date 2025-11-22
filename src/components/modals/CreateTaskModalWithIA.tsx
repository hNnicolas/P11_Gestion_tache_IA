"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { createTaskWithIAClient } from "@/app/actions/tasks/createTaskWithIAClient";
import { updateTaskAction } from "@/app/actions/tasks/updateTaskAction";
import { deleteTaskAction } from "@/app/actions/tasks/deleteTaskAction";
import { ITask } from "@/lib/prisma";
import { eventBus } from "@/lib/eventBus";

// Type pour le modal avec isNew
type TaskForModal = ITask & { isNew?: boolean };

type CreateModalIAProps = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  projectId?: string;
  onTaskCreated?: (prompt: string) => Promise<void>;
};

export default function CreateModalIA({
  isOpen,
  setIsOpen,
  projectId,
  onTaskCreated,
}: CreateModalIAProps) {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [tasks, setTasks] = useState<TaskForModal[]>([]);
  const [view, setView] = useState<"generate" | "list">("generate");
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);

  const modalRef = useRef<HTMLDivElement>(null);
  const firstFocusableRef = useRef<HTMLButtonElement>(null);
  const lastFocusableRef = useRef<HTMLButtonElement>(null);

  // Normalise les données reçues depuis l'API IA pour correspondre à ITask
  const normalizeTask = (t: any, projectId: string): TaskForModal => ({
    id: t.id,
    title: t.title,
    description: t.description ?? null,
    status: t.status ?? "TODO",
    priority: t.priority ?? "MEDIUM",
    projectId,
    project: {
      id: projectId,
      name: t.project?.name ?? "",
      description: t.project?.description ?? null,
    },
    assignees:
      t.assignees?.map((a: any) => ({
        user: {
          id: a.userId,
          name: a.name ?? null,
          email: a.email ?? "",
        },
      })) ?? [],
    comments:
      t.comments?.map((c: any) => ({
        id: c.id,
        content: c.content,
        author: { id: c.authorId, name: c.authorName ?? null },
        createdAt: new Date(c.createdAt),
        updatedAt: new Date(c.updatedAt),
      })) ?? [],
    dueDate: t.dueDate ? new Date(t.dueDate) : null,
    creatorId: t.creatorId ?? "",
    isNew: true,
  });

  // Gestion du clavier (ESC pour fermer, Enter pour générer, Tab pour focus trap)
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === "Escape") setIsOpen(false);
      if (e.key === "Enter" && view === "generate") handleGenerate();

      // Focus trap
      if (e.key === "Tab" && modalRef.current) {
        const focusableEls = modalRef.current.querySelectorAll<
          HTMLButtonElement | HTMLInputElement | HTMLTextAreaElement
        >(
          'button:not([disabled]), input:not([disabled]), textarea:not([disabled]), [tabindex="0"]'
        );
        if (focusableEls.length === 0) return;

        const firstEl = focusableEls[0];
        const lastEl = focusableEls[focusableEls.length - 1];

        if (!e.shiftKey && document.activeElement === lastEl) {
          e.preventDefault();
          firstEl.focus();
        }
        if (e.shiftKey && document.activeElement === firstEl) {
          e.preventDefault();
          lastEl.focus();
        }
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [view, prompt, isOpen]);

  // Clic extérieur pour fermer la modal
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    window.addEventListener("mousedown", handleClickOutside);
    return () => window.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Génération IA
  const handleGenerate = async () => {
    if (!prompt.trim() || !projectId) return;

    setLoading(true);
    try {
      const res = await createTaskWithIAClient(prompt, projectId);
      if (!res.success || !res.data?.task) return;

      const tasksData = Array.isArray(res.data.task)
        ? res.data.task
        : [res.data.task];

      const newTasks = tasksData.map((t: any) => normalizeTask(t, projectId));

      // On met à jour le state local pour lister les tâches
      setTasks((prev) => [...prev, ...newTasks]);
      setView("list");
      setPrompt("");

      // On émet directement chaque tâche vers le parent
      newTasks.forEach((task: ITask) => eventBus.emit("taskCreated", task));
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = async () => {
    if (!projectId || tasks.length === 0) return;

    setLoading(true);
    try {
      for (const task of tasks) {
        if (task.isNew) {
          const res = await createTaskWithIAClient(task.title, projectId);
          if (res.success && res.data?.task) {
            const savedTask = normalizeTask(res.data.task, projectId);
            eventBus.emit("taskCreated", savedTask);
          }
        } else {
          // Déjà créé, on émet pour s'assurer que le parent le reçoit
          eventBus.emit("taskCreated", task);
        }
      }

      // Réinitialisation du modal après ajout
      setTasks([]);
      setView("generate");
      setPrompt("");
      setIsOpen(false);
    } finally {
      setLoading(false);
    }
  };

  // Mise à jour titre/description
  const handleUpdateTask = async (task: TaskForModal) => {
    if (!projectId) return;

    const res = await updateTaskAction(projectId, task.id, {
      title: task.title,
      description: task.description || "",
    });

    if (!res.success) {
      alert(res.message);
      return;
    }

    const updatedTask: TaskForModal = normalizeTask(res.data, projectId);
    setTasks((prev) =>
      prev.map((t) => (t.id === updatedTask.id ? updatedTask : t))
    );
    eventBus.emit("taskUpdated", updatedTask);
  };

  const handleDeleteTask = async (task: TaskForModal) => {
    if (!projectId) return;

    const res = await deleteTaskAction(projectId, task.id);
    if (!res.success) {
      alert(res.message);
      return;
    }

    setTasks((prev) => prev.filter((t) => t.id !== task.id));
    eventBus.emit("taskDeleted", { id: task.id });
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
    >
      <div
        ref={modalRef}
        className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl h-[800px] flex flex-col"
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-5">
          <div className="flex items-center gap-2">
            <Image
              src="/images/icons/star.png"
              width={20}
              height={20}
              alt="star icon"
            />
            <h2 id="modal-title" className="text-xl font-semibold">
              {view === "generate"
                ? "Créer une tâche avec IA"
                : "Vos tâches..."}
            </h2>
          </div>

          <button
            onClick={() => {
              setIsOpen(false);
              setPrompt("");
            }}
            aria-label="Fermer la modal"
            ref={firstFocusableRef}
          >
            <Image
              src="/images/icons/close-modal.png"
              width={22}
              height={22}
              alt="close icon"
            />
          </button>
        </div>

        {/* Vue Génération */}
        {view === "generate" && (
          <div className="flex flex-col justify-end flex-1">
            <div className="mt-auto bg-[#F9FAFB] rounded-[20px] p-3 flex items-center gap-2">
              <input
                type="text"
                placeholder="Décrivez une tâche que vous souhaitez ajouter..."
                className="flex-1 bg-transparent outline-none px-2 py-2"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                aria-label="Description de la tâche"
              />
              <button
                onClick={handleGenerate}
                disabled={loading}
                aria-label="Générer tâche IA"
                className="focus:ring-2 focus:ring-black rounded-full"
                ref={lastFocusableRef}
              >
                <Image
                  src="/images/icons/button-IA.png"
                  width={38}
                  height={38}
                  alt="generate icon"
                />
              </button>
            </div>
            {loading && (
              <p className="text-xs text-gray-500 mt-2">
                ✨ Génération en cours...
              </p>
            )}
          </div>
        )}

        {/* Vue Liste */}
        {view === "list" && (
          <div className="flex flex-col h-full">
            <div
              className="flex-1 overflow-y-auto pr-1 flex flex-col gap-4 pb-4"
              role="region"
              aria-label="Liste des tâches générées"
            >
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="bg-white border border-[#E5E7EB] rounded-[20px] p-5 shadow-sm"
                  role="group"
                  aria-labelledby={`task-title-${task.id}`}
                >
                  <input
                    id={`task-title-${task.id}`}
                    className="w-full outline-none text-lg font-semibold mb-1"
                    value={task.title || ""}
                    onChange={(e) =>
                      setTasks((prev) =>
                        prev.map((t) =>
                          t.id === task.id ? { ...t, title: e.target.value } : t
                        )
                      )
                    }
                    disabled={editingTaskId !== task.id}
                    aria-label="Titre de la tâche"
                  />

                  <textarea
                    className="w-full outline-none text-sm text-gray-600 mb-4 resize-none"
                    value={task.description || ""}
                    onChange={(e) =>
                      setTasks((prev) =>
                        prev.map((t) =>
                          t.id === task.id
                            ? { ...t, description: e.target.value }
                            : t
                        )
                      )
                    }
                    disabled={editingTaskId !== task.id}
                    aria-label="Description de la tâche"
                  />

                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <button
                      onClick={async () => {
                        await handleDeleteTask(task);
                      }}
                      className="flex items-center gap-1 hover:opacity-70"
                      aria-label={`Supprimer la tâche ${task.title}`}
                    >
                      <Image
                        src="/images/icons/drop.png"
                        width={16}
                        height={16}
                        alt="delete icon"
                      />
                      Supprimer
                    </button>

                    <span className="text-gray-300">|</span>
                    <button
                      onClick={async () => {
                        if (editingTaskId === task.id) {
                          await handleUpdateTask(task);
                          setEditingTaskId(null);
                        } else {
                          setEditingTaskId(task.id);
                        }
                      }}
                      className="flex items-center gap-1 hover:opacity-70"
                      aria-label={`Modifier la tâche ${task.title}`}
                    >
                      <Image
                        src="/images/icons/edit.png"
                        width={14}
                        height={14}
                        alt="edit icon"
                      />
                      {editingTaskId === task.id ? "Enregistrer" : "Modifier"}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button
              className="bg-black text-white rounded-full px-6 py-2 text-sm font-medium mb-3 hover:opacity-90 mx-auto"
              onClick={handleAddTask}
              aria-label="Ajouter les tâches"
            >
              + Ajouter les tâches
            </button>

            <div className="sticky bottom-0 bg-[#F9FAFB] rounded-[20px] p-3 flex items-center gap-2">
              <input
                type="text"
                placeholder="Décrivez les tâches que vous souhaitez ajouter..."
                className="flex-1 bg-transparent outline-none px-2 py-2"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
                aria-label="Nouvelle tâche"
              />
              <button
                onClick={handleGenerate}
                disabled={loading}
                className="focus:ring-2 focus:ring-black rounded-full"
                aria-label="Ajouter tâche IA"
              >
                <Image
                  src="/images/icons/button-IA.png"
                  width={34}
                  height={34}
                  alt="add icon"
                />
              </button>
            </div>

            {loading && (
              <p className="text-xs text-gray-500 mt-2">
                ✨ Génération en cours...
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
