
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

type ResetProductsDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export function ResetProductsDialog({ isOpen, onClose, onConfirm }: ResetProductsDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Zerar Cadastro de Produtos?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta ação não pode ser desfeita. Isso irá apagar permanentemente
            todos os dados de produtos, categorias e unidades de medida. Outros dados como vendas e financeiro não serão afetados.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className={buttonVariants({ variant: "destructive" })}
          >
            Sim, zerar os produtos
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
