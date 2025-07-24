
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
import { cn, formatBRL, formatCurrencyInput, parseCurrencyBRL } from '@/lib/utils';


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
  const [paymentAmountStrings, setPaymentAmountStrings] = useState<Record<string, string>>({});
  const [paymentAmounts, setPaymentAmounts] = useState<Record<string, number>>({});
  const [focusedIndex, setFocusedIndex] = useState(0);
  
  const paymentInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const paymentButtonRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const confirmButtonRef = useRef<HTMLButtonElement>(null);

  const { toast } = useToast();

  const cardFee = useMemo(() => {
    let fee = 0;
    if (paymentAmounts['Crédito'] > 0) {
        fee = Math.max(fee, paymentAmounts['Crédito'] * CREDIT_FEE_RATE);
    }
    if (paymentAmounts['Débito'] > 0) {
        fee = Math.max(fee, paymentAmounts['Débito'] * DEBIT_FEE_RATE);
    }
    return fee;
  }, [paymentAmounts]);
  
  const total = useMemo(() => subtotal + tax + cardFee, [subtotal, tax, cardFee]);

  const totalPaid = useMemo(() => {
    return Object.values(paymentAmounts).reduce((acc, amount) => acc + (amount || 0), 0);
  }, [paymentAmounts]);

  const balance = total - totalPaid;
  const change = balance < -0.001 ? Math.abs(balance) : 0;
  
  useEffect(() => {
    if (isOpen) {
        // Reset state on open
        setPaymentAmounts({});
        setPaymentAmountStrings({});
        setFocusedIndex(0);

        const initialTotal = subtotal + tax;
        // Pre-select "Dinheiro" with the full amount
        setPaymentAmounts({ 'Dinheiro': initialTotal });
        setPaymentAmountStrings({ 'Dinheiro': formatCurrencyInput(String(initialTotal * 100)) });

        setTimeout(() => paymentButtonRefs.current[0]?.focus(), 100);
    }
  }, [isOpen, subtotal, tax]);


  const handleSelectPaymentMethod = (method: string) => {
    setPaymentAmounts(prevAmounts => {
        const newAmountsNum: Record<string, number> = { ...prevAmounts };
        const isSelected = newAmountsNum[method] !== undefined && newAmountsNum[method] > 0;

        if (isSelected) {
            // Deselect only if it's not the only one selected or if total is covered
             if (Object.keys(newAmountsNum).length > 1) {
                delete newAmountsNum[method];
             }
        } else {
            // Select and fill with remaining balance
            const paidSoFar = Object.values(newAmountsNum).reduce((sum, amt) => sum + (amt || 0), 0);
            const remaining = total - paidSoFar;
             if (remaining > 0.001) {
               newAmountsNum[method] = remaining;
             } else {
                // If paidSoFar already covers total, just add the new method with 0
                newAmountsNum[method] = 0;
             }
        }
        
        // Recalculate string values from numeric values
        const newAmountsStr: Record<string, string> = {};
        Object.keys(newAmountsNum).forEach(key => {
          newAmountsStr[key] = formatCurrencyInput(String(newAmountsNum[key] * 100));
        });
        setPaymentAmountStrings(newAmountsStr);

        // Focus the input of the selected method
        setTimeout(() => {
            const inputElement = paymentInputRefs.current[method];
            if (inputElement) {
                inputElement.focus();
                inputElement.select();
            }
        }, 100);

        return newAmountsNum;
    });
  };


  const handlePaymentAmountChange = (method: string, value: string) => {
    const formattedValue = formatCurrencyInput(value);
    setPaymentAmountStrings(prev => ({ ...prev, [method]: formattedValue }));

    const numericValue = parseCurrencyBRL(formattedValue);
    setPaymentAmounts(prev => ({ ...prev, [method]: numericValue }));
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
    const finalAmounts = Object.fromEntries(Object.entries(paymentAmounts).filter(([, value]) => value > 0));

    onConfirmSale({ paymentAmounts: finalAmounts, change, cardFee });
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    const isInputFocused = document.activeElement?.tagName === 'INPUT';

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const nextIndex = (focusedIndex + 1) % paymentOptions.length;
      setFocusedIndex(nextIndex);
      paymentButtonRefs.current[nextIndex]?.focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prevIndex = (focusedIndex - 1 + paymentOptions.length) % paymentOptions.length;
      setFocusedIndex(prevIndex);
       paymentButtonRefs.current[prevIndex]?.focus();
    } else if ((e.key === 'Enter' || e.key === ' ') && !isInputFocused) {
       e.preventDefault();
       const currentMethod = paymentOptions[focusedIndex].value;
       handleSelectPaymentMethod(currentMethod);
    } else if (e.key === 'Enter' && isInputFocused) {
        handleFinish();
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent 
        className="sm:max-w-md p-0 gap-0"
        onKeyDown={handleKeyDown}
      >
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="text-center text-sm font-normal text-muted-foreground tracking-widest">TOTAL A PAGAR</DialogTitle>
           <div className="text-center text-4xl font-bold">{formatBRL(total)}</div>
        </DialogHeader>
        <button onClick={onClose} className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
            <X className="h-5 w-5" />
            <span className="sr-only">Fechar</span>
        </button>
        <div className="flex flex-col px-6 pb-6 gap-2">
            {paymentOptions.map(({ value, label, icon: Icon }, index) => {
                const isSelected = paymentAmounts[value] !== undefined;
                return (
                    <button 
                        type="button"
                        key={value}
                        ref={(el) => (paymentButtonRefs.current[index] = el)}
                        onClick={() => handleSelectPaymentMethod(value)}
                        onFocus={() => setFocusedIndex(index)}
                        className={cn(
                            "flex items-center p-3 rounded-lg border-2 text-left transition-all focus:outline-none focus:ring-2 focus:ring-offset-background",
                            isSelected ? "border-primary bg-primary/10 ring-primary" : "border-transparent bg-muted/50 ring-ring",
                        )}
                    >
                        <Icon className="h-6 w-6 mr-4 text-muted-foreground" />
                        <span className="flex-1 font-medium">{label}</span>
                        {isSelected && (
                            <div className="relative w-32">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">R$</span>
                                <Input
                                    ref={(el) => { paymentInputRefs.current[value] = el; }}
                                    type="text"
                                    inputMode="decimal"
                                    value={paymentAmountStrings[value] ?? ''}
                                    onChange={(e) => handlePaymentAmountChange(value, e.target.value)}
                                    className="h-9 text-right font-bold text-base pr-3 pl-9 bg-background"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        (e.target as HTMLInputElement).select();
                                    }}
                                    onFocus={(e) => e.target.select()}
                                    placeholder="0,00"
                                />
                            </div>
                        )}
                    </button>
                )
            })}
        </div>
        <DialogFooter className="flex-col gap-2 bg-muted/50 p-4 border-t">
             <div className="w-full flex justify-between items-center text-base">
                <div className="font-semibold text-muted-foreground">
                    {change > 0 ? "Troco" : (balance > 0.001 ? "Falta" : "Total Pago")}
                </div>
                <div className={cn("font-bold", balance > 0.001 ? "text-destructive" : "text-primary")}>
                    {change > 0 ? formatBRL(change) : (balance > 0.001 ? formatBRL(balance) : formatBRL(totalPaid))}
                </div>
            </div>
          <Button 
            ref={confirmButtonRef}
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
