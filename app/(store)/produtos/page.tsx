import { prisma } from "@/lib/prisma";
import ProdutosGrid from "@/components/store/ProdutosGrid";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Produtos",
  description: "Catálogo de materiais de construção J.A Construções",
};

type SearchParams = { [key: string]: string | string[] | undefined };

export default async function ProdutosPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const categoriaSlug = typeof params.categoria === "string" ? params.categoria : null;
  const subcategoriaSlug = typeof params.sub === "string" ? params.sub : null;
  const q = typeof params.q === "string" ? params.q.trim() : null;
  const ordem = typeof params.ordem === "string" ? params.ordem : "nome";
  const dir = typeof params.dir === "string" ? params.dir : "asc";

  type SubCategoria = { id: string; nome: string; slug: string };

  // Categorias principais (sem pai) para o dropdown
  const categorias = await prisma.$queryRaw<
    { id: string; nome: string; slug: string }[]
  >`SELECT id, nome, slug FROM Categoria WHERE parentId IS NULL ORDER BY nome ASC`;

  const categoria = categoriaSlug
    ? await prisma.categoria.findUnique({
        where: { slug: categoriaSlug },
      })
    : null;

  const subcategorias: SubCategoria[] = categoria
    ? await prisma.$queryRaw<SubCategoria[]>`
        SELECT id, nome, slug FROM Categoria WHERE parentId = ${categoria.id} ORDER BY nome ASC
      `
    : [];

  const where: {
    ativo: boolean;
    categoriaId?: string | { in: string[] };
    nome?: { contains: string };
  } = {
    ativo: true,
  };
  if (categoria) {
    if (subcategoriaSlug && subcategorias.length > 0) {
      const sub = subcategorias.find((f: SubCategoria) => f.slug === subcategoriaSlug);
      if (sub) where.categoriaId = sub.id;
      else where.categoriaId = categoria.id;
    } else {
      const ids = [categoria.id, ...subcategorias.map((f: SubCategoria) => f.id)];
      where.categoriaId = { in: ids };
    }
  }
  if (q) where.nome = { contains: q };

  const orderBy = ordem === "preco" ? { preco: dir as "asc" | "desc" } : { nome: dir as "asc" | "desc" };

  const produtos = await prisma.produto.findMany({
    where,
    orderBy,
    include: { categoria: { select: { id: true, nome: true, slug: true } } },
  });

  const produtosComImagens = produtos.map((p) => ({
    ...p,
    imagens: JSON.parse(p.imagens || "[]") as string[],
  }));

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6"><span className="text-yellow-500">Produtos</span></h1>
      <ProdutosGrid
        produtos={produtosComImagens}
        categorias={categorias}
        categoriaSlug={categoriaSlug}
        subcategorias={subcategorias}
        subcategoriaSlug={subcategoriaSlug}
        busca={q}
        ordem={ordem}
        dir={dir}
      />
    </div>
  );
}
