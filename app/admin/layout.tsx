import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { signOut } from "next-auth/react";
import AdminNav from "@/components/dashboard/AdminNav";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  const isLoginPage = false; // layout is used for all /admin; login is unprotected

  return (
    <div className="min-h-screen bg-black text-gray-100">
      {session && (
        <header className="border-b border-gray-800 bg-gray-900/80 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-14">
            <Link href="/admin/produtos" className="font-bold text-yellow-400">
              J.A Construções — Admin
            </Link>
            <AdminNav session={session} />
          </div>
        </header>
      )}
      <main className={session ? "max-w-7xl mx-auto px-4 py-6" : undefined}>
        {children}
      </main>
    </div>
  );
}
