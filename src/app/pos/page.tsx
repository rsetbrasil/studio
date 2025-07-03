"use client";

import React, { useState, useMemo, useRef } from "react";
import { Banknote, CreditCard, Landmark, PlusCircle, Search, X } from "lucide-react";

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
import { Checkbox } from "@/components/ui/checkbox";

const allProducts = [
  { id: 1, name: "Coca-Cola 2L", price: 7.0, stock: 150, category: "Refrigerante" },
  { id: 2, name: "Guaraná Antarctica 2L", price: 6.5, stock: 120, category: "Refrigerante" },
  { id: 3, name: "Skol 350ml Lata", price: 3.5, stock: 300, category: "Cerveja" },
  { id: 4, name: "Brahma 350ml Lata", price: 3.4, stock: 280, category: "Cerveja" },
  { id: 5, name: "Heineken 330ml Long Neck", price: 5.5, stock: 180, category: "Cerveja" },
  { id: 6, name: "Red Bull Energy Drink", price: 9.0, stock: 90, category: "Energético" },
];

const CREDIT_FEE_RATE = 0.03; // 3%
const DEBIT_FEE_RATE = 0.015; // 1.5%

type CartItem = {
  id: number;
  name: string;
  price: number;
  quantity: number;
};

export default function PosPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [paymentAmounts, setPaymentAmounts] = useState<Record<string, number>>({});
  const [customerName, setCustomerName] = useState("Cliente Balcão");
  const { toast } = useToast();
  const { addSale } = useSales();
  const paymentInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

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

  const cardFee = useMemo(() => {
    let fee = 0;
    const paymentMethods = Object.keys(paymentAmounts);

    if (paymentMethods.includes("Crédito")) {
      fee = Math.max(fee, subtotal * CREDIT_FEE_RATE);
    }
    if (paymentMethods.includes("Débito")) {
      fee = Math.max(fee, subtotal * DEBIT_FEE_RATE);
    }
    
    return fee;
  }, [paymentAmounts, subtotal]);

  const total = subtotal + tax + cardFee;

  const totalPaid = useMemo(() => {
    return Object.values(paymentAmounts).reduce((acc, amount) => acc + (amount || 0), 0);
  }, [paymentAmounts]);

  const balance = total - totalPaid;
  const change = balance < -0.001 ? Math.abs(balance) : 0;

  const handleFinishSale = () => {
    if (cart.length === 0) {
      toast({
        title: "Carrinho Vazio",
        description: "Adicione produtos ao carrinho antes de finalizar a venda.",
        variant: "destructive",
      });
      return;
    }

    if (balance > 0.001) {
      toast({
        title: "Pagamento Incompleto",
        description: `Ainda falta pagar R$${formatBRL(balance)}.`,
        variant: "destructive",
      });
      return;
    }

    const newSale = {
      customer: customerName || "Cliente Balcão",
      product: cart.length > 1 ? `${cart[0].name} e outros` : cart[0].name,
      amount: total,
    };
    addSale(newSale);
    
    const paymentMethodsUsed = Object.keys(paymentAmounts).join(" e ");
    toast({
      title: "Venda Finalizada!",
      description: `Venda registrada com ${paymentMethodsUsed}. ${change > 0.001 ? `Troco: R$${formatBRL(change)}` : ''}`.trim(),
    });

    setCart([]);
    setCustomerName("Cliente Balcão");
    setPaymentAmounts({});
  };

  const paymentOptions = [
    { value: "Dinheiro", label: "Dinheiro", icon: Banknote, fee: 0 },
    { value: "Débito", label: "Débito", icon: CreditCard, fee: DEBIT_FEE_RATE },
    { value: "Crédito", label: "Crédito", icon: CreditCard, fee: CREDIT_FEE_RATE },
    { value: "PIX", label: "PIX", icon: Landmark, fee: 0 },
  ];

  const handlePaymentMethodChange = (method: string, checked: boolean | 'indeterminate') => {
    setPaymentAmounts(prev => {
        const newAmounts = { ...prev };
        
        let finalMethods: string[];
        if (checked) {
            finalMethods = [...Object.keys(prev), method];
        } else {
            delete newAmounts[method];
            finalMethods = Object.keys(newAmounts);
        }

        let fee = 0;
        if (finalMethods.includes("Crédito")) fee = Math.max(fee, subtotal * CREDIT_FEE_RATE);
        if (finalMethods.includes("Débito")) fee = Math.max(fee, subtotal * DEBIT_FEE_RATE);
        const finalTotal = subtotal + tax + fee;

        if (checked) {
            const paidSoFar = Object.values(prev).reduce((sum, amt) => sum + amt, 0);
            const remaining = finalTotal - paidSoFar;
            newAmounts[method] = Math.round(Math.max(0, remaining) * 100) / 100;
        } 
        
        return newAmounts;
    });

    if (checked) {
      setTimeout(() => {
        const inputElement = paymentInputRefs.current[method];
        if (inputElement) {
          inputElement.focus();
          inputElement.select();
        }
      }, 100);
    }
  };

  const handlePaymentAmountChange = (method: string, amountStr: string) => {
      const amount = parseFloat(amountStr) || 0;
      setPaymentAmounts(prev => ({
          ...prev,
          [method]: amount
      }));
  };

  return (
    <AppShell>
      <div className="grid flex-1 gap-4 md:grid-cols-2 lg:grid-cols-3 h-full">
        <div className="flex flex-col gap-4 lg:col-span-2 h-full">
          <Card className="flex h-full flex-col">
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
        <div className="flex flex-col gap-4 h-full">
          <Card className="flex h-full flex-col">
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
              <ScrollArea className="h-full">
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
              {cardFee > 0.001 && (
                <div className="flex w-full justify-between text-sm text-muted-foreground">
                  <span>Taxa do Cartão</span>
                  <span>{`R$${formatBRL(cardFee)}`}</span>
                </div>
              )}
              <Separator className="my-1" />
              <div className="flex w-full justify-between text-lg font-semibold">
                <span>Total</span>
                <span>{`R$${formatBRL(total)}`}</span>
              </div>
              <div className="flex w-full justify-between text-sm text-primary">
                <span>Total Pago</span>
                <span>{`R$${formatBRL(totalPaid)}`}</span>
              </div>
              <div
                className={`flex w-full justify-between text-sm ${
                  balance > 0.001 ? "text-destructive" : "text-muted-foreground"
                }`}
              >
                <span>A Pagar</span>
                <span>{`R$${formatBRL(Math.max(0, balance))}`}</span>
              </div>
              {change > 0 && (
                <div className="flex w-full justify-between text-sm font-semibold text-primary">
                  <span>Troco</span>
                  <span>{`R$${formatBRL(change)}`}</span>
                </div>
              )}

              <Separator className="my-1" />
              <div className="grid w-full gap-4">
                <Label className="text-base">Forma de Pagamento</Label>
                <div className="grid grid-cols-2 gap-4">
                  {paymentOptions.map(({ value, label, icon: Icon, fee }) => {
                    const isChecked = paymentAmounts[value] !== undefined;
                    return (
                      <div key={value}>
                        <Checkbox
                          id={value}
                          checked={isChecked}
                          onCheckedChange={(checked) =>
                            handlePaymentMethodChange(value, checked)
                          }
                          className="peer sr-only"
                        />
                        <Label
                          htmlFor={value}
                          className="flex cursor-pointer flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                        >
                          <Icon className="mb-3 h-6 w-6" />
                          <div className="flex flex-col items-center gap-1">
                            <span>{label}</span>
                            {fee > 0 && (
                              <span className="text-xs font-normal text-muted-foreground">
                                (taxa {(fee * 100).toFixed(1).replace(".", ",")}
                                %)
                              </span>
                            )}
                          </div>
                        </Label>
                        {isChecked && (
                          <Input
                            ref={(el) => {
                              paymentInputRefs.current[value] = el;
                            }}
                            type="number"
                            placeholder="Valor"
                            value={paymentAmounts[value]}
                            onChange={(e) =>
                              handlePaymentAmountChange(value, e.target.value)
                            }
                            className="mt-2 h-9"
                            onClick={(e) => {
                              e.stopPropagation();
                              (e.target as HTMLInputElement).select();
                            }}
                            onFocus={(e) => e.target.select()}
                            step="0.01"
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
              <Button
                size="lg"
                className="mt-2 w-full"
                onClick={handleFinishSale}
                disabled={cart.length === 0 || balance > 0.001}
              >
                Finalizar Venda
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
