import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";

import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { CartProvider } from "@/components/cart";

// Підключаємо сучасний округлий шрифт з підтримкою кирилиці
const montserrat = Montserrat({ 
  subsets: ["latin", "cyrillic"], 
  weight: ["400", "500", "600", "700", "800"],
});

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
      <body className={`${montserrat.className} bg-[#0a0c09] text-white antialiased`}>
        <CartProvider>
          <Header />
          <main className="min-h-screen">
            {children}
          </main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}