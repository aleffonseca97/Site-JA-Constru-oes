import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions, assertAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseEndereco } from "@/lib/utils";
import { z } from "zod";

const updateSchema = z.object({
  status: z.enum(["pendente", "pago", "entregue", "cancelado"]),
});

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  const denied = assertAdmin(session);
  if (denied) return denied;

  try {
    const { id } = await params;
    const pedido = await prisma.pedido.findUnique({
      where: { id },
      include: {
        itens: {
          include: { produto: { select: { id: true, nome: true, slug: true } } },
        },
      },
    });
    if (!pedido) {
      return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 });
    }
    return NextResponse.json({
      ...pedido,
      total: Number(pedido.total),
      endereco: parseEndereco(pedido.endereco),
      itens: pedido.itens.map((i) => ({
        ...i,
        precoUnitario: Number(i.precoUnitario),
      })),
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Erro ao buscar pedido" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  const denied = assertAdmin(session);
  if (denied) return denied;

  try {
    const { id } = await params;
    const body = await request.json();
    const { status } = updateSchema.parse(body);
    const pedido = await prisma.pedido.update({
      where: { id },
      data: { status },
      include: {
        itens: {
          include: { produto: { select: { id: true, nome: true, slug: true } } },
        },
      },
    });
    return NextResponse.json({
      ...pedido,
      total: Number(pedido.total),
      endereco: parseEndereco(pedido.endereco),
      itens: pedido.itens.map((i) => ({
        ...i,
        precoUnitario: Number(i.precoUnitario),
      })),
    });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: e.flatten() }, { status: 400 });
    }
    console.error(e);
    return NextResponse.json(
      { error: "Erro ao atualizar pedido" },
      { status: 500 }
    );
  }
}
