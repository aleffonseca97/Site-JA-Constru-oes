import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateSchema = z.object({
  nome: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  descricao: z.string().optional(),
  preco: z.number().positive().optional(),
  estoque: z.number().int().min(0).optional(),
  categoriaId: z.string().min(1).optional(),
  imagens: z.array(z.string()).optional(),
  ativo: z.boolean().optional(),
});

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const produto = await prisma.produto.findUnique({
      where: { id },
      include: { categoria: true },
    });
    if (!produto) {
      return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 });
    }
    return NextResponse.json({
      ...produto,
      imagens: JSON.parse(produto.imagens || "[]") as string[],
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Erro ao buscar produto" },
      { status: 500 }
    );
  }
}

export async function PUT(
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
    const raw = {
      ...body,
      preco: body.preco != null ? (typeof body.preco === "string" ? parseFloat(body.preco) : body.preco) : undefined,
      estoque: body.estoque != null ? (typeof body.estoque === "string" ? parseInt(body.estoque, 10) : body.estoque) : undefined,
    };
    const data = updateSchema.parse(raw);

    const updateData: Record<string, unknown> = { ...data };
    if (data.imagens) updateData.imagens = JSON.stringify(data.imagens);

    const produto = await prisma.produto.update({
      where: { id },
      data: updateData,
      include: { categoria: { select: { id: true, nome: true, slug: true } } },
    });

    return NextResponse.json({
      ...produto,
      imagens: JSON.parse(produto.imagens || "[]") as string[],
    });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: e.flatten() }, { status: 400 });
    }
    console.error(e);
    return NextResponse.json(
      { error: "Erro ao atualizar produto" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as { role?: string }).role !== "admin") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  try {
    const { id } = await params;
    await prisma.produto.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Erro ao excluir produto" },
      { status: 500 }
    );
  }
}
