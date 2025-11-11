import { getProjectByIdAction } from "@/app/actions/getProfileAction";
import Image from "next/image";

// Fonction utilitaire pour obtenir les initiales
const getInitials = (name: string) => {
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
};

interface ProjectPageProps {
  params: Promise<{ id: string }>; // params est maintenant un Promise
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { id: projectId } = await params; // 👈 await ici

  if (!projectId) {
    return (
      <div className="max-w-7xl mx-auto px-8 py-6">
        <p className="text-red-500">ID du projet manquant.</p>
      </div>
    );
  }

  let project;
  try {
    project = await getProjectByIdAction(projectId);
  } catch (error) {
    console.error(error);
    return (
      <div className="max-w-7xl mx-auto px-8 py-6">
        <p className="text-red-500">Impossible de récupérer le projet.</p>
      </div>
    );
  }

  const completedTasks =
    project.tasks?.filter((t: any) => t.status === "done")?.length || 0;
  const totalTasks = project._count?.tasks || project.tasks?.length || 0;
  const progress =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="max-w-7xl mx-auto px-8 py-6">
      <h1 className="text-2xl font-bold mb-4">{project.name}</h1>
      <p
        className="text-sm mb-6"
        style={{ color: "var(--color-sous-texte, #6b7280)" }}
      >
        {project.description || "Aucune description"}
      </p>

      {/* Barre de progression */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-1">
          <h3
            className="text-sm font-medium"
            style={{ color: "var(--color-text, #1f1f1f)" }}
          >
            Progression
          </h3>
          <span className="text-sm font-semibold">{progress}%</span>
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
          style={{ color: "var(--color-sous-texte, #6b7280)" }}
        >
          <span>
            {completedTasks}/{totalTasks} tâches terminées
          </span>
        </div>
      </div>

      {/* Équipe */}
      <div>
        <div className="flex items-center gap-2 text-sm mb-3">
          <Image
            src="/images/icons/team.png"
            alt="Équipe"
            width={18}
            height={18}
            className="object-contain opacity-90"
          />
          <span style={{ color: "var(--color-sous-texte, #6b7280)" }}>
            Équipe ({project.members.length})
          </span>
        </div>

        {/* Initiales */}
        <div className="flex items-center gap-1 flex-wrap">
          {/* Propriétaire */}
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 flex items-center justify-center rounded-full text-sm font-semibold"
              style={{
                backgroundColor: "var(--color-tag1-bg, #FFE8D9)",
                color: "var(--color-principal, #d3580b)",
              }}
            >
              {getInitials(project.owner.name ?? "??")}
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
          {project.members.length > 0 &&
            project.members.map((member: any) => (
              <div
                key={member.user.id}
                className="w-8 h-8 flex items-center justify-center rounded-full text-sm font-semibold text-gray-700 bg-gray-100 -ml-1"
              >
                {getInitials(member.user.name)}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
