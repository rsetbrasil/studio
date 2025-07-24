
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
import { formatBRL } from '@/lib/utils';

type ConfirmFiadoDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  customerName: string;
  total: number;
};

export function ConfirmFiadoDialog({ isOpen, onClose, onConfirm, customerName, total }: ConfirmFiadoDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirmar Venda Fiado?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta ação adicionará um débito de{' '}
            <strong className="text-destructive">{formatBRL(total)}</strong> na conta do cliente{' '}
            <strong>{customerName}</strong>. Os itens sairão do estoque.
            Deseja continuar?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>
            Sim, Salvar Fiado
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
