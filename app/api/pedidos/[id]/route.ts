import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateSchema = z.object({
  status: z.enum(["pendente", "pago", "entregue", "cancelado"]),
});

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as { role?: string }).role !== "admin") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
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
      endereco: JSON.parse(pedido.endereco || "{}") as Record<string, string>,
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
  if (!session?.user || (session.user as { role?: string }).role !== "admin") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
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
      endereco: JSON.parse(pedido.endereco || "{}") as Record<string, string>,
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
