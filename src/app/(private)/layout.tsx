import { UserProvider } from "@/context/UserContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function PrivateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <UserProvider>
      <Header />
      <main>{children}</main>
      <Footer />
    </UserProvider>
  );
}
