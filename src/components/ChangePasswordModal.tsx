"use client";

import { useState } from "react";
import { updatePasswordAction } from "@/app/actions/users/updatePasswordAction";

export default function ChangePasswordModal({
  onClose,
}: {
  onClose: () => void;
}) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const handleSubmit = async () => {
    try {
      await updatePasswordAction({ currentPassword, newPassword });

      alert("Mot de passe mis à jour !");
      onClose();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-lg w-[400px]">
        <h2 className="text-xl font-semibold mb-6">Changer le mot de passe</h2>

        <div className="flex flex-col gap-4">
          <div>
            <label className="small-text mb-1 block">Mot de passe actuel</label>
            <input
              type="password"
              className="w-full px-4 py-2 border rounded-lg"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>

          <div>
            <label className="small-text mb-1 block">
              Nouveau mot de passe
            </label>
            <input
              type="password"
              className="w-full px-4 py-2 border rounded-lg"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>

          <button
            onClick={handleSubmit}
            className="bg-black text-white py-2 rounded-lg hover:bg-[#1c1c1c]"
          >
            Modifier le mot de passe
          </button>

          <button
            onClick={onClose}
            className="mt-2 text-center text-sm underline text-gray-500 hover:text-gray-700"
          >
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
}
