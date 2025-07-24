
"use client";

import { useState } from "react";
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
import { useSales, type Sale } from "@/context/SalesContext";
import { useProducts } from "@/context/ProductsContext";
import { formatBRL } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { XCircle } from "lucide-react";
import { CancelSaleDialog } from "@/components/sales/cancel-sale-dialog";
import { useToast } from "@/hooks/use-toast";

export default function SalesPage() {
  const { sales, cancelSale: cancelSaleFromContext } = useSales();
  const { increaseStock } = useProducts();
  const [saleToCancel, setSaleToCancel] = useState<Sale | null>(null);
  const { toast } = useToast();

  const handleCancelClick = (sale: Sale) => {
    setSaleToCancel(sale);
  };

  const handleConfirmCancel = () => {
    if (saleToCancel) {
      cancelSaleFromContext(saleToCancel.id, increaseStock);
      toast({
        title: "Venda Cancelada!",
        description: `A venda ${saleToCancel.id} foi cancelada e os itens retornaram ao estoque.`,
      });
      setSaleToCancel(null);
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "Finalizada":
        return "default";
      case "Cancelada":
        return "destructive";
      default:
        return "secondary";
    }
  };

  return (
    <AppShell>
      <div className="p-4 sm:px-6 sm:py-4">
        <Card>
          <CardHeader>
            <CardTitle>Vendas Finalizadas</CardTitle>
            <CardDescription>
              Consulte e gerencie o histórico de todas as vendas.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID da Venda</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Itens</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead className="w-[120px] text-center">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sales.length > 0 ? (
                  sales.map((sale) => (
                    <TableRow key={sale.id}>
                      <TableCell className="font-medium">{sale.id}</TableCell>
                      <TableCell>{sale.customer}</TableCell>
                      <TableCell>{sale.items.length} item(s)</TableCell>
                      <TableCell>{new Date(sale.date).toLocaleString('pt-BR', { timeZone: 'UTC' })}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(sale.status) as any}>{sale.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {formatBRL(sale.amount)}
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={sale.status === 'Cancelada'}
                          onClick={() => handleCancelClick(sale)}
                        >
                          <XCircle className="mr-2 h-4 w-4" />
                          Cancelar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      Nenhuma venda registrada.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
      <CancelSaleDialog
        isOpen={!!saleToCancel}
        onClose={() => setSaleToCancel(null)}
        onConfirm={handleConfirmCancel}
        sale={saleToCancel}
      />
    </AppShell>
  );
}
