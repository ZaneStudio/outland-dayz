import type { Metadata } from "next";
import "./globals.css";

import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { CartProvider } from "@/components/cart";
import { AutumnLeaves } from "@/components/autumn-leaves";

export const metadata: Metadata = {
  title: "Outland DayZ",
  description: "Український сервер DayZ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uk">
      <body className="font-montserrat bg-[#0a0c09] text-white antialiased">
        <CartProvider>
          <Header />
          <AutumnLeaves />
          <main className="min-h-screen">
            {children}
          </main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
