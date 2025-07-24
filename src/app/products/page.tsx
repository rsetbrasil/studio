
"use client";

import React, { useState, useMemo, useRef } from "react";
import Papa from 'papaparse';
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
import { Input } from "@/components/ui/input";
import { useProducts, type Product } from "@/context/ProductsContext";
import { formatBRL } from "@/lib/utils";
import { PlusCircle, Pencil, Search, Upload } from "lucide-react";
import { ProductDialog } from "@/components/products/product-dialog";
import { useToast } from "@/hooks/use-toast";

type CsvProduct = {
  id: number;
  nome: string;
  categoria: string;
  unidade_medida: string;
  preco_compra_fardo: number;
  preco_venda_fardo: number;
  unidades_por_fardo: number;
  estoque_fardo: number;
};


export default function ProductsPage() {
  const { products, addProduct, updateProduct, loadProducts } = useProducts();
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
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

  const handleConfirm = (productData: Omit<Product, 'id' | 'price'>) => {
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
  
  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    Papa.parse<CsvProduct>(file, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: (results) => {
            if(results.errors.length) {
                toast({
                    title: "Erro na Importação",
                    description: "Ocorreram erros ao processar o arquivo CSV. Verifique o formato.",
                    variant: "destructive",
                });
                console.error("CSV Parsing Errors:", results.errors);
            } else {
                const mappedProducts = results.data.map(csvProduct => ({
                    id: csvProduct.id,
                    name: csvProduct.nome,
                    category: csvProduct.categoria,
                    unitOfMeasure: csvProduct.unidade_medida,
                    cost: csvProduct.preco_compra_fardo,
                    packPrice: csvProduct.preco_venda_fardo,
                    unitsPerPack: csvProduct.unidades_por_fardo,
                    stock: csvProduct.estoque_fardo,
                }));

                loadProducts(mappedProducts);
                toast({
                    title: "Produtos Importados!",
                    description: `${results.data.length} produtos foram carregados com sucesso.`,
                });
            }
        },
        error: (error) => {
            toast({
                title: "Erro na Importação",
                description: "Não foi possível ler o arquivo selecionado.",
                variant: "destructive",
            });
            console.error(error);
        }
    });

    // Reset file input to allow re-importing the same file
    event.target.value = '';
  };


  return (
    <AppShell>
      <div className="p-4 sm:px-6 sm:py-4">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Gestão de Produtos</CardTitle>
                <CardDescription>
                  Visualize, adicione e edite seus produtos.
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative w-full sm:max-w-xs">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10"
                  />
                </div>
                <Button onClick={handleImportClick} variant="outline">
                  <Upload className="mr-2 h-4 w-4" />
                  Importar
                </Button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept=".csv"
                />
                <Button onClick={() => handleOpenDialog()}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Adicionar Produto
                </Button>
              </div>
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
                  <TableHead className="w-[100px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">{product.id}</TableCell>
                      <TableCell>{product.name}</TableCell>
                      <TableCell>{product.stock}</TableCell>
                      <TableCell>{formatBRL(product.cost)}</TableCell>
                      <TableCell>{formatBRL(product.packPrice)}</TableCell>
                      <TableCell>{formatBRL(product.price)}</TableCell>
                      <TableCell>{product.category}</TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenDialog(product)}
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Editar
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
    </AppShell>
  );
}
