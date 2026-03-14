"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const STATUS_OPCOES = [
  { value: "pendente", label: "Pendente" },
  { value: "pago", label: "Pago" },
  { value: "entregue", label: "Entregue" },
  { value: "cancelado", label: "Cancelado" },
] as const;

export default function AtualizarStatusPedido({
  pedidoId,
  statusAtual,
}: {
  pedidoId: string;
  statusAtual: string;
}) {
  const router = useRouter();
  const [status, setStatus] = useState(statusAtual);
  const [loading, setLoading] = useState(false);

  async function handleChange(newStatus: string) {
    setLoading(true);
    try {
      const res = await fetch(`/api/pedidos/${pedidoId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setStatus(newStatus);
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <select
      value={status}
      onChange={(e) => handleChange(e.target.value)}
      disabled={loading}
      className="rounded bg-black border border-gray-700 text-white px-4 py-2 focus:border-yellow-500 outline-none disabled:opacity-50"
    >
      {STATUS_OPCOES.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
