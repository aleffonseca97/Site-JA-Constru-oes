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

const createSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  slug: z.string().min(1).optional(),
  parentId: z.string().nullable().optional(),
});

export async function GET() {
  try {
    const categorias = await prisma.categoria.findMany({
      orderBy: { nome: "asc" },
    });
    return NextResponse.json(categorias);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Erro ao listar categorias" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as { role?: string }).role !== "admin") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  try {
    const body = await request.json();
    const data = createSchema.parse(body);

    const slug =
      data.slug?.trim() ||
      slugify(data.nome);

    const existente = await prisma.categoria.findUnique({ where: { slug } });
    const slugFinal = existente ? `${slug}-${Date.now()}` : slug;

    const categoria = await prisma.categoria.create({
      data: {
        nome: data.nome,
        slug: slugFinal,
        parentId: data.parentId ?? undefined,
      },
    });
    return NextResponse.json(categoria);
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json(
        { error: e.flatten().fieldErrors },
        { status: 400 }
      );
    }
    console.error(e);
    return NextResponse.json(
      { error: "Erro ao criar categoria" },
      { status: 500 }
    );
  }
}
