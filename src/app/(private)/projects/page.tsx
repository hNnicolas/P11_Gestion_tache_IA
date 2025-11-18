"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getProjectsAction } from "@/app/actions/getProjectsAction";
import { getProjectsProgressAction } from "@/app/actions/getAssignedTasksAction";
import CreateProjectModal from "@/components/modals/CreateProjectModal";

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1️⃣ Récupérer les projets
        const projectsData = await getProjectsAction();
        setProjects(projectsData);

        // 2️⃣ Récupérer les progressions (par projet)
        const progressData = await getProjectsProgressAction();
        const progressObj = progressData.reduce(
          (acc, { projectId, progress }) => {
            acc[projectId] = progress;
            return acc;
          },
          {} as Record<string, number>
        );
        setProgressMap(progressObj);

        // 3️⃣ Collecte des utilisateurs
        const users: { id: string; name: string; email: string }[] = [];
        projectsData.forEach((project: any) => {
          if (project.owner) users.push(project.owner);
          project.members?.forEach((m: any) => users.push(m.user));
        });
        setAllUsers(Array.from(new Map(users.map((u) => [u.id, u])).values()));

        // 4️⃣ Utilisateur courant
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

  if (loading) return <p>Chargement des projets...</p>;

  return (
    <div className="w-full bg-[#F9FAFB]">
      {/* Conteneur responsive avec padding horizontal */}
      <div className="w-full max-w-[1550px] mx-auto px-4 md:px-6 lg:px-8 py-6">
        {/* Titre principal */}
        <div className="flex justify-between items-center mb-2 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold mb-5 mt-8">Mes projets</h1>
            <p
              className="text-sm mt-1 mb-10"
              style={{ color: "var(--color-text)" }}
            >
              Gérez vos projets
            </p>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-black text-white px-4 py-2 rounded-[10px] text-sm font-medium hover:opacity-90 transition mt-4 md:mt-0"
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
                  className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 flex flex-col justify-between cursor-pointer hover:shadow-md transition"
                  onClick={() => router.push(`/projects/${project.id}`)}
                >
                  {/* Nom et description */}
                  <div>
                    <h2 className="font-semibold text-lg">{project.name}</h2>
                    <p
                      className="text-sm mt-1 line-clamp-2"
                      style={{ color: "var(--color-sous-texte)" }}
                    >
                      {project.description || "Aucune description"}
                    </p>
                  </div>

                  {/* Barre de progression dynamique */}
                  <div className="mt-5">
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
                    <div className="w-full bg-gray-200 rounded-full h-2.5 relative">
                      <div
                        className="h-2.5 rounded-full transition-all duration-500"
                        style={{
                          width: `${progress}%`,
                          backgroundColor: "var(--color-principal, #d3580b)",
                        }}
                      />
                    </div>
                    <div
                      className="flex justify-between text-xs mt-1"
                      style={{ color: "var(--color-sous-texte)" }}
                    >
                      <span>
                        {completedTasks}/{totalTasks} tâches terminées
                      </span>
                    </div>
                  </div>

                  {/* Équipe */}
                  <div className="mt-6">
                    <div className="flex items-center gap-2 text-sm mb-3">
                      <Image
                        src="/images/icons/team.png"
                        alt="Équipe"
                        width={18}
                        height={18}
                        className="object-contain opacity-90"
                      />
                      <span
                        className="text-sm"
                        style={{ color: "var(--color-sous-texte)" }}
                      >
                        Équipe ({1 + project.members.length})
                      </span>
                    </div>
                    <div className="flex items-center gap-3 flex-wrap">
                      {/* Propriétaire */}
                      <div className="flex items-center gap-2">
                        <div
                          className="w-8 h-8 flex items-center justify-center rounded-full text-sm font-semibold"
                          style={{
                            backgroundColor: "#FFE8D9",
                            color: "var(--color-principal, #d3580b)",
                          }}
                        >
                          {getInitials(project.owner.name)}
                        </div>
                        <span
                          className="text-sm font-medium px-2 py-0.5 rounded-full"
                          style={{
                            backgroundColor: "#FFE8D9",
                            color: "var(--color-principal, #d3580b)",
                          }}
                        >
                          Propriétaire
                        </span>
                      </div>
                      {/* Contributeurs */}
                      {project.members.length > 0 && (
                        <div className="flex items-center -space-x-2">
                          {project.members.map((member: any) => (
                            <div
                              key={member.user.id}
                              className="w-8 h-8 flex items-center justify-center rounded-full text-sm font-semibold text-gray-700 bg-gray-100 border-2 border-white"
                            >
                              {getInitials(member.user.name)}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
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
    </div>
  );
}
