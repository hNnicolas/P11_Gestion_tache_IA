"use client";

import { useState } from "react";
import CreateProjectModal from "@/components/modals/CreateProjectModal";
import DashboardTasksView from "@/components/DashboardTasksView";
import { UserForClient } from "@/app/actions/getAllUsersAction";

type Props = {
  user: { id: string; name: string; email: string };
  tasks: any[];
  allUsers: UserForClient[];
};

export default function DashboardClient({ user, tasks, allUsers }: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fullName = user.name || "";
  const [firstName, lastName] = fullName.split(" ");

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

            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-black text-white px-4 py-2 rounded-[10px] text-sm font-medium hover:opacity-90 transition"
            >
              + Créer un projet
            </button>
          </div>
        </div>
      </section>

      <section className="p-6 bg-white rounded-[20px] border border-[#E5E7EB] w-[1215px] shadow-sm mt-6">
        <h2 className="font-semibold text-lg">Mes tâches assignées</h2>
        <span className="block text-[--color-sous-texte] mt-1 mb-4 small-text">
          Par ordre de priorité
        </span>

        <DashboardTasksView tasks={tasks} />
      </section>

      {isModalOpen && (
        <CreateProjectModal
          isOpen={isModalOpen}
          setIsOpen={setIsModalOpen}
          currentUser={user}
          allUsers={allUsers}
          onProjectCreated={(newProject) => {
            console.log("Projet créé :", newProject);
          }}
        />
      )}
    </div>
  );
}
