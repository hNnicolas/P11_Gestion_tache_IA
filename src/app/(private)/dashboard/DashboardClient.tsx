"use client";

import { useState, useEffect } from "react";
import CreateProjectModal from "@/components/modals/CreateProjectModal";
import DashboardTasksView from "@/components/DashboardTasksView";
import { UserForClient } from "@/app/actions/users/getAllUsersAction";
import { searchTasksAction } from "@/app/actions/tasks/searchTasksAction";
import { getAssignedTasksAction } from "@/app/actions/tasks/getAssignedTasksAction";
import { useEventBus } from "@/hooks/useEventBus";
import { ITask as PrismaITask } from "@/lib/prisma";

// Type local pour les assignees afin de normaliser les données
type Assignee = {
  user: {
    id: string;
    name: string | null;
    email: string;
  };
};

// Props du composant DashboardClient
type Props = {
  user: { id: string; name: string; email: string };
  allUsers: UserForClient[];
};

export default function DashboardClient({ user, allUsers }: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tasks, setTasks] = useState<PrismaITask[]>([]);
  const [searchResults, setSearchResults] = useState<PrismaITask[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [view, setView] = useState<"LIST" | "KANBAN">("LIST");

  const fullName = user.name || "";
  const [firstName, lastName] = fullName.split(" ");

  const { on, off } = useEventBus();

  /** Normalise une tâche pour correspondre au type Prisma.ITask */
  const normalizeTask = (t: any): PrismaITask => ({
    id: t.id,
    title: t.title,
    description: t.description ?? null,
    status: t.status,
    dueDate: t.dueDate ? new Date(t.dueDate) : null,
    assignees: (t.assignees ?? []).map((a: any) => ({
      user: {
        id: a.user.id,
        name: a.user.name ?? null,
        email: a.user.email ?? "",
      },
    })),
    comments: (t.comments ?? []).map((c: any) => ({
      id: c.id,
      content: c.content,
      author: {
        id: c.author.id,
        name: c.author.name ?? null,
      },
      createdAt: new Date(c.createdAt),
      updatedAt: new Date(c.updatedAt),
    })),
    projectId: t.projectId ?? t.project?.id ?? "",
    project: t.project ?? {
      id: t.projectId ?? "",
      name: "Projet inconnu",
      description: null,
    },
    priority: t.priority ?? "MEDIUM",
    creatorId: t.creatorId ?? t.project?.ownerId ?? "",
  });

  /** Filtre uniquement les tâches assignées à l'utilisateur */
  const filterTasksForUser = (tasks: any[]) =>
    tasks.filter((t: any) =>
      t.assignees.some((a: any) => a.user.id === user.id)
    );

  /** Met à jour simultanément tasks et searchResults */
  const updateTaskState = (
    updateFn: (prev: PrismaITask[]) => PrismaITask[]
  ) => {
    setTasks((prev) => updateFn(prev));
    setSearchResults((prev) => updateFn(prev));
  };

  /** Récupère toutes les tâches assignées à l’utilisateur connecté */
  const refreshTasks = async () => {
    try {
      const assignedTasks: any[] = await getAssignedTasksAction();
      const userTasks: PrismaITask[] =
        filterTasksForUser(assignedTasks).map(normalizeTask);
      setTasks(userTasks);
      setSearchResults(userTasks);
    } catch (err) {
      console.error("Erreur récupération tâches assignées :", err);
    }
  };

  /** Écoute des événements via EventBus */
  useEffect(() => {
    refreshTasks();

    const handleCreated = (task: any) => {
      if (!task.assignees.some((a: any) => a.user.id === user.id)) return;
      const normalized = normalizeTask(task);
      updateTaskState((prev) =>
        prev.some((t) => t.id === normalized.id) ? prev : [normalized, ...prev]
      );
    };

    const handleUpdated = (task: any) => {
      if (!task.assignees.some((a: any) => a.user.id === user.id)) return;
      const normalized = normalizeTask(task);
      updateTaskState((prev) =>
        prev.map((t) => (t.id === normalized.id ? normalized : t))
      );
    };

    const handleDeleted = ({ id }: { id: string }) => {
      updateTaskState((prev) => prev.filter((t) => t.id !== id));
    };

    on("taskCreated", handleCreated);
    on("taskUpdated", handleUpdated);
    on("taskDeleted", handleDeleted);

    return () => {
      off("taskCreated", handleCreated);
      off("taskUpdated", handleUpdated);
      off("taskDeleted", handleDeleted);
    };
  }, []);

  /** Recherche sur les tâches assignées */
  const handleSearchTasks = async () => {
    if (!searchQuery.trim()) {
      setSearchResults(tasks);
      return;
    }

    const result = await searchTasksAction(searchQuery);
    if (result.success) {
      const normalizedTasks: PrismaITask[] = filterTasksForUser(
        result.tasks
      ).map(normalizeTask);
      setSearchResults(normalizedTasks);
      setSearchQuery("");
    } else {
      alert(result.message);
    }
  };

  return (
    <div
      className="flex flex-col items-center bg-[#F9FAFB] min-h-screen py-10 pb-20"
      role="main"
    >
      {/* Header */}
      <section
        className="w-full max-w-[1500px] px-4 md:px-6 lg:px-8"
        role="region"
        aria-labelledby="dashboard-title"
        tabIndex={0}
      >
        <div className="flex items-start justify-between w-full">
          <div>
            <h1
              id="dashboard-title"
              className="text-[--color-principal] font-semibold text-2xl -ml-5"
              tabIndex={0}
            >
              Tableau de bord
            </h1>
            <p
              className="small-text mt-4 -ml-5 text-[--color-sous-texte]"
              tabIndex={0}
            >
              Bonjour {firstName} {lastName}, voici un aperçu de vos projets et
              tâches
            </p>
            <div className="flex items-center gap-4 mt-6 -ml-5">
              <button
                className={`flex items-center gap-2 px-4 py-2 rounded-[10px] focus:outline-none focus:ring-2 ${
                  view === "LIST"
                    ? "bg-[#FFE8D9] text-[#E48E59]"
                    : "bg-[#FFFFFF] text-[#E48E59]"
                }`}
                onClick={() => setView("LIST")}
                aria-label="Afficher les tâches en liste"
              >
                <img
                  src="/images/icons/icon-liste.png"
                  alt="Icône liste"
                  className="h-5 w-5"
                />
                <span className="font-medium text-[#E48E59]!">Liste</span>
              </button>
              <button
                className={`flex items-center gap-2 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 ${
                  view === "KANBAN"
                    ? "bg-[#FFE8D9] text-[#E48E59]"
                    : "bg-[#FFFFFF] text-[#E48E59]"
                }`}
                onClick={() => setView("KANBAN")}
                aria-label="Afficher les tâches en kanban"
              >
                <img
                  src="/images/icons/icon-kanban.png"
                  alt="Icône kanban"
                  className="h-5 w-5"
                />
                <span className="font-medium text-[#E48E59]!">Kanban</span>
              </button>
            </div>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-black text-white px-4 py-2 ml-5 rounded-[10px] text-sm font-medium hover:opacity-90 transition focus:outline-none focus:ring-2"
            aria-label="Créer un nouveau projet"
          >
            + Créer un projet
          </button>
        </div>
      </section>

      {/* Section tâches */}
      <section
        className="w-full max-w-[1500px] px-4 md:px-6 lg:px-8 py-6 bg-white rounded-[10px] border border-[#E5E7EB] shadow-sm mt-6"
        role="region"
        aria-labelledby="assigned-tasks-title"
        tabIndex={0}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex flex-col">
            <h2
              id="assigned-tasks-title"
              className="font-semibold text-lg"
              tabIndex={0}
            >
              Mes tâches assignées
            </h2>
            <span
              className="block text-[--color-sous-texte] small-text mt-1"
              tabIndex={0}
            >
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
              aria-label="Recherche de tâche"
            />
            <button
              onClick={handleSearchTasks}
              aria-label="Rechercher la tâche"
              className="ml-2 focus:outline-none focus:ring-2 rounded"
            >
              <img
                src="/images/icons/search.png"
                alt="Icône de recherche"
                className="w-4 h-4"
              />
            </button>
          </div>
        </div>

        <DashboardTasksView
          tasks={searchResults}
          project={null}
          currentUserId={user.id}
          view={view}
          setView={setView}
          allUsers={allUsers}
        />
      </section>

      {isModalOpen && (
        <CreateProjectModal
          isOpen={isModalOpen}
          setIsOpen={setIsModalOpen}
          currentUser={user}
          allUsers={allUsers}
          onProjectCreated={refreshTasks}
        />
      )}
    </div>
  );
}
