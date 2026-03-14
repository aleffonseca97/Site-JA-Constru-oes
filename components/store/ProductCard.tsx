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

export default function ProductCard({ produto }: { produto: Produto }) {
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

  return (
    <article className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md hover:border-yellow-400 transition flex flex-col">
      <Link href={`/produtos/${produto.slug}`} className="block flex-1">
        <div className="aspect-square relative bg-gray-100">
          {imagem ? (
            <Image
              src={imagem}
              alt={produto.nome}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              Sem imagem
            </div>
          )}
        </div>
        <div className="p-4">
          <h3 className="font-medium text-gray-900 line-clamp-2">{produto.nome}</h3>
          <p className="text-yellow-600 font-bold mt-1">
            R$ {produto.preco.toFixed(2).replace(".", ",")}
          </p>
        </div>
      </Link>
      <div className="p-4 pt-0">
        <button
          type="button"
          onClick={handleAdd}
          disabled={produto.estoque < 1}
          className="w-full py-2 rounded-lg bg-yellow-500 text-gray-900 font-medium hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {produto.estoque < 1 ? "Indisponível" : "Adicionar ao carrinho"}
        </button>
      </div>
    </article>
  );
}
