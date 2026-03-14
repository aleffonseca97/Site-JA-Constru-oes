"use client";

import { useRouter, useSearchParams } from "next/navigation";

export default function VendasFilters({ status }: { status?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function setStatus(value: string | null) {
    const p = new URLSearchParams(searchParams.toString());
    if (value) p.set("status", value);
    else p.delete("status");
    router.push(`/admin/vendas?${p.toString()}`);
  }

  return (
    <div className="flex items-center gap-4">
      <label htmlFor="status" className="text-sm text-gray-400">
        Status:
      </label>
      <select
        id="status"
        value={status ?? ""}
        onChange={(e) => setStatus(e.target.value || null)}
        className="rounded bg-gray-900 border border-gray-700 text-white px-3 py-1.5 text-sm focus:border-yellow-500 outline-none"
      >
        <option value="">Todos</option>
        <option value="pendente">Pendente</option>
        <option value="pago">Pago</option>
        <option value="entregue">Entregue</option>
        <option value="cancelado">Cancelado</option>
      </select>
    </div>
  );
}
