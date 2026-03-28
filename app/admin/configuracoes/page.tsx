import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminConfigForm from "@/components/dashboard/AdminConfigForm";

export const metadata = {
  title: "Configurações — Admin",
};

export default async function AdminConfiguracoesPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    redirect("/admin/login");
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-yellow-400">Configurações</h1>
        <p className="text-gray-500 text-sm mt-1">
          Gerencie o e-mail e a senha de acesso ao painel administrativo.
        </p>
      </div>
      <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
        <AdminConfigForm currentEmail={session.user.email} />
      </div>
    </div>
  );
}
