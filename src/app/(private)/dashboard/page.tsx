import { redirect } from "next/navigation";
import Link from "next/link";
import { getUser } from "@/app/actions/user";
import DashboardTasksView from "@/components/DashboardTasksView";
import { getAssignedTasksAction } from "@/app/actions/getAssignedTasksAction";

export default async function DashboardPage() {
  const user = await getUser();

  if (!user) {
    redirect("/login");
  }

  const fullName = user.name || "";
  const [firstName, lastName] = fullName.split(" ");

  const tasks = await getAssignedTasksAction();

  return (
    <div className="flex flex-col items-center bg-[#F9FAFB] min-h-screen py-10 pb-20">
      <section className="w-[1215px]">
        <div className="flex items-center justify-between">
          <div className="flex items-start justify-between w-full">
            <div>
              <h1 className="text-[--color-principal] font-semibold text-2xl">
                Tableau de bord
              </h1>
              <p className="small-text mt-4 text-[--color-sous-texte]">
                Bonjour {firstName} {lastName}, voici un aperçu de vos projets
                et tâches
              </p>
            </div>

            <Link
              href="/projects"
              className="bg-black text-white! px-6 py-3 rounded-[10px] small-text font-medium shadow-sm"
            >
              + Créer un projet
            </Link>
          </div>
        </div>
      </section>

      {/* SECTION TÂCHES avec switch Liste/Kanban */}
      <section className="p-6 bg-white rounded-[20px] border border-[#E5E7EB] w-[1215px] shadow-sm mt-6">
        <h2 className="font-semibold text-lg">Mes tâches assignées</h2>
        <span className="block text-[--color-sous-texte] mt-1 mb-4 small-text">
          Par ordre de priorité
        </span>

        <DashboardTasksView tasks={tasks} />
      </section>
    </div>
  );
}
