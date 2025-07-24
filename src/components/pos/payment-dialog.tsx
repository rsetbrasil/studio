
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
  const dialogContentRef = useRef<HTMLDivElement>(null);
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
      const initialTotal = subtotal + tax;
      setPaymentAmounts({ 'Dinheiro': initialTotal });
      setPaymentAmountStrings({ 'Dinheiro': formatBRL(initialTotal).replace('R$', '').trim() });
      setFocusedIndex(0); 
    } else {
      setPaymentAmounts({});
      setPaymentAmountStrings({});
      setFocusedIndex(0);
    }
  }, [isOpen, subtotal, tax]);


  useEffect(() => {
    if (isOpen) {
        setTimeout(() => {
            const buttonToFocus = paymentButtonRefs.current[focusedIndex];
            if (buttonToFocus) {
                buttonToFocus.focus();
            }
        }, 100);
    }
  }, [isOpen]);

   useEffect(() => {
    if (isOpen && paymentButtonRefs.current[focusedIndex]) {
        paymentButtonRefs.current[focusedIndex]?.focus();
    }
  }, [focusedIndex, isOpen]);

  const handleSelectPaymentMethod = (method: string) => {
    setPaymentAmounts(prevAmounts => {
        const newAmountsNum: Record<string, number> = { ...prevAmounts };
        const newAmountsStr: Record<string, string> = {};
        const isSelected = newAmountsNum[method] !== undefined;

        if (isSelected) {
            if (Object.keys(newAmountsNum).length > 1) {
              delete newAmountsNum[method];
            }
        } else {
            const paidSoFar = Object.values(newAmountsNum).reduce((sum, amt) => sum + (amt || 0), 0);
            const currentTotal = subtotal + tax; // Use initial total, cardFee will be calculated later
            const remaining = currentTotal - paidSoFar;
            newAmountsNum[method] = Math.max(0, remaining > 0.001 ? remaining : 0);
        }

        Object.keys(newAmountsNum).forEach(key => {
          newAmountsStr[key] = formatCurrencyInput(String(newAmountsNum[key] * 100));
        });
        setPaymentAmountStrings(newAmountsStr);
        return newAmountsNum;
    });

    setTimeout(() => {
        const inputElement = paymentInputRefs.current[method];
        if (inputElement) {
            inputElement.focus();
            inputElement.select();
        } else {
           const selectedIndex = paymentOptions.findIndex(p => p.value === method);
           if (selectedIndex !== -1) {
               setFocusedIndex(selectedIndex);
           }
        }
    }, 100);
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
      if (!isInputFocused) {
          setFocusedIndex(prev => (prev + 1) % paymentOptions.length);
      } else {
          confirmButtonRef.current?.focus();
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
       if (!isInputFocused) {
            setFocusedIndex(prev => (prev - 1 + paymentOptions.length) % paymentOptions.length);
       }
    } else if (e.key === 'Enter' || e.key === ' ') {
        if (!isInputFocused) {
           e.preventDefault();
           const currentMethod = paymentOptions[focusedIndex].value;
           handleSelectPaymentMethod(currentMethod);
        }
    }
    if (e.key === 'Enter' && isInputFocused) {
        handleFinish();
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent 
        ref={dialogContentRef}
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
                            "flex items-center p-3 rounded-lg border-2 text-left transition-all focus:outline-none focus:ring-2 focus:ring-offset-2",
                            isSelected ? "border-primary bg-primary/10" : "border-transparent bg-muted/50 hover:bg-muted",
                            focusedIndex === index && !isSelected ? "ring-2 ring-ring ring-offset-2" : "",
                            focusedIndex === index && isSelected ? "ring-2 ring-primary ring-offset-2" : ""
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
                                    className="h-9 text-right font-bold text-base pr-3"
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
