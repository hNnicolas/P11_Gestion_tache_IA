import "./globals.css";
import type { ReactNode } from "react";

export const metadata = {
  title: "Abricot",
  icons: [{ rel: "icon", url: "/logo.png" }],
  description: "Gestion de projets Abricot",
};

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
