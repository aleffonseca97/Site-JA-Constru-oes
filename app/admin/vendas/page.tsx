import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import { parseEndereco } from "@/lib/utils";
import VendasFilters from "@/components/dashboard/VendasFilters";
import VendasRefreshButton from "@/components/dashboard/VendasRefreshButton";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Vendas — Admin",
};

type SearchParams = { [key: string]: string | string[] | undefined };

export default async function AdminVendasPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const status =
    typeof params.status === "string" ? params.status : undefined;

  const validStatuses = ["pendente", "pago", "entregue", "cancelado"] as const;
  type StatusType = (typeof validStatuses)[number];
  const isValid = status && validStatuses.includes(status as StatusType);
  const where = isValid ? { status: status as StatusType } : {};
  const pedidos = await prisma.pedido.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      itens: {
        include: { produto: { select: { nome: true } } },
      },
    },
  });

  const pedidosComEndereco = pedidos.map((p) => ({
    ...p,
    total: Number(p.total),
    endereco: parseEndereco(p.endereco),
  }));

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-yellow-400">Vendas</h1>
        <VendasRefreshButton />
      </div>
      <VendasFilters status={status} />
      <div className="mt-4 bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="p-3 text-gray-400 font-medium">Data</th>
                <th className="p-3 text-gray-400 font-medium">Cliente</th>
                <th className="p-3 text-gray-400 font-medium">Total</th>
                <th className="p-3 text-gray-400 font-medium">Status</th>
                <th className="p-3 text-gray-400 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {pedidosComEndereco.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-gray-500">
                    Nenhum pedido encontrado.
                  </td>
                </tr>
              ) : (
                pedidosComEndereco.map((p) => (
                  <tr
                    key={p.id}
                    className="border-b border-gray-800 hover:bg-gray-800/50"
                  >
                    <td className="p-3 text-gray-300 text-sm">
                      {new Date(p.createdAt).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="p-3 text-white">{p.clienteNome}</td>
                    <td className="p-3 text-yellow-400 font-medium">
                      {formatCurrency(p.total)}
                    </td>
                    <td className="p-3">
                      <span
                        className={
                          p.status === "pago" || p.status === "entregue"
                            ? "text-green-400"
                            : p.status === "cancelado"
                              ? "text-red-400"
                              : "text-gray-400"
                        }
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="p-3">
                      <Link
                        href={`/admin/vendas/${p.id}`}
                        className="text-yellow-400 hover:text-yellow-300 text-sm"
                      >
                        Ver detalhe
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
