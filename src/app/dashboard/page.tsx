

"use client";

import {
  CreditCard,
  DollarSign,
  PackageX,
  ListOrdered,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { OverviewChart } from "@/components/dashboard/overview";
import { useSales } from "@/context/SalesContext";
import { useOrders } from "@/context/OrdersContext";
import { useProducts } from "@/context/ProductsContext";
import { formatBRL } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";


export default function DashboardPage() {
  const { sales, totalSalesValue, salesLastMonthPercentage, isMounted: salesMounted } = useSales();
  const { orders, ordersLastMonthPercentage, isMounted: ordersMounted } = useOrders();
  const { products, isMounted: productsMounted } = useProducts();

  const isMounted = salesMounted && ordersMounted && productsMounted;

  const lowStockProducts = products.filter(p => p.stock < 10).length;
  const recentSales = sales.slice(0, 5);
  
  return (
      <div className="p-4 sm:px-6 sm:py-4 space-y-4 md:space-y-8">
        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Receita Total
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isMounted ? (
                <>
                  <div className="text-2xl font-bold">{formatBRL(totalSalesValue)}</div>
                  <p className="text-xs text-muted-foreground">
                    {salesLastMonthPercentage >= 0 ? `+${salesLastMonthPercentage.toFixed(1)}%` : `${salesLastMonthPercentage.toFixed(1)}%`} do mês passado
                  </p>
                </>
              ) : (
                <>
                  <Skeleton className="h-8 w-3/4" />
                  <Skeleton className="h-4 w-1/2 mt-1" />
                </>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total de Pedidos
              </CardTitle>
              <ListOrdered className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
               {isMounted ? (
                <>
                  <div className="text-2xl font-bold">+{orders.length}</div>
                  <p className="text-xs text-muted-foreground">
                    {ordersLastMonthPercentage >= 0 ? `+${ordersLastMonthPercentage.toFixed(1)}%` : `${ordersLastMonthPercentage.toFixed(1)}%`} do mês passado
                  </p>
                </>
               ) : (
                <>
                  <Skeleton className="h-8 w-3/4" />
                  <Skeleton className="h-4 w-1/2 mt-1" />
                </>
               )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Vendas</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isMounted ? (
                <>
                  <div className="text-2xl font-bold">+{sales.length}</div>
                  <p className="text-xs text-muted-foreground">
                    {salesLastMonthPercentage >= 0 ? `+${salesLastMonthPercentage.toFixed(1)}%` : `${salesLastMonthPercentage.toFixed(1)}%`} do mês passado
                  </p>
                </>
               ) : (
                <>
                  <Skeleton className="h-8 w-3/4" />
                  <Skeleton className="h-4 w-1/2 mt-1" />
                </>
               )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Produtos com Baixo Estoque
              </CardTitle>
              <PackageX className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isMounted ? (
                <>
                  <div className="text-2xl font-bold">{lowStockProducts}</div>
                  <p className="text-xs text-muted-foreground">
                    Produtos com menos de 10 unidades
                  </p>
                </>
              ) : (
                 <>
                  <Skeleton className="h-8 w-3/4" />
                  <Skeleton className="h-4 w-1/2 mt-1" />
                </>
              )}
            </CardContent>
          </Card>
        </div>
        <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
          <Card className="xl:col-span-2">
            <CardHeader>
              <CardTitle>Visão Geral de Vendas</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
              {isMounted ? <OverviewChart /> : <Skeleton className="w-full h-[350px]" />}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Vendas Recentes</CardTitle>
              <CardDescription>
                As últimas 5 vendas realizadas.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                 {isMounted ? (
                  recentSales.length > 0 ? (
                    recentSales.map(sale => (
                      <div className="flex items-center" key={sale.id}>
                        <Avatar className="h-9 w-9">
                          <AvatarImage src="https://placehold.co/36x36.png" alt="Avatar" data-ai-hint="person" />
                          <AvatarFallback>{sale.customer.substring(0,2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="ml-4 space-y-1">
                          <p className="text-sm font-medium leading-none">
                            {sale.customer}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(sale.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                          </p>
                        </div>
                        <div className="ml-auto font-medium">{formatBRL(sale.amount)}</div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground text-center">Nenhuma venda recente.</p>
                  )
                ) : (
                  Array.from({ length: 5 }).map((_, index) => (
                    <div className="flex items-center" key={index}>
                      <Skeleton className="h-9 w-9 rounded-full" />
                      <div className="ml-4 space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                      <Skeleton className="h-5 w-16 ml-auto" />
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
  );
}
