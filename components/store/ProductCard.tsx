"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/context/CartContext";

type Produto = {
  id: string;
  nome: string;
  slug: string;
  preco: number;
  imagens: string[];
  estoque: number;
  ativo: boolean;
};

export default function ProductCard({
  produto,
  density = "comfortable",
}: {
  produto: Produto;
  /** Catálogo: cards menores para caber mais colunas no mobile */
  density?: "comfortable" | "compact";
}) {
  const { addItem } = useCart();
  const imagem = produto.imagens?.[0];

  function handleAdd(e: React.MouseEvent) {
    e.preventDefault();
    if (produto.estoque < 1) return;
    addItem({
      produtoId: produto.id,
      nome: produto.nome,
      slug: produto.slug,
      preco: produto.preco,
      imagem,
    });
  }

  const compact = density === "compact";

  return (
    <article
      className={`ui-card ui-card-hover flex min-h-0 min-w-0 flex-col overflow-hidden ${
        compact ? "rounded-lg sm:rounded-xl" : ""
      }`}
    >
      <Link
        href={`/produtos/${produto.slug}`}
        className="group block flex-1 focus-visible:outline-none"
        aria-label={`Ver detalhes de ${produto.nome}`}
      >
        <div
          className={`relative bg-gray-100 ${compact ? "aspect-[4/5] sm:aspect-square" : "aspect-square"}`}
        >
          {imagem ? (
            <Image
              src={imagem}
              alt={produto.nome}
              fill
              className="object-cover transition duration-300 group-hover:scale-[1.02]"
              sizes={
                compact
                  ? "(max-width: 359px) 50vw, (max-width: 639px) 33vw, (max-width: 1023px) 50vw, (max-width: 1279px) 25vw, 20vw"
                  : "(max-width: 479px) 100vw, (max-width: 1023px) 50vw, (max-width: 1279px) 33vw, 25vw"
              }
            />
          ) : (
            <div
              className={`flex h-full w-full items-center justify-center text-gray-400 ${compact ? "text-[10px] sm:text-xs" : ""}`}
            >
              Sem imagem
            </div>
          )}
        </div>
        <div
          className={
            compact
              ? "p-1.5 sm:p-3 lg:p-4"
              : "p-4"
          }
        >
          <h3
            className={`line-clamp-2 font-medium text-gray-900 ${
              compact
                ? "text-[11px] leading-snug sm:text-sm"
                : ""
            }`}
          >
            {produto.nome}
          </h3>
          <p
            className={`font-bold text-yellow-700 ${
              compact ? "mt-0.5 text-[11px] tabular-nums sm:mt-1 sm:text-base" : "mt-1"
            }`}
          >
            R$ {produto.preco.toFixed(2).replace(".", ",")}
          </p>
        </div>
      </Link>
      <div className={compact ? "p-1.5 pt-0 sm:p-3 sm:pt-0 lg:p-4 lg:pt-0" : "p-4 pt-0"}>
        <button
          type="button"
          onClick={handleAdd}
          disabled={produto.estoque < 1}
          className={`ui-btn ui-btn-primary w-full disabled:cursor-not-allowed disabled:opacity-50 ${
            compact
              ? "min-h-9 px-1 py-1.5 text-[10px] leading-tight sm:min-h-0 sm:px-3 sm:py-2 sm:text-sm sm:leading-normal md:min-h-11"
              : "min-h-11 py-2.5 sm:min-h-0 sm:py-2"
          }`}
        >
          {produto.estoque < 1 ? (
            "Indisponível"
          ) : compact ? (
            <>
              <span className="sm:hidden">Adicionar</span>
              <span className="hidden sm:inline">Adicionar ao carrinho</span>
            </>
          ) : (
            "Adicionar ao carrinho"
          )}
        </button>
      </div>
    </article>
  );
}
