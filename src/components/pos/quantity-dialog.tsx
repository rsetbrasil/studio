
'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
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
import type { Product } from '@/context/ProductsContext';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { formatBRL, formatCurrencyInput, parseCurrencyBRL } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export type SaleUnit = 'unit' | 'pack';

type QuantityDialogProps = {
  onClose: () => void;
  onConfirm: (product: Product, quantity: number, price: number, saleUnit: SaleUnit) => void;
  product: Product;
};

export function QuantityDialog({ onClose, onConfirm, product }: QuantityDialogProps) {
  const [quantity, setQuantity] = useState('1');
  const [priceStr, setPriceStr] = useState('');
  const [saleUnit, setSaleUnit] = useState<SaleUnit>('unit');
  
  const quantityInputRef = useRef<HTMLInputElement>(null);
  const priceInputRef = useRef<HTMLInputElement>(null);

  const { toast } = useToast();

  useEffect(() => {
    // Set initial price based on the default sale unit ('unit')
    setPriceStr(formatCurrencyInput(String(product.price * 100)));
    setTimeout(() => {
      quantityInputRef.current?.focus();
      quantityInputRef.current?.select();
    }, 100);
  }, [product]);

  const handleSaleUnitChange = (unit: SaleUnit) => {
    setSaleUnit(unit);
    const newPrice = unit === 'unit' ? product.price : product.packPrice;
    setPriceStr(formatCurrencyInput(String(newPrice * 100)));
  };

  const handleConfirm = () => {
    const numQuantity = parseInt(quantity, 10);
    const numPrice = parseCurrencyBRL(priceStr);

    if (isNaN(numQuantity) || numQuantity <= 0) {
      toast({ title: 'Quantidade inválida', variant: 'destructive' });
      return;
    }
    if (isNaN(numPrice) || numPrice < 0) {
      toast({ title: 'Preço inválido', variant: 'destructive' });
      return;
    }
    
    onConfirm(product, numQuantity, numPrice, saleUnit);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (document.activeElement === quantityInputRef.current) {
        priceInputRef.current?.focus();
        priceInputRef.current?.select();
      } else if (document.activeElement === priceInputRef.current) {
        handleConfirm();
      }
    }
  };

  const availableStock = useMemo(() => {
    if (saleUnit === 'unit') {
      return product.stock * product.unitsPerPack;
    }
    return product.stock;
  }, [saleUnit, product]);

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md" onKeyDown={handleKeyDown}>
          <DialogHeader>
            <DialogTitle>{product.name}</DialogTitle>
            <DialogDescription>
              Estoque disponível: {availableStock} {saleUnit === 'unit' ? 'unidade(s)' : `${product.unitOfMeasure}(s)`}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
             <div className="space-y-2">
                <Label>Vender por</Label>
                <RadioGroup defaultValue={saleUnit} onValueChange={(v) => handleSaleUnitChange(v as SaleUnit)} className="flex gap-4">
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="unit" id="r-unit" />
                        <Label htmlFor="r-unit">Unidade</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="pack" id="r-pack" />
                        <Label htmlFor="r-pack">{product.unitOfMeasure}</Label>
                    </div>
                </RadioGroup>
            </div>
             <div className="space-y-2">
              <Label htmlFor="quantity">
                Quantidade ({saleUnit === 'unit' ? 'Unidades' : product.unitOfMeasure})
              </Label>
              <Input
                id="quantity"
                ref={quantityInputRef}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                type="number"
                min="1"
                max={availableStock}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Preço de Venda (por {saleUnit === 'unit' ? 'Unidade' : product.unitOfMeasure})</Label>
              <Input
                id="price"
                ref={priceInputRef}
                value={priceStr}
                onChange={(e) => setPriceStr(formatCurrencyInput(e.target.value))}
                type="text"
                inputMode="decimal"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="button" onClick={handleConfirm}>Confirmar</Button>
          </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
