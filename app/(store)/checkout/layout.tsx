import { Fraunces } from "next/font/google";

const checkoutDisplay = Fraunces({
  subsets: ["latin"],
  variable: "--font-checkout-display",
  display: "swap",
});

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`${checkoutDisplay.variable} min-h-full`}>{children}</div>
  );
}
