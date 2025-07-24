
"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  X,
  CheckCircle2,
  ListOrdered,
  Printer,
  User,
} from "lucide-react";
import { useSearchParams, useRouter } from 'next/navigation';

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
import { useSales, type Sale } from "@/context/SalesContext";
import { useProducts, type Product } from "@/context/ProductsContext";
import { useToast } from "@/hooks/use-toast";
import { formatBRL } from "@/lib/utils";
import { PaymentDialog } from "@/components/pos/payment-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { QuantityDialog } from "@/components/pos/quantity-dialog";
import { ProductSearch } from "@/components/pos/product-search";
import { useReactToPrint } from "react-to-print";
import { Receipt } from "@/components/pos/receipt";
import { Badge } from "@/components/ui/badge";

type CartItem = Product & {
  cartId: string;
  quantity: number;
  salePrice: number;
  unitOfSale: string;
};

export default function PosPage() {
  const { decreaseStock, getProductById, increaseStock } = useProducts();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState("Cliente Balcão");
  const [isPaymentModalOpen, setPaymentModalOpen] = useState(false);
  const [productForQuantity, setProductForQuantity] = useState<Product | null>(null);
  const { toast } = useToast();
  const { addSale } = useSales();
  const { addOrder, getOrderById, updateOrderStatus } = useOrders();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const receiptRef = useRef<HTMLDivElement>(null);
  const [lastSale, setLastSale] = useState<Sale & { change: number } | null>(null);

  const searchParams = useSearchParams();
  const router = useRouter();

  const stockActions = { increaseStock, decreaseStock, getProductById };

  useEffect(() => {
    searchInputRef.current?.focus();

    const orderIdToLoad = searchParams.get('orderId');
    if (orderIdToLoad) {
      const order = getOrderById(orderIdToLoad);
      if (order && order.status === 'Pendente') {
        const cartItems: CartItem[] = order.items.map((item, index) => {
            const product = getProductById(item.id);
            return {
                ...item,
                stock: product?.stock ?? item.quantity,
                cartId: `${item.id}-${index}`,
                salePrice: item.price,
                unitOfSale: product?.unitOfMeasure || "Unidade",
            }
        });
        setCart(cartItems);
        setCustomerName(order.customer);
        updateOrderStatus(order.id, 'Finalizado', stockActions);

        toast({
          title: "Pedido Carregado",
          description: `Pedido ${order.id} de ${order.customer} carregado para faturamento.`,
        });

        const newUrl = window.location.pathname;
        window.history.replaceState({ ...window.history.state, as: newUrl, url: newUrl }, '', newUrl);
      }
    }
  }, [searchParams, getOrderById, updateOrderStatus, getProductById, toast]);

  const handleCreateOrder = () => {
    if (cart.length === 0) {
      toast({
        title: "Carrinho Vazio",
        description: "Adicione produtos ao carrinho antes de criar um pedido.",
        variant: "destructive",
      });
      return;
    }
    
    const itemsForStockCheck = cart.map(item => ({
        id: item.id,
        quantity: item.quantity,
    }));

    const aggregatedItems = itemsForStockCheck.reduce((acc, item) => {
        acc[item.id] = (acc[item.id] || 0) + item.quantity;
        return acc;
    }, {} as Record<number, number>);

    for (const [productId, quantity] of Object.entries(aggregatedItems)) {
        const productInStock = getProductById(Number(productId));
        if (!productInStock || quantity > productInStock.stock) {
            toast({
                title: "Pedido não criado",
                description: `Estoque de ${productInStock?.name} insuficiente.`,
                variant: "destructive",
            });
            return;
        }
    }

    const orderItems = cart.map(item => ({
        id: item.id,
        name: item.name,
        price: item.salePrice,
        quantity: item.quantity,
    }));

    const newOrder = {
      customer: customerName || "Cliente Balcão",
      items: orderItems,
      total: total,
    };
    addOrder(newOrder, decreaseStock);

    toast({
      title: "Pedido Criado!",
      description: `O pedido para ${customerName} foi salvo e pode ser visto na página de Pedidos.`,
    });

    setCart([]);
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "F2") {
        event.preventDefault();
        if (cart.length > 0) {
          setPaymentModalOpen(true);
        } else {
            toast({
                title: "Carrinho Vazio",
                description: "Adicione produtos para finalizar a venda.",
                variant: "destructive"
            });
        }
      } else if (event.key === "F4") {
        event.preventDefault();
        handleCreateOrder();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cart.length, toast]);

  const handlePrint = useReactToPrint({
    content: () => receiptRef.current,
    onAfterPrint: () => {
        setCart([]);
        setLastSale(null);
    },
  });
  
  useEffect(() => {
    if(lastSale && receiptRef.current) {
        handlePrint();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastSale]);

  const handleProductSelect = (product: Product) => {
    setProductForQuantity(product);
  };
  
  const handleAddToCart = (product: Product, quantity: number, price: number, unitOfSale: string) => {
    if (quantity <= 0) {
        handleCloseQuantityDialog();
        return;
    }

    const existingCartItem = cart.find(item => item.id === product.id && item.salePrice === price && item.unitOfSale === unitOfSale);
    
    const quantityInCart = cart
        .filter(item => item.id === product.id)
        .reduce((acc, item) => {
            const quantityInPacks = item.unitOfSale === product.unitOfMeasure ? item.quantity : item.quantity / product.unitsPerPack;
            return acc + quantityInPacks;
        }, 0);
    
    const newQuantityInPacks = unitOfSale === product.unitOfMeasure ? quantity : quantity / product.unitsPerPack;
    const totalQuantityInPacks = quantityInCart + newQuantityInPacks;


    if (totalQuantityInPacks > product.stock) {
        toast({
            title: "Estoque Insuficiente",
            description: `A quantidade total para ${product.name} excede o estoque de ${product.stock} ${product.unitOfMeasure}(s).`,
            variant: "destructive",
        });
        return;
    }
    
    setCart((currentCart) => {
        if (existingCartItem) {
            return currentCart.map((item) =>
                item.cartId === existingCartItem.cartId
                    ? { ...item, quantity: item.quantity + quantity }
                    : item
            );
        } else {
            const newItem: CartItem = {
                ...product,
                cartId: `${product.id}-${Date.now()}`,
                quantity: quantity,
                salePrice: price,
                unitOfSale: unitOfSale
            };
            return [...currentCart, newItem];
        }
    });

    handleCloseQuantityDialog();
};

  const handleCloseQuantityDialog = () => {
    setProductForQuantity(null);
    setTimeout(() => searchInputRef.current?.focus(), 100);
  }

  const removeFromCart = (cartId: string) => {
    setCart((currentCart) =>
      currentCart.filter((item) => item.cartId !== cartId)
    );
  };

  const updateQuantity = (cartId: string, newQuantity: number) => {
    const cartItem = cart.find(item => item.cartId === cartId);
    if (!cartItem) return;

    if (newQuantity <= 0) {
      removeFromCart(cartId);
      return;
    }
    
    const product = getProductById(cartItem.id);
    if (!product) return;

    if (newQuantity > product.stock) {
      toast({
        title: "Estoque Insuficiente",
        description: `A quantidade máxima em estoque para ${product.name} é ${product.stock} ${product.unitOfMeasure}(s).`,
        variant: "destructive",
      });
      return;
    }
    
    setCart((currentCart) =>
      currentCart.map((item) =>
        item.cartId === cartId ? { ...item, quantity: newQuantity } : item
      )
    );
  };
  
  const total = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.salePrice * item.quantity, 0);
  }, [cart]);

  const handleConfirmSale = ({ paymentAmounts, change, cardFee }: { paymentAmounts: Record<string, number>; change: number; cardFee: number }) => {
    if (cart.length === 0) return;

    const aggregatedItemsForStock = cart.reduce((acc, item) => {
        acc[item.id] = (acc[item.id] || 0) + item.quantity;
        return acc;
    }, {} as Record<number, number>);

    for (const [productId, quantity] of Object.entries(aggregatedItemsForStock)) {
        const productInStock = getProductById(Number(productId));
        if (!productInStock || quantity > productInStock.stock) {
            toast({
                title: "Venda não realizada",
                description: `Estoque de ${productInStock?.name} insuficiente.`,
                variant: "destructive",
            });
            return;
        }
    }

    const itemsToDecrease = Object.entries(aggregatedItemsForStock).map(([id, quantity]) => ({
        id: Number(id),
        quantity
    }));
    decreaseStock(itemsToDecrease);


    const finalTotal = total + cardFee;
    const paymentMethodsUsed = Object.keys(paymentAmounts).join(" e ");

    const saleItems = cart.map(item => ({
        id: item.id,
        name: `${item.name} (${item.unitOfSale})`.trim(),
        price: item.salePrice,
        quantity: item.quantity,
    }));

    const newSaleData = {
      customer: customerName || "Cliente Balcão",
      items: saleItems,
      amount: finalTotal,
      paymentMethod: paymentMethodsUsed,
    };
    const newSale = addSale(newSaleData, increaseStock);
    
    toast({
      title: "Venda Finalizada!",
      description: `Venda registrada para ${customerName}. ${change > 0.001 ? `Troco: ${formatBRL(change)}` : ''}`.trim(),
    });
    
    setPaymentModalOpen(false);
    // This will trigger the useEffect to print
    setLastSale({ ...newSale, change }); 
  };


  return (
    <AppShell>
      <div className="flex flex-col h-full bg-muted/40">
        <header className="flex items-center gap-4 p-4 border-b bg-background flex-wrap">
          <ProductSearch 
            ref={searchInputRef}
            onProductSelect={handleProductSelect} 
          />
          <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                  placeholder="Nome do Cliente"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full text-base pl-10 h-10 min-w-[200px]"
              />
          </div>
          <div className="ml-auto flex items-center gap-2">
            {lastSale && (
                <Button size="sm" onClick={handlePrint} variant="outline">
                    <Printer className="mr-2 h-4 w-4" /> Imprimir Último Comprovante
                </Button>
            )}
             <Button size="sm" onClick={handleCreateOrder} variant="secondary" disabled={cart.length === 0}>
                <ListOrdered className="mr-2 h-4 w-4" /> Criar Pedido
                <kbd className="pointer-events-none ml-2 inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                    F4
                </kbd>
            </Button>
            <Button size="sm" onClick={() => setPaymentModalOpen(true)} disabled={cart.length === 0}>
              <CheckCircle2 className="mr-2 h-4 w-4" /> Finalizar Venda
              <kbd className="pointer-events-none ml-2 inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                F2
              </kbd>
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
                        <TableRow key={item.cartId}>
                        <TableCell className="font-medium">{String(index + 1).padStart(2, '0')}</TableCell>
                        <TableCell className="font-medium">
                            {item.name}
                            <Badge variant="secondary" className="ml-2">{item.unitOfSale}</Badge>
                        </TableCell>
                        <TableCell>
                            <Input
                            type="number"
                            value={item.quantity}
                            onChange={(e) =>
                                updateQuantity(item.cartId, parseInt(e.target.value) || 0)
                            }
                            className="h-8 w-24"
                            min="1"
                            />
                        </TableCell>
                        <TableCell>{formatBRL(item.salePrice)}</TableCell>
                        <TableCell className="text-right">{formatBRL(item.salePrice * item.quantity)}</TableCell>
                        <TableCell>
                            <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => removeFromCart(item.cartId)}
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
                           Nenhum item adicionado. Inicie uma nova venda.
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

        <div className="hidden">
            {lastSale && <Receipt ref={receiptRef} sale={lastSale} />}
        </div>
      </div>
    </AppShell>
  );
}

