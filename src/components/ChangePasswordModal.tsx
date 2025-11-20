"use client";

import { useState, useEffect, useRef } from "react";
import { updatePasswordAction } from "@/app/actions/users/updatePasswordAction";
import ApiMessage from "@/components/ApiMessage";
import { ApiResponse } from "@/types";

export default function ChangePasswordModal({
  onClose,
}: {
  onClose: () => void;
}) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [apiResponse, setApiResponse] = useState<ApiResponse | null>(null);

  const modalRef = useRef<HTMLDivElement | null>(null);
  const firstInputRef = useRef<HTMLInputElement | null>(null);

  // Focus initial sur le premier champ
  useEffect(() => {
    firstInputRef.current?.focus();
  }, []);

  // Fermer avec "ESC"
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  const handleSubmit = async () => {
    try {
      await updatePasswordAction({ currentPassword, newPassword });

      setApiResponse({
        success: true,
        message: "Mot de passe mis à jour !",
      });

      setTimeout(() => onClose(), 1000);
    } catch (err: any) {
      setApiResponse({
        success: false,
        message: "Erreur lors du changement de mot de passe",
        error: err.message,
      });
    }
  };

  return (
    <>
      <ApiMessage response={apiResponse} />

      {/* BACKDROP ACCESSIBLE */}
      <div
        className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
        role="presentation"
        aria-hidden="false"
      >
        {/* MODAL ACCESSIBLE */}
        <div
          ref={modalRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="changePasswordTitle"
          className="bg-white p-8 rounded-lg shadow-lg w-[400px] max-w-[90%] outline-none"
          tabIndex={-1}
        >
          <h2 id="changePasswordTitle" className="text-xl font-semibold mb-6">
            Changer le mot de passe
          </h2>

          <div className="flex flex-col gap-4">
            <div>
              <label
                htmlFor="currentPassword"
                className="small-text mb-1 block"
              >
                Mot de passe actuel
              </label>
              <input
                ref={firstInputRef}
                id="currentPassword"
                type="password"
                className="w-full px-4 py-2 border rounded-lg"
                aria-required="true"
                aria-label="Mot de passe actuel"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="newPassword" className="small-text mb-1 block">
                Nouveau mot de passe
              </label>
              <input
                id="newPassword"
                type="password"
                className="w-full px-4 py-2 border rounded-lg"
                aria-required="true"
                aria-label="Nouveau mot de passe"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>

            <button
              onClick={handleSubmit}
              className="bg-black text-white py-2 rounded-lg hover:bg-[#1c1c1c] focus:outline-none focus:ring-2 focus:ring-black"
              aria-label="Modifier le mot de passe"
            >
              Modifier le mot de passe
            </button>

            <button
              onClick={onClose}
              className="mt-2 text-center text-sm underline text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400"
              aria-label="Fermer la fenêtre de changement de mot de passe"
            >
              Annuler
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
