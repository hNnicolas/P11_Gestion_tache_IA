"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import CreateTaskModal from "@/components/modals/CreateTaskModal";
import EditProjectModal from "@/components/modals/EditProjectModal";

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
  const [activeStatus, setActiveStatus] = useState("A faire");
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [expandedComments, setExpandedComments] = useState<
    Record<string, boolean>
  >({});

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
    TODO: {
      bg: "var(--color-tag1-bg)",
      text: "var(--color-tag1)",
      label: "A faire",
    },
    "in progress": {
      bg: "var(--color-tag2-bg)",
      text: "var(--color-tag2)",
      label: "En cours",
    },
    Done: {
      bg: "var(--color-tag3-bg)",
      text: "var(--color-tag3)",
      label: "Terminées",
    },
  };

  const toggleComments = (taskId: string) => {
    setExpandedComments((prev) => ({ ...prev, [taskId]: !prev[taskId] }));
  };

  return (
    <main
      className="max-w-7xl mx-auto bg-[#F9FAFB] px-4 sm:px-6 lg:px-8 py-6 font-(--font-primary)"
      role="main"
      aria-label={`Page du projet ${project.name}`}
    >
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
            <p className="text-sm" style={{ color: "var(--color-sous-texte)" }}>
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
                  {statusOptions.map((status) => (
                    <li
                      key={status}
                      className="px-3 py-1 cursor-pointer text-sm font-medium hover:bg-(--color-button-hover) rounded-[5px]"
                      style={{
                        backgroundColor:
                          activeStatus === status
                            ? statusColors[status]?.bg || ""
                            : "",
                        color:
                          activeStatus === status
                            ? statusColors[status]?.text || "var(--color-text)"
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
                  ))}
                </ul>
              )}
            </div>

            {/* Recherche */}
            <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-[5px] px-3 py-1.5">
              <input
                type="text"
                placeholder="Rechercher une tâche"
                className="outline-none text-sm text-gray-600 bg-transparent w-32 sm:w-48"
                aria-label="Rechercher une tâche"
              />
              <Image
                src="/images/icons/search.png"
                width={14}
                height={14}
                alt="Icône de recherche"
              />
            </div>
          </div>
        </div>

        {/* Liste des tâches */}
        <div className="flex flex-col gap-4">
          {tasks.map((task: any) => {
            const mapStatusToKey = (status: string) => {
              switch (status) {
                case "A faire":
                  return "TODO";
                case "En cours":
                  return "in progress";
                case "Terminées":
                  return "Done";
                default:
                  return status;
              }
            };
            const statusKey = mapStatusToKey(task.status);
            const taskStatus = statusColors[statusKey] || {
              bg: "var(--color-tag1-bg)",
              text: "var(--color-tag1)",
              label: "A faire",
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
                        backgroundColor: taskStatus.bg,
                        color: taskStatus.text,
                      }}
                    >
                      {taskStatus.label}
                    </span>
                  </div>

                  <Image
                    src="/images/icons/button-dot.png"
                    width={20}
                    height={20}
                    alt="dot"
                    className="ml-auto"
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
                      <ul className="mt-2 flex flex-col gap-1">
                        {task.comments.map((comment: any) => (
                          <li
                            key={comment.id}
                            className="text-sm text-gray-700 pl-2 border-l-2 border-gray-300"
                          >
                            <span className="font-semibold text-gray-900">
                              {comment.author.name} :
                            </span>{" "}
                            {comment.content}
                          </li>
                        ))}
                      </ul>
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
        onTaskCreated={(newTask: any) => setTasks((prev) => [newTask, ...prev])}
      />

      <EditProjectModal
        isOpen={isEditModalOpen}
        setIsOpen={setIsEditModalOpen}
        project={currentProject}
        onUpdate={(updatedProject: any) => setCurrentProject(updatedProject)}
      />
    </main>
  );
}
