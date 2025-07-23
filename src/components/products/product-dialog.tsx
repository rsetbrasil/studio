
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
import { useProducts, type Product } from '@/context/ProductsContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Pencil } from 'lucide-react';
import { EntityManagementDialog } from './entity-management-dialog';

type ProductDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (productData: Omit<Product, 'id'>) => void;
  product?: Product | null;
};

type DialogManagementState = {
  isOpen: boolean;
  type: 'category' | 'unit' | null;
}

export function ProductDialog({ isOpen, onClose, onConfirm, product }: ProductDialogProps) {
  const { 
    products, 
    categories, 
    unitsOfMeasure, 
    addCategory, 
    updateCategory, 
    addUnitOfMeasure,
    updateUnitOfMeasure
  } = useProducts();
  
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [unitOfMeasure, setUnitOfMeasure] = useState('');
  const { toast } = useToast();

  const [dialogManagementState, setDialogManagementState] = useState<DialogManagementState>({ isOpen: false, type: null });

  useEffect(() => {
    if (product) {
      setName(product.name);
      setCategory(product.category);
      setPrice(String(product.price));
      setStock(String(product.stock));
      setUnitOfMeasure(product.unitOfMeasure);
    } else {
      setName('');
      setCategory('');
      setPrice('');
      setStock('');
      setUnitOfMeasure('');
    }
  }, [product, isOpen]);

  const handleConfirm = () => {
    if (!name || !category || !price || !stock || !unitOfMeasure) {
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
      unitOfMeasure,
    };

    onConfirm(productData);
  };
  
  const openManagementDialog = (type: 'category' | 'unit') => {
    setDialogManagementState({ isOpen: true, type });
  };
  
  const closeManagementDialog = () => {
    setDialogManagementState({ isOpen: false, type: null });
  };

  const getManagementProps = () => {
    if (dialogManagementState.type === 'category') {
      return {
        title: 'Gerenciar Categorias',
        items: categories,
        onAdd: addCategory,
        onUpdate: updateCategory,
      };
    }
    if (dialogManagementState.type === 'unit') {
      return {
        title: 'Gerenciar Unidades de Medida',
        items: unitsOfMeasure,
        onAdd: addUnitOfMeasure,
        onUpdate: updateUnitOfMeasure,
      };
    }
    return null;
  };

  const managementProps = getManagementProps();

  return (
    <>
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
              <div className="col-span-3 flex items-center gap-2">
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => openManagementDialog('category')}>
                  <Pencil className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="unitOfMeasure" className="text-right">
                Un. Medida
              </Label>
               <div className="col-span-3 flex items-center gap-2">
                <Select value={unitOfMeasure} onValueChange={setUnitOfMeasure}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {unitsOfMeasure.map((unit) => (
                      <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => openManagementDialog('unit')}>
                  <Pencil className="h-4 w-4" />
                </Button>
              </div>
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
      
      {dialogManagementState.isOpen && managementProps && (
        <EntityManagementDialog
          isOpen={dialogManagementState.isOpen}
          onClose={closeManagementDialog}
          title={managementProps.title}
          items={managementProps.items}
          onAdd={managementProps.onAdd}
          onUpdate={managementProps.onUpdate}
        />
      )}
    </>
  );
}
