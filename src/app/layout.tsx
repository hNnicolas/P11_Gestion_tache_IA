import "./globals.css";
import type { ReactNode } from "react";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <title>Abricot</title>
      <body>{children}</body>
    </html>
  );
}
