import { prisma } from "@/lib/prisma";

/**
 * Marca o pedido como pago e decrementa o estoque dos produtos.
 * Idempotente: se o pedido já não estiver "pendente", não altera.
 * Tudo é feito dentro de uma transação para garantir consistência.
 */
export async function confirmarPedidoPago(pedidoId: string): Promise<boolean> {
  return prisma.$transaction(async (tx) => {
    const pedido = await tx.pedido.findUnique({
      where: { id: pedidoId },
      include: { itens: true },
    });

    if (!pedido || pedido.status !== "pendente") {
      return false;
    }

    for (const item of pedido.itens) {
      const produto = await tx.produto.findUnique({
        where: { id: item.produtoId },
        select: { estoque: true, nome: true },
      });

      if (!produto || produto.estoque < item.quantidade) {
        throw new Error(
          `Estoque insuficiente para "${produto?.nome ?? item.produtoId}": ` +
          `disponível ${produto?.estoque ?? 0}, necessário ${item.quantidade}`
        );
      }

      await tx.produto.update({
        where: { id: item.produtoId },
        data: { estoque: { decrement: item.quantidade } },
      });
    }

    await tx.pedido.update({
      where: { id: pedidoId },
      data: { status: "pago" },
    });

    return true;
  });
}
