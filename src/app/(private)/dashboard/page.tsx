import { redirect } from "next/navigation";
import { getUser } from "@/app/actions/users/user";
import {
  getAllUsersAction,
  UserForClient,
} from "@/app/actions/users/getAllUsersAction";
import { getAssignedTasksAction } from "@/app/actions/tasks/getAssignedTasksAction";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const userFromDb = await getUser();
  if (!userFromDb) redirect("/login");

  // 🔹 Normalisation du nom pour qu'il soit toujours string
  const user = {
    id: userFromDb.id,
    email: userFromDb.email,
    name: userFromDb.name ?? "Unknown",
  };

  const tasks = await getAssignedTasksAction();
  const allUsers: UserForClient[] = await getAllUsersAction();

  return <DashboardClient user={user} tasks={tasks} allUsers={allUsers} />;
}
