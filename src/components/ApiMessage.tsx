"use client";

import React, { useEffect, useState, useRef } from "react";
import { ApiResponse } from "@/types";

interface ApiMessageProps {
  response: ApiResponse | null;
  duration?: number;
}

export default function ApiMessage({
  response,
  duration = 5000,
}: ApiMessageProps) {
  const [visible, setVisible] = useState(false);
  const messageRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (response) {
      setVisible(true);

      messageRef.current?.focus();

      const timer = setTimeout(() => setVisible(false), duration);
      return () => clearTimeout(timer);
    }
  }, [response, duration]);

  if (!response || !visible) return null;

  const isSuccess = response.success;
  const bgColor = isSuccess ? "bg-green-100" : "bg-red-100";
  const textColor = isSuccess ? "text-green-800" : "text-red-800";
  const borderColor = isSuccess ? "border-green-400" : "border-red-400";

  return (
    <div
      ref={messageRef}
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
      tabIndex={0}
      className={`fixed top-5 right-5 max-w-xs w-full p-4 border-l-4 rounded shadow ${bgColor} ${borderColor} ${textColor} z-50 outline-none animate-fadeIn`}
      style={{ transition: "opacity 0.3s ease" }}
    >
      <div className="flex justify-between items-start gap-2">
        <div>
          <p className="font-semibold">{isSuccess ? "Succès" : "Erreur"}</p>
          <p className="text-sm">{response.message}</p>

          {response.error && (
            <p className="text-xs mt-1 text-gray-600">{response.error}</p>
          )}
        </div>

        <button
          aria-label="Fermer la notification"
          onClick={() => setVisible(false)}
          className="text-sm font-bold text-gray-600 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-400 rounded"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
