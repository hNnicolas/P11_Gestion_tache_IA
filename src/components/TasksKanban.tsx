"use client";

import { ITask } from "@/lib/prisma";

interface TasksKanbanProps {
  tasks: ITask[];
  onTaskView: (task: ITask) => void;
}

const STATUS_MAP: Record<ITask["status"], string> = {
  TODO: "À faire",
  IN_PROGRESS: "En cours",
  DONE: "Terminée",
  CANCELLED: "Annulée",
};

const BADGE_STYLES: Record<string, string> = {
  "À faire":
    "text-(--color-tag1)! bg-(--color-tag1-bg)! border border-(--color-tag1-bg)!",
  "En cours":
    "text-(--color-tag2)! bg-(--color-tag2-bg)! border border-(--color-tag2-bg)!",
  Terminée:
    "text-(--color-tag3)! bg-(--color-tag3-bg)! border border-(--color-tag3-bg)!",
  Annulée: "text-(--color-sous-texte)! bg-[#f3f4f6]! border border-[#f3f4f6]!",
};

const STATUS_ORDER = ["À faire", "En cours", "Terminée"] as const;

export default function TasksKanban({ tasks, onTaskView }: TasksKanbanProps) {
  const tasksByStatus = STATUS_ORDER.reduce((acc, status) => {
    acc[status] = tasks.filter((task) => STATUS_MAP[task.status] === status);
    return acc;
  }, {} as Record<string, ITask[]>);

  return (
    <div className="flex flex-col md:flex-row gap-6 overflow-x-auto">
      {STATUS_ORDER.map((status) => (
        <div
          key={status}
          className="flex-1 min-w-[300px] bg-[#FFFFFF] rounded-[10px] border border-[#E5E7EB] p-5 shadow-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-[15px] text-[#111827] mb-6 flex items-center gap-2">
              {status}
              <span className="text-[#111827] bg-[#E5E7EB] px-4 py-1 rounded-[15px] text-[12px] font-medium min-w-6 text-center">
                {tasksByStatus[status].length}
              </span>
            </h3>
          </div>

          <div className="flex flex-col gap-3">
            {tasksByStatus[status].length === 0 ? (
              <p className="text-(--color-sous-texte)! text-sm italic">
                Aucune tâche
              </p>
            ) : (
              tasksByStatus[status].map((task) => (
                <div
                  key={task.id}
                  className="bg-white rounded-xl border border-[#E5E7EB] p-6 min-h-[140px] shadow-[0_1px_3px_rgba(0,0,0,0.05)]"
                >
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-semibold text-[15px] text-[#111827] truncate flex-1 min-w-0">
                      {task.title}
                    </h4>
                    <span
                      className={`text-[12px] px-2.5 py-1 rounded-[10px] font-medium whitespace-nowrap shrink-0 ${BADGE_STYLES[status]}`}
                    >
                      {status}
                    </span>
                  </div>

                  <p className="text-(--color-sous-texte)! text-[13px] truncate mt-1">
                    {task.project?.description ?? "Aucune description"}
                  </p>

                  <div className="flex items-center gap-2 mt-3 text-[12px] text-(--color-sous-texte)! truncate">
                    <div className="flex items-center gap-1 truncate">
                      <img
                        src="/images/icons/icon-folder.png"
                        alt="Projet"
                        width={14}
                        height={14}
                        className="shrink-0"
                      />
                      <span className="truncate max-w-[90px]">
                        {task.project?.name ?? "Projet inconnu"}
                      </span>
                    </div>

                    <span className="mx-2 shrink-0">|</span>

                    {task.dueDate && (
                      <>
                        <div className="flex items-center gap-1 shrink-0">
                          <img
                            src="/images/icons/icon-calendar.png"
                            alt="Date"
                            width={14}
                            height={14}
                            className="shrink-0"
                          />
                          <span className="truncate">
                            {new Date(task.dueDate).toLocaleDateString(
                              "fr-FR",
                              {
                                day: "2-digit",
                                month: "short",
                              }
                            )}
                          </span>
                        </div>

                        <span className="mx-2 shrink-0">|</span>
                      </>
                    )}

                    <div className="flex items-center gap-1 shrink-0">
                      <img
                        src="/images/icons/icon-message.png"
                        alt="Commentaires"
                        width={14}
                        height={14}
                        className="shrink-0"
                      />
                      <span className="truncate">
                        {task.comments?.length ?? 0}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => onTaskView(task)}
                    className="bg-black text-white text-[15px] rounded-lg px-6 py-3 font-medium mt-5 hover:opacity-90 transition-all duration-200"
                  >
                    Voir
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
