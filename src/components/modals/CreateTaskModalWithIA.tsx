"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { createTaskWithIAClient } from "@/app/actions/tasks/createTaskWithIAClient";
import { updateTaskAction } from "@/app/actions/tasks/updateTaskAction";
import { deleteTaskAction } from "@/app/actions/tasks/deleteTaskAction";

type Task = {
  id: string;
  title: string;
  description: string | null;
  status?: "TODO" | "IN_PROGRESS" | "DONE" | "CANCELLED";
  priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  project?: {
    id: string;
    name: string;
    description: string | null;
    ownerId: string;
    createdAt: Date;
    updatedAt: Date;
  };
  creatorId?: string;
  assignees?: { userId: string }[];
  comments?: any[];
  isNew?: boolean;
};

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
}: CreateModalIAProps) {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [view, setView] = useState<"generate" | "list">("generate");
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);

  const modalRef = useRef<HTMLDivElement>(null);
  const firstFocusableRef = useRef<HTMLButtonElement>(null);
  const lastFocusableRef = useRef<HTMLButtonElement>(null);

  /* Fermeture ESC + navigation clavier */
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

  /* Clic extérieur pour fermer modal */
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    window.addEventListener("mousedown", handleClickOutside);
    return () => window.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  /* ----------- GÉNÉRATION IA ----------- */
  const handleGenerate = async () => {
    if (!prompt.trim() || !projectId) return;
    setLoading(true);

    try {
      const res = await createTaskWithIAClient(prompt, projectId);
      if (!res.success) return;

      const tasksData = res.data?.task;
      const newTasks = Array.isArray(tasksData)
        ? tasksData.map((t: any) => ({
            id: t.id,
            title: t.title,
            description: t.description,
          }))
        : [
            {
              id: tasksData.id,
              title: tasksData.title,
              description: tasksData.description,
            },
          ];

      setTasks((prev) => [...prev, ...newTasks]);

      newTasks.forEach((task) => {
        window.dispatchEvent(new CustomEvent("taskCreated", { detail: task }));
      });

      setPrompt("");
      setView("list");
    } finally {
      setLoading(false);
    }
  };

  /* ----------- AJOUT TÂCHE ----------- */
  const handleAddTask = async () => {
    if (!projectId || !prompt.trim()) return;
    setLoading(true);
    try {
      const res = await createTaskWithIAClient(prompt, projectId);
      if (!res.success) {
        console.error("❌ Erreur création tâche IA :", res.message, res.error);
        alert(res.message || "Erreur lors de la création de la tâche IA");
        return;
      }

      const newTask = res.data?.task;
      if (!newTask) {
        console.warn("⚠️ Aucune tâche retournée par le serveur");
        return;
      }

      setTasks((prev) => [
        ...prev,
        {
          id: newTask.id,
          title: newTask.title,
          description: newTask.description,
          status: newTask.status as Task["status"],
          priority: newTask.priority as Task["priority"],
          project: newTask.project,
          creatorId: newTask.creatorId,
          assignees: newTask.assignees,
          comments: newTask.comments,
          isNew: true,
        },
      ]);

      window.dispatchEvent(new CustomEvent("taskCreated", { detail: newTask }));

      setPrompt("");
      setView("list");
    } catch (err: any) {
      console.error("Erreur création tâche IA :", err);
      alert(
        err?.message ||
          "Une erreur est survenue lors de la création de la tâche IA."
      );
    } finally {
      setLoading(false);
    }
  };

  const updateTask = (
    id: string,
    field: "title" | "description",
    value: string
  ) => {
    setTasks((prev) =>
      prev.map((task) => (task.id === id ? { ...task, [field]: value } : task))
    );
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
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
                      updateTask(task.id, "title", e.target.value)
                    }
                    disabled={editingTaskId !== task.id}
                    aria-label="Titre de la tâche"
                  />

                  <textarea
                    className="w-full outline-none text-sm text-gray-600 mb-4 resize-none"
                    value={task.description || ""}
                    onChange={(e) =>
                      updateTask(task.id, "description", e.target.value)
                    }
                    disabled={editingTaskId !== task.id}
                    aria-label="Description de la tâche"
                  />

                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <button
                      onClick={async () => {
                        if (!projectId) return;
                        try {
                          const res = await deleteTaskAction(
                            projectId,
                            task.id
                          );

                          if (!res.success) {
                            console.error(
                              "Erreur suppression tâche :",
                              res.message,
                              res.error
                            );
                            alert(res.message);
                            return;
                          }

                          deleteTask(task.id);

                          window.dispatchEvent(
                            new CustomEvent("taskDeleted", {
                              detail: { id: task.id },
                            })
                          );
                        } catch (err) {
                          console.error("Erreur suppression tâche :", err);
                          alert(
                            "Une erreur est survenue lors de la suppression."
                          );
                        }
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
                          try {
                            const res = await updateTaskAction(
                              projectId!,
                              task.id,
                              {
                                title: task.title,
                                description: task.description || "",
                              }
                            );

                            if (!res.success) {
                              console.error(
                                "Erreur serveur :",
                                res.message,
                                res.error
                              );
                              alert(res.message);
                              return;
                            }

                            const updatedTask = res.data;
                            const updatedTaskTyped: Task = {
                              id: updatedTask.id,
                              title: updatedTask.title,
                              description: updatedTask.description || null,
                              status: updatedTask.status as Task["status"],
                              priority:
                                updatedTask.priority as Task["priority"],
                              project: updatedTask.project,
                              creatorId: updatedTask.creatorId,
                              assignees: updatedTask.assignees,
                              comments: updatedTask.comments,
                            };

                            setTasks((prev) =>
                              prev.map((t) =>
                                t.id === updatedTaskTyped.id
                                  ? updatedTaskTyped
                                  : t
                              )
                            );

                            window.dispatchEvent(
                              new CustomEvent("taskUpdated", {
                                detail: updatedTaskTyped,
                              })
                            );

                            setEditingTaskId(null);
                          } catch (err) {
                            console.error("Erreur sauvegarde tâche :", err);
                            alert(
                              "Une erreur est survenue lors de la mise à jour."
                            );
                          }
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
