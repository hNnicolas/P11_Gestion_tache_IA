"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { createTaskWithIAClient } from "@/app/actions/createTaskWithIAClient";

type Task = {
  id: string;
  title: string;
  description: string;
};

type CreateModalIAProps = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  projectId?: string;
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

  const modalRef = useRef<HTMLDivElement>(null);

  /** Fermeture modale ESC + Enter */
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
      if (e.key === "Enter" && view === "generate") handleGenerateTask();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [prompt, view]);

  /** Clic extérieur */
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    window.addEventListener("mousedown", handleClickOutside);
    return () => window.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /** Génération IA */
  const handleGenerateTask = async () => {
    if (!prompt.trim() || !projectId) return;
    setLoading(true);

    try {
      const data = await createTaskWithIAClient(prompt, projectId);

      const newTasks: Task[] = Array.isArray(data.task)
        ? data.task.map((t: any) => ({
            id: t.id,
            title: t.title,
            description: t.description,
          }))
        : [
            {
              id: data.task.id,
              title: data.task.title,
              description: data.task.description,
            },
          ];

      setTasks((prev) => [...prev, ...newTasks]);
      setPrompt("");
      setView("list");
    } catch (err) {
      console.error("Erreur génération IA :", err);
    } finally {
      setLoading(false);
    }
  };

  /** Suppression tâche */
  const deleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div
        ref={modalRef}
        className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl h-[700px] max-h-[700px] flex flex-col justify-between"
      >
        {/* ----------- HEADER ----------- */}
        <div className="flex justify-between items-center mb-3 pt-2">
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

          <button onClick={() => setIsOpen(false)}>
            <Image
              src="/images/icons/close-modal.png"
              width={20}
              height={20}
              alt="close"
            />
          </button>
        </div>

        {/* ----------- VUE 1 : GENERER ----------- */}

        {view === "generate" && (
          <div className="flex flex-col h-full">
            {/* Zone scrollable si tu ajoutes du contenu plus tard */}
            <div className="flex-1 overflow-y-auto"></div>

            {/* Input collé en bas */}
            <div className="mt-4 flex items-center gap-2 bg-[#F9FAFB] rounded-[20px] p-3">
              <input
                type="text"
                placeholder="Décrivez une tâche que vous souhaitez ajouter..."
                className="flex-1 bg-transparent outline-none px-2 py-2"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />
              <button onClick={handleGenerateTask} disabled={loading}>
                <Image
                  src="/images/icons/button-IA.png"
                  width={34}
                  height={34}
                  alt="generate"
                />
              </button>
            </div>

            {loading && (
              <p className="mt-2 text-sm text-gray-500">
                ✨ Génération en cours...
              </p>
            )}
          </div>
        )}

        {/* ----------- VUE 2 : LISTE ----------- */}
        {view === "list" && (
          <div className="flex flex-col">
            {/* Liste scrollable */}
            <div className="max-h-[350px] overflow-y-auto flex flex-col gap-4 pr-1 mb-6">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="bg-white border border-[#E5E7EB] rounded-[20px] p-6 shadow-sm"
                >
                  <p className="font-semibold text-lg">{task.title}</p>
                  <p className="text-gray-500 text-sm mt-1 mb-4">
                    {task.description}
                  </p>

                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="flex items-center gap-1"
                    >
                      <Image
                        src="/images/icons/drop.png"
                        width={18}
                        height={18}
                        alt="delete"
                      />
                      Supprimer
                    </button>

                    <span>|</span>

                    <button className="flex items-center gap-1">
                      <Image
                        src="/images/icons/edit.png"
                        width={18}
                        height={18}
                        alt="edit"
                      />
                      Modifier
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Bouton + Ajouter les tâches */}
            <button
              className="mx-auto bg-black text-white rounded-full px-5 py-2 text-sm font-medium mb-6"
              onClick={() => setView("generate")}
            >
              + Ajouter les tâches
            </button>

            {/* Input bas */}
            <div className="flex items-center gap-2 bg-[#F9FAFB] rounded-[20px] p-3">
              <input
                type="text"
                placeholder="Décrivez les tâches que vous souhaitez ajouter..."
                className="flex-1 bg-transparent outline-none px-2 py-2"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />
              <button onClick={handleGenerateTask} disabled={loading}>
                <Image
                  src="/images/icons/button-IA.png"
                  width={30}
                  height={30}
                  alt="add"
                />
              </button>
            </div>

            {loading && (
              <p className="mt-3 text-sm text-gray-500">
                ✨ Génération en cours...
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
