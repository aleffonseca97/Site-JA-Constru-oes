import CheckoutForm from "@/components/store/CheckoutForm";

export const metadata = {
  title: "Checkout — J.A Construções",
  description: "Finalize sua compra",
};

export default function CheckoutPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        <span className="text-yellow-500">Finalizar compra</span>
      </h1>
      <CheckoutForm />
    </div>
  );
}
