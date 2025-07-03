"use client";

import React, { useState, useMemo } from "react";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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
  const [paymentMethod, setPaymentMethod] = useState("dinheiro");
  const { toast } = useToast();

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

  const handleFinishSale = () => {
    if (cart.length === 0) {
      toast({
        title: "Carrinho Vazio",
        description: "Adicione produtos ao carrinho antes de finalizar a venda.",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Venda Finalizada!",
      description: `A venda foi registrada com sucesso no ${paymentMethod}.`,
    });

    setCart([]);
  };

  return (
    <AppShell>
      <div className="grid flex-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="flex flex-col gap-4 lg:col-span-2">
          <Card>
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
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredProducts.map((product) => (
                  <Card key={product.id} className="overflow-hidden">
                    <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                       <img src={`https://placehold.co/100x100.png`} alt={product.name} className="rounded-md mb-2" data-ai-hint="beverage drink"/>
                      <h3 className="font-semibold text-sm">{product.name}</h3>
                      <p className="text-muted-foreground text-xs">{`R$${product.price.toFixed(2)}`}</p>
                    </CardContent>
                    <CardFooter className="p-0">
                      <Button className="w-full rounded-t-none" onClick={() => addToCart(product)}>
                        <PlusCircle className="mr-2 h-4 w-4" /> Adicionar
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Pedido Atual</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[400px]">
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
                          <TableCell className="font-medium">{item.name}</TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              value={item.quantity}
                              onChange={(e) =>
                                updateQuantity(item.id, parseInt(e.target.value, 10))
                              }
                              className="h-8 w-16"
                            />
                          </TableCell>
                          <TableCell className="text-right">
                            {`R$${(item.price * item.quantity).toFixed(2)}`}
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="icon" onClick={() => removeFromCart(item.id)}>
                              <X className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="h-[400px] text-center text-muted-foreground">
                          Seu carrinho está vazio
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
            <CardFooter className="flex flex-col gap-4 border-t p-6">
              <div className="w-full flex justify-between text-sm text-muted-foreground">
                <span>Subtotal</span>
                <span>{`R$${subtotal.toFixed(2)}`}</span>
              </div>
              <div className="w-full flex justify-between text-sm text-muted-foreground">
                <span>Impostos (5%)</span>
                <span>{`R$${tax.toFixed(2)}`}</span>
              </div>
              <Separator className="my-1" />
              <div className="w-full flex justify-between font-semibold text-lg">
                <span>Total</span>
                <span>{`R$${total.toFixed(2)}`}</span>
              </div>
              <Separator className="my-1" />
              <div className="grid gap-4 w-full">
                <Label className="text-base">Forma de Pagamento</Label>
                <RadioGroup 
                  defaultValue="dinheiro" 
                  className="grid grid-cols-2 gap-4"
                  value={paymentMethod}
                  onValueChange={setPaymentMethod}
                >
                  <div>
                    <RadioGroupItem value="Dinheiro" id="dinheiro" className="peer sr-only" />
                    <Label
                      htmlFor="dinheiro"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                    >
                      <Banknote className="mb-3 h-6 w-6" />
                      Dinheiro
                    </Label>
                  </div>
                  <div>
                    <RadioGroupItem
                      value="Débito"
                      id="cartao-debito"
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor="cartao-debito"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                    >
                      <CreditCard className="mb-3 h-6 w-6" />
                      Débito
                    </Label>
                  </div>
                   <div>
                    <RadioGroupItem
                      value="Crédito"
                      id="cartao-credito"
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor="cartao-credito"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                    >
                      <CreditCard className="mb-3 h-6 w-6" />
                      Crédito
                    </Label>
                  </div>
                  <div>
                    <RadioGroupItem
                      value="PIX"
                      id="pix"
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor="pix"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                    >
                      <Landmark className="mb-3 h-6 w-6" />
                      PIX
                    </Label>
                  </div>
                </RadioGroup>
              </div>
              <Button size="lg" className="w-full mt-2" onClick={handleFinishSale}>
                Finalizar Venda
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
