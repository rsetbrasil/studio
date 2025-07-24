
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
import { CashRegisterSession } from '@/context/CashRegisterContext';

type DeleteSessionDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  session: CashRegisterSession | null;
};

export function DeleteSessionDialog({ isOpen, onClose, onConfirm, session }: DeleteSessionDialogProps) {
  if (!session) return null;

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir Registro de Caixa?</AlertDialogTitle>
          <AlertDialogDescription>
            Você tem certeza que deseja excluir o registro do caixa{' '}
            <strong>#{session.id}</strong> (de {new Date(session.openingTime).toLocaleDateString('pt-BR')})? 
            Esta ação não pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className={buttonVariants({ variant: "destructive" })}
          >
            Sim, Excluir Registro
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
