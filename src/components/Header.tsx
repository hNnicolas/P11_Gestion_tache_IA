"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";

interface User {
  id: string;
  name: string;
  email: string;
}

interface HeaderProps {
  currentPage?: "dashboard" | "projects" | "profil";
}

export default function Header({ currentPage }: HeaderProps) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    fetch("/api/me", { credentials: "include" })
      .then((res) => (res.ok ? res.json() : Promise.reject("Non authentifié")))
      .then((data) => setUser(data.user))
      .catch(() => setUser(null));
  }, []);

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0].toUpperCase())
        .join("")
    : "?";

  return (
    <header
      className={clsx(
        "w-full shadow-sm",
        currentPage === "dashboard" || currentPage === "projects"
          ? "bg-[#0F0F0F]"
          : "bg-white"
      )}
    >
      <div className="flex items-center justify-between h-20 px-8 max-w-7xl mx-auto">
        {/* Logo */}
        <div className="shrink-0">
          <img
            src="/images/icons/logo.png"
            alt="Logo"
            className={clsx("h-10 w-auto", {
              "filter invert":
                currentPage === "dashboard" || currentPage === "projects",
            })}
          />
        </div>

        {/* Navigation */}
        <nav className="flex items-center gap-6">
          <a
            href="/dashboard"
            className={clsx(
              "flex items-center gap-3 px-5 py-3 rounded-[7px] text-sm font-medium",
              {
                "bg-[#0F0F0F] text-white":
                  currentPage === "dashboard" || currentPage === "projects",
              }
            )}
          >
            <img
              src="/images/icons/menu-items.png"
              alt="Tableau de bord"
              className="h-5 w-5"
            />
            Tableau de bord
          </a>

          <a
            href="/projects"
            className={clsx(
              "flex items-center gap-2 px-5 py-3 rounded-[7px] text-sm font-medium",
              {
                "bg-[#0F0F0F] text-white":
                  currentPage === "dashboard" || currentPage === "projects",
                "bg-white text-[#D3580B]": currentPage === "profil",
              }
            )}
          >
            <img
              src="/images/icons/folder.png"
              alt="Projets"
              className="h-5 w-5"
            />
            Projets
          </a>
        </nav>

        {/* Utilisateur */}
        {user && (
          <a
            href="/profil"
            className={clsx(
              "flex items-center justify-center w-12 h-12 rounded-full text-base font-semibold cursor-pointer transition",
              {
                "bg-[#FFE8D9] text-[#D2691E] hover:opacity-80":
                  currentPage === "dashboard" || currentPage === "projects",
                "bg-[#FFF2E8] text-[#D3580B] hover:opacity-80":
                  currentPage === "profil",
              }
            )}
          >
            {initials}
          </a>
        )}
      </div>
    </header>
  );
}
