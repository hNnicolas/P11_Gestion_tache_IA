"use client";

import { useState, useEffect } from "react";
import TasksList from "@/components/TaskList";
import TasksKanban from "@/components/TasksKanban";
import EditTaskModal from "@/components/modals/EditTaskModal";
import { ITask } from "@/lib/prisma";

type Props = {
  tasks: ITask[];
  project: any;
  currentUserId: string;
  view: "LIST" | "KANBAN";
  setView: (v: "LIST" | "KANBAN") => void;
};

export default function DashboardTasksView({
  tasks,
  project,
  currentUserId,
  view,
  setView,
}: Props) {
  const [selectedTask, setSelectedTask] = useState<ITask | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [taskList, setTaskList] = useState<ITask[]>(tasks);

  // Synchronisation si search change
  useEffect(() => {
    setTaskList(tasks);
  }, [tasks]);

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
    <div className="mt-6">
      {view === "LIST" ? (
        <TasksList tasks={taskList} onTaskView={openEditModal} />
      ) : (
        <TasksKanban tasks={taskList} onTaskView={openEditModal} />
      )}

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
