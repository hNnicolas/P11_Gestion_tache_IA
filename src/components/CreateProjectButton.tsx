"use client";

import { useState } from "react";
import CreateProjectModal from "./CreateProjectModal";

interface CreateProjectButtonProps {
  onProjectCreated: () => void;
}

export default function CreateProjectButton({
  onProjectCreated,
}: CreateProjectButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="text-white bg-black px-4 py-2 rounded-[10px] text-sm font-medium hover:opacity-90 transition"
      >
        + Créer un projet
      </button>

      <CreateProjectModal
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        onProjectCreated={onProjectCreated}
      />
    </>
  );
}
