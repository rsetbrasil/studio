
'use client';

import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { buttonVariants } from '@/components/ui/button';
import { Product } from '@/context/ProductsContext';

type DeleteProductDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  product: Product | null;
};

export function DeleteProductDialog({ isOpen, onClose, onConfirm, product }: DeleteProductDialogProps) {
  if (!product) return null;

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir Produto?</AlertDialogTitle>
          <AlertDialogDescription>
            Você tem certeza que deseja excluir o produto <strong>{product.name}</strong>? Esta ação não pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className={buttonVariants({ variant: "destructive" })}
          >
            Sim, Excluir Produto
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
