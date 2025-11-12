// app/projects/[id]/page.tsx
import { getProjectByIdAction } from "@/app/actions/getProfileAction";
import SingleProjectClient from "./SingleProjectClient";
import { notFound } from "next/navigation";

export default async function SingleProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = await getProjectByIdAction(id);

  if (!project) {
    return (
      <div className="max-w-7xl mx-auto px-8 py-6">
        <p className="text-red-500">Projet introuvable</p>
      </div>
    );
  }

  return <SingleProjectClient project={project} />;
}
