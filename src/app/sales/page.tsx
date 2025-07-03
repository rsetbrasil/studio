"use client";

import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useSales } from "@/context/SalesContext";
import { formatBRL } from "@/lib/utils";

export default function SalesPage() {
  const { sales } = useSales();

  return (
    <AppShell>
      <div className="p-4 sm:px-6 sm:py-4">
        <Card>
          <CardHeader>
            <CardTitle>Vendas Finalizadas</CardTitle>
            <CardDescription>
              Consulte o histórico de todas as vendas finalizadas.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID da Venda</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Produto Principal</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sales.length > 0 ? (
                  sales.map((sale) => (
                    <TableRow key={sale.id}>
                      <TableCell className="font-medium">{sale.id}</TableCell>
                      <TableCell>{sale.customer}</TableCell>
                      <TableCell>{sale.product}</TableCell>
                      <TableCell>{sale.date}</TableCell>
                      <TableCell>
                        <Badge variant="default">{sale.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {formatBRL(sale.amount)}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      Nenhuma venda registrada.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
