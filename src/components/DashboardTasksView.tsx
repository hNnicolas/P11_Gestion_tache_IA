"use client";

import { useState } from "react";
import TasksList from "@/components/TaskList";
import TasksKanban from "@/components/TasksKanban";
import EditTaskModal from "@/components/modals/EditTaskModal";
import { UserForClient } from "@/app/actions/users/getAllUsersAction";
import { ITask } from "@/lib/prisma";

type Props = {
  tasks: ITask[];
  project: any;
  currentUserId: string;
  view: "LIST" | "KANBAN";
  setView: (v: "LIST" | "KANBAN") => void;
  allUsers: UserForClient[];
};

export default function DashboardTasksView({
  tasks,
  project,
  currentUserId,
  view,
  allUsers,
}: Props) {
  const [selectedTask, setSelectedTask] = useState<ITask | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const openEditModal = (task: ITask) => {
    setSelectedTask(task);
    setIsEditOpen(true);
  };

  return (
    <div className="mt-6">
      {view === "LIST" ? (
        <TasksList tasks={tasks} onTaskView={openEditModal} />
      ) : (
        <TasksKanban tasks={tasks} onTaskView={openEditModal} />
      )}

      {selectedTask && isEditOpen && (
        <EditTaskModal
          isOpen={isEditOpen}
          setIsOpen={setIsEditOpen}
          task={selectedTask}
          project={project}
          currentUserId={currentUserId}
          onTaskUpdated={() => {}}
          allUsers={allUsers}
        />
      )}
    </div>
  );
}
