

"use client";

import React, { useState, useMemo, useRef } from "react";
import Papa from "papaparse";
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
import { Input } from "@/components/ui/input";
import { useProducts, type Product } from "@/context/ProductsContext";
import { useSales } from "@/context/SalesContext";
import { useOrders } from "@/context/OrdersContext";
import { formatBRL } from "@/lib/utils";
import { PlusCircle, Pencil, Search, Download, Upload, Trash } from "lucide-react";
import { ProductDialog } from "@/components/products/product-dialog";
import { DeleteProductDialog } from "@/components/products/delete-product-dialog";
import { useToast } from "@/hooks/use-toast";

type CsvProductImport = {
  id: string;
  nome: string;
  categoria: string;
  unidade_medida: string;
  preco_compra_fardo: string;
  preco_venda_fardo: string;
  unidades_por_fardo: string;
  estoque_fardo: string;
};

export default function ProductsPage() {
  const { products, addProduct, updateProduct, loadProducts, deleteProduct } = useProducts();
  const { sales } = useSales();
  const { orders } = useOrders();
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleOpenDialog = (product: Product | null = null) => {
    setEditingProduct(product);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setEditingProduct(null);
    setDialogOpen(false);
  };

  const handleOpenDeleteDialog = (product: Product) => {
    setDeletingProduct(product);
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeletingProduct(null);
    setDeleteDialogOpen(false);
  };

  const handleConfirmDelete = () => {
    if (deletingProduct) {
      deleteProduct(deletingProduct.id, sales, orders);
    }
    handleCloseDeleteDialog();
  };

  const handleConfirm = (productData: Omit<Product, "id" | "price">) => {
    if (editingProduct) {
      updateProduct(editingProduct.id, productData);
    } else {
      addProduct(productData);
    }
    handleCloseDialog();
  };

  const filteredProducts = useMemo(() => {
    if (!searchTerm) {
      return products;
    }
    const lowercasedTerm = searchTerm.toLowerCase();
    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(lowercasedTerm) ||
        String(product.id).includes(lowercasedTerm)
    );
  }, [products, searchTerm]);

  const handleExport = () => {
    const csvData = Papa.unparse(
      filteredProducts.map((p) => ({
        id: p.id,
        nome: p.name,
        categoria: p.category,
        unidade_medida: p.unitOfMeasure,
        preco_compra_fardo: p.cost,
        preco_venda_fardo: p.packPrice,
        unidades_por_fardo: p.unitsPerPack,
        estoque_fardo: p.stock,
      }))
    );

    const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", "produtos.csv");
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.errors.length) {
            toast({
              title: "Erro na importação do CSV",
              description:
                "Verifique o formato do arquivo e tente novamente.",
              variant: "destructive",
            });
            console.error("CSV Parsing Errors:", results.errors);
            return;
          }

          const parsedProducts = (results.data as CsvProductImport[]).reduce((acc: Omit<Product, "price">[], row) => {
              const id = Number(row.id);
              const name = row.nome;

              if (name && name.trim() !== "" && !isNaN(id) && id > 0) {
                acc.push({
                  id: id,
                  name: name,
                  category: row.categoria || "Sem Categoria",
                  unitOfMeasure: row.unidade_medida || "Unidade",
                  cost: Number(row.preco_compra_fardo) || 0,
                  packPrice: Number(row.preco_venda_fardo) || 0,
                  unitsPerPack: Number(row.unidades_por_fardo) || 1,
                  stock: Number(row.estoque_fardo) || 0,
                });
              }
              return acc;
            }, [])
            .filter((p): p is Omit<Product, "price"> => p.id != null);

          loadProducts(parsedProducts);

          toast({
            title: "Importação Concluída!",
            description: `${parsedProducts.length} produtos foram importados com sucesso.`,
          });
        },
      });
      // Reset file input
      if (event.target) {
        event.target.value = "";
      }
    }
  };


  return (
      <div className="p-4 sm:px-6 sm:py-4">
        <Card>
           <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex-1">
              <CardTitle>Gestão de Produtos</CardTitle>
              <CardDescription>
                Visualize, adicione, importe e exporte seus produtos.
              </CardDescription>
            </div>
            <div className="flex w-full flex-col items-stretch gap-2 sm:w-auto sm:flex-row sm:items-center">
              <div className="relative flex-1 sm:flex-initial">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 sm:w-64"
                />
              </div>
              <input
                type="file"
                accept=".csv"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
              />
              <Button variant="outline" onClick={handleImportClick}>
                <Upload className="mr-2 h-4 w-4" />
                Importar
              </Button>
              <Button variant="outline" onClick={handleExport}>
                <Download className="mr-2 h-4 w-4" />
                Exportar
              </Button>
              <Button onClick={() => handleOpenDialog()}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Adicionar
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Estoque (Fardos)</TableHead>
                  <TableHead>Custo (Fardo)</TableHead>
                  <TableHead>Preço (Fardo)</TableHead>
                  <TableHead>Preço (Unit.)</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">
                        {product.id}
                      </TableCell>
                      <TableCell>{product.name}</TableCell>
                      <TableCell>{product.stock}</TableCell>
                      <TableCell>{formatBRL(product.cost)}</TableCell>
                      <TableCell>{formatBRL(product.packPrice)}</TableCell>
                      <TableCell>{formatBRL(product.price)}</TableCell>
                      <TableCell>{product.category}</TableCell>
                      <TableCell className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenDialog(product)}
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Editar
                        </Button>
                         <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleOpenDeleteDialog(product)}
                        >
                          <Trash className="mr-2 h-4 w-4" />
                          Excluir
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                      Nenhum produto encontrado.
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
        onClose={handleCloseDialog}
        onConfirm={handleConfirm}
        product={editingProduct}
      />
      <DeleteProductDialog
        isOpen={isDeleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleConfirmDelete}
        product={deletingProduct}
       />
  );
}
