
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
    const [selectedMethods, setSelectedMethods] = useState<Set<string>>(new Set(['Dinheiro']));
    const [paymentAmountStrings, setPaymentAmountStrings] = useState<Record<string, string>>({});
    const [focusedIndex, setFocusedIndex] = useState(0);

    const paymentInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
    const paymentButtonRefs = useRef<(HTMLButtonElement | null)[]>([]);
    const confirmButtonRef = useRef<HTMLButtonElement>(null);

    const { toast } = useToast();

    // Recalculate everything when amounts or selection changes
    const { total, cardFee, totalPaid, balance, change, numericAmounts } = useMemo(() => {
        const amounts: Record<string, number> = {};
        for (const method of selectedMethods) {
            amounts[method] = parseCurrencyBRL(paymentAmountStrings[method] || '0');
        }

        let calculatedCardFee = 0;
        if (amounts['Crédito'] > 0) {
            calculatedCardFee = Math.max(calculatedCardFee, amounts['Crédito'] * CREDIT_FEE_RATE);
        }
        if (amounts['Débito'] > 0) {
            calculatedCardFee = Math.max(calculatedCardFee, amounts['Débito'] * DEBIT_FEE_RATE);
        }

        const calculatedTotal = subtotal + tax + calculatedCardFee;
        const calculatedTotalPaid = Object.values(amounts).reduce((acc, amount) => acc + (amount || 0), 0);
        const calculatedBalance = calculatedTotal - calculatedTotalPaid;
        const calculatedChange = calculatedBalance < -0.001 ? Math.abs(calculatedBalance) : 0;
        
        return {
            total: calculatedTotal,
            cardFee: calculatedCardFee,
            totalPaid: calculatedTotalPaid,
            balance: calculatedBalance,
            change: calculatedChange,
            numericAmounts: amounts
        };
    }, [paymentAmountStrings, selectedMethods, subtotal, tax]);


    // Effect to run only when the dialog opens
    useEffect(() => {
        if (isOpen) {
            const initialTotal = subtotal + tax;
            setSelectedMethods(new Set(['Dinheiro']));
            setPaymentAmountStrings({ 'Dinheiro': formatCurrencyInput(String(initialTotal * 100)) });
            setFocusedIndex(0);
            setTimeout(() => paymentButtonRefs.current[0]?.focus(), 100);
        }
    }, [isOpen, subtotal, tax]);


    const handleSelectPaymentMethod = (method: string) => {
        const newSelectedMethods = new Set(selectedMethods);
        const isCurrentlySelected = newSelectedMethods.has(method);

        if (isCurrentlySelected) {
            // Deselect if it's not the only one selected
             if (newSelectedMethods.size > 1) {
                newSelectedMethods.delete(method);
             }
        } else {
            // Select
            newSelectedMethods.add(method);
        }
        
        setSelectedMethods(newSelectedMethods);
        
        // Recalculate and distribute balance
        const currentPaid = Object.entries(paymentAmountStrings)
            .filter(([key]) => newSelectedMethods.has(key) && key !== method)
            .reduce((sum, [, value]) => sum + parseCurrencyBRL(value), 0);

        const remainingBalance = total - currentPaid;
        
        const newAmountStrings = {...paymentAmountStrings};
        
        if (!isCurrentlySelected) { // If we just selected it
            newAmountStrings[method] = formatCurrencyInput(String(remainingBalance * 100));
             // Focus the input of the newly selected method
            setTimeout(() => {
                const inputElement = paymentInputRefs.current[method];
                if (inputElement) {
                    inputElement.focus();
                    inputElement.select();
                }
            }, 100);
        } else { // If we just deselected it
            delete newAmountStrings[method];
        }

        setPaymentAmountStrings(newAmountStrings);
    };

    const handlePaymentAmountChange = (method: string, value: string) => {
        const formattedValue = formatCurrencyInput(value);
        setPaymentAmountStrings(prev => ({ ...prev, [method]: formattedValue }));
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
        const finalAmounts = Object.fromEntries(Object.entries(numericAmounts).filter(([, value]) => value > 0));

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
            e.preventDefault();
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
                const isSelected = selectedMethods.has(value);
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
