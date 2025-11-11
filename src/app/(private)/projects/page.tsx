import Image from "next/image";
import Link from "next/link";
import { getProjectsAction } from "@/app/actions/getProjectsAction";

export default async function ProjectsPage() {
  let projects = [];

  try {
    projects = await getProjectsAction();
  } catch (error) {
    console.error(error);
    return (
      <div className="max-w-7xl mx-auto px-8 py-6">
        <p className="text-red-500">Impossible de récupérer les projets.</p>
      </div>
    );
  }

  const getInitials = (name: string) => {
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  return (
    <div className="max-w-7xl mx-auto px-8 py-6">
      {/* Titre principal */}
      <div className="flex justify-between items-center mb-2">
        <div>
          <h1 className="text-2xl font-bold mb-5">Mes projets</h1>
          <p
            className="text-sm mt-1"
            style={{ color: "var(--color-text, #1f1f1f)" }}
          >
            Gérez vos projets
          </p>
        </div>
        {/* Bouton créer un projet */}
        <Link
          href="/projects/create" // ou la route de la page single project
          className="text-white! bg-black px-4 py-2 rounded-[10px] text-sm font-medium hover:opacity-90 transition"
        >
          + Créer un projet
        </Link>
      </div>

      {projects.length === 0 ? (
        <p className="text-gray-500">Aucun projet trouvé</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {projects.map((project: any) => {
            const completedTasks =
              project.tasks?.filter((t: any) => t.status === "done")?.length ||
              0;
            const totalTasks =
              project._count?.tasks || project.tasks?.length || 0;
            const progress =
              totalTasks > 0
                ? Math.round((completedTasks / totalTasks) * 100)
                : 0;

            return (
              <div
                key={project.id}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 flex flex-col justify-between"
              >
                {/* Nom et description */}
                <div>
                  <h2 className="font-semibold text-lg">{project.name}</h2>
                  <p
                    className="text-sm mt-1 line-clamp-2"
                    style={{ color: "var(--color-sous-texte, #6b7280)" }}
                  >
                    {project.description || "Aucune description"}
                  </p>
                </div>

                {/* Barre de progression */}
                <div className="mt-5">
                  <div className="flex justify-between items-center mb-1">
                    <h3
                      className="text-sm font-medium"
                      style={{ color: "var(--color-text, #1f1f1f)" }}
                    >
                      Progression
                    </h3>
                    <span
                      className="text-sm font-semibold"
                      style={{ color: "var(--color-text, #1f1f1f)" }}
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
                    ></div>
                  </div>

                  <div
                    className="flex justify-between text-xs mt-1"
                    style={{ color: "var(--color-sous-texte, #6b7280)" }}
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
                      style={{ color: "var(--color-sous-texte, #6b7280)" }}
                    >
                      Équipe ({project.members.length})
                    </span>
                  </div>

                  {/* Ligne des initiales */}
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
                          backgroundColor: "var(--color-tag1-bg, #FFE8D9)",
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
    </div>
  );
}
