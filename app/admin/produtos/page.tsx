import Link from "next/link";
import { prisma } from "@/lib/prisma";
import ProdutosTable from "@/components/dashboard/ProdutosTable";

export const dynamic = "force-dynamic";

export default async function AdminProdutosPage() {
  const produtos = await prisma.produto.findMany({
    orderBy: { nome: "asc" },
    include: { categoria: { select: { id: true, nome: true, slug: true } } },
  });
  const categorias = await prisma.categoria.findMany({
    orderBy: { nome: "asc" },
  });

  const produtosComImagens = produtos.map((p) => ({
    ...p,
    imagens: JSON.parse(p.imagens || "[]") as string[],
  }));

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
      <ProdutosTable produtos={produtosComImagens} categorias={categorias} />
    </div>
  );
}
