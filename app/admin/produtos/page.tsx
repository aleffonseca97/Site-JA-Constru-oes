import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { produtoComUrlsDeImagens, produtoImagensQuery } from "@/lib/produto-imagens";
import ProdutosTable from "@/components/dashboard/ProdutosTable";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Produtos — Admin",
};

export default async function AdminProdutosPage() {
  const produtos = await prisma.produto.findMany({
    orderBy: { nome: "asc" },
    include: {
      categoria: { select: { id: true, nome: true, slug: true } },
      ...produtoImagensQuery,
    },
  });

  const produtosComImagens = produtos.map((p) => produtoComUrlsDeImagens(p));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-yellow-400">Produtos</h1>
        <Link
          href="/admin/produtos/novo"
          className="px-4 py-2 rounded bg-yellow-500 text-black font-medium hover:bg-yellow-400 transition"
        >
          Novo produto
        </Link>
      </div>
      <ProdutosTable produtos={produtosComImagens} />
    </div>
  );
}
