"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getProjectsAction } from "@/app/actions/projects/getProjectsAction";
import { getProjectsProgressAction } from "@/app/actions/tasks/getAssignedTasksAction";
import CreateProjectModal from "@/components/modals/CreateProjectModal";
import { deleteProjectAction } from "@/app/actions/projects/deleteProjectAction";
import ApiMessage from "@/components/ApiMessage";
import { ApiResponse } from "@/types";

export default function ProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<any[]>([]);
  const [progressMap, setProgressMap] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [allUsers, setAllUsers] = useState<
    { id: string; name: string; email: string }[]
  >([]);
  const [currentUser, setCurrentUser] = useState<{
    id: string;
    name: string;
    email: string;
  } | null>(null);

  const [apiResponse, setApiResponse] = useState<ApiResponse | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const projectsData = await getProjectsAction();
        setProjects(projectsData);

        const progressData = await getProjectsProgressAction();
        const progressObj = progressData.reduce(
          (acc, { projectId, progress }) => {
            acc[projectId] = progress;
            return acc;
          },
          {} as Record<string, number>
        );
        setProgressMap(progressObj);

        const users: { id: string; name: string; email: string }[] = [];
        projectsData.forEach((project: any) => {
          if (project.owner) users.push(project.owner);
          project.members?.forEach((m: any) => users.push(m.user));
        });
        setAllUsers(Array.from(new Map(users.map((u) => [u.id, u])).values()));

        if (projectsData.length > 0) {
          setCurrentUser({
            id: projectsData[0].owner.id,
            name: projectsData[0].owner.name ?? "Unknown",
            email: projectsData[0].owner.email ?? "",
          });
        }
      } catch (error) {
        console.error("Erreur lors du chargement des données :", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getInitials = (name: string) => {
    const parts = name.trim().split(" ");
    return parts.length === 1
      ? parts[0].slice(0, 2).toUpperCase()
      : (parts[0][0] + parts[1][0]).toUpperCase();
  };

  const handleDeleteProject = async (
    projectId: string,
    projectName: string
  ) => {
    if (!confirm(`Voulez-vous vraiment supprimer le projet "${projectName}" ?`))
      return;

    try {
      const response = await deleteProjectAction(projectId);

      if (response.success) {
        setProjects((prev) => prev.filter((p) => p.id !== projectId));

        setApiResponse({
          success: true,
          message: response.message || "Projet supprimé avec succès !",
        });
      } else {
        setApiResponse({
          success: false,
          message: response.message || "Erreur lors de la suppression.",
          error: response.error || undefined,
        });
      }
    } catch (error: any) {
      console.error(error);
      setApiResponse({
        success: false,
        message: "Vous n'avez pas la permission de supprimer ce projet.",
        error: error.message || "Erreur inconnue",
      });
    }
  };

  if (loading)
    return (
      <p role="status" aria-busy="true" className="text-center mt-10">
        Chargement des projets...
      </p>
    );

  return (
    <div className="w-full bg-[#F9FAFB]">
      <div className="w-full max-w-[1550px] mx-auto px-4 md:px-6 lg:px-8 py-6">
        <div className="flex justify-between items-center mb-2 flex-wrap">
          <div>
            <h1
              tabIndex={0}
              aria-label="Titre de la page: Mes projets"
              className="text-2xl font-bold mb-5 mt-8"
            >
              Mes projets
            </h1>
            <p
              tabIndex={0}
              aria-label="Description: Gérez vos projets"
              className="text-sm mt-1 mb-10"
              style={{ color: "var(--color-text)" }}
            >
              Gérez vos projets
            </p>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-black text-white px-4 py-2 rounded-[10px] text-sm font-medium hover:opacity-90 transition mt-4 md:mt-0 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            aria-label="Créer un nouveau projet"
          >
            + Créer un projet
          </button>
        </div>

        {projects.length === 0 ? (
          <p className="text-gray-500">Aucun projet trouvé</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {projects.map((project: any) => {
              const progress = progressMap[project.id] ?? 0;
              const totalTasks =
                project._count?.tasks || project.tasks?.length || 0;
              const completedTasks = Math.round((progress / 100) * totalTasks);

              return (
                <div
                  key={project.id}
                  className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 flex flex-col justify-between cursor-pointer hover:shadow-md transition relative focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  role="button"
                  tabIndex={0}
                  onClick={() => router.push(`/projects/${project.id}`)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      router.push(`/projects/${project.id}`);
                    }
                  }}
                  aria-label={`Projet ${
                    project.name
                  }, ${progress}% terminé, ${completedTasks} sur ${totalTasks} tâches terminées, équipe composée de ${
                    1 + project.members.length
                  } membres`}
                >
                  <div>
                    <h2
                      tabIndex={0}
                      aria-label={`Nom du projet: ${project.name}`}
                      className="font-semibold text-lg"
                    >
                      {project.name}
                    </h2>
                    <p
                      tabIndex={0}
                      aria-label={`Description: ${
                        project.description || "Aucune description"
                      }`}
                      className="text-sm mt-1 line-clamp-2"
                      style={{ color: "var(--color-sous-texte)" }}
                    >
                      {project.description || "Aucune description"}
                    </p>
                  </div>

                  <div
                    className="mt-5"
                    tabIndex={0}
                    aria-label={`Progression: ${progress}% du projet`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <h3
                        className="text-sm font-medium"
                        style={{ color: "var(--color-text)" }}
                      >
                        Progression
                      </h3>
                      <span
                        className="text-sm font-semibold"
                        style={{ color: "var(--color-text)" }}
                      >
                        {progress}%
                      </span>
                    </div>
                    <div
                      className="w-full bg-gray-200 rounded-full h-2.5 relative"
                      role="progressbar"
                      aria-valuenow={progress}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label={`Barre de progression du projet ${project.name}`}
                    >
                      <div
                        className="h-2.5 rounded-full transition-all duration-500"
                        style={{
                          width: `${progress}%`,
                          backgroundColor: "var(--color-principal, #d3580b)",
                        }}
                      />
                    </div>
                    <div
                      tabIndex={0}
                      aria-label={`Tâches terminées: ${completedTasks} sur ${totalTasks}`}
                    >
                      <span
                        className="flex justify-between text-xs mt-1"
                        style={{ color: "var(--color-sous-texte)" }}
                      >
                        {completedTasks}/{totalTasks} tâches terminées
                      </span>
                    </div>
                  </div>

                  <div
                    className="mt-6"
                    aria-label={`Équipe du projet ${project.name}`}
                  >
                    <div className="flex items-center gap-2 text-sm mb-3">
                      <div className="relative w-5 h-5">
                        <Image
                          src="/images/icons/team.png"
                          alt="Icône Équipe"
                          fill
                          className="object-contain opacity-90"
                        />
                      </div>

                      <span
                        tabIndex={0}
                        aria-label={`Nombre total de membres dans l'équipe: ${
                          1 + project.members.length
                        }`}
                        className="text-sm"
                        style={{ color: "var(--color-sous-texte)" }}
                      >
                        Équipe ({1 + project.members.length})
                      </span>
                    </div>

                    <div className="flex items-center gap-3 flex-wrap">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-8 h-8 flex items-center justify-center rounded-full text-sm font-semibold"
                          style={{
                            backgroundColor: "#FFE8D9",
                            color: "var(--color-principal, #d3580b)",
                          }}
                          tabIndex={0}
                          aria-label={`Propriétaire: ${project.owner.name}`}
                        >
                          {getInitials(project.owner.name)}
                        </div>
                        <span
                          tabIndex={0}
                          aria-label="Rôle : Propriétaire"
                          className="text-sm font-medium px-2 py-0.5 rounded-full"
                          style={{
                            backgroundColor: "#FFE8D9",
                            color: "var(--color-principal, #d3580b)",
                          }}
                        >
                          Propriétaire
                        </span>
                      </div>
                      {project.members.length > 0 && (
                        <div className="flex items-center -space-x-2">
                          {project.members.map((member: any) => (
                            <div
                              key={member.user.id}
                              className="w-8 h-8 flex items-center justify-center rounded-full text-sm font-semibold text-gray-700 bg-gray-100 border-2 border-white"
                              tabIndex={0}
                              aria-label={`Contributeur: ${member.user.name}`}
                            >
                              {getInitials(member.user.name)}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteProject(project.id, project.name);
                    }}
                    className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded hover:opacity-90 transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-400"
                    aria-label={`Supprimer le projet ${project.name}`}
                  >
                    Supprimer
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {currentUser && (
          <CreateProjectModal
            isOpen={isCreateModalOpen}
            setIsOpen={setIsCreateModalOpen}
            currentUser={currentUser}
            allUsers={allUsers}
            onProjectCreated={(newProject) =>
              setProjects((prev) => [newProject, ...prev])
            }
          />
        )}
      </div>
      <ApiMessage response={apiResponse} />
    </div>
  );
}
