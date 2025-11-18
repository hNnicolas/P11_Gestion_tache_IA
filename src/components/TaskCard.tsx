import { ITask } from "@/lib/prisma";

type Props = {
  task: ITask;
  onTaskView: (task: ITask) => void;
};

export default function TaskCard({ task, onTaskView }: Props) {
  const statusFR: Record<ITask["status"], string> = {
    TODO: "À faire",
    IN_PROGRESS: "En cours",
    DONE: "Terminée",
    CANCELLED: "Annulée",
  };

  const BADGE_STYLES: Record<string, string> = {
    "À faire":
      "!text-[var(--color-tag1)] !bg-[var(--color-tag1-bg)] !border !border-[var(--color-tag1-bg)]",
    "En cours":
      "!text-[var(--color-tag2)] !bg-[var(--color-tag2-bg)] !border !border-[var(--color-tag2-bg)]",
    Terminée:
      "!text-[var(--color-tag3)] !bg-[var(--color-tag3-bg)] !border !border-[var(--color-tag3-bg)]",
    Annulée:
      "!text-[var(--color-sous-texte)] !bg-[#f3f4f6] !border !border-[#f3f4f6]",
  };

  const status = statusFR[task.status];

  return (
    <div className="bg-white rounded-xl p-6 flex items-center justify-between border border-[#EFF0F3] shadow-sm">
      {/* LEFT BLOCK */}
      <div className="flex flex-col gap-2 max-w-[820px]">
        <h3 className="text-black font-semibold text-base">{task.title}</h3>
        <p className="small-text text-(--color-sous-texte)!">
          {task.description}
        </p>

        <div className="flex items-center gap-3 mt-3 small-text text-(--color-sous-texte)!">
          {/* projet */}
          <div className="flex items-center gap-2">
            <img src="/images/icons/icon-folder.png" className="h-4 w-4" />
            <span className="text-[13px]">
              {task.project?.name ?? "Projet inconnu"}
            </span>
          </div>

          <span className="mx-2 text-[13px]">|</span>

          {/* date */}
          <div className="flex items-center gap-2">
            <img src="/images/icons/icon-calendar.png" className="h-4 w-4" />
            <span className="text-[13px]">
              {task.dueDate?.toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "long",
              })}
            </span>
          </div>

          <span className="mx-2 text-[13px]">|</span>

          {/* messages */}
          <div className="flex items-center gap-2">
            <img src="/images/icons/icon-message.png" className="h-4 w-4" />
            <span className="text-[13px]">{task.comments?.length ?? 0}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-end justify-between h-full min-w-[130px] gap-4">
        <span
          className={`inline-block px-4 py-1.5 rounded-[10px] mb-10 text-[11px] font-medium ${BADGE_STYLES[status]}`}
        >
          {status}
        </span>

        {/* Bouton pour ouvrir la modale */}
        {task.project?.id ? (
          <button
            onClick={() => onTaskView(task)}
            className="inline-block bg-black text-white! px-6 py-2 rounded-[10px] small-text shadow-md"
          >
            Voir
          </button>
        ) : (
          <span className="text-gray-400 text-[13px] px-6 py-2 rounded-[10px] inline-block">
            Projet indisponible
          </span>
        )}
      </div>
    </div>
  );
}
