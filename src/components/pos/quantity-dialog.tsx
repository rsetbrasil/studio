

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
  onConfirm: (product: Product, quantity: number, price: number) => void;
  product: Product;
};

export function QuantityDialog({ onClose, onConfirm, product }: QuantityDialogProps) {
  const [quantity, setQuantity] = useState('1');
  const [priceStr, setPriceStr] = useState('');
  const { user } = useAuth();
  
  const canEditPrice = user?.role === 'Administrador' || user?.role === 'Gerente';

  const quantityInputRef = useRef<HTMLInputElement>(null);
  const priceInputRef = useRef<HTMLInputElement>(null);

  const { toast } = useToast();

  const packPrice = product.packPrice;
  const unitOfMeasure = product.unitOfMeasure;
  

  useEffect(() => {
    setPriceStr(formatCurrencyInput(String(packPrice * 100)));
    setTimeout(() => {
      quantityInputRef.current?.focus();
      quantityInputRef.current?.select();
    }, 100);
  }, [product, packPrice]);

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
    
    onConfirm(product, numQuantity, numPrice);
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
              Estoque disponível: {product.stock} {product.unitOfMeasure}(s)
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
             <div className="space-y-2">
              <Label htmlFor="quantity">
                Quantidade ({unitOfMeasure})
              </Label>
              <Input
                id="quantity"
                ref={quantityInputRef}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                type="number"
                min="1"
                max={product.stock}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Preço de Venda (por {unitOfMeasure})</Label>
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
