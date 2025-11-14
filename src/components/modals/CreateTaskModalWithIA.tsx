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

  /** Fermeture modale ESC / Enter */
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
      if (e.key === "Enter") handleGenerateTask();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [prompt]);

  /** Fermeture clic extérieur */
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    window.addEventListener("mousedown", handleClickOutside);
    return () => window.removeEventListener("mousedown", handleClickOutside);
  }, [setIsOpen]);

  /** Génération d'une tâche IA */
  const handleGenerateTask = async () => {
    if (!prompt.trim() || !projectId) return;
    setLoading(true);

    try {
      const data = await createTaskWithIAClient(prompt, projectId);
      const newTask: Task = {
        id: data.task.id,
        title: data.task.title,
        description: data.task.description,
      };
      setTasks((prev) => [...prev, newTask]);
      setPrompt("");
      setView("list");
    } catch (err) {
      console.error("Erreur génération IA :", err);
    } finally {
      setLoading(false);
    }
  };

  /** Supprimer une tâche */
  const deleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div
        ref={modalRef}
        className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl"
      >
        {/* HEADER */}
        <div className="flex justify-between items-center mb-4">
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
                : "Vos tâches ..."}
            </h2>
          </div>
          <button onClick={() => setIsOpen(false)}>
            <Image
              src="/images/icons/close-modal.png"
              width={22}
              height={22}
              alt="close"
            />
          </button>
        </div>

        {/* ---------------- VUE 1 : GENERATION ---------------- */}
        {view === "generate" && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 bg-[#F9FAFB] rounded-[20px] p-2">
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
                  width={32}
                  height={32}
                  alt="generate"
                />
              </button>
            </div>
            {loading && (
              <p className="mt-2 text-sm text-gray-500">
                Génération en cours...
              </p>
            )}
          </div>
        )}

        {/* ---------------- VUE 2 : LISTE DES TÂCHES ---------------- */}
        {view === "list" && (
          <div className="mt-3 flex flex-col gap-4">
            {/* LISTE DES TÂCHES */}
            <div className="max-h-72 overflow-y-auto pr-1 flex flex-col gap-4">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="border border-[#E7E9ED] rounded-2xl p-5 shadow-sm"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-semibold text-lg">{task.title}</p>
                      <p className="text-gray-500 text-sm mt-1 mb-4">
                        {task.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="flex items-center gap-1"
                      >
                        <Image
                          src="/images/icons/drop.png"
                          width={22}
                          height={22}
                          alt="drop"
                        />
                        Supprimer
                      </button>
                      <span>|</span>
                      <button className="flex items-center gap-1">
                        <Image
                          src="/images/icons/edit.png"
                          width={22}
                          height={22}
                          alt="edit"
                        />
                        Modifier
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Bouton ajouter une nouvelle tâche */}
            <button
              className="flex items-center gap-2 mt-2 px-4 py-2 bg-white text-white rounded-xl"
              onClick={() => setView("generate")}
            >
              <Image
                src="/images/icons/button-add-tasks.png"
                width={200}
                height={200}
                alt="add"
              />
            </button>

            {/* Input pour ajouter une nouvelle tâche */}
            <div className="mt-4 flex items-center gap-2 bg-[#F9FAFB] rounded-[20px] p-2">
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
                  width={32}
                  height={32}
                  alt="generate"
                />
              </button>
            </div>

            {loading && (
              <div className="mt-2 text-gray-500">✨ Génération en cours…</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
