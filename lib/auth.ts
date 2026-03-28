import type { NextAuthOptions } from "next-auth";
import type { Session } from "next-auth";
import { NextResponse } from "next/server";
import CredentialsProvider from "next-auth/providers/credentials";
import * as bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "E-mail", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const user = await prisma.usuario.findUnique({
          where: { email: credentials.email.toLowerCase() },
        });
        if (!user || user.role !== "admin") return null;
        const valid = await bcrypt.compare(credentials.password, user.senhaHash);
        if (!valid) return null;
        return {
          id: user.id,
          email: user.email,
          name: user.nome ?? user.email,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/admin/login",
  },
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  secret: process.env.NEXTAUTH_SECRET,
};

/**
 * Returns a 401 response if the session is missing or the user is not an admin.
 * Otherwise returns null (caller should proceed).
 */
export function assertAdmin(session: Session | null): NextResponse | null {
  if (!session?.user?.role || session.user.role !== "admin") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  return null;
}
