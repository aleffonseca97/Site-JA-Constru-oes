"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

type Categoria = { id: string; nome: string; slug: string };
type Produto = {
  id: string;
  nome: string;
  slug: string;
  descricao: string | null;
  preco: number;
  estoque: number;
  imagens: string[];
  ativo: boolean;
  destaque: boolean;
  categoriaId: string;
};

type Pendente = { id: string; file: File; preview: string };

export default function ProdutoForm({
  categorias,
  produto,
}: {
  categorias: Categoria[];
  produto?: Produto & { categoria: Categoria };
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [nome, setNome] = useState(produto?.nome ?? "");
  const [descricao, setDescricao] = useState(produto?.descricao ?? "");
  const [preco, setPreco] = useState(produto?.preco?.toString() ?? "");
  const [estoque, setEstoque] = useState(produto?.estoque?.toString() ?? "0");
  const [categoriaId, setCategoriaId] = useState(produto?.categoriaId ?? categorias[0]?.id ?? "");
  const [ativo, setAtivo] = useState(produto?.ativo ?? true);
  const [destaque, setDestaque] = useState(produto?.destaque ?? false);
  /** URLs já salvas no servidor (edição) ou enviadas em um salvamento anterior na mesma sessão não aplicável — só existentes */
  const [urlsExistentes, setUrlsExistentes] = useState<string[]>(produto?.imagens ?? []);
  /** Arquivos escolhidos localmente; upload só ao salvar */
  const [pendentes, setPendentes] = useState<Pendente[]>([]);

  const pendentesRef = useRef<Pendente[]>([]);
  useEffect(() => {
    pendentesRef.current = pendentes;
  }, [pendentes]);
  useEffect(() => {
    return () => {
      pendentesRef.current.forEach((p) => URL.revokeObjectURL(p.preview));
    };
  }, []);

  function handleEscolherImagens(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files?.length) return;
    setError("");
    const novos: Pendente[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith("image/")) continue;
      novos.push({
        id: crypto.randomUUID(),
        file,
        preview: URL.createObjectURL(file),
      });
    }
    if (novos.length) setPendentes((prev) => [...prev, ...novos]);
    e.target.value = "";
  }

  function removeUrlExistente(url: string) {
    setUrlsExistentes((prev) => prev.filter((u) => u !== url));
  }

  function removePendente(id: string) {
    setPendentes((prev) => {
      const item = prev.find((p) => p.id === id);
      if (item) URL.revokeObjectURL(item.preview);
      return prev.filter((p) => p.id !== id);
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const novasUrls: string[] = [];
      for (const p of pendentes) {
        const formData = new FormData();
        formData.set("file", p.file);
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        const data = await res.json();
        if (!res.ok) {
          setError(typeof data.error === "string" ? data.error : "Falha ao enviar uma das imagens");
          setLoading(false);
          return;
        }
        if (data.url) novasUrls.push(data.url);
      }

      pendentes.forEach((p) => URL.revokeObjectURL(p.preview));
      setPendentes([]);

      const imagens = [...urlsExistentes, ...novasUrls];

      const body = {
        nome,
        descricao: descricao || undefined,
        preco: parseFloat(preco),
        estoque: parseInt(estoque, 10),
        categoriaId,
        ativo,
        destaque,
        imagens,
      };
      const url = produto ? `/api/produtos/${produto.id}` : "/api/produtos";
      const method = produto ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error?.message ?? data.error ?? "Erro ao salvar");
        setLoading(false);
        return;
      }
      router.push("/admin/produtos");
      router.refresh();
    } catch {
      setError("Erro ao salvar");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-4">
      {error && (
        <div className="text-red-400 text-sm bg-red-900/30 border border-red-500/50 rounded px-3 py-2">
          {error}
        </div>
      )}
      <div>
        <label htmlFor="nome" className="block text-sm font-medium text-gray-300 mb-1">
          Nome *
        </label>
        <input
          id="nome"
          type="text"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          required
          className="w-full px-4 py-2 rounded bg-gray-900 border border-gray-700 text-white focus:border-yellow-500 outline-none"
        />
      </div>
      <div>
        <label htmlFor="descricao" className="block text-sm font-medium text-gray-300 mb-1">
          Descrição
        </label>
        <textarea
          id="descricao"
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          rows={3}
          className="w-full px-4 py-2 rounded bg-gray-900 border border-gray-700 text-white focus:border-yellow-500 outline-none"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="preco" className="block text-sm font-medium text-gray-300 mb-1">
            Preço (R$) *
          </label>
          <input
            id="preco"
            type="number"
            step="0.01"
            min="0"
            value={preco}
            onChange={(e) => setPreco(e.target.value)}
            required
            className="w-full px-4 py-2 rounded bg-gray-900 border border-gray-700 text-white focus:border-yellow-500 outline-none"
          />
        </div>
        <div>
          <label htmlFor="estoque" className="block text-sm font-medium text-gray-300 mb-1">
            Estoque *
          </label>
          <input
            id="estoque"
            type="number"
            min="0"
            value={estoque}
            onChange={(e) => setEstoque(e.target.value)}
            required
            className="w-full px-4 py-2 rounded bg-gray-900 border border-gray-700 text-white focus:border-yellow-500 outline-none"
          />
        </div>
      </div>
      <div>
        <label htmlFor="categoria" className="block text-sm font-medium text-gray-300 mb-1">
          Categoria *
        </label>
        <select
          id="categoria"
          value={categoriaId}
          onChange={(e) => setCategoriaId(e.target.value)}
          required
          className="w-full px-4 py-2 rounded bg-gray-900 border border-gray-700 text-white focus:border-yellow-500 outline-none"
        >
          {categorias.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nome}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Imagens
        </label>
        <p className="text-xs text-gray-500 mb-2">
          As imagens só são enviadas ao Cloudflare ao clicar em Salvar (primeiro o arquivo, depois o cadastro).
        </p>
        <div className="flex flex-wrap gap-2 mb-2">
          {urlsExistentes.map((url) => (
            <div key={url} className="relative w-20 h-20 rounded overflow-hidden bg-gray-800 border border-gray-700">
              <Image src={url} alt="" fill className="object-cover" sizes="80px" />
              <button
                type="button"
                onClick={() => removeUrlExistente(url)}
                className="absolute top-0 right-0 bg-red-600 text-white text-xs w-5 h-5 flex items-center justify-center rounded-bl"
              >
                ×
              </button>
            </div>
          ))}
          {pendentes.map((p) => (
            <div
              key={p.id}
              className="relative w-20 h-20 rounded overflow-hidden bg-gray-800 border border-dashed border-yellow-600/60"
            >
              <Image src={p.preview} alt="" fill className="object-cover" unoptimized sizes="80px" />
              <span className="absolute bottom-0 left-0 right-0 bg-black/60 text-[10px] text-yellow-300 text-center py-0.5">
                pendente
              </span>
              <button
                type="button"
                onClick={() => removePendente(p.id)}
                className="absolute top-0 right-0 bg-red-600 text-white text-xs w-5 h-5 flex items-center justify-center rounded-bl"
              >
                ×
              </button>
            </div>
          ))}
        </div>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleEscolherImagens}
          className="text-sm text-gray-400 file:mr-2 file:py-1 file:px-3 file:rounded file:border-0 file:bg-yellow-500 file:text-black file:font-medium"
        />
      </div>
      <div className="flex items-center gap-2">
        <input
          id="ativo"
          type="checkbox"
          checked={ativo}
          onChange={(e) => setAtivo(e.target.checked)}
          className="rounded border-gray-600 bg-gray-900 text-yellow-500 focus:ring-yellow-500"
        />
        <label htmlFor="ativo" className="text-sm text-gray-300">
          Produto ativo (visível na loja)
        </label>
      </div>
      <div className="flex items-center gap-2">
        <input
          id="destaque"
          type="checkbox"
          checked={destaque}
          onChange={(e) => setDestaque(e.target.checked)}
          className="rounded border-gray-600 bg-gray-900 text-yellow-500 focus:ring-yellow-500"
        />
        <label htmlFor="destaque" className="text-sm text-gray-300">
          Destaque na página inicial (até 4 produtos)
        </label>
      </div>
      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 rounded bg-yellow-500 text-black font-medium hover:bg-yellow-400 disabled:opacity-50"
        >
          {loading ? "Enviando..." : "Salvar"}
        </button>
        <Link
          href="/admin/produtos"
          className="px-4 py-2 rounded border border-gray-600 text-gray-300 hover:bg-gray-800"
        >
          Cancelar
        </Link>
      </div>
    </form>
  );
}
