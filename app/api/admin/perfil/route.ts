import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions, assertAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import * as bcrypt from "bcryptjs";
import { z } from "zod";

const patchSchema = z
  .object({
    currentPassword: z.string().min(1, "Informe a senha atual"),
    email: z.string().email("E-mail inválido").optional(),
    newPassword: z.string().min(8, "A nova senha deve ter pelo menos 8 caracteres").optional(),
    confirmPassword: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.newPassword && data.newPassword !== data.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "As senhas não coincidem",
        path: ["confirmPassword"],
      });
    }
  });

export async function PATCH(request: NextRequest) {
  const session = await getServerSession(authOptions);
  const denied = assertAdmin(session);
  if (denied) return denied;

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corpo inválido" }, { status: 400 });
  }

  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return NextResponse.json(
      { error: first?.message ?? "Dados inválidos" },
      { status: 400 }
    );
  }

  const { currentPassword, email, newPassword } = parsed.data;

  const user = await prisma.usuario.findUnique({
    where: { id: session.user.id },
  });
  if (!user) {
    return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
  }

  const valid = await bcrypt.compare(currentPassword, user.senhaHash);
  if (!valid) {
    return NextResponse.json({ error: "Senha atual incorreta" }, { status: 403 });
  }

  const emailChanged = email !== undefined && email.trim().toLowerCase() !== user.email.toLowerCase();
  const passwordChanged = newPassword !== undefined && newPassword.length > 0;

  if (!emailChanged && !passwordChanged) {
    return NextResponse.json(
      { error: "Informe um novo e-mail ou uma nova senha" },
      { status: 400 }
    );
  }

  if (emailChanged && email) {
    const taken = await prisma.usuario.findUnique({
      where: { email: email.trim().toLowerCase() },
    });
    if (taken && taken.id !== user.id) {
      return NextResponse.json({ error: "Este e-mail já está em uso" }, { status: 409 });
    }
  }

  await prisma.usuario.update({
    where: { id: user.id },
    data: {
      ...(emailChanged && email ? { email: email.trim().toLowerCase() } : {}),
      ...(passwordChanged && newPassword ? { senhaHash: await bcrypt.hash(newPassword, 10) } : {}),
    },
  });

  return NextResponse.json({
    ok: true,
    emailChanged: !!emailChanged,
    passwordChanged: !!passwordChanged,
  });
}
