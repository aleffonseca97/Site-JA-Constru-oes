import { prisma } from "@/lib/prisma";

/**
 * Marca o pedido como pago e decrementa o estoque dos produtos.
 * Idempotente: se o pedido já não estiver "pendente", não altera.
 */
export async function confirmarPedidoPago(pedidoId: string): Promise<boolean> {
  const pedido = await prisma.pedido.findUnique({
    where: { id: pedidoId },
    include: { itens: true },
  });
  if (!pedido || pedido.status !== "pendente") {
    return false;
  }
  for (const item of pedido.itens) {
    await prisma.produto.update({
      where: { id: item.produtoId },
      data: { estoque: { decrement: item.quantidade } },
    });
  }
  await prisma.pedido.update({
    where: { id: pedidoId },
    data: { status: "pago" },
  });
  return true;
}
