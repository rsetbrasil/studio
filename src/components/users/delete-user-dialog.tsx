
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
import { User } from '@/context/UsersContext';

type DeleteUserDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  user: User | null;
};

export function DeleteUserDialog({ isOpen, onClose, onConfirm, user }: DeleteUserDialogProps) {
  if (!user) return null;

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir Usuário?</AlertDialogTitle>
          <AlertDialogDescription>
            Você tem certeza que deseja excluir o usuário <strong>{user.name}</strong>? Esta ação não pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className={buttonVariants({ variant: "destructive" })}
          >
            Sim, Excluir Usuário
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
