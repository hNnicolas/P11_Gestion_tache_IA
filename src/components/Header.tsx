"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "../context/UserContext";

export default function Header() {
  const { user, setUser } = useUser();
  const [loading, setLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
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

  const dashboardTextColor = isDashboard ? "text-white!" : "text-[#A23E00]!";
  const projectsTextColor =
    isProjects || isSingleProject ? "text-white!" : "text-[#A23E00]!";

  return (
    <header
      className="w-full shadow-sm bg-white transition-colors duration-200"
      role="banner"
    >
      <div className="flex items-center justify-between h-20 px-2 md:px-6 lg:px-10 xl:px-16 w-full max-w-full mx-auto">
        <div className="shrink-0">
          <Link href="/" aria-label="Accueil">
            <img
              src="/images/icons/logo.png"
              alt="Logo Abricot : le O représenté par un abricot coupé en deux"
              className="h-10 w-auto ml-10"
            />
          </Link>
        </div>

        <nav
          className="hidden md:flex items-center gap-6"
          role="navigation"
          aria-label="Menu principal"
        >
          <Link
            href="/dashboard"
            className={clsx(
              "flex items-center gap-3 px-5 py-3 rounded-[7px] text-sm font-medium transition-colors duration-200 hover:text-white",
              {
                "bg-[#0F0F0F]": isDashboard,
                "bg-white": !isDashboard && !isProfil,
              }
            )}
            aria-current={isDashboard ? "page" : undefined}
          >
            <img
              src={dashboardIcon}
              alt=""
              aria-hidden="true"
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
            aria-current={isProjects || isSingleProject ? "page" : undefined}
          >
            <img
              src={folderIcon}
              alt=""
              aria-hidden="true"
              className="h-5 w-5"
            />
            <span className={clsx(projectsTextColor)}>Projets</span>
          </Link>
        </nav>

        <div className="flex items-center gap-4 mr-20">
          {user && (
            <Link
              href="/profil"
              className="flex items-center justify-center w-12 h-12 rounded-full text-base font-semibold cursor-pointer transition-all duration-200 hover:opacity-80 bg-[#FFE8D9] text-[#A23E00]"
              aria-label="Profil utilisateur"
            >
              {initials}
            </Link>
          )}

          {!user && !loading && (
            <Link
              href="/login"
              className="px-5 py-2 rounded-lg bg-black text-white hover:bg-[#1c1c1c] text-sm font-medium transition-colors duration-200"
              aria-label="Se connecter"
            >
              Se connecter
            </Link>
          )}
        </div>

        <button
          className="md:hidden px-3 py-2 rounded-md text-gray-700 hover:text-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#A23E00]"
          aria-label="Ouvrir le menu"
          aria-expanded={isMenuOpen}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <span className="sr-only">Ouvrir le menu</span>
          <div className="w-6 h-0.5 bg-black mb-1"></div>
          <div className="w-6 h-0.5 bg-black mb-1"></div>
          <div className="w-6 h-0.5 bg-black"></div>
        </button>
      </div>

      {isMenuOpen && (
        <nav
          className="flex flex-col md:hidden bg-white w-full px-4 pb-4"
          role="navigation"
          aria-label="Menu mobile"
        >
          <Link
            href="/dashboard"
            className={clsx(
              "flex items-center gap-3 px-5 py-3 rounded-[7px] text-sm font-medium mb-2 transition-colors duration-200 hover:text-white",
              {
                "bg-[#0F0F0F]": isDashboard,
                "bg-white": !isDashboard && !isProfil,
              }
            )}
          >
            <img
              src={dashboardIcon}
              alt=""
              aria-hidden="true"
              className="h-5 w-5"
            />
            <span className={clsx(dashboardTextColor)}>Tableau de bord</span>
          </Link>

          <Link
            href="/projects"
            className={clsx(
              "flex items-center gap-2 px-10 py-3 rounded-[7px] text-sm font-medium mb-2 transition-colors duration-200 hover:text-white",
              {
                "bg-[#0F0F0F]": isProjects || isSingleProject,
                "bg-white": !isProjects && !isSingleProject && !isProfil,
              }
            )}
          >
            <img
              src={folderIcon}
              alt=""
              aria-hidden="true"
              className="h-5 w-5"
            />
            <span className={clsx(projectsTextColor)}>Projets</span>
          </Link>
        </nav>
      )}
    </header>
  );
}
