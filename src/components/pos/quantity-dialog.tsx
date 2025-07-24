
'use client';

import React, { useState, useEffect, useRef } from 'react';
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
import { formatBRL, formatCurrencyInput, parseCurrencyBRL } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { useAuth } from '@/context/AuthContext';

type QuantityDialogProps = {
  onClose: () => void;
  onConfirm: (product: Product, quantity: number, price: number, unitOfSale: string) => void;
  product: Product;
};

export function QuantityDialog({ onClose, onConfirm, product }: QuantityDialogProps) {
  const [quantity, setQuantity] = useState('1');
  const [priceStr, setPriceStr] = useState('');
  const [unitOfSale, setUnitOfSale] = useState(product.unitOfMeasure);
  const { user } = useAuth();
  
  const canEditPrice = user?.role === 'Administrador' || user?.role === 'Gerente';

  const quantityInputRef = useRef<HTMLInputElement>(null);
  const priceInputRef = useRef<HTMLInputElement>(null);

  const { toast } = useToast();

  const unitPrice = product.price;
  const packPrice = product.packPrice;
  const unitsPerPack = product.unitsPerPack;
  const packUnitName = product.unitOfMeasure;
  
  const isPack = unitOfSale === packUnitName;
  const stockDisplay = isPack ? product.stock : product.stock * unitsPerPack;
  const stockUnitDisplay = isPack ? packUnitName : 'Unidade';

  useEffect(() => {
    // Set initial state based on selling the pack
    setUnitOfSale(packUnitName);
    setPriceStr(formatCurrencyInput(String(packPrice * 100)));
    setTimeout(() => {
      quantityInputRef.current?.focus();
      quantityInputRef.current?.select();
    }, 100);
  }, [product, packPrice, packUnitName]);
  
  useEffect(() => {
      const newPrice = unitOfSale === packUnitName ? packPrice : unitPrice;
      setPriceStr(formatCurrencyInput(String(newPrice * 100)));
  }, [unitOfSale, packPrice, unitPrice, packUnitName]);

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
    
    onConfirm(product, numQuantity, numPrice, unitOfSale);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (document.activeElement === quantityInputRef.current) {
        if(canEditPrice) {
            priceInputRef.current?.focus();
            priceInputRef.current?.select();
        } else {
            handleConfirm();
        }
      } else if (document.activeElement === priceInputRef.current) {
        handleConfirm();
      }
    }
  };

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md" onKeyDown={handleKeyDown}>
          <DialogHeader>
            <DialogTitle>{product.name}</DialogTitle>
            <DialogDescription>
              Estoque disponível: {stockDisplay} {stockUnitDisplay}(s)
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
             <div className="space-y-2">
                <Label>Vender por</Label>
                 <RadioGroup value={unitOfSale} onValueChange={setUnitOfSale} className="flex gap-4">
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value={packUnitName} id={`r-${packUnitName}`} />
                        <Label htmlFor={`r-${packUnitName}`}>{packUnitName}</Label>
                    </div>
                    {unitsPerPack > 1 && (
                      <div className="flex items-center space-x-2">
                          <RadioGroupItem value="Unidade" id="r-unidade" />
                          <Label htmlFor="r-unidade">Unidade</Label>
                      </div>
                    )}
                </RadioGroup>
             </div>
             <div className="space-y-2">
              <Label htmlFor="quantity">
                Quantidade ({unitOfSale})
              </Label>
              <Input
                id="quantity"
                ref={quantityInputRef}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                type="number"
                min="1"
                max={stockDisplay}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Preço de Venda (por {unitOfSale})</Label>
              <Input
                id="price"
                ref={priceInputRef}
                value={priceStr}
                onChange={(e) => setPriceStr(formatCurrencyInput(e.target.value))}
                type="text"
                inputMode="decimal"
                readOnly={!canEditPrice}
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
