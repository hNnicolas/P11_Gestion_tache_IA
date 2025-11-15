"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { ITask } from "@/lib/prisma";
import { updateTaskAction } from "@/app/actions/tasks/updateTaskAction";

type Props = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  task: ITask;
  project: any;
  currentUserId: string;
  onTaskUpdated: (task: ITask) => void;
};

const validStatuses = ["TODO", "IN_PROGRESS", "DONE", "CANCELLED"] as const;
type TaskStatus = (typeof validStatuses)[number];
const validPriorities = ["LOW", "MEDIUM", "HIGH", "URGENT"] as const;
type TaskPriority = (typeof validPriorities)[number];

const castStatus = (status: string): TaskStatus =>
  validStatuses.includes(status as TaskStatus)
    ? (status as TaskStatus)
    : "TODO";

const castPriority = (priority: string | null | undefined): TaskPriority =>
  priority && validPriorities.includes(priority as TaskPriority)
    ? (priority as TaskPriority)
    : "LOW";

export default function EditTaskModal({
  isOpen,
  setIsOpen,
  task,
  project,
  currentUserId,
  onTaskUpdated,
}: Props) {
  const initialAssignee = task.assignees?.[0]?.user
    ? { id: task.assignees[0].user.id, name: task.assignees[0].user.name ?? "" }
    : { id: "", name: "" };

  const [form, setForm] = useState({
    title: task.title,
    description: task.description ?? "",
    dueDate: task.dueDate
      ? new Date(task.dueDate).toISOString().substring(0, 10)
      : "",
    assigneeName: initialAssignee.name,
  });

  const [selectedContributorId, setSelectedContributorId] = useState<string>(
    initialAssignee.id
  );
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
      const a = task.assignees?.[0]?.user;
      setForm({
        title: task.title,
        description: task.description ?? "",
        dueDate: task.dueDate
          ? new Date(task.dueDate).toISOString().substring(0, 10)
          : "",
        assigneeName: a?.name ?? "",
      });
      setSelectedContributorId(a?.id ?? "");
      setSelectedStatus(castStatus(task.status));
    }
  }, [isOpen, task]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    if (isOpen) window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const updatedTaskRaw = await updateTaskAction(
        currentUserId,
        task.projectId,
        task.id,
        {
          title: form.title,
          description: form.description,
          dueDate: form.dueDate
            ? new Date(form.dueDate).toISOString()
            : undefined,
          status: selectedStatus,
          assigneeIds: selectedContributorId ? [selectedContributorId] : [],
        }
      );

      const updatedTask: ITask = {
        ...updatedTaskRaw,
        status: castStatus(updatedTaskRaw.status),
        priority: castPriority(updatedTaskRaw.priority),
      };

      onTaskUpdated(updatedTask);
      setIsOpen(false);
      console.log("✅ Tâche mise à jour :", updatedTask);
    } catch (err) {
      console.error("❌ Erreur modification tâche :", err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md relative">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Modifier la tâche</h2>
          <button onClick={() => setIsOpen(false)}>
            <Image
              src="/images/icons/close-modal.png"
              width={20}
              height={20}
              alt="Fermer"
            />
          </button>
        </div>

        {/* Form */}
        <div className="flex flex-col gap-3">
          <label className="text-sm font-medium">Titre*</label>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            required
          />

          <label className="text-sm font-medium">Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          />

          <label className="text-sm font-medium">Échéance</label>
          <input
            type="date"
            name="dueDate"
            value={form.dueDate}
            onChange={handleChange}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          />

          {/* Assignee dropdown */}
          <div className="relative w-full mb-5">
            <input
              type="text"
              value={
                form.assigneeName ||
                (project?.members?.length !== undefined
                  ? `${project.members.length + 1} Contributeurs`
                  : "0 Contributeurs")
              }
              readOnly
              onClick={() => setShowContributors(!showContributors)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full pr-8 cursor-pointer"
              style={{ color: "var(--color-sous-texte)" }}
            />

            {/* Flèche */}
            <div className="absolute inset-y-0 right-2 flex items-center">
              <svg
                className={`w-4 h-4 text-gray-500 transition-transform ${
                  showContributors ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>

            {/* Dropdown */}
            {showContributors && (
              <ul className="mt-2 border border-gray-200 rounded-md bg-white shadow-sm p-2 max-h-40 overflow-auto text-sm text-gray-700 absolute w-full z-10">
                {project?.owner && (
                  <li
                    className="font-semibold px-2 py-1 hover:bg-gray-100 cursor-pointer"
                    onClick={() => {
                      setForm({ ...form, assigneeName: project.owner.name });
                      setSelectedContributorId(project.owner.id);
                      setShowContributors(false);
                    }}
                  >
                    {project.owner.name} (Propriétaire)
                  </li>
                )}

                {project?.members?.length ? (
                  project.members.map((member: any) => (
                    <li
                      key={member.user.id}
                      className="px-2 py-1 hover:bg-gray-100 cursor-pointer"
                      onClick={() => {
                        setForm({ ...form, assigneeName: member.user.name });
                        setSelectedContributorId(member.user.id);
                        setShowContributors(false);
                      }}
                    >
                      {member.user.name}
                    </li>
                  ))
                ) : (
                  <li className="px-2 py-1 text-gray-400">
                    Aucun contributeur
                  </li>
                )}
              </ul>
            )}
          </div>

          {/* Status */}
          <label className="text-sm font-medium mt-3 block">Statut :</label>
          <div className="flex gap-2 mt-1">
            {statusOptions.map((status) => (
              <span
                key={status.label}
                className={`px-2 py-1 rounded-full text-sm font-medium cursor-pointer ${
                  selectedStatus === statusLabelToStatus[status.label]
                    ? "ring-2"
                    : ""
                }`}
                style={{ backgroundColor: status.bg, color: status.text }}
                onClick={() =>
                  setSelectedStatus(statusLabelToStatus[status.label])
                }
              >
                {status.label}
              </span>
            ))}
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-start mt-5">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="text-white bg-black rounded-[10px] px-4 py-2 text-sm font-medium hover:opacity-90"
          >
            {loading ? "Enregistrement..." : "Enregistrer"}
          </button>
        </div>
      </div>
    </div>
  );
}
