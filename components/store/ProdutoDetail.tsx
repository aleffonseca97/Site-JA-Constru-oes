"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";

type Produto = {
  id: string;
  nome: string;
  slug: string;
  descricao: string | null;
  preco: number;
  estoque: number;
  imagens: string[];
  categoria: { id: string; nome: string; slug: string };
};

export default function ProdutoDetail({ produto }: { produto: Produto }) {
  const { addItem } = useCart();
  const [quantidade, setQuantidade] = useState(1);
  const [added, setAdded] = useState(false);
  const imagem = produto.imagens?.[0];

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
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <div className="ui-container py-8">
      <div className="mb-4">
        <Link href="/produtos" className="ui-link text-sm">
          ← Voltar aos produtos
        </Link>
      </div>
      <div className="grid md:grid-cols-2 gap-8">
        <div className="aspect-square relative bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
          {imagem ? (
            <Image
              src={imagem}
              alt={produto.nome}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              Sem imagem
            </div>
          )}
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            {produto.nome}
          </h1>
          <p className="text-yellow-700 text-2xl font-bold mb-4">
            R$ {produto.preco.toFixed(2).replace(".", ",")}
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
