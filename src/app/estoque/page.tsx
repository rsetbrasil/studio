
'use client';

import React, { useState, useMemo, useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useProducts, type Product } from '@/context/ProductsContext';
import { useToast } from '@/hooks/use-toast';
import { ProductSearch } from '@/components/pos/product-search';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Check, Trash2, X } from 'lucide-react';
import { formatBRL } from '@/lib/utils';

type StockEntryItem = Product & {
  entryQuantity: number | string;
};

export default function StockEntryPage() {
  const { increaseStock, getProductById } = useProducts();
  const [entryList, setEntryList] = useState<StockEntryItem[]>([]);
  const { toast } = useToast();
  const searchInputRef = useRef<HTMLInputElement>(null);

  const handleProductSelect = (product: Product) => {
    const isAlreadyInList = entryList.find((item) => item.id === product.id);
    if (isAlreadyInList) {
      toast({
        title: 'Produto já na lista',
        description: `${product.name} já foi adicionado para entrada.`,
      });
      return;
    }
    setEntryList((prev) => [...prev, { ...product, entryQuantity: '' }]);
    searchInputRef.current?.focus();
  };
  
  const handleQuantityChange = (productId: string, quantity: string) => {
    const numQuantity = parseInt(quantity, 10);
    setEntryList(prev => 
      prev.map(item => 
        item.id === productId 
          ? { ...item, entryQuantity: isNaN(numQuantity) || numQuantity < 0 ? '' : numQuantity } 
          : item
      )
    );
  };

  const removeFromList = (productId: string) => {
    setEntryList(prev => prev.filter(item => item.id !== productId));
  };
  
  const handleClearList = () => {
    setEntryList([]);
  }

  const handleConfirmEntry = async () => {
    const itemsToIncrease = entryList
      .filter(item => typeof item.entryQuantity === 'number' && item.entryQuantity > 0)
      .map(item => ({ id: item.id, quantity: Number(item.entryQuantity) }));

    if (itemsToIncrease.length === 0) {
      toast({
        title: 'Nenhuma quantidade informada',
        description: 'Por favor, insira a quantidade para pelo menos um produto.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await increaseStock(itemsToIncrease);
      toast({
        title: 'Estoque Atualizado!',
        description: `${itemsToIncrease.length} produto(s) tiveram seu estoque atualizado com sucesso.`,
      });
      setEntryList([]);
    } catch (error) {
        toast({
            title: 'Erro ao atualizar estoque',
            description: 'Não foi possível salvar as alterações no banco de dados.',
            variant: 'destructive',
        })
    }
  };


  return (
    <div className="p-4 sm:px-6 sm:py-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Entrada de Estoque</CardTitle>
          <CardDescription>
            Busque produtos e adicione as quantidades recebidas para atualizar o
            estoque.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <ProductSearch
                ref={searchInputRef}
                onProductSelect={handleProductSelect}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
             <CardTitle>Lista de Entrada</CardTitle>
             <CardDescription>Produtos a terem o estoque atualizado.</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleClearList} disabled={entryList.length === 0}>
                <X className="mr-2 h-4 w-4" /> Limpar Lista
            </Button>
            <Button onClick={handleConfirmEntry} disabled={entryList.length === 0}>
                <Check className="mr-2 h-4 w-4" /> Confirmar Entrada
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[calc(100vh-420px)]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cód.</TableHead>
                  <TableHead>Produto</TableHead>
                  <TableHead>Estoque Atual (Fardos)</TableHead>
                  <TableHead className="w-[200px]">Qtd. a Adicionar (Fardos)</TableHead>
                  <TableHead className="w-[100px] text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entryList.length > 0 ? (
                  entryList.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.code}</TableCell>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>{item.stock}</TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={item.entryQuantity}
                          onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                          className="h-9"
                          min="0"
                          placeholder="0"
                        />
                      </TableCell>
                       <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeFromList(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="h-48 text-center text-muted-foreground"
                    >
                      Nenhum produto na lista. Busque e adicione produtos para
                      dar entrada no estoque.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
