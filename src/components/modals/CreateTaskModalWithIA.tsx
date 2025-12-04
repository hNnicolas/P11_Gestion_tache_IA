"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { createTaskWithIAClient } from "@/app/actions/tasks/createTaskWithIAClient";
import { eventBus } from "@/lib/eventBus";

type TaskForModal = {
  id: string;
  title: string;
  description: string | null;
  isNew?: boolean;
};

type Props = {
  isOpen: boolean;
  setIsOpen: (v: boolean) => void;
  projectId?: string;
};

export default function CreateTaskModalWithIA({
  isOpen,
  setIsOpen,
  projectId,
}: Props) {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [tasks, setTasks] = useState<TaskForModal[]>([]);
  const [view, setView] = useState<"generate" | "list">("generate");
  const [editingId, setEditingId] = useState<string | null>(null);

  const modalRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setPrompt("");
      setTasks([]);
      setView("generate");
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "Escape") setIsOpen(false);
      if (e.key === "Enter" && view === "generate") void handleGenerate();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, view, prompt]);

  const normalizeTask = (t: any): TaskForModal => ({
    id: t.id ?? `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    title: t.title ?? "",
    description: t.description ?? null,
    isNew: true,
  });

  async function handleGenerate() {
    if (!prompt.trim() || !projectId) return;
    setLoading(true);
    try {
      const INSTRUCTIONS = `
Si le prompt correspond à UNE tâche déjà existante → réponds STRICTEMENT "DOUBLON".
Sinon → génère une ou plusieurs tâches :
- Ligne 1 = titre (max 80 caractères)
- Lignes suivantes = description sans markdown
`.trim();

      const ragPrompt = `CONTEXTE :\nAucune tâche client (RAG server-side)\n\nINSTRUCTIONS :\n${INSTRUCTIONS}\n\nPROMPT :\n${prompt}`;

      const res: any = await createTaskWithIAClient({
        prompt: ragPrompt,
        projectId,
      });

      if (!res || !res.success) {
        alert("Erreur lors de la génération IA.");
        return;
      }

      if (res.duplicate) {
        alert("❌ Cette tâche existe déjà (DOUBLON).");
        return;
      }

      const generatedTasks = res.tasks ?? [];
      if (!Array.isArray(generatedTasks) || generatedTasks.length === 0) {
        alert("Aucune tâche générée.");
        return;
      }

      const mapped = generatedTasks.map((t: any) =>
        normalizeTask({
          id: `${Date.now()}-${Math.random()}`,
          title: t.title,
          description: t.description,
        })
      );

      setTasks((prev) => [...prev, ...mapped]);
      setView("list");
    } catch (err) {
      console.error("handleGenerate error:", err);
      alert("Erreur lors de la génération IA.");
    } finally {
      setLoading(false);
    }
  }

  async function handleAddTasksToProject() {
    if (!projectId || tasks.length === 0) return;
    setLoading(true);

    try {
      for (const t of tasks) {
        try {
          const res = await fetch(`/api/projects/${projectId}/tasks`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title: t.title,
              description: t.description ?? "",
            }),
          });

          const data = await res.json();
          console.log("Task added to Prisma:", data);

          if (res.ok && data?.success && data?.task) {
            eventBus.emit("taskCreated", data.task);
          } else {
            console.error("❌ Error adding task:", data);
          }
        } catch (err) {
          console.error("❌ Network or server error adding task:", err);
        }
      }

      setTasks([]);
      setView("generate");
      setPrompt("");
      setIsOpen(false);
    } catch (err) {
      console.error("❌ handleAddTasksToProject error:", err);
      alert("Erreur lors de l'ajout des tâches.");
    } finally {
      setLoading(false);
    }
  }

  function handleDelete(id: string) {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }

  function handleUpdateField(
    id: string,
    field: "title" | "description",
    value: string
  ) {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, [field]: value } : t))
    );
  }

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
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
              alt="star"
            />
            <h2 className="text-xl font-semibold">
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
            aria-label="Fermer"
          >
            <Image
              src="/images/icons/close-modal.png"
              width={22}
              height={22}
              alt="close"
            />
          </button>
        </div>

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
                >
                  <input
                    value={task.title}
                    aria-label="Titre de la tâche"
                    onChange={(e) =>
                      handleUpdateField(task.id, "title", e.target.value)
                    }
                    className="w-full outline-none text-lg font-semibold mb-1"
                  />

                  <textarea
                    value={task.description ?? ""}
                    aria-label="Description de la tâche"
                    onChange={(e) =>
                      handleUpdateField(task.id, "description", e.target.value)
                    }
                    className="w-full outline-none text-sm text-gray-600 mb-4 resize-none"
                    rows={3}
                  />

                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <button
                      onClick={() => handleDelete(task.id)}
                      className="flex items-center gap-1 hover:opacity-70"
                    >
                      <Image
                        src="/images/icons/drop.png"
                        width={16}
                        height={16}
                        alt="delete"
                      />
                      Supprimer
                    </button>
                    <span className="text-gray-300">|</span>
                    <button
                      onClick={() =>
                        setEditingId(editingId === task.id ? null : task.id)
                      }
                      className="flex items-center gap-1 hover:opacity-70"
                    >
                      <Image
                        src="/images/icons/edit.png"
                        width={14}
                        height={14}
                        alt="edit"
                      />
                      {editingId === task.id ? "Fin édition" : "Modifier"}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={handleAddTasksToProject}
              className="bg-black text-white rounded-full px-6 py-2 text-sm font-medium mb-3 hover:opacity-90 mx-auto"
            >
              + Ajouter les tâches
            </button>

            <div className="sticky bottom-0 bg-[#F9FAFB] rounded-[20px] p-3 flex items-center gap-2">
              <input
                type="text"
                aria-label="Champ de saisie pour générer des tâches"
                placeholder="Décrivez les tâches que vous souhaitez ajouter..."
                className="flex-1 bg-transparent outline-none px-2 py-2"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && void handleGenerate()}
              />

              <button
                onClick={handleGenerate}
                disabled={loading}
                aria-label="Ajouter tâche IA"
                className="rounded-full w-10 h-10 flex items-center justify-center bg-orange-500"
              >
                <Image
                  src="/images/icons/button-IA.png"
                  width={18}
                  height={18}
                  alt="ia"
                />
              </button>
            </div>
          </div>
        )}

        {view === "generate" && (
          <div className="flex flex-col justify-end flex-1">
            <div className="mt-auto bg-[#F9FAFB] rounded-[20px] p-3 flex items-center gap-2">
              <input
                type="text"
                placeholder="Décrivez une tâche que vous souhaitez ajouter..."
                className="flex-1 bg-transparent outline-none px-2 py-2"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />
              <button
                onClick={handleGenerate}
                disabled={loading}
                className="rounded-full w-10 h-10 flex items-center justify-center bg-orange-500"
              >
                <Image
                  src="/images/icons/star-white.png"
                  width={14}
                  height={14}
                  alt="étoile blanche"
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
