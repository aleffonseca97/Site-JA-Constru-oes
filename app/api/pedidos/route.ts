import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions, assertAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseEndereco } from "@/lib/utils";
import type { PedidoStatus } from "@prisma/client";

const VALID_STATUSES = new Set<PedidoStatus>(["pendente", "pago", "entregue", "cancelado"]);

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  const denied = assertAdmin(session);
  if (denied) return denied;

  try {
    const { searchParams } = new URL(request.url);
    const statusParam = searchParams.get("status");
    const status = statusParam && VALID_STATUSES.has(statusParam as PedidoStatus)
      ? (statusParam as PedidoStatus)
      : undefined;

    const where = status ? { status } : {};
    const pedidos = await prisma.pedido.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        itens: {
          include: { produto: { select: { id: true, nome: true, slug: true } } },
        },
      },
    });

    const parsed = pedidos.map((p) => ({
      ...p,
      total: Number(p.total),
      endereco: parseEndereco(p.endereco),
      itens: p.itens.map((i) => ({
        ...i,
        precoUnitario: Number(i.precoUnitario),
      })),
    }));

    return NextResponse.json(parsed);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Erro ao listar pedidos" },
      { status: 500 }
    );
  }
}
