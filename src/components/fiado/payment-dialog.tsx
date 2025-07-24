
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
import { useToast } from '@/hooks/use-toast';
import { formatCurrencyInput, parseCurrencyBRL, formatBRL } from '@/lib/utils';
import { FiadoAccount } from '@/context/FiadoContext';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Banknote, CreditCard, Landmark } from 'lucide-react';

type PaymentDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (customerName: string, amount: number, paymentMethod: string) => void;
  account: FiadoAccount;
};

export function PaymentDialog({ isOpen, onClose, onConfirm, account }: PaymentDialogProps) {
  const [amountStr, setAmountStr] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Dinheiro');
  const { toast } = useToast();

  React.useEffect(() => {
    if (account) {
      setAmountStr(formatCurrencyInput(String(account.balance * 100)));
    }
  }, [account]);

  const handleConfirm = () => {
    const numericAmount = parseCurrencyBRL(amountStr);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      toast({
        title: "Valor Inválido",
        description: "Por favor, insira um valor válido para o pagamento.",
        variant: "destructive",
      });
      return;
    }
    
    onConfirm(account.customerName, numericAmount, paymentMethod);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Receber Pagamento de Fiado</DialogTitle>
          <DialogDescription>
            Cliente: <strong>{account.customerName}</strong><br/>
            Saldo Devedor: <span className="font-bold text-destructive">{formatBRL(account.balance)}</span>
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Valor do Pagamento (R$)</Label>
            <Input
              id="amount"
              value={amountStr}
              onChange={(e) => setAmountStr(formatCurrencyInput(e.target.value))}
              type="text"
              inputMode="decimal"
              placeholder="0,00"
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label>Forma de Pagamento</Label>
            <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="flex gap-4 pt-2">
                <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Dinheiro" id="r-dinheiro" />
                    <Label htmlFor="r-dinheiro" className="flex items-center gap-2 cursor-pointer"><Banknote className="h-4 w-4"/> Dinheiro</Label>
                </div>
                <div className="flex items-center space-x-2">
                    <RadioGroupItem value="PIX" id="r-pix" />
                    <Label htmlFor="r-pix" className="flex items-center gap-2 cursor-pointer"><Landmark className="h-4 w-4"/> PIX</Label>
                </div>
                 <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Crédito" id="r-credito" />
                    <Label htmlFor="r-credito" className="flex items-center gap-2 cursor-pointer"><CreditCard className="h-4 w-4"/> Crédito</Label>
                </div>
                 <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Débito" id="r-debito" />
                    <Label htmlFor="r-debito" className="flex items-center gap-2 cursor-pointer"><CreditCard className="h-4 w-4"/> Débito</Label>
                </div>
            </RadioGroup>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
          <Button type="button" onClick={handleConfirm}>
            Confirmar Recebimento
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
