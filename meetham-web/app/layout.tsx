import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";
import CartDrawer from "../components/customer/CartDrawer";

// Fallback to local system fonts to enable offline builds
const geistSans = { variable: "font-sans" };
const geistMono = { variable: "font-mono" };

export const metadata: Metadata = {
  title: "Meetham | Surplus Food Marketplace",
  description: "Save delicious surplus food from your local restaurants at amazing discounts.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900">
        <Providers>
          {children}
          <CartDrawer />
        </Providers>
      </body>
    </html>
  );
}
