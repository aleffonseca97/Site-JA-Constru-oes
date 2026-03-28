"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { formatCurrency } from "@/lib/utils";
import type { ProdutoDetalhado } from "@/types";

export default function ProdutoDetail({ produto }: { produto: ProdutoDetalhado }) {
  const { addItem } = useCart();
  const [quantidade, setQuantidade] = useState(1);
  const [added, setAdded] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const imagens = produto.imagens?.filter(Boolean) ?? [];
  const imagem = imagens[0];
  const [idxAtivo, setIdxAtivo] = useState(0);
  const idxSeguro = Math.min(idxAtivo, Math.max(0, imagens.length - 1));
  const srcPrincipal = imagens[idxSeguro];

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  function handleAdd() {
    if (produto.estoque < 1) return;
    const qty = Math.min(Math.max(1, quantidade), produto.estoque);
    addItem(
      {
        produtoId: produto.id,
        nome: produto.nome,
        slug: produto.slug,
        preco: produto.preco,
        imagem,
      },
      qty
    );
    setAdded(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setAdded(false), 2000);
  }

  return (
    <div className="ui-container py-8">
      <div className="mb-4">
        <Link href="/produtos" className="ui-link text-sm">
          ← Voltar aos produtos
        </Link>
      </div>
      <div className="grid md:grid-cols-2 gap-8">
        <div className="flex flex-col gap-3 sm:gap-4">
          <div className="group relative aspect-square w-full overflow-hidden rounded-xl border border-gray-200/90 bg-gradient-to-br from-gray-50 to-gray-100 shadow-[0_1px_0_rgba(0,0,0,0.04)]">
            {srcPrincipal ? (
              <Image
                key={srcPrincipal}
                src={srcPrincipal}
                alt={`${produto.nome} — imagem ${idxSeguro + 1} de ${imagens.length}`}
                fill
                className="object-cover transition-[transform,opacity] duration-300 ease-out group-hover:scale-[1.02]"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-gray-400">
                Sem imagem
              </div>
            )}
            {imagens.length > 1 && (
              <div
                className="pointer-events-none absolute bottom-3 left-3 rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-medium tracking-wide text-white backdrop-blur-sm md:bottom-4 md:left-4"
                aria-hidden
              >
                {idxSeguro + 1} / {imagens.length}
              </div>
            )}
          </div>

          {imagens.length > 1 && (
            <div
              className="flex w-full snap-x snap-mandatory gap-2 overflow-x-auto overflow-y-hidden scroll-smooth pb-1 [-ms-overflow-style:none] [scrollbar-width:none] md:snap-none md:flex-wrap md:overflow-x-visible [&::-webkit-scrollbar]:hidden"
              role="tablist"
              aria-label="Miniaturas do produto"
            >
              {imagens.map((url, i) => {
                const ativo = i === idxSeguro;
                return (
                  <button
                    key={`${url}-${i}`}
                    type="button"
                    role="tab"
                    aria-selected={ativo}
                    aria-label={`Ver imagem ${i + 1} de ${imagens.length}`}
                    onClick={() => setIdxAtivo(i)}
                    className={[
                      "relative h-16 w-16 shrink-0 snap-start overflow-hidden rounded-lg border-2 transition-all duration-200 sm:h-[4.5rem] sm:w-[4.5rem] md:h-20 md:w-20",
                      "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-600",
                      ativo
                        ? "border-yellow-600 shadow-md ring-2 ring-yellow-600/25"
                        : "border-gray-200 opacity-90 hover:border-gray-300 hover:opacity-100",
                    ].join(" ")}
                  >
                    <Image
                      src={url}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </button>
                );
              })}
            </div>
          )}
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            {produto.nome}
          </h1>
          <p className="text-yellow-700 text-2xl font-bold mb-4">
            {formatCurrency(produto.preco)}
          </p>
          {produto.descricao && (
            <p className="text-gray-600 mb-6 whitespace-pre-wrap">
              {produto.descricao}
            </p>
          )}
          <p className="text-gray-500 text-sm mb-4">
            Categoria: {produto.categoria.nome}
          </p>
          {produto.estoque > 0 ? (
            <>
              <div className="flex items-center gap-4 mb-4">
                <label htmlFor="qty" className="text-gray-700 font-medium">
                  Quantidade:
                </label>
                <input
                  id="qty"
                  type="number"
                  min={1}
                  max={produto.estoque}
                  value={quantidade}
                  onChange={(e) =>
                    setQuantidade(parseInt(e.target.value, 10) || 1)
                  }
                  className="ui-input w-20 px-3 py-2"
                />
                <span className="text-gray-500 text-sm">
                  ({produto.estoque} em estoque)
                </span>
              </div>
              <button
                type="button"
                onClick={handleAdd}
                className="ui-btn ui-btn-primary w-full md:w-auto px-6 py-3"
              >
                {added ? "Adicionado ao carrinho!" : "Adicionar ao carrinho"}
              </button>
            </>
          ) : (
            <p className="text-gray-500">Produto indisponível no momento.</p>
          )}
        </div>
      </div>
    </div>
  );
}
