
'use client';

import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  X,
  CheckCircle2,
  ListOrdered,
  Printer,
  User,
  Save,
} from "lucide-react";
import { useSearchParams, useRouter } from 'next/navigation';

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
import { Receipt } from "@/components/pos/receipt";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import { useFiado } from "@/context/FiadoContext";
import { ConfirmFiadoDialog } from "@/components/pos/confirm-fiado-dialog";

type CartItem = Product & {
  cartId: string;
  quantity: number;
  salePrice: number;
  unitOfSale: string;
};

export default function PosComponent() {
  const { decreaseStock, getProductById, increaseStock } = useProducts();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState("Cliente Balcão");
  const [isPaymentModalOpen, setPaymentModalOpen] = useState(false);
  const [isFiadoConfirmOpen, setFiadoConfirmOpen] = useState(false);
  const [productForQuantity, setProductForQuantity] = useState<Product | null>(null);
  const { toast } = useToast();
  const { addSale } = useSales();
  const { addOrder, getOrderById, updateOrderStatus } = useOrders();
  const { addFiadoSale } = useFiado();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const receiptRef = useRef<HTMLDivElement>(null);
  const [lastSale, setLastSale] = useState<(Sale & { change: number, totalPaid: number }) | null>(null);
  const { user } = useAuth();

  const searchParams = useSearchParams();
  const router = useRouter();

  const stockActions = useMemo(() => ({ increaseStock, decreaseStock, getProductById }), [increaseStock, decreaseStock, getProductById]);

  const total = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.salePrice * item.quantity, 0);
  }, [cart]);

 const handlePrint = () => {
    window.print();
  };


  useEffect(() => {
    if (lastSale && receiptRef.current) {
        handlePrint();
        setCart([]);
        setCustomerName("Cliente Balcão");
        setLastSale(null);
    }
  }, [lastSale]);


  useEffect(() => {
    searchInputRef.current?.focus();

    const orderIdToLoad = searchParams.get('orderId');
    if (orderIdToLoad) {
      const order = getOrderById(orderIdToLoad);
      if (order && order.status === 'Pendente') {
        const cartItems: CartItem[] = order.items.map((item, index) => {
            const product = getProductById(String(item.id));
            return {
                ...item,
                stock: product?.stock ?? item.quantity,
                cartId: `${item.id}-${index}`,
                salePrice: item.price,
                unitOfSale: product?.unitOfMeasure || "Unidade",
                id: product?.id ?? String(item.id)
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
  }, [searchParams, getOrderById, updateOrderStatus, getProductById, toast, stockActions]);

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
    }, {} as Record<string, number>);

    for (const [productId, quantity] of Object.entries(aggregatedItems)) {
        const productInStock = getProductById(String(productId));
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
        id: Number(item.id),
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
    setCustomerName("Cliente Balcão");
  };
  
  const handleFiadoConfirm = () => {
    if (cart.length === 0) return;
    
    const saleItems = cart.map(item => ({
        id: Number(item.id),
        name: `${item.name}`,
        price: item.salePrice,
        quantity: item.quantity,
        unit: item.unitOfSale,
        cost: item.cost,
    }));
    
    const newFiadoSale = {
        customer: customerName || "Cliente Balcão",
        items: saleItems,
        amount: total,
        paymentMethod: "Fiado",
    }
    
    addFiadoSale(newFiadoSale);
    
    const itemsToDecrease = saleItems.map(({ id, quantity }) => ({ id: String(id), quantity }));
    decreaseStock(itemsToDecrease);
    
    toast({
        title: "Venda Fiado Registrada!",
        description: `A dívida de ${formatBRL(total)} foi adicionada para ${customerName}.`,
    });
    
    setCart([]);
    setCustomerName("Cliente Balcão");
    setFiadoConfirmOpen(false);
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
      } else if (event.key === "F9") {
        event.preventDefault();
        if (cart.length > 0 && customerName !== 'Cliente Balcão' && customerName.trim() !== '') {
            setFiadoConfirmOpen(true);
        } else if (cart.length === 0) {
             toast({
                title: "Carrinho Vazio",
                description: "Adicione produtos para salvar no fiado.",
                variant: "destructive"
            });
        } else {
            toast({
                title: "Cliente não identificado",
                description: "Informe o nome do cliente para salvar no fiado.",
                variant: "destructive"
            });
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [cart, customerName, total, handleCreateOrder]);


  const handleProductSelect = (product: Product) => {
    setProductForQuantity(product);
  };
  
  const handleAddToCart = (product: Product, quantity: number, price: number) => {
    if (quantity <= 0) {
        handleCloseQuantityDialog();
        return;
    }

    const unitOfSale = product.unitOfMeasure;
    const existingCartItem = cart.find(item => item.id === product.id && item.salePrice === price && item.unitOfSale === unitOfSale);
    
    if (existingCartItem) {
      const newQuantity = existingCartItem.quantity + quantity;
      updateQuantity(existingCartItem.cartId, newQuantity);
    } else {
        const quantityInCart = cart
            .filter(item => item.id === product.id)
            .reduce((acc, item) => acc + item.quantity, 0);

        if (quantity + quantityInCart > product.stock) {
            toast({
                title: "Estoque Insuficiente",
                description: `A quantidade total para ${product.name} excede o estoque de ${product.stock}.`,
                variant: "destructive",
            });
            return;
        }

        const newItem: CartItem = {
            ...product,
            cartId: `${product.id}-${Date.now()}`,
            quantity: quantity,
            salePrice: price,
            unitOfSale: unitOfSale
        };
        setCart((currentCart) => [...currentCart, newItem]);
    }

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

    const quantityInCart = cart
        .filter(item => item.id === product.id && item.cartId !== cartId)
        .reduce((acc, item) => acc + item.quantity, 0);

    if (newQuantity + quantityInCart > product.stock) {
      toast({
        title: "Estoque Insuficiente",
        description: `A quantidade máxima em estoque para ${product.name} é ${product.stock}.`,
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
  
  const handleConfirmSale = ({ paymentAmounts, change, cardFee, totalPaid }: { paymentAmounts: Record<string, number>; change: number; cardFee: number, totalPaid: number }) => {
    if (cart.length === 0) return;

    const aggregatedItemsForStock = cart.reduce((acc, item) => {
        acc[item.id] = (acc[item.id] || 0) + item.quantity;
        return acc;
    }, {} as Record<string, number>);

    for (const [productId, quantity] of Object.entries(aggregatedItemsForStock)) {
        const productInStock = getProductById(String(productId));
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
        id: String(id),
        quantity
    }));
    decreaseStock(itemsToDecrease);


    const finalTotal = total + cardFee;
    const paymentMethodsUsed = Object.keys(paymentAmounts).join(" e ");

    const saleItems = cart.map(item => ({
        id: Number(item.id),
        name: `${item.name}`,
        price: item.salePrice,
        quantity: item.quantity,
        unit: item.unitOfSale,
        cost: item.cost,
    }));

    const newSaleData = {
      customer: customerName || "Cliente Balcão",
      items: saleItems,
      amount: finalTotal,
      paymentMethod: paymentMethodsUsed,
    };
    const newSale = addSale(newSaleData);
    
    toast({
      title: "Venda Finalizada!",
      description: `Venda registrada para ${customerName}. ${change > 0.001 ? `Troco: ${formatBRL(change)}` : ''}`.trim(),
    });
    
    setPaymentModalOpen(false);
    
    setLastSale({ ...newSale, change, totalPaid });
  };


  return (
      <div className="flex flex-col h-full bg-muted/40" id="pos-page">
        <header className="flex items-center gap-4 p-4 border-b bg-background flex-wrap print:hidden">
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
             <Button 
                size="sm" 
                onClick={() => setFiadoConfirmOpen(true)} 
                variant="secondary" 
                disabled={cart.length === 0 || customerName === 'Cliente Balcão' || customerName.trim() === ''}>
                <Save className="mr-2 h-4 w-4" /> Salvar Fiado
                <kbd className="pointer-events-none ml-2 inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                    F9
                </kbd>
            </Button>
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

        <main className="flex-1 flex flex-col p-4 gap-4 print:hidden">
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
        
        <footer className="p-4 border-t bg-background print:hidden">
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
        
        {isFiadoConfirmOpen && (
            <ConfirmFiadoDialog
                isOpen={isFiadoConfirmOpen}
                onClose={() => setFiadoConfirmOpen(false)}
                onConfirm={handleFiadoConfirm}
                customerName={customerName}
                total={total}
            />
        )}


        <div className="hidden print:block">
            {lastSale && <Receipt ref={receiptRef} sale={lastSale} user={user} />}
        </div>
      </div>
  );
}
