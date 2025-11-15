import "./globals.css";
import type { ReactNode } from "react";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <title>Abricot</title>
      <link rel="icon" href="/logo.png" />
      <body>{children}</body>
    </html>
  );
}
