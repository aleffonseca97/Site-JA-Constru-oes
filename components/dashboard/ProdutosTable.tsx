"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

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

export default function ProdutosTable({
  produtos,
  categorias,
}: {
  produtos: Produto[];
  categorias: Categoria[];
}) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  async function handleDelete(id: string) {
    if (confirmId !== id) {
      setConfirmId(id);
      return;
    }
    setDeletingId(id);
    try {
      const res = await fetch(`/api/produtos/${id}`, { method: "DELETE" });
      if (res.ok) window.location.reload();
      else alert("Erro ao excluir.");
    } finally {
      setDeletingId(null);
      setConfirmId(null);
    }
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-800">
              <th className="p-3 text-gray-400 font-medium">Imagem</th>
              <th className="p-3 text-gray-400 font-medium">Nome</th>
              <th className="p-3 text-gray-400 font-medium">Categoria</th>
              <th className="p-3 text-gray-400 font-medium">Preço</th>
              <th className="p-3 text-gray-400 font-medium">Estoque</th>
              <th className="p-3 text-gray-400 font-medium">Status</th>
              <th className="p-3 text-gray-400 font-medium">Ações</th>
            </tr>
          </thead>
          <tbody>
            {produtos.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-6 text-center text-gray-500">
                  Nenhum produto cadastrado.
                </td>
              </tr>
            ) : (
              produtos.map((p) => (
                <tr key={p.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                  <td className="p-3">
                    <div className="w-12 h-12 relative rounded overflow-hidden bg-gray-800">
                      {p.imagens?.[0] ? (
                        <Image
                          src={p.imagens[0]}
                          alt=""
                          fill
                          className="object-cover"
                          sizes="48px"
                        />
                      ) : (
                        <span className="text-gray-600 text-xs flex items-center justify-center h-full">
                          —
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-3 text-white font-medium">{p.nome}</td>
                  <td className="p-3 text-gray-300">{p.categoria.nome}</td>
                  <td className="p-3 text-yellow-400">
                    R$ {p.preco.toFixed(2).replace(".", ",")}
                  </td>
                  <td className="p-3 text-gray-300">{p.estoque}</td>
                  <td className="p-3">
                    <span
                      className={
                        p.ativo
                          ? "text-green-400"
                          : "text-gray-500"
                      }
                    >
                      {p.ativo ? "Ativo" : "Inativo"}
                    </span>
                  </td>
                  <td className="p-3 flex gap-2">
                    <Link
                      href={`/admin/produtos/${p.id}`}
                      className="text-yellow-400 hover:text-yellow-300 text-sm"
                    >
                      Editar
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDelete(p.id)}
                      disabled={deletingId === p.id}
                      className={
                        confirmId === p.id
                          ? "text-red-400 hover:text-red-300 text-sm"
                          : "text-gray-400 hover:text-red-400 text-sm"
                      }
                    >
                      {deletingId === p.id
                        ? "Excluindo..."
                        : confirmId === p.id
                          ? "Clique novamente para confirmar"
                          : "Excluir"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
