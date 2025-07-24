
"use client";

import React, { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { type Product } from "@/context/ProductsContext";
import { formatBRL } from "@/lib/utils";
import { Search, Package } from "lucide-react";
import { AppLogo } from "@/components/icons";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

export default function CatalogPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  useEffect(() => {
    const fetchProducts = async () => {
        try {
            const productsCollection = collection(db, "products");
            const productsSnapshot = await getDocs(productsCollection);
            const productsList = productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
            setProducts(productsList);
        } catch(error) {
            console.error("Failed to fetch products for catalog", error);
        } finally {
            setIsMounted(true);
        }
    };

    fetchProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    if (!searchTerm) {
      return products;
    }
    const lowercasedTerm = searchTerm.toLowerCase();
    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(lowercasedTerm) ||
        product.category.toLowerCase().includes(lowercasedTerm) ||
        String(product.id).includes(lowercasedTerm)
    );
  }, [products, searchTerm]);

  return (
    <div className="bg-muted/40 min-h-screen">
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 sm:px-6">
        <div className="flex items-center gap-2 font-semibold">
          <AppLogo className="h-6 w-6 text-primary" />
          <span>Catálogo de Produtos</span>
        </div>
        <div className="relative ml-auto flex-1 md:grow-0">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar produtos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[320px]"
          />
        </div>
      </header>
      <main className="p-4 sm:px-6 sm:py-4">
        {isMounted ? (
          filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredProducts.map((product) => (
                <Card key={product.id} className="overflow-hidden">
                  <div className="relative w-full h-40 bg-muted">
                    <Image
                      src={`https://placehold.co/400x400.png`}
                      alt={product.name}
                      layout="fill"
                      objectFit="cover"
                      data-ai-hint="drink bottle"
                    />
                  </div>
                  <CardHeader>
                    <CardTitle className="text-base">{product.name}</CardTitle>
                    <CardDescription>{product.category}</CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-2">
                    <div className="font-semibold text-lg">
                      {formatBRL(product.packPrice)}
                      <span className="text-sm text-muted-foreground font-normal"> / {product.unitOfMeasure}</span>
                    </div>
                     <div className="text-sm text-muted-foreground">
                       {formatBRL(product.price)} / Unidade
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-96 border-2 border-dashed rounded-lg">
                <Package className="h-12 w-12 text-muted-foreground" />
                <p className="mt-4 text-muted-foreground">Nenhum produto encontrado.</p>
            </div>
          )
        ) : (
           <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-40 bg-muted rounded-t-lg"></div>
                <CardHeader>
                  <div className="h-5 w-3/4 bg-muted rounded"></div>
                  <div className="h-4 w-1/2 bg-muted rounded mt-1"></div>
                </CardHeader>
                <CardContent className="space-y-2">
                   <div className="h-6 w-1/3 bg-muted rounded"></div>
                   <div className="h-4 w-1/4 bg-muted rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
