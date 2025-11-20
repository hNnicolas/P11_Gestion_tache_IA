"use client";

import React, { useEffect, useState } from "react";
import { ApiResponse } from "@/types";

interface ApiMessageProps {
  response: ApiResponse | null;
  duration?: number; // durée avant disparition (ms)
}

export default function ApiMessage({
  response,
  duration = 5000,
}: ApiMessageProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (response) {
      setVisible(true);
      const timer = setTimeout(() => setVisible(false), duration);
      return () => clearTimeout(timer);
    }
  }, [response, duration]);

  if (!response || !visible) return null;

  const bgColor = response.success ? "bg-green-100" : "bg-red-100";
  const textColor = response.success ? "text-green-800" : "text-red-800";
  const borderColor = response.success ? "border-green-400" : "border-red-400";

  return (
    <div
      className={`fixed top-5 right-5 max-w-xs w-full p-4 border-l-4 rounded shadow ${bgColor} ${borderColor} ${textColor} z-50`}
    >
      <p className="font-semibold">{response.success ? "Succès" : "Erreur"}</p>
      <p className="text-sm">{response.message}</p>
      {response.error && (
        <p className="text-xs mt-1 text-gray-600">{response.error}</p>
      )}
    </div>
  );
}
