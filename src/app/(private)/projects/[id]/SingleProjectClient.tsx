"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import CreateTaskModal from "@/components/modals/CreateTaskModal";
import EditProjectModal from "@/components/modals/EditProjectModal";
import CreateTaskModalWithIA from "@/components/modals/CreateTaskModalWithIA";
import { createTaskWithIAClient } from "@/app/actions/tasks/createTaskWithIAClient";
import { searchTasksAction } from "@/app/actions/tasks/searchTasksAction";
import { deleteTaskAction } from "@/app/actions/tasks/deleteTaskAction";
import Comments from "@/components/Comment";

type Task = {
  id: string;
  title: string;
  description?: string;
  dueDate?: string | number;
  status: "A faire" | "En cours" | "Terminées";
  assignees?: { user: { id: string; name: string } }[];
  comments?: { id: string; author: { name: string }; content: string }[];
};

export default function SingleProjectClient({ project }: { project: any }) {
  const router = useRouter();

  const [tasks, setTasks] = useState<Task[]>(project.tasks);
  const [currentProject, setCurrentProject] = useState(project);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isIAModalOpen, setIsIAModalOpen] = useState(false);
  const [activeStatus, setActiveStatus] = useState("A faire");
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const [expandedComments, setExpandedComments] = useState<
    Record<string, boolean>
  >({});

  // Callback pour récupérer la tâche générée par IA
  const handleTaskCreatedByIA = async (prompt: string) => {
    try {
      const response = await createTaskWithIAClient(prompt);

      if (!response.success || !response.data?.task) {
        console.error(
          "Erreur création tâche IA :",
          response.message,
          response.error
        );
        return;
      }

      // Récupère la tâche générée
      const taskFromIA = response.data.task;

      // Normalisation
      const normalizedTask: Task = {
        id: taskFromIA.id,
        title: taskFromIA.title,
        description: taskFromIA.description || "",
        status: "A faire",
        assignees: taskFromIA.assignees ?? [],
        comments: taskFromIA.comments ?? [],
      };

      setTasks((prev) => [normalizedTask, ...prev]);
      setIsIAModalOpen(false);
    } catch (err) {
      console.error("Erreur création tâche IA :", err);
    }
  };

  const getInitials = (name: string) => {
    if (!name) return "";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  const statusOptions = ["A faire", "En cours", "Terminées"];
  const statusColors: Record<
    string,
    { bg: string; text: string; label: string }
  > = {
    todo: {
      bg: "var(--color-tag1-bg)",
      text: "var(--color-tag1)",
      label: "À faire",
    },
    "in progress": {
      bg: "var(--color-tag2-bg)",
      text: "var(--color-tag2)",
      label: "En cours",
    },
    done: {
      bg: "var(--color-tag3-bg)",
      text: "var(--color-tag3)",
      label: "Terminée",
    },
  };

  const statusLabelMap: Record<string, string> = {
    TODO: "À faire",
    "in progress": "En cours",
    Done: "Terminée",
  };

  // Mapping des statuts DB -> statusColors keys
  const normalizeStatusKey = (status: string) => {
    switch (status) {
      case "TODO":
        return "todo";
      case "in progress":
        return "in progress";
      case "Done":
        return "done";
      default:
        return "todo";
    }
  };

  const toggleComments = (taskId: string) => {
    setExpandedComments((prev) => ({ ...prev, [taskId]: !prev[taskId] }));
  };

  const handleSearchTasks = async () => {
    const result = await searchTasksAction(searchQuery);
    if (result.success) {
      console.log("[handleSearchTasks] Résultats :", result.tasks);

      const normalizedTasks: Task[] = result.tasks.map((t: any) => ({
        id: t.id,
        title: t.title,
        description: t.description ?? undefined,
        status: t.status as Task["status"],
        dueDate: t.dueDate ? new Date(t.dueDate).getTime() : undefined,
        assignees: t.assignees ?? [],
        comments: t.comments ?? [],
      }));

      setTasks((prevTasks) => {
        const tasksMap = new Map<string, Task>();

        // Pace les tâches du résultat de recherche
        normalizedTasks.forEach((t) => tasksMap.set(t.id, t));

        // Puis on ajoute les anciennes tâches (sauf celles déjà présentes)
        prevTasks.forEach((t) => {
          if (!tasksMap.has(t.id)) tasksMap.set(t.id, t);
        });

        // Retourne la liste en conservant l'ordre : recherches en premier
        return Array.from(tasksMap.values());
      });

      setSearchResults(normalizedTasks);
      // Remettre le champ à zéro
      setSearchQuery("");
    } else {
      alert(result.message);
    }
  };

  return (
    <main
      className="w-full bg-[#F9FAFB] min-h-screen font-(--font-primary)"
      role="main"
      aria-label={`Page du projet ${project.name}`}
    >
      <div className="max-w-[1650px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* === HEADER === */}
        <header
          className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4"
          aria-label="En-tête du projet"
        >
          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              onClick={() => router.push("/dashboard")}
              className="p-2 rounded-full hover:bg-(--color-button-hover) focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-(--color-principal) transition"
              aria-label="Revenir au tableau de bord"
            >
              <Image
                src="/images/icons/button-preview.png"
                alt="Retour"
                width={50}
                height={50}
              />
            </button>
            <div>
              <h1 className="text-(--color-text) text-2xl font-bold flex items-center gap-2">
                {project.name}
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="text-(--color-principal) hover:underline text-sm font-medium focus:outline-none focus:ring-1 focus:ring-(--color-principal) rounded-sm"
                  aria-label={`Modifier le projet ${project.name}`}
                >
                  Modifier
                </button>
              </h1>
              <p
                className="text-sm md:text-base mt-1"
                style={{ color: "var(--color-sous-texte)" }}
              >
                {project.description}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-black text-white px-4 py-2 rounded-[10px] text-sm font-medium hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
              aria-label="Créer une nouvelle tâche"
            >
              Créer une tâche
            </button>
            <button
              onClick={() => setIsIAModalOpen(true)}
              className="flex items-center gap-2 bg-(--color-principal) text-white px-3 py-2 rounded-[10px] text-sm font-medium hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-(--color-principal)"
              aria-label="Fonctionnalité d’intelligence artificielle"
            >
              <Image
                src="/images/icons/star.png"
                width={14}
                height={14}
                alt="Étoile"
                className="filter brightness-0 invert"
              />
              IA
            </button>
          </div>
        </header>

        {/* === CONTRIBUTEURS === */}
        <section
          className="bg-[#F3F4F6] rounded-lg px-4 py-3 mb-6 flex flex-wrap items-center gap-3"
          aria-label="Contributeurs du projet"
        >
          <p className="text-sm font-medium">
            Contributeurs {project.members.length + 1}{" "}
            <span style={{ color: "var(--color-sous-texte)" }}>personnes</span>
          </p>
          <div className="flex flex-wrap gap-3 ml-auto" role="list">
            <div className="flex items-center gap-2" role="listitem">
              <div
                className="w-8 h-8 flex items-center justify-center rounded-full font-semibold"
                style={{
                  backgroundColor: "#FFE8D9",
                  color: "var(--color-principal)",
                }}
              >
                {getInitials(project.owner.name)}
              </div>
              <span
                className="text-sm font-medium px-2 py-0.5 rounded-full"
                style={{
                  backgroundColor: "#FFE8D9",
                  color: "var(--color-principal)",
                }}
              >
                Propriétaire
              </span>
            </div>
            {project.members.map((member: any) => (
              <div
                key={member.user.id}
                className="flex items-center gap-2"
                role="listitem"
              >
                <div
                  className="w-8 h-8 flex items-center justify-center rounded-[10px] font-semibold"
                  style={{ backgroundColor: "#E5E7EB", color: "#0F0F0F" }}
                >
                  {getInitials(member.user.name)}
                </div>
                <span
                  className="text-sm truncate"
                  style={{ color: "var(--color-text)" }}
                >
                  {member.user.name}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* === TÂCHES === */}
        <section
          className="bg-white rounded-lg p-4 shadow-sm"
          aria-label="Liste des tâches"
        >
          <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-3">
            <div>
              <h2 className="text-lg font-semibold text-(--color-text)">
                Tâches
              </h2>
              <p
                className="text-sm"
                style={{ color: "var(--color-sous-texte)" }}
              >
                Par ordre de priorité
              </p>
            </div>

            {/* Filtres et recherche */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Liste */}
              <button
                className="flex items-center gap-2 bg-(--color-tag2-bg) text-(--color-principal) px-3 py-1.5 rounded-[5px] text-sm font-medium focus:outline-none focus:ring-1 focus:ring-(--color-principal)"
                aria-pressed="true"
              >
                <Image
                  src="/images/icons/icon-liste.png"
                  width={14}
                  height={14}
                  alt="Liste"
                />
                Liste
              </button>

              {/* Calendrier */}
              <button
                className="flex items-center gap-2 bg-white border border-gray-200 text-(--color-principal) py-1.5 rounded-[5px] text-sm font-medium hover:bg-(--color-button-hover)"
                aria-label="Vue calendrier"
              >
                <Image
                  src="/images/icons/icon-calendar.png"
                  width={14}
                  height={14}
                  alt="Calendrier"
                />
                Calendrier
              </button>

              {/* Statut dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium text-(--color-sous-texte) bg-white border border-[#E5E7EB] focus:outline-none focus:ring-1 focus:ring-(--color-principal)"
                  aria-haspopup="listbox"
                  aria-expanded={showStatusDropdown}
                >
                  Statut
                  <svg
                    className={`w-4 h-4 transition-transform ${
                      showStatusDropdown ? "rotate-180" : ""
                    }`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.23 7.21a.75.75 0 011.06.02L10 11.584l3.71-4.354a.75.75 0 111.14.976l-4 4.7a.75.75 0 01-1.14 0l-4-4.7a.75.75 0 01.02-1.06z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
                {showStatusDropdown && (
                  <ul
                    className="absolute mt-1 bg-white rounded-[5px] shadow-lg z-10 w-full"
                    role="listbox"
                  >
                    {statusOptions.map((status) => {
                      const colors = statusColors[status];
                      return (
                        <li
                          key={status}
                          className="px-3 py-1 cursor-pointer text-sm font-medium rounded-[5px] hover:opacity-80"
                          style={{
                            backgroundColor:
                              activeStatus === status ? colors.bg : "white",
                            color:
                              activeStatus === status
                                ? colors.text
                                : "var(--color-text)",
                          }}
                          onClick={() => {
                            setActiveStatus(status);
                            setShowStatusDropdown(false);
                          }}
                          role="option"
                          aria-selected={activeStatus === status}
                        >
                          {status}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>

              {/* Recherche */}
              <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-[5px] px-3 py-1.5">
                <input
                  type="text"
                  placeholder="Rechercher une tâche"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSearchTasks();
                  }}
                  className="outline-none text-sm text-gray-600 bg-transparent w-32 sm:w-48"
                  aria-label="Rechercher une tâche"
                />

                <Image
                  src="/images/icons/search.png"
                  width={14}
                  height={14}
                  alt="Icône de recherche"
                  className="cursor-pointer"
                  onClick={handleSearchTasks}
                />
              </div>
            </div>
          </div>

          {/* Liste des tâches */}
          <div className="flex flex-col gap-4">
            {tasks.map((task: any) => {
              const taskStatus = statusColors[task.status] || {
                bg: "var(--color-tag1-bg)",
                text: "var(--color-tag1)",
                label: task.status,
              };

              return (
                <article
                  key={task.id}
                  className="bg-white rounded-lg border border-gray-200 p-4 transition hover:shadow-md focus-within:ring-2 focus-within:ring-(--color-principal)"
                  tabIndex={0}
                  aria-labelledby={`task-${task.id}`}
                >
                  <header className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <h3
                        id={`task-${task.id}`}
                        className="font-semibold text-sm text-(--color-text)"
                      >
                        {task.title}
                      </h3>
                      <span
                        className="text-xs px-2 py-0.5 rounded-full font-medium"
                        style={{
                          backgroundColor:
                            statusColors[normalizeStatusKey(task.status)]?.bg ||
                            "var(--color-tag1-bg)",
                          color:
                            statusColors[normalizeStatusKey(task.status)]
                              ?.text || "var(--color-tag1)",
                        }}
                      >
                        {statusLabelMap[task.status] || task.status}
                      </span>
                    </div>

                    <Image
                      src="/images/icons/button-dot.png"
                      width={50}
                      height={50}
                      alt="dot"
                      className="ml-auto cursor-pointer"
                      onClick={async () => {
                        try {
                          const result = await deleteTaskAction(
                            project.id,
                            task.id
                          );

                          if (result.success) {
                            setTasks((prev) =>
                              prev.filter((t) => t.id !== task.id)
                            );
                            console.log(
                              `Tâche ${task.id} supprimée avec succès`
                            );
                          } else {
                            alert(
                              result.message || "Erreur lors de la suppression"
                            );
                          }
                        } catch (err: any) {
                          console.error("Erreur deleteTaskAction :", err);
                          alert(err.message || "Erreur lors de la suppression");
                        }
                      }}
                    />
                  </header>

                  <p
                    className="text-sm mt-1"
                    style={{ color: "var(--color-sous-texte)" }}
                  >
                    {task.description}
                  </p>

                  {task.assignees?.length > 0 && (
                    <div
                      className="flex flex-wrap items-center gap-3 mt-3"
                      aria-label="Contributeurs assignés"
                    >
                      <div className="mt-2 flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium text-[--color-sous-texte]">
                          Assigné à :
                        </span>
                        {task.assignees.map((assignee: any) => (
                          <div
                            key={assignee.user.id}
                            className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-full"
                          >
                            <div
                              className="w-6 h-6 flex items-center justify-center rounded-full font-semibold text-xs"
                              style={{
                                backgroundColor: "#E5E7EB",
                                color: "#0F0F0F",
                              }}
                            >
                              {getInitials(assignee.user.name)}
                            </div>
                            <span className="text-sm text-[--color-text]">
                              {assignee.user.name}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {task.dueDate && (
                    <p
                      className="text-sm mt-2"
                      style={{ color: "var(--color-sous-texte)" }}
                    >
                      {(() => {
                        const rawDate = task.dueDate;
                        const parsedDate =
                          typeof rawDate === "number"
                            ? new Date(rawDate)
                            : new Date(String(rawDate));

                        const formattedDate = isNaN(parsedDate.getTime())
                          ? "Date invalide"
                          : parsedDate.toLocaleDateString("fr-FR", {
                              day: "2-digit",
                              month: "long",
                            });

                        return `Échéance : ${formattedDate}`;
                      })()}
                    </p>
                  )}

                  <hr className="my-3 border-gray-200" />

                  {task.comments?.length > 0 && (
                    <div className="mt-3">
                      <button
                        onClick={() => toggleComments(task.id)}
                        className="flex items-center justify-between w-full text-sm font-medium text-gray-600 hover:text-gray-800 focus:outline-none"
                      >
                        <span style={{ color: "#575757" }}>
                          Commentaires ({task.comments.length})
                        </span>
                        <svg
                          className={`w-4 h-4 ml-2 transition-transform ${
                            expandedComments[task.id] ? "rotate-180" : ""
                          }`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M5.23 7.21a.75.75 0 011.06.02L10 11.584l3.71-4.354a.75.75 0 111.14.976l-4 4.7a.75.75 0 01-1.14 0l-4-4.7a.75.75 0 01.02-1.06z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                      {expandedComments[task.id] && (
                        <div className="mt-2">
                          <Comments
                            initialComments={task.comments || []}
                            taskId={task.id}
                            projectId={project.id}
                            currentUser={{
                              userId: project.owner.id,
                              name: project.owner.name,
                            }}
                            onNewComment={(comment) =>
                              setTasks((prev) =>
                                prev.map((t) =>
                                  t.id === task.id
                                    ? {
                                        ...t,
                                        comments: [
                                          ...(t.comments || []),
                                          comment,
                                        ],
                                      }
                                    : t
                                )
                              )
                            }
                          />
                        </div>
                      )}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </section>

        {/* === MODALES === */}
        <CreateTaskModal
          isOpen={isCreateModalOpen}
          setIsOpen={setIsCreateModalOpen}
          project={project}
          currentUserId={project.currentUserId || project.owner.id}
          onTaskCreated={(newTask: any) =>
            setTasks((prev) => [newTask, ...prev])
          }
        />

        <EditProjectModal
          isOpen={isEditModalOpen}
          setIsOpen={setIsEditModalOpen}
          project={currentProject}
          onUpdate={(updatedProject: any) => setCurrentProject(updatedProject)}
        />
        {isIAModalOpen && (
          <CreateTaskModalWithIA
            isOpen={isIAModalOpen}
            setIsOpen={setIsIAModalOpen}
            projectId={project.id}
            onTaskCreated={handleTaskCreatedByIA}
          />
        )}
      </div>
    </main>
  );
}
