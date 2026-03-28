import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { produtoComUrlsDeImagens, produtoImagensQuery } from "@/lib/produto-imagens";
import ProdutoForm from "@/components/dashboard/ProdutoForm";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Editar Produto — Admin",
};

export default async function EditarProdutoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const produto = await prisma.produto.findUnique({
    where: { id },
    include: { categoria: true, ...produtoImagensQuery },
  });
  if (!produto) notFound();

  const categorias = await prisma.categoria.findMany({
    orderBy: { nome: "asc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-yellow-400 mb-6">Editar produto</h1>
      <ProdutoForm categorias={categorias} produto={produtoComUrlsDeImagens(produto)} />
    </div>
  );
}
