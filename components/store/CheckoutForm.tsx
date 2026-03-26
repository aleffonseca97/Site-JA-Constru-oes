"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";

export default function CheckoutForm() {
  const { items, total, clear } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [rua, setRua] = useState("");
  const [numero, setNumero] = useState("");
  const [bairro, setBairro] = useState("");
  const [cidade, setCidade] = useState("");
  const [cep, setCep] = useState("");
  const [complemento, setComplemento] = useState("");

  if (items.length === 0 && !loading) {
    return (
      <div className="flex flex-col items-center py-6 text-center sm:py-8">
        <div
          className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-stone-200 bg-stone-50 text-stone-500 shadow-inner sm:h-16 sm:w-16"
          aria-hidden
        >
          <svg
            className="h-7 w-7 sm:h-8 sm:w-8"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.541 3.947-7.171 3.947-7.171 0 0-.896-.034-1.842.28-.94.313-1.732.893-2.39 1.645M7.5 14.25l-1.02-5.513m0 0L5.25 5.25h13.5l-1.08 5.513M7.5 14.25l5.25-5.25m0 0l5.25 5.25"
            />
          </svg>
        </div>
        <p className="mb-1 text-lg font-semibold text-stone-900">
          Carrinho vazio
        </p>
        <p className="mb-6 max-w-sm text-pretty text-sm text-stone-600 sm:text-base">
          Adicione produtos antes de finalizar a compra.
        </p>
        <Link
          href="/produtos"
          className="ui-btn ui-btn-primary min-h-[3rem] w-full max-w-xs px-6 py-3 sm:w-auto"
        >
          Ver produtos
        </Link>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const itens = items.map((i) => ({
        produtoId: i.produtoId,
        quantidade: i.quantidade,
        precoUnitario: i.preco,
      }));
      const res = await fetch("/api/checkout/stripe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clienteNome: nome,
          clienteEmail: email,
          clienteTelefone: telefone || undefined,
          endereco: { rua, numero, bairro, cidade, cep, complemento: complemento || undefined },
          itens,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error?.message ?? data.error ?? "Erro ao processar");
        setLoading(false);
        return;
      }
      if (data.url) {
        clear();
        window.location.href = data.url;
        return;
      }
      setError("Resposta inválida do servidor");
      setLoading(false);
    } catch {
      setError("Erro de conexão");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="text-red-700 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </div>
      )}
      <div>
        <h2 className="checkout-heading-font text-xl font-semibold text-stone-900 mb-3 sm:text-[1.35rem]">
          <span className="text-amber-700">Dados pessoais</span>
        </h2>
        <div className="space-y-3">
          <div>
            <label htmlFor="nome" className="block text-sm text-gray-600 mb-1 font-medium">Nome *</label>
            <input
              id="nome"
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
              className="ui-input"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm text-gray-600 mb-1 font-medium">E-mail *</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="ui-input"
            />
          </div>
          <div>
            <label htmlFor="telefone" className="block text-sm text-gray-600 mb-1 font-medium">Telefone</label>
            <input
              id="telefone"
              type="tel"
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
              className="ui-input"
            />
          </div>
        </div>
      </div>
      <div>
        <h2 className="checkout-heading-font text-xl font-semibold text-stone-900 mb-3 sm:text-[1.35rem]">
          <span className="text-amber-700">Endereço de entrega</span>
        </h2>
        <div className="space-y-3">
          <div>
            <label htmlFor="rua" className="block text-sm text-gray-600 mb-1 font-medium">Rua *</label>
            <input
              id="rua"
              type="text"
              value={rua}
              onChange={(e) => setRua(e.target.value)}
              required
              className="ui-input"
            />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="numero" className="block text-sm text-gray-600 mb-1 font-medium">Número *</label>
              <input
                id="numero"
                type="text"
                value={numero}
                onChange={(e) => setNumero(e.target.value)}
                required
                className="ui-input"
              />
            </div>
            <div>
              <label htmlFor="complemento" className="block text-sm text-gray-600 mb-1 font-medium">Complemento</label>
              <input
                id="complemento"
                type="text"
                value={complemento}
                onChange={(e) => setComplemento(e.target.value)}
                className="ui-input"
              />
            </div>
          </div>
          <div>
            <label htmlFor="bairro" className="block text-sm text-gray-600 mb-1 font-medium">Bairro *</label>
            <input
              id="bairro"
              type="text"
              value={bairro}
              onChange={(e) => setBairro(e.target.value)}
              required
              className="ui-input"
            />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="cidade" className="block text-sm text-gray-600 mb-1 font-medium">Cidade *</label>
              <input
                id="cidade"
                type="text"
                value={cidade}
                onChange={(e) => setCidade(e.target.value)}
                required
                className="ui-input"
              />
            </div>
            <div>
              <label htmlFor="cep" className="block text-sm text-gray-600 mb-1 font-medium">CEP *</label>
              <input
                id="cep"
                type="text"
                value={cep}
                onChange={(e) => setCep(e.target.value)}
                required
                placeholder="00000-000"
                className="ui-input"
              />
            </div>
          </div>
        </div>
      </div>
      <div className="pt-4 border-t border-gray-200">
        <p className="ui-muted mb-2 font-medium">
          Total: <span className="text-yellow-700 font-bold">R$ {total.toFixed(2).replace(".", ",")}</span>
        </p>
        <button
          type="submit"
          disabled={loading}
          className="ui-btn ui-btn-primary w-full py-3 disabled:opacity-50"
        >
          {loading ? "Redirecionando..." : "Ir para pagamento"}
        </button>
        <p className="text-gray-500 text-xs mt-2 text-center">
          Você será redirecionado ao Stripe para pagamento seguro.
        </p>
      </div>
    </form>
  );
}
