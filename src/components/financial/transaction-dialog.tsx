
'use client';

import React, { useState, useEffect } from 'react';
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Calendar as CalendarIcon } from "lucide-react"

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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { useToast } from '@/hooks/use-toast';
import { cn, formatCurrencyInput, parseCurrencyBRL } from '@/lib/utils';
import type { Transaction } from '@/context/FinancialContext';

type TransactionDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (transactionData: Omit<Transaction, 'id'>) => void;
};

export function TransactionDialog({ isOpen, onClose, onConfirm }: TransactionDialogProps) {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'Receita' | 'Despesa'>('Despesa');
  const [status, setStatus] = useState<'Pago' | 'Pendente'>('Pendente');
  const [date, setDate] = useState<Date | undefined>(new Date());
  
  const { toast } = useToast();

  useEffect(() => {
    if (!isOpen) {
      setDescription('');
      setAmount('');
      setType('Despesa');
      setStatus('Pendente');
      setDate(new Date());
    }
  }, [isOpen]);

  const handleConfirm = () => {
    const numericAmount = parseCurrencyBRL(amount);
    if (!description || !amount || !date || isNaN(numericAmount) || numericAmount <= 0) {
      toast({
        title: "Campos Obrigatórios ou Inválidos",
        description: "Por favor, preencha todos os campos corretamente.",
        variant: "destructive",
      });
      return;
    }

    const transactionData = {
      description,
      amount: numericAmount,
      type,
      status,
      date: format(date, "yyyy-MM-dd"),
    };

    onConfirm(transactionData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Adicionar Nova Transação</DialogTitle>
          <DialogDescription>
            Preencha as informações da transação abaixo.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                Descrição
                </Label>
                <Input id="description" value={description} onChange={(e) => setDescription(e.target.value)} className="col-span-3" />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="amount" className="text-right">
                Valor
                </Label>
                <Input 
                  id="amount" 
                  value={amount} 
                  onChange={(e) => setAmount(formatCurrencyInput(e.target.value))} 
                  className="col-span-3" 
                  type="text" 
                  inputMode="decimal" 
                  placeholder="0,00"
                />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Data</Label>
                <Popover>
                    <PopoverTrigger asChild>
                    <Button
                        variant={"outline"}
                        className={cn(
                        "col-span-3 justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP", { locale: ptBR }) : <span>Escolha uma data</span>}
                    </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                        <Calendar
                            mode="single"
                            selected={date}
                            onSelect={setDate}
                            initialFocus
                            locale={ptBR}
                        />
                    </PopoverContent>
                </Popover>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Tipo</Label>
                <RadioGroup defaultValue={type} onValueChange={(value) => setType(value as any)} className="col-span-3 flex gap-4">
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Receita" id="r-receita" />
                        <Label htmlFor="r-receita">Receita</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Despesa" id="r-despesa" />
                        <Label htmlFor="r-despesa">Despesa</Label>
                    </div>
                </RadioGroup>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Status</Label>
                <RadioGroup defaultValue={status} onValueChange={(value) => setStatus(value as any)} className="col-span-3 flex gap-4">
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Pago" id="s-pago" />
                        <Label htmlFor="s-pago">Pago</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Pendente" id="s-pendente" />
                        <Label htmlFor="s-pendente">Pendente</Label>
                    </div>
                </RadioGroup>
            </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
          <Button type="button" onClick={handleConfirm}>
            Salvar Transação
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
