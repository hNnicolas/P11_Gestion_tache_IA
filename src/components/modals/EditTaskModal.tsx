"use client";

import { useState, useEffect, KeyboardEvent } from "react";
import Image from "next/image";
import { ITask } from "@/lib/prisma";
import { updateTaskAction } from "@/app/actions/tasks/updateTaskAction";
import { UserForClient } from "@/app/actions/users/getAllUsersAction";
import { eventBus } from "@/lib/eventBus";

type Props = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  task: ITask;
  project: any;
  currentUserId: string;
  onTaskUpdated: (task: ITask) => void;
  allUsers: UserForClient[];
};

const validStatuses = ["TODO", "IN_PROGRESS", "DONE", "CANCELLED"] as const;
type TaskStatus = (typeof validStatuses)[number];

const castStatus = (status: string): TaskStatus =>
  validStatuses.includes(status as TaskStatus)
    ? (status as TaskStatus)
    : "TODO";

export default function EditTaskModal({
  isOpen,
  setIsOpen,
  task,
  project,
  currentUserId,
  onTaskUpdated,
  allUsers,
}: Props) {
  const initialAssigneeIds = task.assignees?.map((a) => a.user.id) || [];

  const [form, setForm] = useState({
    title: task.title,
    description: task.description ?? "",
    dueDate: task.dueDate
      ? new Date(task.dueDate).toISOString().substring(0, 10)
      : "",
  });
  const [selectedContributorIds, setSelectedContributorIds] =
    useState<string[]>(initialAssigneeIds);
  const [selectedStatus, setSelectedStatus] = useState<TaskStatus>(
    castStatus(task.status)
  );
  const [showContributors, setShowContributors] = useState(false);
  const [loading, setLoading] = useState(false);

  const statusLabelToStatus: Record<string, TaskStatus> = {
    "A faire": "TODO",
    "En cours": "IN_PROGRESS",
    Terminées: "DONE",
    Annulée: "CANCELLED",
  };

  const statusOptions = [
    { label: "A faire", bg: "var(--color-tag1-bg)", text: "var(--color-tag1)" },
    {
      label: "En cours",
      bg: "var(--color-tag2-bg)",
      text: "var(--color-tag2)",
    },
    {
      label: "Terminées",
      bg: "var(--color-tag3-bg)",
      text: "var(--color-tag3)",
    },
  ];

  useEffect(() => {
    if (isOpen) {
      const assignees = task.assignees?.map((a) => a.user) || [];
      setForm({
        title: task.title,
        description: task.description ?? "",
        dueDate: task.dueDate
          ? new Date(task.dueDate).toISOString().substring(0, 10)
          : "",
      });
      setSelectedContributorIds(assignees.map((u) => u.id));
      setSelectedStatus(castStatus(task.status));
    }
  }, [isOpen, task]);

  const toggleContributor = (userId: string) => {
    setSelectedContributorIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const updatedTaskResponse = await updateTaskAction(
        task.projectId,
        task.id,
        {
          title: form.title,
          description: form.description,
          dueDate: form.dueDate
            ? new Date(form.dueDate).toISOString()
            : undefined,
          status: selectedStatus,
          assigneeIds: selectedContributorIds,
        }
      );

      if (!updatedTaskResponse.success || !updatedTaskResponse.data) {
        throw new Error(updatedTaskResponse.message);
      }

      const updatedTaskRaw = updatedTaskResponse.data;

      const updatedTask = {
        ...updatedTaskRaw,
        status: castStatus(updatedTaskRaw.status),
      };

      onTaskUpdated(updatedTask);

      eventBus.emit("taskUpdated", updatedTask);

      setIsOpen(false);
    } catch (err) {
      console.error("Erreur modification tâche :", err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDownStatus = (
    e: KeyboardEvent<HTMLSpanElement>,
    status: TaskStatus
  ) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setSelectedStatus(status);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-task-title"
      tabIndex={-1}
      className="fixed inset-0 flex items-center justify-center bg-black/40 z-50 p-2"
    >
      <div className="bg-white rounded-xl p-6 w-full max-w-md relative focus:outline-none">
        <div className="flex justify-between items-center mb-4">
          <h2 id="edit-task-title" className="text-xl font-bold" tabIndex={0}>
            Modifier
          </h2>
          <button
            onClick={() => setIsOpen(false)}
            aria-label="Fermer la modale"
          >
            <Image
              src="/images/icons/close-modal.png"
              width={20}
              height={20}
              alt="Fermer"
              style={{ width: "auto", height: "auto" }}
            />
          </button>
        </div>

        {/* Form */}
        <div className="flex flex-col gap-3">
          <label htmlFor="task-title" className="text-sm font-medium">
            Titre
          </label>
          <input
            id="task-title"
            name="title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            required
            aria-required="true"
          />

          <label htmlFor="task-description" className="text-sm font-medium">
            Description
          </label>
          <textarea
            id="task-description"
            name="description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          />

          <label htmlFor="task-dueDate" className="text-sm font-medium">
            Échéance
          </label>
          <input
            type="date"
            id="task-dueDate"
            name="dueDate"
            value={form.dueDate}
            onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          />

          <label className="text-sm font-medium mt-3 block">
            Contributeurs
          </label>
          <div className="relative w-full mb-5">
            <div
              role="button"
              tabIndex={0}
              aria-label="Sélectionner des contributeurs"
              aria-haspopup="listbox"
              aria-expanded={showContributors}
              onClick={() => setShowContributors(!showContributors)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setShowContributors(!showContributors);
                }
              }}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full pr-8 cursor-pointer"
              style={{ color: "var(--color-sous-texte)" }}
            >
              {`${selectedContributorIds.length} contributeurs`}
            </div>

            {showContributors && (
              <ul
                role="listbox"
                aria-label="Liste des contributeurs"
                className="mt-2 border border-gray-200 rounded-md bg-white shadow-sm p-2 max-h-40 overflow-auto text-sm text-gray-700 absolute w-full z-10"
              >
                {allUsers.map((user) => (
                  <li
                    key={user.id}
                    role="option"
                    aria-selected={selectedContributorIds.includes(user.id)}
                    tabIndex={0}
                    className={`px-2 py-1 hover:bg-gray-100 cursor-pointer ${
                      user.id === project?.owner?.id ? "font-semibold" : ""
                    }`}
                    onClick={() => toggleContributor(user.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        toggleContributor(user.id);
                      }
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={selectedContributorIds.includes(user.id)}
                      readOnly
                      className="mr-2"
                      aria-hidden="true"
                    />
                    {user.name}{" "}
                    {user.id === project?.owner?.id && "(Propriétaire)"}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <label className="text-sm font-medium mt-3 block">Statut :</label>
          <div className="flex gap-2 mt-1">
            {statusOptions.map((status) => (
              <span
                key={status.label}
                role="radio"
                aria-checked={
                  selectedStatus === statusLabelToStatus[status.label]
                }
                tabIndex={0}
                className={`px-2 py-1 rounded-full text-sm font-medium cursor-pointer ${
                  selectedStatus === statusLabelToStatus[status.label]
                    ? "ring-2"
                    : ""
                }`}
                style={{ backgroundColor: status.bg, color: status.text }}
                onClick={() =>
                  setSelectedStatus(statusLabelToStatus[status.label])
                }
                onKeyDown={(e) =>
                  handleKeyDownStatus(e, statusLabelToStatus[status.label])
                }
              >
                {status.label}
              </span>
            ))}
          </div>
        </div>

        <div className="flex justify-start mt-5">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="text-white bg-black rounded-[10px] px-4 py-2 text-sm font-medium hover:opacity-90"
            aria-label="Enregistrer les modifications"
            aria-busy={loading}
            tabIndex={0}
          >
            {loading ? "Enregistrement..." : "Enregistrer"}
          </button>
        </div>
      </div>
    </div>
  );
}
