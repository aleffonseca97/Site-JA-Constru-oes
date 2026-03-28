import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatCurrency, parseEndereco } from "@/lib/utils";
import AtualizarStatusPedido from "@/components/dashboard/AtualizarStatusPedido";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Detalhe da Venda — Admin",
};

export default async function AdminVendaDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const pedido = await prisma.pedido.findUnique({
    where: { id },
    include: {
      itens: {
        include: {
          produto: { select: { id: true, nome: true, slug: true } },
        },
      },
    },
  });
  if (!pedido) notFound();

  const endereco = parseEndereco(pedido.endereco);

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/admin/vendas"
          className="text-yellow-400 hover:text-yellow-300 text-sm"
        >
          ← Voltar às vendas
        </Link>
      </div>
      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <h2 className="text-lg font-medium text-yellow-400 mb-4">
              Cliente
            </h2>
            <p className="text-white font-medium">{pedido.clienteNome}</p>
            <p className="text-gray-400 text-sm">{pedido.clienteEmail}</p>
            {pedido.clienteTelefone && (
              <p className="text-gray-400 text-sm">{pedido.clienteTelefone}</p>
            )}
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <h2 className="text-lg font-medium text-yellow-400 mb-4">
              Endereço
            </h2>
            <p className="text-gray-300">
              {endereco.rua}, {endereco.numero}
              {endereco.complemento ? ` - ${endereco.complemento}` : ""}
            </p>
            <p className="text-gray-300">
              {endereco.bairro} — {endereco.cidade}
            </p>
            <p className="text-gray-300">CEP: {endereco.cep}</p>
          </div>
        </div>
        <div>
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <h2 className="text-lg font-medium text-yellow-400 mb-4">
              Itens do pedido
            </h2>
            <ul className="space-y-2 mb-4">
              {pedido.itens.map((item) => (
                <li
                  key={item.id}
                  className="flex justify-between text-gray-300 border-b border-gray-800 pb-2"
                >
                  <span>
                    {item.produto.nome} × {item.quantidade}
                  </span>
                  <span className="text-yellow-400">
                    {formatCurrency(Number(item.precoUnitario) * item.quantidade)}
                  </span>
                </li>
              ))}
            </ul>
            <p className="text-xl font-bold text-yellow-400 border-t border-gray-800 pt-4">
              Total: {formatCurrency(Number(pedido.total))}
            </p>
            <div className="mt-6">
              <p className="text-gray-500 text-sm mb-2">Status atual:</p>
              <AtualizarStatusPedido pedidoId={pedido.id} statusAtual={pedido.status} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
