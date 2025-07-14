
"use client";

import React, { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useProducts, type Product } from "@/context/ProductsContext";
import { formatBRL } from "@/lib/utils";
import { PlusCircle } from "lucide-react";
import { ProductDialog } from "@/components/products/product-dialog";

export default function ProductsPage() {
  const { products, addProduct } = useProducts();
  const [isDialogOpen, setDialogOpen] = useState(false);

  const handleAddProduct = (newProductData: Omit<Product, "id">) => {
    addProduct(newProductData);
    setDialogOpen(false);
  };

  return (
    <AppShell>
      <div className="p-4 sm:px-6 sm:py-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Gestão de Produtos</CardTitle>
              <CardDescription>
                Visualize e gerencie seus produtos.
              </CardDescription>
            </div>
            <Button onClick={() => setDialogOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Adicionar Produto
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Estoque</TableHead>
                  <TableHead className="text-right">Preço</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.length > 0 ? (
                  products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">{product.id}</TableCell>
                      <TableCell>{product.name}</TableCell>
                      <TableCell>{product.category}</TableCell>
                      <TableCell>{product.stock}</TableCell>
                      <TableCell className="text-right">
                        {formatBRL(product.price)}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      Nenhum produto cadastrado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <ProductDialog
        isOpen={isDialogOpen}
        onClose={() => setDialogOpen(false)}
        onConfirm={handleAddProduct}
      />
    </AppShell>
  );
}
