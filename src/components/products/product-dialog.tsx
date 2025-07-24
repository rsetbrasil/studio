
'use client';

import React, { useState, useEffect, useMemo } from 'react';
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
import Image from 'next/image';
import { formatBRL, formatCurrencyInput, parseCurrencyBRL } from '@/lib/utils';


type ProductDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (productData: Omit<Product, 'id' | 'price'>) => void;
  product?: Product | null;
};

type DialogManagementState = {
  isOpen: boolean;
  type: 'category' | 'unit' | null;
}

export function ProductDialog({ isOpen, onClose, onConfirm, product }: ProductDialogProps) {
  const { 
    categories, 
    unitsOfMeasure, 
    addCategory, 
    updateCategory,
    deleteCategory, 
    addUnitOfMeasure,
    updateUnitOfMeasure,
    deleteUnitOfMeasure
  } = useProducts();
  
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [costStr, setCostStr] = useState('');
  const [stock, setStock] = useState('');
  const [unitOfMeasure, setUnitOfMeasure] = useState('');
  const [unitsPerPack, setUnitsPerPack] = useState('');
  const [packPriceStr, setPackPriceStr] = useState('');
  
  const { toast } = useToast();

  const [dialogManagementState, setDialogManagementState] = useState<DialogManagementState>({ isOpen: false, type: null });

  const packPriceNum = useMemo(() => parseCurrencyBRL(packPriceStr), [packPriceStr]);
  const unitsPerPackNum = useMemo(() => parseInt(unitsPerPack, 10), [unitsPerPack]);

  useEffect(() => {
    if (product) {
      setName(product.name);
      setCategory(product.category);
      setCostStr(formatCurrencyInput(String(product.cost * 100)));
      setStock(String(product.stock));
      setUnitOfMeasure(product.unitOfMeasure);
      setUnitsPerPack(String(product.unitsPerPack));
      setPackPriceStr(formatCurrencyInput(String(product.packPrice * 100)));
    } else {
      setName('');
      setCategory('');
      setCostStr('');
      setStock('');
      setUnitOfMeasure('');
      setUnitsPerPack('');
      setPackPriceStr('');
    }
  }, [product, isOpen]);

  const unitPrice = useMemo(() => {
    if (!isNaN(packPriceNum) && !isNaN(unitsPerPackNum) && unitsPerPackNum > 0) {
      return packPriceNum / unitsPerPackNum;
    }
    return 0;
  }, [packPriceNum, unitsPerPackNum]);

  const handleConfirm = () => {
    const costNum = parseCurrencyBRL(costStr);
    
    if (!name || !category || !stock || !unitOfMeasure || !costStr || !unitsPerPack || !packPriceStr || isNaN(costNum) || isNaN(packPriceNum)) {
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
      cost: costNum,
      stock: parseInt(stock, 10),
      unitOfMeasure,
      unitsPerPack: unitsPerPackNum,
      packPrice: packPriceNum,
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
        onDelete: deleteCategory,
      };
    }
    if (dialogManagementState.type === 'unit') {
      return {
        title: 'Gerenciar Unidades de Medida',
        items: unitsOfMeasure,
        onAdd: addUnitOfMeasure,
        onUpdate: updateUnitOfMeasure,
        onDelete: deleteUnitOfMeasure,
      };
    }
    return null;
  };

  const managementProps = getManagementProps();

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{product ? 'Editar Produto' : 'Adicionar Novo Produto'}</DialogTitle>
            <DialogDescription>
              Atualize os detalhes do produto. Clique em salvar quando terminar.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-4">
            {/* Coluna da Imagem */}
            <div className="md:col-span-1 space-y-2">
                <Label>Imagem do Produto</Label>
                <div className="flex items-center justify-center w-full h-48 border-2 border-dashed rounded-lg">
                    <Image 
                        src={product?.imageUrl || "https://placehold.co/200x200.png"} 
                        alt={product?.name || "Placeholder"}
                        width={200}
                        height={200}
                        className="object-contain h-full"
                        data-ai-hint="beverage bottle"
                    />
                </div>
            </div>

            {/* Coluna dos Campos */}
            <div className="md:col-span-2 grid grid-cols-2 gap-4">
                <div className="col-span-2">
                    <Label htmlFor="name">Nome do Produto</Label>
                    <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div>
                    <Label htmlFor="id">Código</Label>
                    <Input id="id" value={product?.id ?? ''} readOnly disabled />
                </div>
                <div>
                    <Label htmlFor="category">Categoria</Label>
                    <div className="flex items-center gap-2">
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
                        <Button variant="outline" size="icon" className="h-9 w-9 flex-shrink-0" onClick={() => openManagementDialog('category')}>
                            <Pencil className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                <div>
                    <Label htmlFor="unitOfMeasure">Unidade de Medida</Label>
                    <div className="flex items-center gap-2">
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
                        <Button variant="outline" size="icon" className="h-9 w-9 flex-shrink-0" onClick={() => openManagementDialog('unit')}>
                            <Pencil className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                <div>
                    <Label htmlFor="unitsPerPack">Unid. por Fardo</Label>
                    <Input id="unitsPerPack" value={unitsPerPack} onChange={e => setUnitsPerPack(e.target.value)} type="number" />
                </div>

                <div>
                    <Label htmlFor="cost">Preço de Compra (Fardo)</Label>
                    <Input id="cost" value={costStr} onChange={(e) => setCostStr(formatCurrencyInput(e.target.value))} type="text" inputMode="decimal" placeholder="0,00" />
                </div>

                <div>
                    <Label htmlFor="packPrice">Preço de Venda (Fardo)</Label>
                    <Input id="packPrice" value={packPriceStr} onChange={(e) => setPackPriceStr(formatCurrencyInput(e.target.value))} type="text" inputMode="decimal" placeholder="0,00" />
                </div>
                
                <div>
                    <Label htmlFor="unitPrice">Preço de Venda (Unit.)</Label>
                    <Input id="unitPrice" value={formatBRL(unitPrice)} readOnly disabled />
                    <p className="text-xs text-muted-foreground mt-1">Calculado automaticamente.</p>
                </div>

                 <div>
                    <Label htmlFor="stock">Estoque (em Fardos)</Label>
                    <Input id="stock" value={stock} onChange={(e) => setStock(e.target.value)} type="number" />
                </div>
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
          onDelete={managementProps.onDelete}
        />
      )}
    </>
  );
}
