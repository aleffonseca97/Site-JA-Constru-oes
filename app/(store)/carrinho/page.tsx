import CarrinhoContent from "@/components/store/CarrinhoContent";

export const metadata = {
  title: "Carrinho — J.A Construções",
  description: "Seu carrinho de compras J.A Construções",
};

export default function CarrinhoPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6"><span className="text-yellow-500">Carrinho</span></h1>
      <CarrinhoContent />
    </div>
  );
}
