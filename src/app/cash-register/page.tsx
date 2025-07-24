
'use client';

import React, { useState, useMemo } from 'react';
import { AppShell } from '@/components/app-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useCashRegister } from '@/context/CashRegisterContext';
import { formatBRL, formatCurrencyInput, parseCurrencyBRL } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';

export default function CashRegisterPage() {
  const { state, history, openRegister, closeRegister, getSalesForCurrentSession, isMounted } = useCashRegister();
  const [isOpeningDialogOpen, setOpeningDialogOpen] = useState(false);
  const [isClosingDialogOpen, setClosingDialogOpen] = useState(false);
  const [openingBalance, setOpeningBalance] = useState('');
  const { toast } = useToast();

  const salesForCurrentSession = getSalesForCurrentSession();
  const totalSales = useMemo(() => salesForCurrentSession.reduce((acc, sale) => acc + sale.amount, 0), [salesForCurrentSession]);
  
  const paymentMethodTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    salesForCurrentSession.forEach(sale => {
      // paymentMethod can be "Dinheiro e PIX"
      const methods = sale.paymentMethod.split(' e ');
      methods.forEach(method => {
        // This is a simplification. A real scenario needs to know how much was paid with each method.
        // For now, we assume the full amount for each method, which is incorrect for split payments.
        // This would require changes in the payment dialog.
        totals[method] = (totals[method] || 0) + sale.amount; 
      });
    });
    return totals;
  }, [salesForCurrentSession]);
  

  const handleOpenRegister = () => {
    const balance = parseCurrencyBRL(openingBalance);
    if (isNaN(balance) || balance < 0) {
      toast({ title: 'Valor inválido', description: 'Por favor, insira um valor de abertura válido.', variant: 'destructive' });
      return;
    }
    openRegister(balance);
    toast({ title: 'Caixa Aberto!', description: `Caixa aberto com um saldo inicial de ${formatBRL(balance)}.` });
    setOpeningBalance('');
    setOpeningDialogOpen(false);
  };

  const handleCloseRegister = () => {
    closeRegister();
    toast({ title: 'Caixa Fechado!', description: 'O caixa foi fechado com sucesso.' });
    setClosingDialogOpen(false);
  };

  return (
    <AppShell>
      <div className="p-4 sm:px-6 sm:py-4 space-y-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Controle de Caixa</CardTitle>
              <CardDescription>
                {!isMounted ? (
                  <Skeleton className="h-4 w-72" />
                ) : state.isOpen ? (
                  'Caixa aberto. Acompanhe as movimentações.' 
                ) : (
                  'Caixa fechado. Abra para iniciar as vendas.'
                )}
              </CardDescription>
            </div>
            {isMounted && (
              state.isOpen ? (
                <Button variant="destructive" onClick={() => setClosingDialogOpen(true)}>Fechar Caixa</Button>
              ) : (
                <Button onClick={() => setOpeningDialogOpen(true)}>Abrir Caixa</Button>
              )
            )}
          </CardHeader>
          {isMounted && state.isOpen && state.currentSession && (
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Saldo Inicial</CardDescription>
                    <CardTitle className="text-2xl">{formatBRL(state.currentSession.openingBalance)}</CardTitle>
                  </CardHeader>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Vendas no Período</CardDescription>
                    <CardTitle className="text-2xl">{formatBRL(totalSales)}</CardTitle>
                  </CardHeader>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Saldo Esperado</CardDescription>
                    <CardTitle className="text-2xl">{formatBRL(state.currentSession.openingBalance + totalSales)}</CardTitle>
                  </CardHeader>
                </Card>
              </div>
            </CardContent>
          )}
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Histórico de Caixas</CardTitle>
                <CardDescription>Consulte os fechamentos de caixa anteriores.</CardDescription>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-96">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Abertura</TableHead>
                            <TableHead>Fechamento</TableHead>
                            <TableHead>Saldo Inicial</TableHead>
                            <TableHead>Vendas</TableHead>
                            <TableHead>Saldo Final</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {history.length > 0 ? (
                            history.map(session => (
                                <TableRow key={session.id}>
                                    <TableCell>#{session.id}</TableCell>
                                    <TableCell>{new Date(session.openingTime).toLocaleString('pt-BR')}</TableCell>
                                    <TableCell>{session.closingTime ? new Date(session.closingTime).toLocaleString('pt-BR') : '-'}</TableCell>
                                    <TableCell>{formatBRL(session.openingBalance)}</TableCell>
                                    <TableCell>{formatBRL(session.totalSales)}</TableCell>
                                    <TableCell>{session.closingBalance ? formatBRL(session.closingBalance) : '-'}</TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">Nenhum histórico de caixa encontrado.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
                </ScrollArea>
            </CardContent>
        </Card>

        {/* Open Register Dialog */}
        <Dialog open={isOpeningDialogOpen} onOpenChange={setOpeningDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Abrir Caixa</DialogTitle>
              <DialogDescription>Insira o valor inicial (suprimento) para abrir o caixa.</DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Label htmlFor="openingBalance">Valor Inicial (R$)</Label>
              <Input
                id="openingBalance"
                type="text"
                inputMode="decimal"
                value={openingBalance}
                onChange={e => setOpeningBalance(formatCurrencyInput(e.target.value))}
                placeholder="0,00"
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpeningDialogOpen(false)}>Cancelar</Button>
              <Button onClick={handleOpenRegister}>Confirmar Abertura</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Close Register Dialog */}
        <Dialog open={isClosingDialogOpen} onOpenChange={setClosingDialogOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Fechar Caixa</DialogTitle>
              <DialogDescription>Confira o resumo antes de fechar o caixa. Esta ação não pode ser desfeita.</DialogDescription>
            </DialogHeader>
            {state.currentSession && (
              <div className="py-4 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Horário de Abertura:</span>
                  <span className="font-medium">{new Date(state.currentSession.openingTime).toLocaleString('pt-BR')}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center text-lg">
                  <span className="text-muted-foreground">Saldo Inicial:</span>
                  <span className="font-bold">{formatBRL(state.currentSession.openingBalance)}</span>
                </div>
                 <div className="flex justify-between items-center text-lg">
                  <span className="text-muted-foreground">Vendas no Período:</span>
                  <span className="font-bold">{formatBRL(totalSales)}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center text-xl text-primary">
                  <span className="font-semibold">Saldo Final Esperado:</span>
                  <span className="font-extrabold">{formatBRL(state.currentSession.openingBalance + totalSales)}</span>
                </div>
                <Separator />
                 <div>
                    <h4 className="font-medium mb-2">Resumo por Forma de Pagamento</h4>
                    <div className="space-y-1">
                        {Object.entries(paymentMethodTotals).map(([method, total]) => (
                            <div key={method} className="flex justify-between">
                                <span className="text-muted-foreground">{method}:</span>
                                <span>{formatBRL(total)}</span>
                            </div>
                        ))}
                    </div>
                 </div>

              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setClosingDialogOpen(false)}>Cancelar</Button>
              <Button variant="destructive" onClick={handleCloseRegister}>Confirmar Fechamento</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppShell>
  );
}
