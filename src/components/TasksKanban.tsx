"use client";

import { ITask } from "@/lib/prisma";

interface TasksKanbanProps {
  tasks: ITask[];
}

// Mapping backend -> frontend
const STATUS_MAP: Record<ITask["status"], string> = {
  TODO: "A Faire",
  IN_PROGRESS: "En cours",
  DONE: "Terminées",
  CANCELLED: "Annulée",
};

// Ordre d'affichage des colonnes
const STATUS_ORDER = ["A Faire", "En cours", "Terminées"] as const;

export default function TasksKanban({ tasks }: TasksKanbanProps) {
  // Grouper les tâches par status frontend
  const tasksByStatus = STATUS_ORDER.reduce((acc, status) => {
    acc[status] = tasks.filter((task) => STATUS_MAP[task.status] === status);
    return acc;
  }, {} as Record<string, ITask[]>);

  return (
    <div className="flex gap-4 overflow-x-auto">
      {STATUS_ORDER.map((status) => (
        <div
          key={status}
          className="flex-1 bg-[#F3F4F6] rounded-lg p-4 min-w-[250px]"
        >
          <h3 className="font-semibold text-sm mb-4">{status}</h3>
          {tasksByStatus[status].length === 0 ? (
            <p className="text-gray-400 text-sm italic">Aucune tâche</p>
          ) : (
            tasksByStatus[status].map((task) => (
              <div
                key={task.id}
                className="bg-white rounded-md p-3 mb-3 shadow-sm border border-gray-200"
              >
                <p className="font-medium">{task.title}</p>
                {task.priority && (
                  <span className="text-xs text-gray-500">
                    Priorité : {task.priority}
                  </span>
                )}
              </div>
            ))
          )}
        </div>
      ))}
    </div>
  );
}
