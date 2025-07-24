

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
import { Pencil, Trash, CheckCircle } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";

export default function OrdersPage() {
  const { orders, updateOrderStatus: updateOrderStatusFromContext, faturarPedido } = useOrders();
  const { increaseStock, decreaseStock, getProductById } = useProducts();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const canEditOrder = user?.role === 'Administrador' || user?.role === 'Gerente' || user?.role === 'Vendedor';
  const canManageStatus = user?.role === 'Administrador' || user?.role === 'Gerente';
  
  const getStatusVariant = (status: string) => {
    switch (status) {
      case "Faturado":
        return "default";
      case "Cancelado":
        return "destructive";
      case "Pendente":
        return "secondary";
      default:
        return "outline";
    }
  };
  
  const handleFaturar = (orderId: string) => {
      faturarPedido(orderId);
      toast({
        title: "Pedido Faturado!",
        description: "O pedido foi faturado e uma venda foi gerada."
      });
  };

  const handleDelete = (orderId: string) => {
      updateOrderStatusFromContext(orderId, 'Cancelado', { increaseStock, decreaseStock, getProductById });
      toast({
          title: "Pedido Cancelado",
          description: "O pedido foi cancelado e os itens retornaram ao estoque."
      })
  }

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
                  <TableHead className="w-[200px] text-center">Ações</TableHead>
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
                        <Badge variant={getStatusVariant(order.status) as any}>
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {formatBRL(order.total)}
                      </TableCell>
                       <TableCell className="text-center">
                        {order.status === 'Pendente' && (
                            <div className="flex gap-2 justify-center">
                                {canEditOrder && (
                                  <Button asChild size="sm" variant="outline">
                                      <Link href={`/pdv?orderId=${order.id}`}>
                                          <Pencil className="mr-2 h-4 w-4" />
                                          Alterar
                                      </Link>
                                  </Button>
                                )}
                                {canManageStatus && (
                                   <Button onClick={() => handleFaturar(order.id)} size="sm">
                                      <CheckCircle className="mr-2 h-4 w-4" />
                                      Faturar
                                  </Button>
                                )}
                                 {canEditOrder && (
                                  <Button onClick={() => handleDelete(order.id)} size="sm" variant="destructive">
                                      <Trash className="mr-2 h-4 w-4" />
                                      Excluir
                                  </Button>
                                )}
                            </div>
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
