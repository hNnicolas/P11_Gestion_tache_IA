"use client";

import { useState } from "react";
import CreateProjectModal from "@/components/modals/CreateProjectModal";
import DashboardTasksView from "@/components/DashboardTasksView";
import { UserForClient } from "@/app/actions/users/getAllUsersAction";
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
  const [view, setView] = useState<"LIST" | "KANBAN">("LIST");

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
        const prevFiltered = prev.filter(
          (pt) => !normalizedTasks.some((t) => t.id === pt.id)
        );
        return [...normalizedTasks, ...prevFiltered];
      });

      setSearchQuery("");
    } else {
      alert(result.message);
    }
  };

  return (
    <div className="flex flex-col items-center bg-[#F9FAFB] min-h-screen py-10 pb-20">
      <section className="w-full max-w-[1500px] px-4 md:px-6 lg:px-8">
        <div className="flex items-start justify-between w-full">
          <div>
            <h1 className="text-[--color-principal] font-semibold text-2xl -ml-5">
              Tableau de bord
            </h1>
            <p className="small-text mt-4 -ml-5 text-[--color-sous-texte]">
              Bonjour {firstName} {lastName}, voici un aperçu de vos projets et
              tâches
            </p>

            <div className="flex items-center gap-4 mt-6 -ml-5">
              <div
                className={`flex items-center gap-2 px-4 py-2 rounded-[10px] cursor-pointer ${
                  view === "LIST"
                    ? "bg-[#FFE8D9] text-[#E48E59]"
                    : "bg-[#FFFFFF] text-[#E48E59]"
                }`}
                onClick={() => setView("LIST")}
              >
                <img src="/images/icons/icon-liste.png" className="h-5 w-5" />
                <span className="font-medium text-[#E48E59]!">Liste</span>
              </div>

              <div
                className={`flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer ${
                  view === "KANBAN"
                    ? "bg-[#FFE8D9] text-[#E48E59]"
                    : "bg-[#FFFFFF] text-[#E48E59]"
                }`}
                onClick={() => setView("KANBAN")}
              >
                <img src="/images/icons/icon-kanban.png" className="h-5 w-5" />
                <span className="font-medium text-[#E48E59]!">Kanban</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-black text-white px-4 py-2 ml-5 rounded-[10px] text-sm font-medium hover:opacity-90 transition"
          >
            + Créer un projet
          </button>
        </div>
      </section>

      <section className="w-full max-w-[1500px] px-4 md:px-6 lg:px-8 py-6 bg-white rounded-[10px] border border-[#E5E7EB] shadow-sm mt-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex flex-col">
            <h2 className="font-semibold text-lg">Mes tâches assignées</h2>
            <span className="block text-[--color-sous-texte] small-text mt-1">
              Par ordre de priorité
            </span>
          </div>

          <div className="flex items-center border border-gray-200 rounded-[7px] px-3 py-1.5 bg-white">
            <input
              type="text"
              placeholder="Rechercher une tâche..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearchTasks()}
              className="outline-none text-sm text-gray-600 bg-transparent w-48 p-2"
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
          view={view}
          setView={setView}
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
