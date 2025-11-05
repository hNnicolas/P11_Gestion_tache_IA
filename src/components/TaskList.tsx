import TaskCard from "@/components/TaskCard";
import { ITask } from "@/lib/prisma";

// exemple de props / mock tasks — adapte à ton fetch réel
const mockTasks: ITask[] = new Array(6).fill(0).map((_, i) => ({
  id: `${i}`,
  title: "Nom de la tâche",
  description: "Description de la tâche",
  status: i === 1 ? "IN_PROGRESS" : "TODO",
  priority: "MEDIUM",
  dueDate: new Date(2025, 2, 9), // 9 mars
  projectId: "p1",
  creatorId: "u1",
  assignees: [],
  comments: new Array(2).fill({
    id: "c",
    content: "ok",
    author: { id: "u", email: "", name: "" },
    taskId: "",
  }),
}));

export default function TasksList({ tasks = mockTasks }: { tasks?: ITask[] }) {
  return (
    <div className="flex flex-col">
      {/* le design montre des cartes séparées par un espace et un contour léger */}
      {tasks.map((task) => (
        <div key={task.id} className="mb-4 last:mb-0">
          <TaskCard task={task} />
        </div>
      ))}
    </div>
  );
}
