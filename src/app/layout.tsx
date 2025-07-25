
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { SalesProvider } from "@/context/SalesContext";
import { OrdersProvider } from "@/context/OrdersContext";
import { ProductsProvider } from "@/context/ProductsContext";
import { FinancialProvider } from "@/context/FinancialContext";
import { CashRegisterProvider } from "@/context/CashRegisterContext";
import { UsersProvider } from "@/context/UsersContext";
import { CompanyProvider } from "@/context/CompanyContext";
import { AuthProvider } from "@/context/AuthContext";
import { AppShellController } from "@/components/app-shell-controller";
import { FiadoProvider } from "@/context/FiadoContext";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Distribuidora",
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
        <UsersProvider>
          <AuthProvider>
            <CompanyProvider>
              <ProductsProvider>
                <OrdersProvider>
                  <SalesProvider>
                    <FinancialProvider>
                      <FiadoProvider>
                        <CashRegisterProvider>
                          <AppShellController>
                            {children}
                          </AppShellController>
                        </CashRegisterProvider>
                      </FiadoProvider>
                    </FinancialProvider>
                  </SalesProvider>
                </OrdersProvider>
              </ProductsProvider>
            </CompanyProvider>
          </AuthProvider>
        </UsersProvider>
        <Toaster />
      </body>
    </html>
  );
}
