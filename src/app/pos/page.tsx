
"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  X,
  CheckCircle2,
  ListOrdered,
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { QuantityDialog } from "@/components/pos/quantity-dialog";
import { ProductSearch } from "@/components/pos/product-search";

type CartItem = Product & {
  quantity: number;
};

export default function PosPage() {
  const { decreaseStock, getProductById } = useProducts();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isPaymentModalOpen, setPaymentModalOpen] = useState(false);
  const [productForQuantity, setProductForQuantity] = useState<Product | null>(null);
  const { toast } = useToast();
  const { addSale } = useSales();
  const { addOrder } = useOrders();
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    searchInputRef.current?.focus();
  }, []);

  const handleProductSelect = (product: Product) => {
    setProductForQuantity(product);
  };
  
  const handleAddToCart = (product: Product, quantityToAdd: number) => {
    if (quantityToAdd <= 0) {
      setProductForQuantity(null);
      return;
    }

    if (quantityToAdd > product.stock) {
        toast({
            title: "Estoque Insuficiente",
            description: `A quantidade máxima para ${product.name} é ${product.stock}.`,
            variant: "destructive",
        });
        return;
    }

    setCart((currentCart) => {
      const existingItem = currentCart.find((item) => item.id === product.id);
      if (existingItem) {
        const newQuantity = existingItem.quantity + quantityToAdd;
        if (newQuantity > product.stock) {
          toast({
            title: "Estoque Insuficiente",
            description: `Você já tem ${existingItem.quantity} no carrinho. A quantidade máxima em estoque para ${product.name} é ${product.stock}.`,
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
        return [...currentCart, { ...product, quantity: quantityToAdd }];
      }
    });

    setProductForQuantity(null);
    setTimeout(() => searchInputRef.current?.focus(), 100);
  };

  const handleCloseQuantityDialog = () => {
    setProductForQuantity(null);
    setTimeout(() => searchInputRef.current?.focus(), 100);
  }

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
        <header className="flex items-center gap-2 p-4 border-b bg-background flex-wrap">
          <ProductSearch 
            ref={searchInputRef}
            onProductSelect={handleProductSelect} 
          />
          <div className="ml-auto flex items-center gap-2">
             <Button size="sm" onClick={handleCreateOrder} variant="secondary" disabled={cart.length === 0}>
                <ListOrdered className="mr-2 h-4 w-4" /> Criar Pedido
            </Button>
            <Button size="sm" onClick={() => setPaymentModalOpen(true)} disabled={cart.length === 0}>
              <CheckCircle2 className="mr-2 h-4 w-4" /> Finalizar Venda
            </Button>
          </div>
        </header>

        <main className="flex-1 flex flex-col p-4 gap-4">
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
                        className="h-[calc(100vh-250px)] text-center text-muted-foreground"
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

        {productForQuantity && (
            <QuantityDialog
                product={productForQuantity}
                onClose={handleCloseQuantityDialog}
                onConfirm={handleAddToCart}
            />
        )}
        
        {isPaymentModalOpen && (
            <PaymentDialog
            isOpen={isPaymentModalOpen}
            onClose={() => setPaymentModalOpen(false)}
            subtotal={total}
            tax={0}
            onConfirmSale={handleConfirmSale}
            />
        )}
      </div>
    </AppShell>
  );
}
