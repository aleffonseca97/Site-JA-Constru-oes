"use client";

import { useRouter, useSearchParams } from "next/navigation";
import ProductCard from "./ProductCard";
import type { Categoria, ProdutoComCategoria } from "@/types";

export default function ProdutosGrid({
  produtos,
  categorias,
  categoriaSlug,
  subcategorias = [],
  subcategoriaSlug = null,
  busca,
  ordem,
  dir,
}: {
  produtos: ProdutoComCategoria[];
  categorias: Categoria[];
  categoriaSlug: string | null;
  subcategorias?: Categoria[];
  subcategoriaSlug?: string | null;
  busca: string | null;
  ordem: string;
  dir: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  function setFilter(key: string, value: string | null) {
    const p = new URLSearchParams(searchParams.toString());
    if (value) p.set(key, value);
    else p.delete(key);
    router.push(`/produtos?${p.toString()}`);
  }

  const mostraSubcategorias = categoriaSlug && subcategorias.length > 0;

  return (
    <div className="space-y-6 sm:space-y-8">
      {busca ? (
        <p className="text-sm text-gray-600">
          Resultados para{" "}
          <span className="font-medium text-gray-900">&ldquo;{busca}&rdquo;</span>
        </p>
      ) : null}

      <div className="rounded-2xl border border-gray-200/90 bg-white/90 p-4 shadow-sm backdrop-blur-sm sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end sm:gap-x-6 sm:gap-y-4">
          <label className="flex min-w-0 flex-1 flex-col gap-1.5 sm:min-w-[12rem] sm:max-w-sm">
            <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Categoria
            </span>
            <select
              value={categoriaSlug ?? ""}
              onChange={(e) => {
                const p = new URLSearchParams(searchParams.toString());
                const slug = e.target.value;
                if (slug) p.set("categoria", slug);
                else p.delete("categoria");
                p.delete("sub");
                router.push(`/produtos?${p.toString()}`);
              }}
              className="ui-select w-full min-h-11 min-w-0 py-2.5 text-base sm:min-h-0 sm:py-1.5 sm:text-sm"
            >
              <option value="">Todas</option>
              {categorias.map((c) => (
                <option key={c.id} value={c.slug}>
                  {c.nome}
                </option>
              ))}
            </select>
          </label>
          <label className="flex min-w-0 flex-1 flex-col gap-1.5 sm:min-w-[11rem] sm:max-w-xs">
            <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Ordenar
            </span>
            <select
              value={`${ordem}-${dir}`}
              onChange={(e) => {
                const [o, d] = (e.target.value as string).split("-");
                const p = new URLSearchParams(searchParams.toString());
                p.set("ordem", o);
                p.set("dir", d);
                router.push(`/produtos?${p.toString()}`);
              }}
              className="ui-select w-full min-h-11 min-w-0 py-2.5 text-base sm:min-h-0 sm:py-1.5 sm:text-sm"
            >
              <option value="nome-asc">Nome A–Z</option>
              <option value="nome-desc">Nome Z–A</option>
              <option value="preco-asc">Preço menor</option>
              <option value="preco-desc">Preço maior</option>
            </select>
          </label>
        </div>
      </div>

      {mostraSubcategorias && (
        <div className="border-b border-gray-200/90 pb-4 sm:pb-5">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500 sm:mb-3">
            Subcategorias
          </p>
          <nav
            className="-mx-4 flex snap-x snap-mandatory gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:thin] sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0 sm:snap-none"
            aria-label="Filtrar por subcategoria"
          >
            <button
              type="button"
              onClick={() => setFilter("sub", null)}
              className={`shrink-0 snap-start rounded-xl px-4 py-2.5 text-sm font-medium transition sm:py-1.5 ${
                !subcategoriaSlug
                  ? "bg-yellow-500 text-gray-900 shadow-sm"
                  : "cursor-pointer border border-gray-200 bg-gray-50 text-gray-800 hover:bg-gray-100"
              }`}
            >
              Todos
            </button>
            {subcategorias.map((sub) => (
              <button
                key={sub.id}
                type="button"
                onClick={() => setFilter("sub", sub.slug)}
                className={`shrink-0 snap-start rounded-xl px-4 py-2.5 text-sm font-medium transition sm:py-1.5 ${
                  subcategoriaSlug === sub.slug
                    ? "bg-yellow-500 text-gray-900 shadow-sm"
                    : "cursor-pointer border border-gray-200 bg-gray-50 text-gray-800 hover:bg-gray-100"
                }`}
              >
                {sub.nome}
              </button>
            ))}
          </nav>
        </div>
      )}

      <ul
        className="grid grid-cols-2 gap-2 min-[360px]:grid-cols-3 min-[360px]:gap-2 sm:grid-cols-2 sm:gap-4 md:grid-cols-3 md:gap-5 lg:grid-cols-4 lg:gap-5 xl:gap-6"
        aria-label="Lista de produtos"
      >
        {produtos.map((p, index) => (
          <li
            key={p.id}
            className="category-card-reveal min-w-0"
            style={{ animationDelay: `${Math.min(index * 42, 420)}ms` }}
          >
            <ProductCard produto={p} density="compact" />
          </li>
        ))}
      </ul>
      {produtos.length === 0 && (
        <p className="rounded-xl border border-dashed border-gray-300 bg-white/60 px-4 py-14 text-center text-gray-600">
          Nenhum produto encontrado com os filtros atuais.
        </p>
      )}
    </div>
  );
}
