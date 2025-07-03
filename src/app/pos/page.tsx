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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const allProducts = [
  { id: 1, name: "Coca-Cola 2L", price: 7.0, stock: 150, category: "Soda" },
  { id: 2, name: "Guaraná Antarctica 2L", price: 6.5, stock: 120, category: "Soda" },
  { id: 3, name: "Skol 350ml Can", price: 3.5, stock: 300, category: "Beer" },
  { id: 4, name: "Brahma 350ml Can", price: 3.4, stock: 280, category: "Beer" },
  { id: 5, name: "Heineken 330ml Long Neck", price: 5.5, stock: 180, category: "Beer" },
  { id: 6, name: "Red Bull Energy Drink", price: 9.0, stock: 90, category: "Energy Drink" },
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
                  placeholder="Search products..."
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
                      <p className="text-muted-foreground text-xs">{`$${product.price.toFixed(2)}`}</p>
                    </CardContent>
                    <CardFooter className="p-0">
                      <Button className="w-full rounded-t-none" onClick={() => addToCart(product)}>
                        <PlusCircle className="mr-2 h-4 w-4" /> Add
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
              <CardTitle>Current Order</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Qty</TableHead>
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
                          ${(item.price * item.quantity).toFixed(2)}
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
                      <TableCell colSpan={4} className="text-center text-muted-foreground">
                        Your cart is empty
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
              <div className="w-full flex justify-between text-sm text-muted-foreground">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="w-full flex justify-between text-sm text-muted-foreground">
                <span>Taxes (5%)</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="w-full flex justify-between font-semibold text-lg">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <Button size="lg" className="w-full mt-4">
                Complete Sale
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
