"use client";

import { useRouter, useSearchParams } from "next/navigation";
import ProductCard from "./ProductCard";

type Categoria = { id: string; nome: string; slug: string };
type Produto = {
  id: string;
  nome: string;
  slug: string;
  preco: number;
  estoque: number;
  ativo: boolean;
  imagens: string[];
  categoria: Categoria;
};

export default function ProdutosGrid({
  produtos,
  categorias,
  categoriaSlug,
  subcategorias = [],
  subcategoriaSlug = null,
  busca: _busca,
  ordem,
  dir,
}: {
  produtos: Produto[];
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
  void _busca;

  function setFilter(key: string, value: string | null) {
    const p = new URLSearchParams(searchParams.toString());
    if (value) p.set(key, value);
    else p.delete(key);
    router.push(`/produtos?${p.toString()}`);
  }

  const mostraSubcategorias = categoriaSlug && subcategorias.length > 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-gray-600 text-sm font-medium">Categoria:</span>
          <select
            value={categoriaSlug ?? ""}
            onChange={(e) => {
              setFilter("categoria", e.target.value || null);
              setFilter("sub", null);
            }}
            className="ui-select"
          >
            <option value="">Todas</option>
            {categorias.map((c) => (
              <option key={c.id} value={c.slug}>
                {c.nome}
              </option>
            ))}
          </select>
        </div>
        <div className="flex gap-2 items-center">
          <span className="text-gray-600 text-sm font-medium">Ordenar:</span>
          <select
            value={`${ordem}-${dir}`}
            onChange={(e) => {
              const [o, d] = (e.target.value as string).split("-");
              const p = new URLSearchParams(searchParams.toString());
              p.set("ordem", o);
              p.set("dir", d);
              router.push(`/produtos?${p.toString()}`);
            }}
            className="ui-select"
          >
            <option value="nome-asc">Nome A–Z</option>
            <option value="nome-desc">Nome Z–A</option>
            <option value="preco-asc">Preço menor</option>
            <option value="preco-desc">Preço maior</option>
          </select>
        </div>
      </div>

      {mostraSubcategorias && (
        <div className="flex flex-wrap gap-2 items-center border-b border-gray-200 pb-4">
          <span className="text-gray-600 text-sm mr-1 font-medium">Subcategorias:</span>
          <button
            type="button"
            onClick={() => setFilter("sub", null)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
              !subcategoriaSlug
                ? "bg-yellow-500 text-gray-900"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300 cursor-pointer"
            }`}
          >
            Todos
          </button>
          {subcategorias.map((sub) => (
            <button
              key={sub.id}
              type="button"
              onClick={() => setFilter("sub", sub.slug)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                subcategoriaSlug === sub.slug
                  ? "bg-yellow-500 text-gray-900"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300 cursor-pointer"
              }`}
            >
              {sub.nome}
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {produtos.map((p) => (
          <ProductCard key={p.id} produto={p} />
        ))}
      </div>
      {produtos.length === 0 && (
        <p className="text-gray-500 text-center py-12">
          Nenhum produto encontrado.
        </p>
      )}
    </div>
  );
}
