import { getUser } from "@/app/actions/user";
import { redirect } from "next/navigation";
import TasksList from "@/components/TaskList";

export default async function DashboardPage() {
  const user = await getUser();

  if (!user) {
    redirect("/login");
  }

  const fullName = user.name || "";
  const [firstName, lastName] = fullName.split(" ");

  return (
    <div className="flex flex-col items-center bg-[#F9FAFB] min-h-screen py-10 pb-20">
      <section className="w-[1215px]">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[--color-principal] font-semibold text-2xl">
              Tableau de bord
            </h1>
            <p className="small-text mt-4 text-[--color-sous-texte]">
              Bonjour {firstName} {lastName}, voici un aperçu de vos projets et
              tâches
            </p>
          </div>
        </div>{" "}
        {/* <<< ICI */}
        {/* LISTE / KANBAN sous le paragraphe, aligné à GAUCHE */}
        <div className="flex items-center gap-4 mt-6">
          {/* Liste */}
          <div className="flex items-center gap-2 bg-[#FFE8D9] text-[#E48E59] rounded-lg px-4 py-2 cursor-pointer">
            <img src="/images/icons/icon-liste.png" className="h-5 w-5" />
            <span className="font-medium">Liste</span>
          </div>

          {/* Kanban */}
          <div className="flex items-center gap-2 bg-[#FFFFFF] text-[#E48E59] rounded-lg px-4 py-2 cursor-pointer border border-[#E5E7EB] shadow-[0px_1px_2px_rgba(0,0,0,0.05)]">
            <img src="/images/icons/icon-kanban.png" className="h-5 w-5" />
            <span className="font-medium">Kanban</span>
          </div>
        </div>
      </section>

      {/* SECTION 2 - card contenant la liste (maquette) */}
      <section className="p-6 bg-white rounded-[20px] border border-[#E5E7EB] w-[1215px] shadow-sm mt-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="font-semibold text-lg">Mes tâches assignées</h2>
            <span className="block text-[--color-sous-texte] mt-1 mb-4 small-text">
              Par ordre de priorité
            </span>
          </div>

          {/* search aligné à droite (maquette) */}
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

        {/* LISTE DES TASKS */}
        <div className="mt-6">
          <TasksList />
        </div>
      </section>
    </div>
  );
}
