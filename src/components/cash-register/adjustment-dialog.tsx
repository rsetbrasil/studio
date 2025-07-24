
'use client';

import React, { useState } from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { formatCurrencyInput, parseCurrencyBRL } from '@/lib/utils';

type AdjustmentDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (amount: number, reason: string) => void;
  type: 'suprimento' | 'sangria';
};

export function AdjustmentDialog({ isOpen, onClose, onConfirm, type }: AdjustmentDialogProps) {
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const { toast } = useToast();

  const handleConfirm = () => {
    const numericAmount = parseCurrencyBRL(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      toast({
        title: "Valor Inválido",
        description: "Por favor, insira um valor válido para a operação.",
        variant: "destructive",
      });
      return;
    }
    onConfirm(numericAmount, reason);
  };

  const title = type === 'suprimento' ? 'Adicionar Suprimento' : 'Realizar Sangria';
  const description = type === 'suprimento' 
    ? 'Adicione um valor ao caixa (ex: troco inicial).' 
    : 'Retire um valor do caixa (ex: depósito, pagamento).';

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Valor (R$)</Label>
            <Input
              id="amount"
              value={amount}
              onChange={(e) => setAmount(formatCurrencyInput(e.target.value))}
              type="text"
              inputMode="decimal"
              placeholder="0,00"
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="reason">Motivo (Opcional)</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={`Ex: ${type === 'suprimento' ? 'Troco da manhã' : 'Depósito bancário'}`}
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
          <Button type="button" onClick={handleConfirm}>
            Confirmar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

    