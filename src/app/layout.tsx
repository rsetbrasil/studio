import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { SalesProvider } from "@/context/SalesContext";
import { OrdersProvider } from "@/context/OrdersContext";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "SipStream",
  description: "Sistema de gestão completo para uma distribuidora de bebidas.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <SalesProvider>
          <OrdersProvider>
            {children}
          </OrdersProvider>
        </SalesProvider>
        <Toaster />
      </body>
    </html>
  );
}
