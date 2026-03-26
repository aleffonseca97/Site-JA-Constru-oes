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

  const total = produtosComImagens.length;

  return (
    <div className="relative overflow-hidden border-b border-gray-200/90 bg-[color-mix(in_srgb,var(--background-alt)_45%,white)]">
      {/* Textura de grade + acento — coerente com a home */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.4]"
        aria-hidden
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(15,23,42,0.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(15,23,42,0.05) 1px, transparent 1px)
          `,
          backgroundSize: "24px 24px",
        }}
      />
      <div
        className="pointer-events-none absolute -left-20 top-1/2 h-80 w-80 -translate-y-1/2 rounded-full bg-[radial-gradient(circle_at_center,color-mix(in_srgb,var(--accent)_14%,transparent),transparent_68%)] blur-3xl"
        aria-hidden
      />

      <div className="relative mx-auto max-w-6xl pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] pb-[max(2.5rem,env(safe-area-inset-bottom))] pt-[max(2rem,env(safe-area-inset-top))] sm:px-6 sm:pb-12 sm:pt-10">
        <header className="mb-8 max-w-2xl category-card-reveal">
          <p className="mb-2 text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-gray-500 sm:text-xs">
            Catálogo
          </p>
          <h1 className="text-balance text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            <span className="text-[color-mix(in_srgb,var(--accent)_92%,#422006)]">
              Produtos
            </span>
            <span className="text-gray-900"> para sua obra</span>
          </h1>
          <p className="mt-3 text-pretty text-base leading-relaxed text-gray-600 sm:text-lg">
            Materiais selecionados com preço transparente. Filtre por categoria e
            encontre o que precisa com rapidez.
          </p>
          <p className="mt-4 inline-flex items-center gap-2 rounded-full border border-gray-200/90 bg-white/80 px-3 py-1.5 text-sm text-gray-700 shadow-sm backdrop-blur-sm">
            <span className="font-mono text-xs text-gray-500" aria-hidden>
              —
            </span>
            <span>
              {total === 1
                ? "1 item listado"
                : `${total} itens listados`}
            </span>
          </p>
        </header>

        <div className="highlight-card-reveal">
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
      </div>
    </div>
  );
}
