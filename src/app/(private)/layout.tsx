import Header from "@/components/Header";
import Footer from "@/components/Footer";

// Layout pour les pages privées
// Affiche Header et Footer autour du contenu
export default function PrivateLayout({
  children,
  currentPage,
}: {
  children: React.ReactNode;
  currentPage?: string;
}) {
  return (
    <>
      {/* Passe la page courante pour gérer les couleurs actives */}
      <Header currentPage={currentPage} />
      <main>{children}</main>
      <Footer />
    </>
  );
}
