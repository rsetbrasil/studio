
"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  X,
  PlusCircle,
  FileText,
  User,
  Tags,
  MessageSquare,
  Truck,
  Printer,
  MoreHorizontal,
  CheckCircle2,
  ListOrdered
} from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useOrders } from "@/context/OrdersContext";
import { useSales } from "@/context/SalesContext";
import { useProducts, type Product } from "@/context/ProductsContext";
import { useToast } from "@/hooks/use-toast";
import { formatBRL } from "@/lib/utils";
import { PaymentDialog } from "@/components/pos/payment-dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

type CartItem = Product & {
  quantity: number;
};

export default function PosPage() {
  const { products: allProducts, decreaseStock, getProductById } = useProducts();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isPaymentModalOpen, setPaymentModalOpen] = useState(false);
  const [isPopoverOpen, setPopoverOpen] = useState(false);
  const { toast } = useToast();
  const { addSale } = useSales();
  const { addOrder } = useOrders();
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    searchInputRef.current?.focus();
  }, []);

  const addToCart = (product: Product, quantityToAdd: number = 1) => {
    setCart((currentCart) => {
      const existingItem = currentCart.find((item) => item.id === product.id);
      if (existingItem) {
        const newQuantity = existingItem.quantity + quantityToAdd;
        if (newQuantity > product.stock) {
          toast({
            title: "Estoque Insuficiente",
            description: `A quantidade máxima em estoque para ${product.name} é ${product.stock}.`,
            variant: "destructive",
          });
          return currentCart;
        }
        return currentCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: newQuantity }
            : item
        );
      } else {
        if (quantityToAdd > product.stock) {
          toast({
            title: "Estoque Insuficiente",
            description: `A quantidade máxima em estoque para ${product.name} é ${product.stock}.`,
            variant: "destructive",
          });
          return currentCart;
        }
        return [...currentCart, { ...product, quantity: quantityToAdd }];
      }
    });
    setSearchTerm("");
    setPopoverOpen(false);
    setTimeout(() => searchInputRef.current?.focus(), 0);
  };

  const removeFromCart = (productId: number) => {
    setCart((currentCart) =>
      currentCart.filter((item) => item.id !== productId)
    );
  };

  const updateQuantity = (productId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    const product = getProductById(productId);
    if (!product) return;

    if (newQuantity > product.stock) {
      toast({
        title: "Estoque Insuficiente",
        description: `A quantidade máxima em estoque para ${product.name} é ${product.stock}.`,
        variant: "destructive",
      });
      setCart((currentCart) =>
        currentCart.map((item) =>
          item.id === productId ? { ...item, quantity: product.stock } : item
        )
      );
      return;
    }
    
    setCart((currentCart) =>
      currentCart.map((item) =>
        item.id === productId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const filteredProducts = useMemo(() => {
    if (!searchTerm) return [];
    return allProducts.filter((product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(product.id).includes(searchTerm)
    );
  }, [searchTerm, allProducts]);
  
  const total = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  }, [cart]);

  const handleConfirmSale = ({ paymentAmounts, change, cardFee }: { paymentAmounts: Record<string, number>; change: number; cardFee: number }) => {
    if (cart.length === 0) return;

    for (const item of cart) {
        const productInStock = getProductById(item.id);
        if (!productInStock || item.quantity > productInStock.stock) {
            toast({
                title: "Venda não realizada",
                description: `Estoque de ${item.name} insuficiente.`,
                variant: "destructive",
            });
            return;
        }
    }

    decreaseStock(cart.map(item => ({ id: item.id, quantity: item.quantity })));

    const finalTotal = total + cardFee;

    const newSale = {
      customer: "Cliente Balcão",
      product: cart.length > 1 ? `${cart[0].name} e outros` : cart[0].name,
      amount: finalTotal,
    };
    addSale(newSale);
    
    const paymentMethodsUsed = Object.keys(paymentAmounts).join(" e ");
    toast({
      title: "Venda Finalizada!",
      description: `Venda registrada com ${paymentMethodsUsed}. ${change > 0.001 ? `Troco: ${formatBRL(change)}` : ''}`.trim(),
    });

    setCart([]);
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

    for (const item of cart) {
        const productInStock = getProductById(item.id);
        if (!productInStock || item.quantity > productInStock.stock) {
            toast({
                title: "Pedido não criado",
                description: `Estoque de ${item.name} insuficiente.`,
                variant: "destructive",
            });
            return;
        }
    }

    const newOrder = {
      customer: "Cliente Balcão",
      items: cart,
      total: total,
    };
    addOrder(newOrder);

    toast({
      title: "Pedido Criado!",
      description: `O pedido para Cliente Balcão foi salvo e pode ser visto na página de Pedidos.`,
    });

    setCart([]);
  };

  return (
    <AppShell>
      <div className="flex flex-col h-full bg-muted/40">
        <header className="flex items-center gap-2 p-2 border-b bg-background flex-wrap">
          <Button size="sm" onClick={() => setPaymentModalOpen(true)} disabled={cart.length === 0}>
            <CheckCircle2 className="mr-2 h-4 w-4" /> Concluir (F2)
          </Button>
          <Button size="sm" variant="outline"><User className="mr-2 h-4 w-4" /> Cliente (F5)</Button>
          <Button size="sm" variant="outline"><Tags className="mr-2 h-4 w-4" /> Desc (F3)</Button>
          <Button size="sm" variant="outline"><MessageSquare className="mr-2 h-4 w-4" /> Obs (F4)</Button>
          <Button size="sm" variant="outline"><Truck className="mr-2 h-4 w-4" /> Entregar (F9)</Button>
          <Button size="sm" variant="outline"><Printer className="mr-2 h-4 w-4" /> Imprimir</Button>
          <div className="ml-auto flex items-center gap-2">
            <Button size="sm" onClick={handleCreateOrder} variant="secondary" disabled={cart.length === 0}>
                <ListOrdered className="mr-2 h-4 w-4" /> Criar Pedido
            </Button>
            <Button size="icon" variant="ghost" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
          </div>
        </header>

        <main className="flex-1 flex flex-col p-4 gap-4">
          <Popover open={isPopoverOpen} onOpenChange={setPopoverOpen}>
            <PopoverTrigger asChild>
              <div className="relative">
                <Input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Código, Nome ou use o leitor de código de barras"
                  className="w-full text-base"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    if (e.target.value) {
                        setPopoverOpen(true);
                    } else {
                        setPopoverOpen(false);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && filteredProducts.length > 0) {
                      addToCart(filteredProducts[0]);
                    }
                  }}
                />
              </div>
            </PopoverTrigger>
            <PopoverContent 
                className="w-[--radix-popover-trigger-width] p-0" 
                align="start"
                onOpenAutoFocus={(e) => e.preventDefault()}
                >
              <CommandList>
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => (
                    <CommandItem
                      key={product.id}
                      onSelect={() => addToCart(product)}
                    >
                      <span>{product.name}</span>
                      <span className="ml-auto text-muted-foreground">{formatBRL(product.price)}</span>
                    </CommandItem>
                  ))
                ) : (
                  <div className="p-4 text-sm text-center text-muted-foreground">
                    Nenhum produto encontrado.
                  </div>
                )}
              </CommandList>
            </PopoverContent>
          </Popover>

          <div className="flex-1 rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden">
            <ScrollArea className="h-full">
                <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead className="w-[80px]">Item</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead className="w-[150px]">Quant.</TableHead>
                    <TableHead className="w-[150px]">Preço</TableHead>
                    <TableHead className="w-[150px] text-right">Total</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {cart.length > 0 ? (
                    cart.map((item, index) => (
                        <TableRow key={item.id}>
                        <TableCell className="font-medium">{String(index + 1).padStart(2, '0')}</TableCell>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell>
                            <Input
                            type="number"
                            value={item.quantity}
                            onChange={(e) =>
                                updateQuantity(item.id, parseInt(e.target.value) || 0)
                            }
                            className="h-8 w-24"
                            min="1"
                            />
                        </TableCell>
                        <TableCell>{formatBRL(item.price)}</TableCell>
                        <TableCell className="text-right">{formatBRL(item.price * item.quantity)}</TableCell>
                        <TableCell>
                            <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
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
                        colSpan={6}
                        className="h-24 text-center text-muted-foreground"
                        >
                        Nenhum item adicionado.
                        </TableCell>
                    </TableRow>
                    )}
                </TableBody>
                </Table>
            </ScrollArea>
          </div>
        </main>
        
        <footer className="p-4 border-t bg-background">
            <div className="flex items-center justify-end">
                <span className="text-2xl font-bold text-primary">Total = {formatBRL(total)}</span>
            </div>
        </footer>

        {isPaymentModalOpen && (
            <PaymentDialog
            isOpen={isPaymentModalOpen}
            onClose={() => setPaymentModalOpen(false)}
            subtotal={total}
            tax={0} // Tax is already included or not applicable in this new design
            onConfirmSale={handleConfirmSale}
            />
        )}
      </div>
    </AppShell>
  );
}

// Dummy Command components for Popover content styling
const CommandList = ({ children, className }: { children: React.ReactNode, className?: string }) => (
    <div className={cn("max-h-[300px] overflow-y-auto overflow-x-hidden", className)}>
        {children}
    </div>
);

const CommandItem = ({ children, onSelect, className }: { children: React.ReactNode, onSelect: () => void, className?: string }) => (
    <div 
        className={cn("flex cursor-pointer items-center justify-between p-2 hover:bg-accent rounded-md", className)}
        onClick={onSelect}
    >
        {children}
    </div>
);
