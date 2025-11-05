import { ITask } from "@/lib/prisma";

type Props = {
  task: ITask;
};

export default function TaskCard({ task }: Props) {
  const statusFR: Record<ITask["status"], string> = {
    TODO: "A faire",
    IN_PROGRESS: "En cours",
    DONE: "Terminé",
    CANCELLED: "Annulée",
  };

  // classes pour la pastille selon le statut (couleurs et padding proches de la maquette)
  const statusClass =
    task.status === "TODO"
      ? "bg-[#FFEDEE] text-[#F38B88]"
      : task.status === "IN_PROGRESS"
      ? "bg-[#FFF5E6] text-[#DB9B3F]"
      : task.status === "DONE"
      ? "bg-[#E8FDF3] text-[#20A87D]"
      : "bg-[#F3F4F6] text-[#6B7280]";

  return (
    <div className="bg-white rounded-xl p-6 flex items-center justify-between border border-[#EFF0F3] shadow-sm">
      {/* LEFT BLOCK */}
      <div className="flex flex-col gap-2 max-w-[820px]">
        <h3 className="text-black font-semibold text-base">{task.title}</h3>
        <p className="small-text text-[--color-sous-texte]">
          {task.description}
        </p>

        {/* infos projet / date / messages */}
        <div className="flex items-center gap-3 mt-3 small-text text-[--color-sous-texte]">
          {/* projet */}
          <div className="flex items-center gap-2">
            <img src="/images/icons/icon-folder.png" className="h-4 w-4" />
            <span className="text-[13px]">Nom du projet</span>
          </div>

          {/* séparateur */}
          <span className="mx-2 text-[13px]">|</span>

          {/* date */}
          <div className="flex items-center gap-2">
            <img src="/images/icons/icon-calendar.png" className="h-4 w-4" />
            <span className="text-[13px]">
              {task.dueDate.toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "long",
              })}
            </span>
          </div>

          {/* séparateur */}
          <span className="mx-2 text-[13px]">|</span>

          {/* messages */}
          <div className="flex items-center gap-2">
            <img src="/images/icons/icon-message.png" className="h-4 w-4" />
            <span className="text-[13px]">{task.comments?.length ?? 0}</span>
          </div>
        </div>
      </div>

      {/* RIGHT BLOCK */}
      <div className="flex flex-col items-start gap-4">
        <span
          className={`inline-block px-3 py-1 rounded-full text-[13px] font-medium ${statusClass}`}
        >
          {statusFR[task.status]}
        </span>

        <button className="bg-black text-white px-6 py-2 rounded-[10px] small-text shadow-md">
          Voir
        </button>
      </div>
    </div>
  );
}
