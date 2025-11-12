"use client";

import { useState } from "react";
import Image from "next/image";
import CreateTaskModal from "@/components/modals/CreateTaskModal";
import EditProjectModal from "@/components/modals/EditProjectModal";

export default function SingleProjectClient({ project }: { project: any }) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const getInitials = (name: string) => {
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  return (
    <div
      className="max-w-7xl mx-auto bg-[#F9FAFB] px-4 sm:px-6 lg:px-8 py-6"
      role="main"
    >
      {/* --- HEADER --- */}
      <header
        className="flex flex-col md:flex-row justify-between items-start mb-6 gap-4"
        aria-label="Informations du projet"
      >
        <div>
          <h1 className="text-2xl font-bold mb-1">
            {project.name}{" "}
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="text-[#d3580b] hover:underline text-sm font-medium"
              aria-label={`Modifier le projet ${project.name}`}
            >
              Modifier
            </button>
          </h1>
          <p className="text-gray-600">{project.description}</p>
        </div>

        <div className="flex gap-3 flex-wrap">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-black text-white px-4 py-2 rounded-[10px] text-sm font-medium hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
            aria-label="Créer une nouvelle tâche"
          >
            Créer une tâche
          </button>

          {/* --- Bouton IA avec star.png blanche via filtre --- */}
          <button
            className="flex items-center gap-2 bg-[#d3580b] text-white px-3 py-2 rounded-[10px] text-sm font-medium hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#d3580b]"
            aria-label="Intelligence artificielle"
          >
            <Image
              src="/images/icons/star.png"
              width={14}
              height={14}
              alt="Étoile blanche"
              className="filter brightness-0 invert"
            />
            IA
          </button>
        </div>
      </header>

      {/* --- CONTRIBUTEURS --- */}
      <section
        className="bg-[#F3F4F6] rounded-lg px-4 py-3 mb-6 flex items-center"
        aria-label="Contributeurs du projet"
      >
        <p className="text-sm font-medium">
          Contributeurs {project.members.length + 1}{" "}
          <span style={{ color: "var(--color-sous-texte, #6b7280)" }}>
            personnes
          </span>
        </p>

        <div className="flex gap-3 flex-wrap ml-auto" role="list">
          {/* Propriétaire */}
          <div className="flex items-center gap-2" role="listitem">
            <div
              className="w-8 h-8 flex items-center justify-center rounded-full font-semibold"
              style={{
                backgroundColor: "#FFE8D9",
                color: "var(--color-principal, #d3580b)",
              }}
            >
              {getInitials(project.owner.name)}
            </div>
            <span
              className="text-sm font-medium bg-[#FFE8D9]"
              style={{ color: "var(--color-principal, #d3580b)" }}
            >
              Propriétaire
            </span>
          </div>

          {/* Contributeurs */}
          {project.members.map((member: any) => (
            <div
              key={member.user.id}
              className="flex items-center gap-2"
              role="listitem"
            >
              <div
                className="w-8 h-8 flex items-center justify-center rounded-full font-semibold"
                style={{ backgroundColor: "#E5E7EB", color: "#0F0F0F" }}
              >
                {getInitials(member.user.name)}
              </div>
              <span className="text-sm" style={{ color: "#0F0F0F" }}>
                {member.user.name}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* --- TÂCHES --- */}
      <section aria-label="Liste des tâches">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
          <div
            className="flex gap-3 flex-wrap"
            role="group"
            aria-label="Filtres de vue des tâches"
          >
            <button
              className="flex items-center gap-2 bg-[#FFF0E6] text-[#d3580b] px-3 py-1.5 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#d3580b]"
              aria-label="Voir la liste des tâches"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M3 6h18v2H3V6zm0 5h18v2H3v-2zm0 5h18v2H3v-2z" />
              </svg>
              Liste
            </button>
            <button
              className="flex items-center gap-2 bg-white border border-gray-200 px-3 py-1.5 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
              aria-label="Voir le calendrier des tâches"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M7 10h5v5H7z" />
                <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 18H5V8h14v13z" />
              </svg>
              Calendrier
            </button>
          </div>

          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-md px-3 py-1.5 w-full sm:w-auto">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M21 21l-4.35-4.35M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16z" />
            </svg>
            <input
              placeholder="Rechercher une tâche"
              className="outline-none text-sm text-gray-600 bg-transparent w-full"
              aria-label="Recherche une tâche"
            />
          </div>
        </div>

        <div className="flex flex-col gap-3">
          {project.tasks.map((task: any) => (
            <div
              key={task.id}
              className="bg-white rounded-lg border border-gray-200 p-4"
              role="region"
              aria-labelledby={`task-${task.id}`}
              tabIndex={0}
            >
              <h3
                id={`task-${task.id}`}
                className="font-semibold text-sm flex justify-between items-center"
              >
                {task.title}
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    task.status === "A faire"
                      ? "bg-red-100 text-red-500"
                      : task.status === "En cours"
                      ? "bg-yellow-100 text-yellow-600"
                      : "bg-green-100 text-green-600"
                  }`}
                  aria-label={`Statut: ${task.status}`}
                >
                  {task.status}
                </span>
              </h3>
              <p className="text-gray-600 text-sm mt-1">{task.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* --- MODALES --- */}
      <CreateTaskModal
        isOpen={isCreateModalOpen}
        setIsOpen={setIsCreateModalOpen}
        projectId={project.id}
      />
      <EditProjectModal
        isOpen={isEditModalOpen}
        setIsOpen={setIsEditModalOpen}
        project={project}
      />
    </div>
  );
}
