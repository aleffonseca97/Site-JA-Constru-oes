import Header from "@/components/store/Header";
import Footer from "@/components/store/Footer";

export const metadata = {
  title: {
    default: "J.A Construções — Materiais de Construção",
    template: "%s | J.A Construções",
  },
  description: "Loja de materiais de construção. Cimento, ferragens, tintas e mais.",
};

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
