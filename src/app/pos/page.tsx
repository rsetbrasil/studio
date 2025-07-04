
"use client";

import React, { useState, useMemo } from "react";
import { ListOrdered, PlusCircle, Search, ShoppingCart, X } from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useOrders } from "@/context/OrdersContext";
import { useSales } from "@/context/SalesContext";
import { useProducts, type Product } from "@/context/ProductsContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { useToast } from "@/hooks/use-toast";
import { formatBRL } from "@/lib/utils";
import { PaymentDialog } from "@/components/pos/payment-dialog";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type CartItem = Product & {
  quantity: number;
};

export default function PosPage() {
  const { products: allProducts, decreaseStock, getProductById } = useProducts();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [customerName, setCustomerName] = useState("Cliente Balcão");
  const [isPaymentModalOpen, setPaymentModalOpen] = useState(false);
  const { toast } = useToast();
  const { addSale } = useSales();
  const { addOrder } = useOrders();
  const isMobile = useIsMobile();
  
  const [isQuantityDialogOpen, setQuantityDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState('1');

  const addToCart = (product: Product, quantityStr: string | undefined) => {
    const quantityToAdd = parseInt(quantityStr || '1', 10);
    if (isNaN(quantityToAdd) || quantityToAdd <= 0) return;

    setCart((currentCart) => {
      const existingItem = currentCart.find((item) => item.id === product.id);
      if (existingItem) {
        return currentCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantityToAdd }
            : item
        );
      }
      return [...currentCart, { ...product, quantity: quantityToAdd }];
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
      return;
    }
    
    setCart((currentCart) =>
      currentCart.map((item) =>
        item.id === productId ? { ...item, quantity: newQuantity } : item
      )
    );
  };
  
  const handleOpenQuantityDialog = (product: Product) => {
    setSelectedProduct(product);
    setQuantity('1');
    setQuantityDialogOpen(true);
  };
  
  const handleConfirmQuantity = () => {
    if (!selectedProduct) {
      setQuantityDialogOpen(false);
      setSelectedProduct(null);
      return;
    }

    const quantityToAdd = parseInt(quantity, 10);
    if (isNaN(quantityToAdd) || quantityToAdd <= 0) {
      return;
    };

    const cartItem = cart.find(item => item.id === selectedProduct.id);
    const currentQuantityInCart = cartItem ? cartItem.quantity : 0;
    
    const productInStock = getProductById(selectedProduct.id);

    if (!productInStock || (quantityToAdd + currentQuantityInCart > productInStock.stock)) {
      toast({
        title: "Estoque Insuficiente",
        description: `Disponível: ${productInStock?.stock ?? 0}. No carrinho: ${currentQuantityInCart}.`,
        variant: "destructive",
      });
      return;
    }
    
    addToCart(selectedProduct, quantity);
    setQuantityDialogOpen(false);
    setSelectedProduct(null);
  };

  const filteredProducts = useMemo(() => {
    return allProducts.filter((product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, allProducts]);
  
  const subtotal = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  }, [cart]);

  const tax = subtotal * 0.05; // 5% tax
  const total = subtotal + tax;

  const handleConfirmSale = ({ paymentAmounts, change, cardFee }: { paymentAmounts: Record<string, number>; change: number; cardFee: number }) => {
    if (cart.length === 0) {
      return;
    }

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
      description: `Venda registrada com ${paymentMethodsUsed}. ${change > 0.001 ? `Troco: ${formatBRL(change)}` : ''}`.trim(),
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

  const ProductListView = (
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
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4">
            {filteredProducts.map((product) => (
              <Card key={product.id} className="overflow-hidden flex flex-col">
                <CardContent className="flex flex-col flex-1 items-center justify-center p-4 text-center">
                  <img
                    src={`https://placehold.co/100x100.png`}
                    alt={product.name}
                    className="mb-2 rounded-md"
                    data-ai-hint="beverage drink"
                  />
                  <h3 className="text-sm font-semibold">{product.name}</h3>
                  <p className="text-xs text-muted-foreground">{formatBRL(
                    product.price
                  )}</p>
                   <Badge variant="outline" className="mt-2">
                    Estoque: {product.stock}
                  </Badge>
                </CardContent>
                <CardFooter className="p-2 mt-auto">
                  <Button
                    className="w-full"
                    onClick={() => handleOpenQuantityDialog(product)}
                    disabled={product.stock === 0}
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
  );

  const CartView = (
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
      <CardContent className="flex-1 p-0 overflow-hidden">
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
                      {formatBRL(item.price * item.quantity)}
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
          <span>{formatBRL(subtotal)}</span>
        </div>
        <div className="flex w-full justify-between text-sm text-muted-foreground">
          <span>Impostos (5%)</span>
          <span>{formatBRL(tax)}</span>
        </div>
        <Separator className="my-1" />
        <div className="flex w-full justify-between text-lg font-semibold">
          <span>Total</span>
          <span>{formatBRL(total)}</span>
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
  );
  
  if (isMobile === undefined) {
    return null; 
  }

  if (isMobile) {
    return (
        <AppShell>
            <Tabs defaultValue="products" className="flex flex-col h-full w-full">
                <div className="flex-1 overflow-hidden p-4">
                  <TabsContent value="products" className="h-full mt-0">
                      {ProductListView}
                  </TabsContent>
                  <TabsContent value="order" className="h-full mt-0">
                      {CartView}
                  </TabsContent>
                </div>
                <div className="border-t bg-background p-4">
                    <TabsList className="grid w-full grid-cols-2 h-12">
                        <TabsTrigger value="products" className="text-base">
                            <ShoppingCart className="mr-2 h-5 w-5" />
                            Produtos
                        </TabsTrigger>
                        <TabsTrigger value="order" className="relative text-base">
                            <ListOrdered className="mr-2 h-5 w-5" />
                            Pedido
                            {cart.length > 0 && (
                                <Badge className="absolute -top-2 -right-2 h-6 w-6 justify-center rounded-full p-0">
                                    {cart.reduce((acc, item) => acc + item.quantity, 0)}
                                </Badge>
                            )}
                        </TabsTrigger>
                    </TabsList>
                </div>
            </Tabs>
            {isPaymentModalOpen && (
                <PaymentDialog
                    isOpen={isPaymentModalOpen}
                    onClose={() => setPaymentModalOpen(false)}
                    subtotal={subtotal}
                    tax={tax}
                    onConfirmSale={handleConfirmSale}
                />
            )}
             {isQuantityDialogOpen && selectedProduct && (
              <Dialog open={isQuantityDialogOpen} onOpenChange={setQuantityDialogOpen}>
                <DialogContent className="sm:max-w-xs">
                  <DialogHeader>
                    <DialogTitle>Adicionar {selectedProduct.name}</DialogTitle>
                    <DialogDescription>
                      Digite a quantidade desejada para adicionar ao carrinho.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-4">
                    <Label htmlFor="quantity" className="sr-only">Quantidade</Label>
                    <Input
                      id="quantity"
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      className="mt-2 text-center text-lg"
                      autoFocus
                      onFocus={(e) => e.target.select()}
                      min="1"
                    />
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setQuantityDialogOpen(false)}>Cancelar</Button>
                    <Button onClick={handleConfirmQuantity}>Confirmar</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
        </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="grid h-full flex-1 gap-4 p-4 md:grid-cols-2 lg:grid-cols-3 md:p-6">
        <div className="flex flex-col gap-4 lg:col-span-2">
          {ProductListView}
        </div>
        <div className="flex flex-col gap-4">
          {CartView}
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
      {isQuantityDialogOpen && selectedProduct && (
        <Dialog open={isQuantityDialogOpen} onOpenChange={setQuantityDialogOpen}>
          <DialogContent className="sm:max-w-xs">
            <DialogHeader>
              <DialogTitle>Adicionar {selectedProduct.name}</DialogTitle>
              <DialogDescription>
                Digite a quantidade desejada para adicionar ao carrinho.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Label htmlFor="quantity-desktop" className='sr-only'>Quantidade</Label>
              <Input
                id="quantity-desktop"
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="mt-2 text-center text-lg"
                autoFocus
                onFocus={(e) => e.target.select()}
                min="1"
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setQuantityDialogOpen(false)}>Cancelar</Button>
              <Button onClick={handleConfirmQuantity}>Confirmar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </AppShell>
  );
}

    
