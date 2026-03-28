import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions, assertAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { produtoComUrlsDeImagens, produtoImagensQuery } from "@/lib/produto-imagens";
import { deleteR2ObjectsForUrls } from "@/lib/r2";
import { z } from "zod";

const updateSchema = z.object({
  nome: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  descricao: z.string().optional(),
  preco: z.number().positive().optional(),
  estoque: z.number().int().min(0).optional(),
  categoriaId: z.string().min(1).optional(),
  imagens: z.array(z.string().min(1)).optional(),
  ativo: z.boolean().optional(),
  destaque: z.boolean().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    const isAdmin = session?.user?.role === "admin";

    const produto = await prisma.produto.findUnique({
      where: { id, ...(!isAdmin && { ativo: true }) },
      include: {
        categoria: true,
        ...produtoImagensQuery,
      },
    });
    if (!produto) {
      return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 });
    }
    return NextResponse.json(produtoComUrlsDeImagens(produto));
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
  const denied = assertAdmin(session);
  if (denied) return denied;

  try {
    const { id } = await params;
    const body = await request.json();
    const raw = {
      ...body,
      preco: body.preco != null ? (typeof body.preco === "string" ? parseFloat(body.preco) : body.preco) : undefined,
      estoque: body.estoque != null ? (typeof body.estoque === "string" ? parseInt(body.estoque, 10) : body.estoque) : undefined,
    };
    const data = updateSchema.parse(raw);

    const { imagens: novasImagens, ...campos } = data;

    const antes = await prisma.produto.findUnique({
      where: { id },
      include: { imagens: true },
    });
    if (!antes) {
      return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 });
    }

    const produto = await prisma.produto.update({
      where: { id },
      data: {
        ...(campos.nome !== undefined && { nome: campos.nome }),
        ...(campos.slug !== undefined && { slug: campos.slug }),
        ...(campos.descricao !== undefined && { descricao: campos.descricao }),
        ...(campos.preco !== undefined && { preco: campos.preco }),
        ...(campos.estoque !== undefined && { estoque: campos.estoque }),
        ...(campos.categoriaId !== undefined && { categoriaId: campos.categoriaId }),
        ...(campos.ativo !== undefined && { ativo: campos.ativo }),
        ...(campos.destaque !== undefined && { destaque: campos.destaque }),
        ...(novasImagens !== undefined && {
          imagens: {
            deleteMany: {},
            create: novasImagens.map((url, ordem) => ({ url, ordem })),
          },
        }),
      },
      include: {
        categoria: { select: { id: true, nome: true, slug: true } },
        ...produtoImagensQuery,
      },
    });

    if (novasImagens !== undefined) {
      const urlsAntigas = antes.imagens.map((i) => i.url);
      const removidas = urlsAntigas.filter((u) => !novasImagens.includes(u));
      await deleteR2ObjectsForUrls(removidas);
    }

    return NextResponse.json(produtoComUrlsDeImagens(produto));
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
  const denied = assertAdmin(session);
  if (denied) return denied;

  try {
    const { id } = await params;
    const existente = await prisma.produto.findUnique({
      where: { id },
      include: { imagens: true },
    });
    if (!existente) {
      return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 });
    }
    const urls = existente.imagens.map((i) => i.url);
    await prisma.produto.delete({ where: { id } });
    await deleteR2ObjectsForUrls(urls);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Erro ao excluir produto" },
      { status: 500 }
    );
  }
}
