import TaskCard from "@/components/TaskCard";
import { ITask } from "@/lib/prisma";

export default function TasksList({ tasks }: { tasks: ITask[] }) {
  if (!tasks || tasks.length === 0) {
    return (
      <div className="text-gray-400 text-sm italic">Aucune tâche assignée</div>
    );
  }

  return (
    <div className="flex flex-col">
      {tasks.map((task) => (
        <div key={task.id} className="mb-4 last:mb-0">
          <TaskCard task={task} />
        </div>
      ))}
    </div>
  );
}
