"use client";

import React, { useState, useMemo } from "react";
import { PlusCircle, Search, X } from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { useSales } from "@/context/SalesContext";
import { useOrders } from "@/context/OrdersContext";
import { PaymentDialog } from "@/components/pos/payment-dialog";

const allProducts = [
  { id: 1, name: "Coca-Cola 2L", price: 7.0, stock: 150, category: "Refrigerante" },
  { id: 2, name: "Guaraná Antarctica 2L", price: 6.5, stock: 120, category: "Refrigerante" },
  { id: 3, name: "Skol 350ml Lata", price: 3.5, stock: 300, category: "Cerveja" },
  { id: 4, name: "Brahma 350ml Lata", price: 3.4, stock: 280, category: "Cerveja" },
  { id: 5, name: "Heineken 330ml Long Neck", price: 5.5, stock: 180, category: "Cerveja" },
  { id: 6, name: "Red Bull Energy Drink", price: 9.0, stock: 90, category: "Energético" },
];

type CartItem = {
  id: number;
  name: string;
  price: number;
  quantity: number;
};

export default function PosPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [customerName, setCustomerName] = useState("Cliente Balcão");
  const [isPaymentModalOpen, setPaymentModalOpen] = useState(false);
  const { toast } = useToast();
  const { addSale } = useSales();
  const { addOrder } = useOrders();

  const formatBRL = (value: number) => {
    return value.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const addToCart = (product: typeof allProducts[0]) => {
    setCart((currentCart) => {
      const existingItem = currentCart.find((item) => item.id === product.id);
      if (existingItem) {
        return currentCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...currentCart, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: number) => {
    setCart((currentCart) =>
      currentCart.filter((item) => item.id !== productId)
    );
  };

  const updateQuantity = (productId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
    } else {
      setCart((currentCart) =>
        currentCart.map((item) =>
          item.id === productId ? { ...item, quantity: newQuantity } : item
        )
      );
    }
  };

  const filteredProducts = useMemo(() => {
    return allProducts.filter((product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);
  
  const subtotal = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  }, [cart]);

  const tax = subtotal * 0.05; // 5% tax
  const total = subtotal + tax;

  const handleConfirmSale = ({ paymentAmounts, change, cardFee }: { paymentAmounts: Record<string, number>; change: number; cardFee: number }) => {
    if (cart.length === 0) {
      return;
    }

    const finalTotal = subtotal + tax + cardFee;

    const newSale = {
      customer: customerName || "Cliente Balcão",
      product: cart.length > 1 ? `${cart[0].name} e outros` : cart[0].name,
      amount: finalTotal,
    };
    addSale(newSale);
    
    const paymentMethodsUsed = Object.keys(paymentAmounts).join(" e ");
    toast({
      title: "Venda Finalizada!",
      description: `Venda registrada com ${paymentMethodsUsed}. ${change > 0.001 ? `Troco: R$${formatBRL(change)}` : ''}`.trim(),
    });

    setCart([]);
    setCustomerName("Cliente Balcão");
    setPaymentModalOpen(false);
  };

  const handleCreateOrder = () => {
    if (cart.length === 0) {
      toast({
        title: "Carrinho Vazio",
        description: "Adicione produtos ao carrinho antes de criar um pedido.",
        variant: "destructive",
      });
      return;
    }

    const newOrder = {
      customer: customerName || "Cliente Balcão",
      items: cart,
      total: subtotal + tax,
    };
    addOrder(newOrder);

    toast({
      title: "Pedido Criado!",
      description: `O pedido para ${customerName} foi salvo e pode ser visto na página de Pedidos.`,
    });

    setCart([]);
    setCustomerName("Cliente Balcão");
  };

  return (
    <AppShell>
      <div className="grid h-full flex-1 gap-4 p-4 md:grid-cols-2 lg:grid-cols-3 md:p-6">
        <div className="flex flex-col gap-4 lg:col-span-2">
          <Card className="flex flex-1 flex-col overflow-hidden">
            <CardHeader>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar produtos..."
                  className="w-full rounded-lg bg-background pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent className="flex-1 p-6">
              <ScrollArea className="h-full">
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                  {filteredProducts.map((product) => (
                    <Card key={product.id} className="overflow-hidden">
                      <CardContent className="flex flex-col items-center justify-center p-4 text-center">
                        <img
                          src={`https://placehold.co/100x100.png`}
                          alt={product.name}
                          className="mb-2 rounded-md"
                          data-ai-hint="beverage drink"
                        />
                        <h3 className="text-sm font-semibold">{product.name}</h3>
                        <p className="text-xs text-muted-foreground">{`R$${formatBRL(
                          product.price
                        )}`}</p>
                      </CardContent>
                      <CardFooter className="p-0">
                        <Button
                          className="w-full rounded-t-none"
                          onClick={() => addToCart(product)}
                        >
                          <PlusCircle className="mr-2 h-4 w-4" /> Adicionar
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
        <div className="flex flex-col gap-4">
          <Card className="flex flex-1 flex-col overflow-hidden">
            <CardHeader>
              <CardTitle>Pedido Atual</CardTitle>
              <div className="mt-4 grid gap-2">
                <Label htmlFor="customer-name">Cliente</Label>
                <Input
                  id="customer-name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Nome do Cliente"
                />
              </div>
            </CardHeader>
            <CardContent className="flex-1 p-0">
              <ScrollArea className="h-[calc(100vh-22rem)]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Produto</TableHead>
                      <TableHead>Qtd</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cart.length > 0 ? (
                      cart.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">
                            {item.name}
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              value={item.quantity}
                              onChange={(e) =>
                                updateQuantity(
                                  item.id,
                                  parseInt(e.target.value, 10)
                                )
                              }
                              className="h-8 w-16"
                            />
                          </TableCell>
                          <TableCell className="text-right">
                            {`R$${formatBRL(item.price * item.quantity)}`}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeFromCart(item.id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={4}
                          className="h-24 text-center text-muted-foreground"
                        >
                          Seu carrinho está vazio
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
            <CardFooter className="flex flex-col gap-4 border-t p-6">
              <div className="flex w-full justify-between text-sm text-muted-foreground">
                <span>Subtotal</span>
                <span>{`R$${formatBRL(subtotal)}`}</span>
              </div>
              <div className="flex w-full justify-between text-sm text-muted-foreground">
                <span>Impostos (5%)</span>
                <span>{`R$${formatBRL(tax)}`}</span>
              </div>
              <Separator className="my-1" />
              <div className="flex w-full justify-between text-lg font-semibold">
                <span>Total</span>
                <span>{`R$${formatBRL(total)}`}</span>
              </div>

              <div className="mt-2 grid w-full grid-cols-2 gap-2">
                <Button
                  size="lg"
                  variant="outline"
                  onClick={handleCreateOrder}
                  disabled={cart.length === 0}
                >
                  Criar Pedido
                </Button>
                <Button
                  size="lg"
                  onClick={() => setPaymentModalOpen(true)}
                  disabled={cart.length === 0}
                >
                  Finalizar Venda
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
      {isPaymentModalOpen && (
        <PaymentDialog
          isOpen={isPaymentModalOpen}
          onClose={() => setPaymentModalOpen(false)}
          subtotal={subtotal}
          tax={tax}
          onConfirmSale={handleConfirmSale}
        />
      )}
    </AppShell>
  );
}
