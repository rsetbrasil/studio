
"use client";

import { useState, useRef, useEffect, useMemo } from "react";
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
import { Input } from "@/components/ui/input";
import { useSales, type Sale } from "@/context/SalesContext";
import { useProducts } from "@/context/ProductsContext";
import { formatBRL } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { XCircle, Printer, Pencil, Search } from "lucide-react";
import { CancelSaleDialog } from "@/components/sales/cancel-sale-dialog";
import { useToast } from "@/hooks/use-toast";
import { Receipt } from "@/components/pos/receipt";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function SalesPage() {
  const { sales, cancelSale, isMounted, getSaleById } = useSales();
  const { increaseStock } = useProducts();
  const [saleToCancel, setSaleToCancel] = useState<Sale | null>(null);
  const [saleToPrint, setSaleToPrint] = useState<(Sale & { change: number, totalPaid: number }) | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const receiptRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const router = useRouter();
  
  const canManageSale = user?.role === 'Administrador' || user?.role === 'Gerente';

  const filteredSales = useMemo(() => {
    if (!isMounted) return [];
    const lowercasedTerm = searchTerm.toLowerCase();
    if (!lowercasedTerm) return sales;
    return sales.filter(
      (sale) =>
        sale.customer.toLowerCase().includes(lowercasedTerm) ||
        sale.displayId.toLowerCase().includes(lowercasedTerm)
    );
  }, [sales, searchTerm, isMounted]);

  const handleCancelClick = (sale: Sale) => {
    setSaleToCancel(sale);
  };

  const handleConfirmCancel = () => {
    if (saleToCancel) {
      cancelSale(saleToCancel.id, increaseStock);
      toast({
        title: "Venda Cancelada!",
        description: `A venda ${saleToCancel.displayId} foi cancelada e os itens retornaram ao estoque.`,
      });
      setSaleToCancel(null);
    }
  };
  
  const handlePrintRequest = (saleId: string) => {
    const sale = getSaleById(saleId);
    if (sale) {
      // Assuming 0 change and total paid equals amount for reprint of already finalized/fiado sales
      setSaleToPrint({ ...sale, change: 0, totalPaid: sale.amount }); 
    }
  };

  const handleEditRequest = (saleId: string) => {
    router.push(`/pdv?saleId=${saleId}`);
  };
  
  const handleActualPrint = () => {
    window.print();
  }

  useEffect(() => {
    if (saleToPrint && receiptRef.current) {
      handleActualPrint();
      setSaleToPrint(null); // Reset after printing
    }
  }, [saleToPrint]);


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
    <>
      <div className="p-4 sm:px-6 sm:py-4">
        <Card>
          <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex-1">
              <CardTitle>Vendas Finalizadas</CardTitle>
              <CardDescription>
                Consulte e gerencie o histórico de todas as vendas.
              </CardDescription>
            </div>
            <div className="relative flex-1 sm:flex-initial">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por cliente ou venda..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 sm:w-64"
              />
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID da Venda</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Forma de Pgto.</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead className="w-[220px] text-center">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isMounted && filteredSales.length > 0 ? (
                  filteredSales.map((sale) => (
                    <TableRow key={sale.id}>
                      <TableCell className="font-medium">{sale.displayId}</TableCell>
                      <TableCell>{sale.customer}</TableCell>
                      <TableCell>{sale.paymentMethod}</TableCell>
                      <TableCell>{new Date(sale.date).toLocaleString('pt-BR', { timeZone: 'UTC' })}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(sale.status) as any}>{sale.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {formatBRL(sale.amount)}
                      </TableCell>
                      <TableCell className="text-center flex gap-2 justify-center">
                         <Button
                          variant="outline"
                          size="sm"
                          disabled={sale.status === 'Cancelada'}
                          onClick={() => handlePrintRequest(sale.id)}
                        >
                          <Printer className="mr-2 h-4 w-4" />
                          Imprimir
                        </Button>
                        {canManageSale && sale.status === 'Finalizada' && (
                           <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditRequest(sale.id)}
                          >
                            <Pencil className="mr-2 h-4 w-4" />
                            Alterar
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={sale.status === 'Cancelada' || sale.status === 'Fiado' || !canManageSale}
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
                      Nenhuma venda encontrada.
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
      <div className="hidden print:block">
        {saleToPrint && <Receipt ref={receiptRef} sale={saleToPrint} user={user} />}
      </div>
    </>
  );
}
