"use client";

import { useState } from "react";

export type CategoriaWithCount = {
  id: string;
  nome: string;
  slug: string;
  parentId?: string | null;
  parent?: { id: string; nome: string; slug: string } | null;
  _count?: { produtos: number };
};

export default function CategoriasTable({
  categorias: initialCategorias,
}: {
  categorias: CategoriaWithCount[];
}) {
  const [categorias, setCategorias] = useState(initialCategorias);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<CategoriaWithCount | null>(null);
  const [nome, setNome] = useState("");
  const [slug, setSlug] = useState("");
  const [parentId, setParentId] = useState<string | "">("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const categoriasRaiz = categorias.filter(
    (c) => !c.parentId && c.id !== editing?.id
  );

  function openNew() {
    setEditing(null);
    setNome("");
    setSlug("");
    setParentId("");
    setError(null);
    setModalOpen(true);
  }

  function openEdit(c: CategoriaWithCount) {
    setEditing(c);
    setNome(c.nome);
    setSlug(c.slug);
    setParentId(c.parentId ?? "");
    setError(null);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditing(null);
    setNome("");
    setSlug("");
    setParentId("");
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      if (editing) {
        const res = await fetch(`/api/categorias/${editing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nome: nome.trim(),
            slug: slug.trim() || undefined,
            parentId: parentId || null,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(typeof data.error === "string" ? data.error : data.error?.message || "Erro ao atualizar.");
          return;
        }
        setCategorias((prev) =>
          prev.map((c) => {
            if (c.id !== editing.id) return c;
            const parentCat = data.parentId ? categorias.find((x) => x.id === data.parentId) : null;
            const parent = parentCat ? { id: parentCat.id, nome: parentCat.nome, slug: parentCat.slug } : null;
            return { ...c, ...data, _count: c._count, parent };
          })
        );
      } else {
        const res = await fetch("/api/categorias", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nome: nome.trim(),
            slug: slug.trim() || undefined,
            parentId: parentId || null,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error?.message || (typeof data.error === "object" ? JSON.stringify(data.error) : data.error) || "Erro ao criar.");
          return;
        }
        setCategorias((prev) => [...prev, { ...data, _count: { produtos: 0 }, parent: null }]);
      }
      closeModal();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (confirmId !== id) {
      setConfirmId(id);
      return;
    }
    setDeletingId(id);
    try {
      const res = await fetch(`/api/categorias/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok) {
        setCategorias((prev) => prev.filter((c) => c.id !== id));
      } else {
        alert(data.error || "Erro ao excluir.");
      }
    } finally {
      setDeletingId(null);
      setConfirmId(null);
    }
  }

  return (
    <>
      <div className="flex justify-end mb-4">
        <button
          type="button"
          onClick={openNew}
          className="px-4 py-2 rounded bg-yellow-500 text-black font-medium hover:bg-yellow-400 transition"
        >
          Nova categoria
        </button>
      </div>
      <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="p-3 text-gray-400 font-medium">Nome</th>
                <th className="p-3 text-gray-400 font-medium">Slug</th>
                <th className="p-3 text-gray-400 font-medium">Pai</th>
                <th className="p-3 text-gray-400 font-medium">Produtos</th>
                <th className="p-3 text-gray-400 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {categorias.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-gray-500">
                    Nenhuma categoria cadastrada. Adicione uma para organizar seus produtos.
                  </td>
                </tr>
              ) : (
                categorias.map((c) => (
                  <tr key={c.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                    <td className="p-3 text-white font-medium">{c.nome}</td>
                    <td className="p-3 text-gray-400 font-mono text-sm">{c.slug}</td>
                    <td className="p-3 text-gray-400 text-sm">{c.parent?.nome ?? "—"}</td>
                    <td className="p-3 text-gray-300">{c._count?.produtos ?? 0}</td>
                    <td className="p-3 flex gap-3">
                      <button
                        type="button"
                        onClick={() => openEdit(c)}
                        className="text-yellow-400 hover:text-yellow-300 text-sm"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(c.id)}
                        disabled={deletingId === c.id}
                        className={
                          confirmId === c.id
                            ? "text-red-400 hover:text-red-300 text-sm"
                            : "text-gray-400 hover:text-red-400 text-sm"
                        }
                      >
                        {deletingId === c.id
                          ? "Excluindo..."
                          : confirmId === c.id
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

      {modalOpen && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          onClick={closeModal}
        >
          <div
            className="bg-gray-900 border border-gray-800 rounded-lg max-w-md w-full p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold text-yellow-400 mb-4">
              {editing ? "Editar categoria" : "Nova categoria"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <p className="text-red-400 text-sm">{error}</p>
              )}
              <div>
                <label className="block text-gray-400 text-sm mb-1">Nome</label>
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-700 text-white focus:border-yellow-500 focus:outline-none"
                  placeholder="Ex: Ferramentas"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-1">Slug (opcional)</label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-700 text-white focus:border-yellow-500 focus:outline-none font-mono text-sm"
                  placeholder="Ex: ferramentas — deixe em branco para gerar do nome"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-1">Subcategoria de (opcional)</label>
                <select
                  value={parentId}
                  onChange={(e) => setParentId(e.target.value)}
                  className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-700 text-white focus:border-yellow-500 focus:outline-none text-sm"
                >
                  <option value="">Nenhuma (categoria principal)</option>
                  {categoriasRaiz.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nome}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 rounded text-gray-400 hover:text-white transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded bg-yellow-500 text-black font-medium hover:bg-yellow-400 transition disabled:opacity-50"
                >
                  {saving ? "Salvando..." : editing ? "Salvar" : "Criar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
