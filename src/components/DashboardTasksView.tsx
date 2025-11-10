"use client";

import { useState } from "react";
import TasksList from "@/components/TaskList";
import TasksKanban from "@/components/TasksKanban";
import { ITask } from "@/lib/prisma";

export default function DashboardTasksView({ tasks }: { tasks: ITask[] }) {
  const [view, setView] = useState<"LIST" | "KANBAN">("LIST");

  return (
    <div>
      {/* Switch Liste / Kanban */}
      <div className="flex items-center gap-4 mt-6">
        <div
          className={`flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer ${
            view === "LIST"
              ? "bg-[#FFE8D9] text-[#E48E59]"
              : "bg-[#FFFFFF] text-[#E48E59] border border-[#E5E7EB] shadow-[0px_1px_2px_rgba(0,0,0,0.05)]"
          }`}
          onClick={() => setView("LIST")}
        >
          <img src="/images/icons/icon-liste.png" className="h-5 w-5" />
          <span className="font-medium">Liste</span>
        </div>

        <div
          className={`flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer ${
            view === "KANBAN"
              ? "bg-[#FFE8D9] text-[#E48E59]"
              : "bg-[#FFFFFF] text-[#E48E59] border border-[#E5E7EB] shadow-[0px_1px_2px_rgba(0,0,0,0.05)]"
          }`}
          onClick={() => setView("KANBAN")}
        >
          <img src="/images/icons/icon-kanban.png" className="h-5 w-5" />
          <span className="font-medium">Kanban</span>
        </div>
      </div>

      {/* Affichage conditionnel */}
      <div className="mt-6">
        {view === "LIST" ? (
          <TasksList tasks={tasks} />
        ) : (
          <TasksKanban tasks={tasks} />
        )}
      </div>
    </div>
  );
}
