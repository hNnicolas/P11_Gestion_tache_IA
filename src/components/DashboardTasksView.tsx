"use client";

import { useState } from "react";
import TasksList from "@/components/TaskList";
import TasksKanban from "@/components/TasksKanban";
import EditTaskModal from "@/components/modals/EditTaskModal";
import { ITask } from "@/lib/prisma";

type Props = {
  tasks: ITask[];
  project: any;
  currentUserId: string;
};

export default function DashboardTasksView({
  tasks,
  project,
  currentUserId,
}: Props) {
  const [view, setView] = useState<"LIST" | "KANBAN">("LIST");

  // ---------- Modal edit task ----------
  const [selectedTask, setSelectedTask] = useState<ITask | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [taskList, setTaskList] = useState<ITask[]>(tasks);

  const openEditModal = (task: ITask) => {
    setSelectedTask(task);
    setIsEditOpen(true);
  };

  const handleTaskUpdated = (updatedTask: ITask) => {
    setTaskList((prev) =>
      prev.map((t) => (t.id === updatedTask.id ? updatedTask : t))
    );
  };

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
          <TasksList tasks={taskList} onTaskView={openEditModal} />
        ) : (
          <TasksKanban tasks={taskList} onTaskView={openEditModal} />
        )}
      </div>

      {/* Modal Edit Task */}
      {selectedTask && isEditOpen && (
        <EditTaskModal
          isOpen={isEditOpen}
          setIsOpen={setIsEditOpen}
          task={selectedTask}
          project={project}
          currentUserId={currentUserId}
          onTaskUpdated={handleTaskUpdated}
        />
      )}
    </div>
  );
}
