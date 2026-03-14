import Link from "next/link";
import { stripe } from "@/lib/stripe";
import { confirmarPedidoPago } from "@/lib/confirmar-pedido-pago";

export const metadata = {
  title: "Pedido recebido — J.A Construções",
  description: "Obrigado pela sua compra",
};

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function CheckoutSucessoPage({ searchParams }: Props) {
  const params = await searchParams;
  const sessionId =
    typeof params.session_id === "string" ? params.session_id : undefined;

  if (sessionId && stripe) {
    try {
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      if (session.payment_status === "paid" && session.metadata?.pedidoId) {
        await confirmarPedidoPago(session.metadata.pedidoId);
      }
    } catch {
      // Ignora erro (sessão inválida ou já processada)
    }
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-16 text-center">
      <div className="mb-6">
        <span className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-yellow-100 text-yellow-600 text-3xl border-2 border-yellow-400">
          ✓
        </span>
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Pedido recebido!</h1>
      <p className="text-gray-600 mb-8">
        Obrigado pela sua compra. Em breve você receberá a confirmação por e-mail.
      </p>
      <Link
        href="/produtos"
        className="inline-block px-6 py-3 rounded-lg font-medium bg-yellow-500 text-gray-900 hover:bg-yellow-400 transition"
      >
        Continuar comprando
      </Link>
    </div>
  );
}
