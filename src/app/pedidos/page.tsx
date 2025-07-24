

"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/context/AuthContext";
import { useOrders, type OrderStatus } from "@/context/OrdersContext";
import { useProducts } from "@/context/ProductsContext";
import { formatBRL } from "@/lib/utils";
import { CreditCard } from "lucide-react";
import Link from "next/link";

export default function OrdersPage() {
  const { orders, updateOrderStatus: updateOrderStatusFromContext } = useOrders();
  const { increaseStock, decreaseStock, getProductById } = useProducts();
  const { user } = useAuth();
  
  const canEditStatus = user?.role === 'Administrador' || user?.role === 'Gerente';

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "Finalizado":
        return "default";
      case "Cancelado":
        return "destructive";
      case "Pendente":
        return "secondary";
      default:
        return "outline";
    }
  };

  const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
    updateOrderStatusFromContext(orderId, newStatus, { increaseStock, decreaseStock, getProductById });
  };

  return (
      <div className="p-4 sm:px-6 sm:py-4">
        <Card>
          <CardHeader>
            <CardTitle>Gestão de Pedidos</CardTitle>
            <CardDescription>
              Registro, consulta e gerenciamento de pedidos realizados.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pedido</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Itens</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead className="w-[120px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.length > 0 ? (
                  orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.displayId}</TableCell>
                      <TableCell>{order.customer}</TableCell>
                      <TableCell>{order.items.length} item(s)</TableCell>
                      <TableCell>{new Date(order.date).toLocaleDateString('pt-BR')}</TableCell>
                      <TableCell>
                        <Select
                          value={order.status}
                          onValueChange={(newStatus) =>
                            handleStatusChange(order.id, newStatus as OrderStatus)
                          }
                          disabled={!canEditStatus || order.status === "Finalizado"}
                        >
                          <SelectTrigger className="w-auto border-0 p-0 focus:ring-0 focus:ring-offset-0">
                            <Badge variant={getStatusVariant(order.status) as any}>
                              {order.status}
                            </Badge>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Pendente">Pendente</SelectItem>
                            <SelectItem value="Finalizado">Finalizado</SelectItem>
                            <SelectItem value="Cancelado">Cancelado</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-right">
                        {formatBRL(order.total)}
                      </TableCell>
                       <TableCell className="text-right">
                        {order.status === 'Pendente' && (
                          <Button asChild size="sm" variant="outline">
                            <Link href={`/pdv?orderId=${order.id}`}>
                              <CreditCard className="mr-2 h-4 w-4" />
                              Faturar
                            </Link>
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      Nenhum pedido registrado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
  );
}
