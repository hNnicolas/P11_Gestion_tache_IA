"use client";

import { useState } from "react";
import CreateProjectModal from "@/components/modals/CreateProjectModal";
import DashboardTasksView from "@/components/DashboardTasksView";
import { UserForClient } from "@/app/actions/getAllUsersAction";
import { searchTasksAction } from "@/app/actions/tasks/searchTasksAction";

type Props = {
  user: { id: string; name: string; email: string };
  tasks: any[];
  allUsers: UserForClient[];
};

export default function DashboardClient({ user, tasks, allUsers }: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState(tasks);

  const fullName = user.name || "";
  const [firstName, lastName] = fullName.split(" ");

  const handleSearchTasks = async () => {
    if (!searchQuery.trim()) {
      setSearchResults(tasks);
      return;
    }

    const result = await searchTasksAction(searchQuery);

    if (result.success) {
      const normalizedTasks = result.tasks.map((t: any) => ({
        id: t.id,
        title: t.title,
        description: t.description ?? undefined,
        status: t.status as "A faire" | "En cours" | "Terminées",
        dueDate: t.dueDate ? new Date(t.dueDate).getTime() : undefined,
        assignees: t.assignees ?? [],
        comments: t.comments ?? [],
      }));

      setSearchResults((prev) => {
        // Filtrer doublons
        const prevFiltered = prev.filter(
          (pt) => !normalizedTasks.some((t) => t.id === pt.id)
        );
        // Les nouvelles tâches trouvées viennent en premier
        return [...normalizedTasks, ...prevFiltered];
      });

      // Remettre le champ à zéro
      setSearchQuery("");
    } else {
      alert(result.message);
    }
  };

  return (
    <div className="flex flex-col items-center bg-[#F9FAFB] min-h-screen py-10 pb-20">
      <section className="w-[1215px]">
        <div className="flex items-start justify-between w-full">
          <div>
            <h1 className="text-[--color-principal] font-semibold text-2xl">
              Tableau de bord
            </h1>
            <p className="small-text mt-4 text-[--color-sous-texte]">
              Bonjour {firstName} {lastName}, voici un aperçu de vos projets et
              tâches
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-black text-white px-4 py-2 rounded-[10px] text-sm font-medium hover:opacity-90 transition"
          >
            + Créer un projet
          </button>
        </div>
      </section>

      <section className="p-6 bg-white rounded-[20px] border border-[#E5E7EB] w-[1215px] shadow-sm mt-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-4">
            <h2 className="font-semibold text-lg">Mes tâches assignées</h2>
            <span className="block text-[--color-sous-texte] small-text mt-1">
              Par ordre de priorité
            </span>
          </div>

          {/* Barre de recherche */}
          <div className="flex items-center border border-gray-200 rounded-[5px] px-3 py-1.5 bg-white">
            <input
              type="text"
              placeholder="Rechercher une tâche..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearchTasks()}
              className="outline-none text-sm text-gray-600 bg-transparent w-48"
            />
            <img
              src="/images/icons/search.png"
              alt="Rechercher"
              className="w-4 h-4 ml-2 cursor-pointer"
              onClick={handleSearchTasks}
            />
          </div>
        </div>

        <DashboardTasksView
          tasks={searchResults}
          project={null}
          currentUserId={user.id}
        />
      </section>

      {isModalOpen && (
        <CreateProjectModal
          isOpen={isModalOpen}
          setIsOpen={setIsModalOpen}
          currentUser={user}
          allUsers={allUsers}
          onProjectCreated={(newProject) =>
            console.log("Projet créé :", newProject)
          }
        />
      )}
    </div>
  );
}
