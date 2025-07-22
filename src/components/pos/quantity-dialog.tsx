
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

type QuantityDialogProps = {
  onClose: () => void;
  onConfirm: (product: Product, quantity: number, price: number) => void;
  product: Product;
};

export function QuantityDialog({ onClose, onConfirm, product }: QuantityDialogProps) {
  const [quantity, setQuantity] = useState('1');
  const [price, setPrice] = useState(product.price.toFixed(2).replace('.', ','));
  const quantityInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTimeout(() => {
      quantityInputRef.current?.focus();
      quantityInputRef.current?.select();
    }, 100);
  }, []);

  const handleConfirm = () => {
    const numQuantity = parseInt(quantity, 10);
    const numPrice = parseFloat(price.replace(',', '.'));

    if (isNaN(numQuantity) || numQuantity <= 0) {
      onClose();
      return;
    }
    if (isNaN(numPrice) || numPrice < 0) {
      onClose();
      return;
    }
    
    onConfirm(product, numQuantity, numPrice);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleConfirm();
    }
  };

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-xs" onKeyDown={handleKeyDown}>
          <DialogHeader>
            <DialogTitle>{product.name}</DialogTitle>
            <DialogDescription>
              Estoque disponível: {product.stock}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="quantity" className="text-right">
                Quant.
              </Label>
              <Input
                id="quantity"
                ref={quantityInputRef}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="col-span-3"
                type="number"
                min="1"
                max={product.stock}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="price" className="text-right">
                Preço
              </Label>
              <Input
                id="price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="col-span-3"
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
