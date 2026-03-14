import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

const updateSchema = z.object({
  nome: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  parentId: z.string().nullable().optional(),
});

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const categoria = await prisma.categoria.findUnique({
      where: { id },
      include: { _count: { select: { produtos: true } } },
    });
    if (!categoria) {
      return NextResponse.json(
        { error: "Categoria não encontrada" },
        { status: 404 }
      );
    }
    return NextResponse.json(categoria);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Erro ao buscar categoria" },
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
    const data = updateSchema.parse(body);

    const current = await prisma.categoria.findUnique({ where: { id } });
    if (!current) {
      return NextResponse.json(
        { error: "Categoria não encontrada" },
        { status: 404 }
      );
    }

    const nome = data.nome ?? current.nome;
    const slug =
      data.slug?.trim() ||
      (data.nome ? slugify(data.nome) : current.slug);

    const existente = await prisma.categoria.findFirst({
      where: { slug, id: { not: id } },
    });
    const slugFinal = existente ? `${slug}-${Date.now()}` : slug;

    const updateData: { nome: string; slug: string; parentId?: string | null } = {
      nome,
      slug: slugFinal,
    };
    if (data.parentId !== undefined) updateData.parentId = data.parentId;

    const categoria = await prisma.categoria.update({
      where: { id },
      data: updateData,
    });
    return NextResponse.json(categoria);
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: e.flatten() }, { status: 400 });
    }
    console.error(e);
    return NextResponse.json(
      { error: "Erro ao atualizar categoria" },
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
    const cat = await prisma.categoria.findUnique({
      where: { id },
      include: { _count: { select: { produtos: true } } },
    });
    if (cat && cat._count.produtos > 0) {
      return NextResponse.json(
        {
          error: `Não é possível excluir: existem ${cat._count.produtos} produto(s) nesta categoria. Remova ou altere a categoria dos produtos primeiro.`,
        },
        { status: 400 }
      );
    }
    await prisma.categoria.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Erro ao excluir categoria" },
      { status: 500 }
    );
  }
}
