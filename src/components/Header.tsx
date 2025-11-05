"use client";
import { useEffect, useState } from "react";

export default function Header() {
  const [user, setUser] = useState<{ name: string } | null>(null);

  useEffect(() => {
    // fetch côté client pour récupérer l'user si connecté
    fetch("/api/me") // route qui lit le JWT depuis le cookie et renvoie l'user
      .then((res) => res.json())
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
    <header className="w-full bg-white shadow-sm">
      <div className="flex items-center justify-between h-20 px-8 max-w-7xl mx-auto">
        <div className="shrink-0">
          <img
            src="/images/icons/logo.png"
            alt="Logo"
            className="h-10 w-auto"
          />
        </div>

        <nav className="flex items-center gap-[30px]">
          <a
            href="/"
            className="flex items-center gap-3 bg-black text-white! px-5 py-5 rounded-[7px] text-sm font-medium"
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
            className="flex items-center px-6 py-3 rounded-lg text-sm font-medium hover:bg-gray-50"
          >
            <img src="/images/icons/folder.png" alt="" className="h-5 w-5" />
            <span
              style={{ color: "var(--color-principal)", marginLeft: "10px" }}
            >
              Projets
            </span>
          </a>
        </nav>

        {user && (
          <a
            href="/profil"
            className="flex items-center justify-center w-12 h-12 rounded-full bg-[#FFE8D9] text-base font-semibold text-[#D2691E] cursor-pointer hover:opacity-80 transition"
          >
            {initials}
          </a>
        )}
      </div>
    </header>
  );
}
