import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as { role?: string }).role !== "admin") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

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
      endereco: JSON.parse(p.endereco || "{}") as Record<string, string>,
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
