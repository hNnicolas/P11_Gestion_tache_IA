"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "../context/UserContext";

export default function Header() {
  const { user, setUser } = useUser();
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();

  const isDashboard = pathname === "/dashboard";
  const isProjects = pathname === "/projects";
  const isSingleProject =
    pathname.startsWith("/projects/") && pathname !== "/projects";
  const isProfil = pathname === "/profil";

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/auth/profile", {
          credentials: "include",
        });
        if (!res.ok) throw new Error("Non authentifié");
        const data = await res.json();
        setUser(data.user);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [setUser]);

  const initials = user?.name
    ? user.name
        .split(" ")
        .filter(Boolean)
        .map((n) => n[0].toUpperCase())
        .join("") || "?"
    : "?";

  const dashboardIcon =
    isProjects || isSingleProject || isProfil
      ? "/images/icons/menu-items-project.png"
      : "/images/icons/menu-items.png";

  const folderIcon =
    isDashboard || isProfil
      ? "/images/icons/folder.png"
      : "/images/icons/folder-white.png";

  const dashboardTextColor = isDashboard ? "text-white!" : "text-[#D3580B]!";
  const projectsTextColor =
    isProjects || isSingleProject ? "text-white!" : "text-[#D3580B]!";

  return (
    <header className="w-full shadow-sm bg-white transition-colors duration-200">
      <div className="flex items-center justify-between h-20 px-2 md:px-6 lg:px-10 xl:px-16 w-full max-w-full mx-auto">
        <div className="shrink-0">
          <Link href="/">
            <img
              src="/images/icons/logo.png"
              alt="Logo"
              className="h-10 w-auto ml-10"
            />
          </Link>
        </div>

        <nav className="flex items-center gap-6">
          <Link
            href="/dashboard"
            className={clsx(
              "flex items-center gap-3 px-5 py-3 rounded-[7px] text-sm font-medium transition-colors duration-200 hover:text-white",
              {
                "bg-[#0F0F0F]": isDashboard,
                "bg-white": !isDashboard && !isProfil,
              }
            )}
          >
            <img
              src={dashboardIcon}
              alt="Tableau de bord icon"
              className="h-5 w-5"
            />
            <span className={clsx(dashboardTextColor)}>Tableau de bord</span>
          </Link>

          <Link
            href="/projects"
            className={clsx(
              "flex items-center gap-2 px-10 py-3 rounded-[7px] text-sm font-medium transition-colors duration-200 hover:text-white",
              {
                "bg-[#0F0F0F]": isProjects || isSingleProject,
                "bg-white": !isProjects && !isSingleProject && !isProfil,
              }
            )}
          >
            <img src={folderIcon} alt="Projets icon" className="h-5 w-5" />
            <span className={clsx(projectsTextColor)}>Projets</span>
          </Link>
        </nav>

        {user && (
          <Link
            href="/profil"
            className="flex items-center justify-center w-12 h-12 mr-10 rounded-full text-base font-semibold cursor-pointer transition-all duration-200 hover:opacity-80 bg-[#FFE8D9] text-[#D3580B]"
          >
            {initials}
          </Link>
        )}

        {!user && !loading && (
          <Link
            href="/login"
            className="px-5 py-2 rounded-lg bg-black text-white hover:bg-[#1c1c1c] text-sm font-medium transition-colors duration-200"
          >
            Se connecter
          </Link>
        )}
      </div>
    </header>
  );
}
