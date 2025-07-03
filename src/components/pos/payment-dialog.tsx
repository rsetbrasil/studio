'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Banknote, CreditCard, Landmark, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { formatBRL } from '@/lib/utils';

const CREDIT_FEE_RATE = 0.03; // 3%
const DEBIT_FEE_RATE = 0.015; // 1.5%

const paymentOptions = [
  { value: "Dinheiro", label: "Dinheiro", icon: Banknote, fee: 0 },
  { value: "Débito", label: "Débito", icon: CreditCard, fee: DEBIT_FEE_RATE },
  { value: "Crédito", label: "Crédito", icon: CreditCard, fee: CREDIT_FEE_RATE },
  { value: "PIX", label: "PIX", icon: Landmark, fee: 0 },
];

type PaymentDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  subtotal: number;
  tax: number;
  onConfirmSale: (paymentData: { paymentAmounts: Record<string, number>; change: number; cardFee: number }) => void;
};

export function PaymentDialog({ isOpen, onClose, subtotal, tax, onConfirmSale }: PaymentDialogProps) {
  const [paymentAmounts, setPaymentAmounts] = useState<Record<string, number>>({});
  const [paymentAmountStrings, setPaymentAmountStrings] = useState<Record<string, string>>({});
  const paymentInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const { toast } = useToast();

  const cardFee = useMemo(() => {
    let fee = 0;
    const paymentMethods = Object.keys(paymentAmounts);

    if (paymentMethods.includes('Crédito')) {
      fee = Math.max(fee, subtotal * CREDIT_FEE_RATE);
    }
    if (paymentMethods.includes('Débito')) {
      fee = Math.max(fee, subtotal * DEBIT_FEE_RATE);
    }
    
    return fee;
  }, [paymentAmounts, subtotal]);

  const total = useMemo(() => subtotal + tax + cardFee, [subtotal, tax, cardFee]);

  const totalPaid = useMemo(() => {
    return Object.values(paymentAmounts).reduce((acc, amount) => acc + (amount || 0), 0);
  }, [paymentAmounts]);

  const balance = total - totalPaid;
  const change = balance < -0.001 ? Math.abs(balance) : 0;

  useEffect(() => {
    if (isOpen) {
      const initialTotal = subtotal + tax; // We calculate fee based on selection, so start without it.
      setPaymentAmounts({ 'Dinheiro': initialTotal });
      setPaymentAmountStrings({ 'Dinheiro': initialTotal.toFixed(2).replace('.', ',') });
    } else {
      // Clear state on close
      setPaymentAmounts({});
      setPaymentAmountStrings({});
    }
  }, [isOpen, subtotal, tax]);


  const handleSelectPaymentMethod = (method: string) => {
    setPaymentAmounts(prevAmounts => {
        const newAmounts = { ...prevAmounts };
        const isSelected = newAmounts[method] !== undefined;

        if (isSelected) {
            // Prevent removing the last payment method by clicking
            if (Object.keys(newAmounts).length > 1) {
              delete newAmounts[method];
            }
        } else {
            // Add new payment method, pre-filled with remaining balance
            const paidSoFar = Object.values(newAmounts).reduce((sum, amt) => sum + (amt || 0), 0);
            const currentTotal = subtotal + tax + cardFee; // Recalculate total with potential new fees
            const remaining = currentTotal - paidSoFar;
            newAmounts[method] = Math.max(0, remaining > 0.001 ? remaining : 0);
        }

        const newStrings: Record<string, string> = {};
        for (const key in newAmounts) {
            newStrings[key] = (newAmounts[key] || 0).toFixed(2).replace('.', ',');
        }
        setPaymentAmountStrings(newStrings);
        
        return newAmounts;
    });

    setTimeout(() => {
        const inputElement = paymentInputRefs.current[method];
        if (inputElement) {
            inputElement.focus();
            inputElement.select();
        }
    }, 100);
  };

  const handlePaymentAmountChange = (method: string, value: string) => {
    setPaymentAmountStrings(prev => ({
      ...prev,
      [method]: value,
    }));

    // Allow empty input or just a comma for typing
    if (value === "" || value === ",") {
        setPaymentAmounts(prev => ({...prev, [method]: 0}));
        return;
    }

    const parsableValue = value.replace(/\./g, '').replace(',', '.');
    const numericValue = parseFloat(parsableValue);

    if (!isNaN(numericValue)) {
      setPaymentAmounts(prev => ({
        ...prev,
        [method]: numericValue,
      }));
    }
  };

  const handleInputBlur = (method: string) => {
    const numericValue = paymentAmounts[method] || 0;
    setPaymentAmountStrings(prev => ({
      ...prev,
      [method]: numericValue.toFixed(2).replace('.', ',')
    }));
  };

  const handleFinish = () => {
    if (balance > 0.001) {
      toast({
        title: "Pagamento Incompleto",
        description: `Ainda falta pagar ${formatBRL(balance)}.`,
        variant: "destructive",
      });
      return;
    }
    onConfirmSale({ paymentAmounts, change, cardFee });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md p-0 gap-0">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="text-center text-sm font-normal text-muted-foreground tracking-widest">TOTAL A PAGAR</DialogTitle>
           <div className="text-center text-4xl font-bold">{formatBRL(total)}</div>
        </DialogHeader>
        <button onClick={onClose} className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
            <X className="h-5 w-5" />
            <span className="sr-only">Fechar</span>
        </button>
        <div className="flex flex-col px-6 pb-6 gap-2">
            {paymentOptions.map(({ value, label, icon: Icon }) => {
                const isSelected = paymentAmounts[value] !== undefined;
                return (
                    <div 
                        key={value}
                        onClick={() => handleSelectPaymentMethod(value)}
                        className={cn(
                            "flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all",
                            isSelected ? "border-primary bg-primary/10" : "border-transparent bg-muted/50 hover:bg-muted"
                        )}
                    >
                        <Icon className="h-6 w-6 mr-4 text-muted-foreground" />
                        <span className="flex-1 font-medium">{label}</span>
                        {isSelected && (
                            <div className="relative w-32">
                                <Input
                                    ref={(el) => { paymentInputRefs.current[value] = el; }}
                                    type="text"
                                    inputMode="decimal"
                                    value={paymentAmountStrings[value] ?? ''}
                                    onChange={(e) => handlePaymentAmountChange(value, e.target.value)}
                                    onBlur={() => handleInputBlur(value)}
                                    className="h-9 text-right font-bold text-base pr-3"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        (e.target as HTMLInputElement).select();
                                    }}
                                    onFocus={(e) => e.target.select()}
                                />
                            </div>
                        )}
                    </div>
                )
            })}
        </div>
        <DialogFooter className="flex-col gap-2 bg-muted/50 p-4">
             <div className="w-full flex justify-between items-center text-base">
                <div className="font-semibold text-muted-foreground">
                    {change > 0 ? "Troco" : (balance > 0.001 ? "Falta" : "Total Pago")}
                </div>
                <div className="font-bold text-primary">
                    {change > 0 ? formatBRL(change) : (balance > 0.001 ? formatBRL(balance) : formatBRL(totalPaid))}
                </div>
            </div>
          <Button 
            size="lg" 
            className="w-full h-12 text-lg font-semibold"
            onClick={handleFinish}
            disabled={balance > 0.001}
          >
            CONCLUIR
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
