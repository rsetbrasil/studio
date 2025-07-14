
'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import type { Product } from '@/context/ProductsContext';

type ProductDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (productData: Omit<Product, 'id'>) => void;
  product?: Product | null;
};

export function ProductDialog({ isOpen, onClose, onConfirm, product }: ProductDialogProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    if (product) {
      setName(product.name);
      setCategory(product.category);
      setPrice(String(product.price));
      setStock(String(product.stock));
    } else {
      setName('');
      setCategory('');
      setPrice('');
      setStock('');
    }
  }, [product, isOpen]);

  const handleConfirm = () => {
    if (!name || !category || !price || !stock) {
      toast({
        title: "Campos Obrigatórios",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive",
      });
      return;
    }

    const productData = {
      name,
      category,
      price: parseFloat(price.replace(',', '.')),
      stock: parseInt(stock, 10),
    };

    onConfirm(productData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{product ? 'Editar Produto' : 'Adicionar Novo Produto'}</DialogTitle>
          <DialogDescription>
            Preencha as informações do produto abaixo.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Nome
            </Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="category" className="text-right">
              Categoria
            </Label>
            <Input id="category" value={category} onChange={(e) => setCategory(e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="price" className="text-right">
              Preço
            </Label>
            <Input id="price" value={price} onChange={(e) => setPrice(e.target.value)} className="col-span-3" type="text" inputMode="decimal" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="stock" className="text-right">
              Estoque
            </Label>
            <Input id="stock" value={stock} onChange={(e) => setStock(e.target.value)} className="col-span-3" type="number" />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
          <Button type="button" onClick={handleConfirm}>
            {product ? 'Salvar Alterações' : 'Adicionar Produto'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
