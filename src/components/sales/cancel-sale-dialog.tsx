
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
import { Sale } from '@/context/SalesContext';

type CancelSaleDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  sale: Sale | null;
};

export function CancelSaleDialog({ isOpen, onClose, onConfirm, sale }: CancelSaleDialogProps) {
  if (!sale) return null;

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Cancelar Venda?</AlertDialogTitle>
          <AlertDialogDescription>
            Você tem certeza que deseja cancelar a venda <strong>{sale.displayId}</strong>? Esta ação não pode ser desfeita e os itens retornarão ao estoque.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>Manter Venda</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className={buttonVariants({ variant: "destructive" })}
          >
            Sim, Cancelar Venda
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
