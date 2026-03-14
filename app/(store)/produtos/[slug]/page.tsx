import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ProdutoDetail from "@/components/store/ProdutoDetail";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const produto = await prisma.produto.findUnique({
    where: { slug, ativo: true },
  });
  if (!produto) return { title: "Produto não encontrado" };
  return {
    title: `${produto.nome} — J.A Construções`,
    description: produto.descricao ?? `Compre ${produto.nome} na J.A Construções`,
  };
}

export default async function ProdutoPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const produto = await prisma.produto.findUnique({
    where: { slug, ativo: true },
    include: { categoria: true },
  });
  if (!produto) notFound();

  const produtoComImagens = {
    ...produto,
    imagens: JSON.parse(produto.imagens || "[]") as string[],
  };

  return <ProdutoDetail produto={produtoComImagens} />;
}
