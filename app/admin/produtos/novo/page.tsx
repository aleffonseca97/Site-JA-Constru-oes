import { prisma } from "@/lib/prisma";
import ProdutoForm from "@/components/dashboard/ProdutoForm";

export const dynamic = "force-dynamic";

export default async function NovoProdutoPage() {
  const categorias = await prisma.categoria.findMany({
    orderBy: { nome: "asc" },
  });
  return (
    <div>
      <h1 className="text-2xl font-bold text-yellow-400 mb-6">Novo produto</h1>
      <ProdutoForm categorias={categorias} />
    </div>
  );
}
