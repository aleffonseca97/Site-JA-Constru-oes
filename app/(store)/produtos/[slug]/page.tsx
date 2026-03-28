import { cache } from "react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { produtoComUrlsDeImagens, produtoImagensQuery } from "@/lib/produto-imagens";
import ProdutoDetail from "@/components/store/ProdutoDetail";

export const revalidate = 60;

const getProdutoBySlug = cache(async (slug: string) => {
  return prisma.produto.findUnique({
    where: { slug, ativo: true },
    include: { categoria: true, ...produtoImagensQuery },
  });
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const produto = await getProdutoBySlug(slug);
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
  const produto = await getProdutoBySlug(slug);
  if (!produto) notFound();

  const p = produtoComUrlsDeImagens(produto);
  return <ProdutoDetail key={p.id} produto={p} />;
}
