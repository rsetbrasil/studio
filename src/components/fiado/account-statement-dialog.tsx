
'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FiadoAccount } from '@/context/FiadoContext';
import { formatBRL } from '@/lib/utils';
import { Badge } from '../ui/badge';
import { ArrowDownCircle, ArrowUpCircle } from 'lucide-react';

type AccountStatementDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  account: FiadoAccount;
};

export function AccountStatementDialog({ isOpen, onClose, account }: AccountStatementDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Extrato da Conta</DialogTitle>
          <DialogDescription>
            Cliente: <strong>{account.customerName}</strong> | Saldo Devedor: <strong className="text-destructive">{formatBRL(account.balance)}</strong>
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <ScrollArea className="h-96">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Operação</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {account.transactions.map(tx => (
                  <TableRow key={tx.id}>
                    <TableCell>{new Date(tx.date).toLocaleString('pt-BR')}</TableCell>
                    <TableCell>
                      <Badge variant={tx.type === 'sale' ? 'destructive' : 'default'}>
                        {tx.type === 'sale' ? <><ArrowUpCircle className="mr-2 h-4 w-4"/> Compra</> : <><ArrowDownCircle className="mr-2 h-4 w-4"/> Pagamento</>}
                      </Badge>
                    </TableCell>
                     <TableCell>
                        {tx.type === 'sale' ? `Venda #${tx.id.replace('SALE', '')}` : `Pagamento via ${tx.paymentMethod}`}
                    </TableCell>
                    <TableCell className={`text-right font-medium ${tx.type === 'sale' ? 'text-destructive' : 'text-green-600'}`}>
                      {formatBRL(Math.abs(tx.amount))}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </div>
        <DialogFooter>
          <Button onClick={onClose}>Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
