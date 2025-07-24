
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
  { value: "Dinheiro", label: "Dinheiro", icon: Banknote, feeRate: 0 },
  { value: "PIX", label: "PIX", icon: Landmark, feeRate: 0 },
  { value: "Crédito", label: "Cartão de Crédito", icon: CreditCard, feeRate: CREDIT_FEE_RATE },
  { value: "Débito", label: "Cartão de Débito", icon: CreditCard, feeRate: DEBIT_FEE_RATE },
];

type PaymentDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  subtotal: number;
  tax: number;
  onConfirmSale: (paymentData: { paymentAmounts: Record<string, number>; change: number; cardFee: number, totalPaid: number }) => void;
};

export function PaymentDialog({ isOpen, onClose, subtotal, tax, onConfirmSale }: PaymentDialogProps) {
    const [selectedMethod, setSelectedMethod] = useState<string>('Dinheiro');
    const [paymentAmountStrings, setPaymentAmountStrings] = useState<Record<string, string>>({});
    
    const paymentInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

    const { toast } = useToast();
    
    useEffect(() => {
        if (isOpen) {
            const initialTotal = subtotal + tax;
            setSelectedMethod('Dinheiro');
            setPaymentAmountStrings({ 'Dinheiro': formatCurrencyInput(String(initialTotal * 100)) });
            setTimeout(() => {
                const inputElement = paymentInputRefs.current['Dinheiro'];
                if (inputElement) {
                    inputElement.focus();
                    inputElement.select();
                }
            }, 100);
        }
    }, [isOpen, subtotal, tax]);
    
    const { total, cardFee, totalPaid, balance, change, numericAmounts } = useMemo(() => {
        const amounts: Record<string, number> = {};
        for (const option of paymentOptions) {
            amounts[option.value] = parseCurrencyBRL(paymentAmountStrings[option.value] || '0');
        }

        let calculatedCardFee = 0;
        if (amounts['Crédito'] > 0) {
            calculatedCardFee += amounts['Crédito'] * CREDIT_FEE_RATE;
        }
        if (amounts['Débito'] > 0) {
            calculatedCardFee += amounts['Débito'] * DEBIT_FEE_RATE;
        }

        const calculatedTotal = subtotal + tax; // Taxa de cartão não entra no total a pagar, mas sim no valor recebido.
        const calculatedTotalPaid = Object.values(amounts).reduce((acc, amount) => acc + (amount || 0), 0);
        const calculatedBalance = calculatedTotal - calculatedTotalPaid;
        const calculatedChange = calculatedBalance < -0.001 ? Math.abs(calculatedBalance) : 0;
        
        return {
            total: calculatedTotal,
            cardFee: calculatedCardFee,
            totalPaid: calculatedTotalPaid,
            balance: calculatedBalance > 0.001 ? calculatedBalance : 0,
            change: calculatedChange,
            numericAmounts: amounts
        };
    }, [paymentAmountStrings, subtotal, tax]);
    
    const handlePaymentAmountChange = (method: string, value: string) => {
        const formattedValue = formatCurrencyInput(value);
        setPaymentAmountStrings(prev => ({ ...prev, [method]: formattedValue }));
    };

    const handleSelectPaymentMethod = (method: string) => {
        setSelectedMethod(method);
        const inputElement = paymentInputRefs.current[method];
        if(inputElement) {
            inputElement.focus();
            inputElement.select();
        }
    }

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

        onConfirmSale({ paymentAmounts: finalAmounts, change, cardFee, totalPaid });
    };
  
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'F2') {
            e.preventDefault();
            handleFinish();
        }
        if (e.key === 'Enter') {
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
        <DialogHeader className="p-6 pb-4 text-center">
          <DialogTitle className="text-4xl font-bold">{formatBRL(total)}</DialogTitle>
          <p className="text-sm text-muted-foreground">Total a Pagar</p>
        </DialogHeader>
        <button onClick={onClose} className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
            <X className="h-5 w-5" />
            <span className="sr-only">Fechar</span>
        </button>
        
        <div className="flex flex-col px-6 pb-6 gap-3">
            {paymentOptions.map(({ value, label, icon: Icon, feeRate }) => {
                const isSelected = selectedMethod === value;
                const feeAmount = (numericAmounts[value] || 0) * feeRate;

                return (
                    <div
                        key={value}
                        onClick={() => handleSelectPaymentMethod(value)}
                        className={cn(
                            "flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all",
                            isSelected ? "border-primary bg-primary/5" : "border-muted bg-muted/50 hover:bg-muted"
                        )}
                    >
                        <Icon className="h-6 w-6 mr-4 text-muted-foreground" />
                        <div className="flex-1">
                            <span className="font-medium">{label}</span>
                            {feeRate > 0 && (
                                <p className="text-xs text-muted-foreground">
                                    Taxa: {(feeRate * 100).toFixed(1)}% ({formatBRL(feeAmount)})
                                </p>
                            )}
                        </div>
                        <div className="relative w-32">
                           <Input
                                ref={(el) => { paymentInputRefs.current[value] = el; }}
                                type="text"
                                inputMode="decimal"
                                value={paymentAmountStrings[value] ?? ''}
                                onChange={(e) => handlePaymentAmountChange(value, e.target.value)}
                                className={cn(
                                    "h-9 text-right font-bold text-base bg-transparent",
                                    !isSelected && "border-transparent"
                                )}
                                onFocus={(e) => {
                                    handleSelectPaymentMethod(value);
                                    e.target.select();
                                }}
                                placeholder="0,00"
                            />
                        </div>
                    </div>
                )
            })}
        </div>

        <div className="bg-muted/50 p-4 border-t space-y-3 text-sm">
            <div className="flex justify-between">
                <span className="text-muted-foreground">Total Pago:</span>
                <span className="font-medium">{formatBRL(totalPaid)}</span>
            </div>
             <div className="flex justify-between">
                <span className="text-muted-foreground">Restante:</span>
                <span className="font-medium">{formatBRL(balance)}</span>
            </div>
            {change > 0 && (
                 <div className="flex justify-between text-base">
                    <span className="text-muted-foreground">Troco:</span>
                    <span className="font-bold text-primary">{formatBRL(change)}</span>
                </div>
            )}
        </div>

        <DialogFooter className="p-4 pt-0">
          <Button 
            size="lg" 
            className="w-full h-12 text-lg font-semibold"
            onClick={handleFinish}
            disabled={balance <= -0.001}
          >
            Concluir (F2)
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

    