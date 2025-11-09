// src/app/(private)/dashboard/page.tsx
import TasksList from "@/components/TaskList";
import { redirect } from "next/navigation";
import { getUser } from "@/app/actions/user";
import { getAssignedTasks } from "@/app/actions/dashboard";
import Link from "next/link";

export default async function DashboardPage() {
  // Récupération de l'utilisateur côté server
  const user = await getUser();

  // Si l'utilisateur n'est pas connecté, redirection vers login
  if (!user) {
    redirect("/login");
  }

  // Séparation du nom complet en prénom et nom
  const fullName = user.name || "";
  const [firstName, lastName] = fullName.split(" ");

  // Récupération directe des tâches assignées via Prisma
  const tasks = await getAssignedTasks();

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

            {/* bouton créer projet */}
            <Link
              href="/projets"
              className="bg-black text-white px-6 py-3 rounded-[10px] small-text font-medium shadow-sm"
            >
              + Créer un projet
            </Link>
          </div>
        </div>

        {/* LISTE / KANBAN */}
        <div className="flex items-center gap-4 mt-6">
          <div className="flex items-center gap-2 bg-[#FFE8D9] text-[#E48E59] rounded-lg px-4 py-2 cursor-pointer">
            <img src="/images/icons/icon-liste.png" className="h-5 w-5" />
            <span className="font-medium">Liste</span>
          </div>
          <div className="flex items-center gap-2 bg-[#FFFFFF] text-[#E48E59] rounded-lg px-4 py-2 cursor-pointer border border-[#E5E7EB] shadow-[0px_1px_2px_rgba(0,0,0,0.05)]">
            <img src="/images/icons/icon-kanban.png" className="h-5 w-5" />
            <span className="font-medium">Kanban</span>
          </div>
        </div>
      </section>

      {/* SECTION TÂCHES */}
      <section className="p-6 bg-white rounded-[20px] border border-[#E5E7EB] w-[1215px] shadow-sm mt-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="font-semibold text-lg">Mes tâches assignées</h2>
            <span className="block text-[--color-sous-texte] mt-1 mb-4 small-text">
              Par ordre de priorité
            </span>
          </div>

          {/* Search */}
          <div className="w-80">
            <div className="relative">
              <input
                type="text"
                placeholder="Rechercher une tâche"
                className="w-full h-10 border border-gray-200 bg-white rounded-lg py-2 pl-4 pr-10 outline-none focus:ring-1 focus:ring-[#DB7433]"
              />
              <img
                src="/images/icons/search.png"
                className="h-4 w-4 absolute right-3 top-1/2 -translate-y-1/2 opacity-30 pointer-events-none"
                alt="Recherche"
              />
            </div>
          </div>
        </div>

        {/* Liste des tâches */}
        <div className="mt-6">
          <TasksList tasks={tasks} />
        </div>
      </section>
    </div>
  );
}
