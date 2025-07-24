
'use client';

import React, { useState, useMemo } from 'react';
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
import { ArrowDownLeft, ArrowUpRight, DollarSign, MinusCircle, PlusCircle, Trash, TrendingUp } from 'lucide-react';
import { AdjustmentDialog } from '@/components/cash-register/adjustment-dialog';
import { DeleteSessionDialog } from '@/components/cash-register/delete-session-dialog';
import type { CashRegisterSession } from '@/context/CashRegisterContext';

export default function CashRegisterPage() {
  const { 
    state, 
    history, 
    openRegister, 
    closeRegister, 
    getSalesForCurrentSession, 
    isMounted,
    addAdjustment,
    deleteSession,
  } = useCashRegister();

  const [isOpeningDialogOpen, setOpeningDialogOpen] = useState(false);
  const [isClosingDialogOpen, setClosingDialogOpen] = useState(false);
  const [openingBalance, setOpeningBalance] = useState('');
  const [adjustmentType, setAdjustmentType] = useState<'suprimento' | 'sangria' | null>(null);
  const [sessionToDelete, setSessionToDelete] = useState<CashRegisterSession | null>(null);


  const { toast } = useToast();

  const salesForCurrentSession = getSalesForCurrentSession();
  const totalSales = useMemo(() => salesForCurrentSession.reduce((acc, sale) => acc + sale.amount, 0), [salesForCurrentSession]);
  
  const totalCost = useMemo(() => 
    salesForCurrentSession.reduce((acc, sale) => {
        const saleCost = sale.items.reduce((itemAcc, item) => itemAcc + (item.cost || 0) * item.quantity, 0);
        return acc + saleCost;
    }, 0),
  [salesForCurrentSession]);

  const grossProfit = useMemo(() => totalSales - totalCost, [totalSales, totalCost]);

  const totalSuprimento = useMemo(() => 
    (state.currentSession?.adjustments || [])
      .filter(a => a.type === 'suprimento')
      .reduce((acc, a) => acc + a.amount, 0),
  [state.currentSession]);

  const totalSangria = useMemo(() => 
    (state.currentSession?.adjustments || [])
      .filter(a => a.type === 'sangria')
      .reduce((acc, a) => acc + a.amount, 0),
  [state.currentSession]);

  const saldoEsperado = useMemo(() => 
    (state.currentSession?.openingBalance || 0) + totalSales + totalSuprimento - totalSangria,
    [state.currentSession, totalSales, totalSuprimento, totalSangria]
  );
  
  const paymentMethodTotals = useMemo(() => {
    if (!state.currentSession) return {};

    const totals: Record<string, number> = {};
    // Initialize with all possible payment methods to ensure they appear even if value is 0
    ['Dinheiro', 'PIX', 'Crédito', 'Débito'].forEach(method => totals[method] = 0);
    
    salesForCurrentSession.forEach(sale => {
      const methods = sale.paymentMethod.split(' e ');
      const amountPerMethod = sale.amount / methods.length;
      methods.forEach(method => {
        if (method in totals) {
          totals[method] = (totals[method] || 0) + amountPerMethod;
        }
      });
    });
    return totals;
  }, [salesForCurrentSession, state.currentSession]);

  const allMovements = useMemo(() => {
    if (!state.currentSession) return [];

    const salesMovements = salesForCurrentSession.map(sale => ({
      time: new Date(sale.date),
      type: 'Venda',
      description: `Venda #${sale.id.replace('SALE', '')} para ${sale.customer}`,
      amount: sale.amount
    }));

    const adjustmentMovements = (state.currentSession.adjustments || []).map(adj => ({
      time: new Date(adj.time),
      type: adj.type === 'suprimento' ? 'Suprimento' : 'Sangria',
      description: adj.reason || (adj.type === 'suprimento' ? 'Adição de valor' : 'Retirada de valor'),
      amount: adj.amount
    }));

    return [...salesMovements, ...adjustmentMovements].sort((a, b) => b.time.getTime() - a.time.getTime());

  }, [salesForCurrentSession, state.currentSession]);
  

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
  
  const handleAdjustment = (amount: number, reason: string) => {
    if (!adjustmentType) return;
    addAdjustment({ type: adjustmentType, amount, reason });
    toast({
      title: `${adjustmentType === 'suprimento' ? 'Suprimento' : 'Sangria'} realizado!`,
      description: `Valor de ${formatBRL(amount)} foi ${adjustmentType === 'suprimento' ? 'adicionado ao' : 'retirado do'} caixa.`
    });
    setAdjustmentType(null);
  };
  
  const handleConfirmDelete = () => {
    if (sessionToDelete) {
      deleteSession(sessionToDelete.id);
      toast({
        title: "Registro Excluído",
        description: `O registro do caixa #${sessionToDelete.id} foi excluído.`,
        variant: "destructive",
      });
      setSessionToDelete(null);
    }
  };


  return (
      <div className="p-4 sm:px-6 sm:py-4 space-y-6">
        <Card>
          <CardHeader className="flex flex-row items-start justify-between">
            <div>
              <CardTitle>Controle de Caixa</CardTitle>
              <CardDescription>
                {!isMounted ? (
                  <Skeleton className="h-4 w-72 mt-1" />
                ) : state.isOpen ? (
                  'Caixa aberto. Acompanhe as movimentações.' 
                ) : (
                  'Caixa fechado. Abra para iniciar as vendas.'
                )}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {isMounted && state.isOpen && (
                 <>
                  <Button variant="outline" size="sm" onClick={() => setAdjustmentType('sangria')}>
                    <MinusCircle className="mr-2 h-4 w-4" />
                    Sangria
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setAdjustmentType('suprimento')}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Suprimento
                  </Button>
                </>
              )}
               {isMounted && (
                state.isOpen ? (
                  <Button variant="destructive" onClick={() => setClosingDialogOpen(true)}>Fechar Caixa</Button>
                ) : (
                  <Button onClick={() => setOpeningDialogOpen(true)}>Abrir Caixa</Button>
                )
              )}
            </div>
          </CardHeader>
          {isMounted && state.isOpen && state.currentSession && (
            <CardContent>
              <div className="grid md:grid-cols-6 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Saldo Inicial</CardDescription>
                    <CardTitle className="text-2xl">{formatBRL(state.currentSession.openingBalance)}</CardTitle>
                  </CardHeader>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Vendas</CardDescription>
                    <CardTitle className="text-2xl text-green-600">{formatBRL(totalSales)}</CardTitle>
                  </CardHeader>
                </Card>
                 <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Lucro Bruto</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="text-2xl font-bold text-teal-600">{formatBRL(grossProfit)}</div>
                    <p className="text-xs text-muted-foreground">Lucro das vendas no período</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Suprimentos</CardDescription>
                    <CardTitle className="text-2xl text-blue-600">{formatBRL(totalSuprimento)}</CardTitle>
                  </CardHeader>
                </Card>
                 <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Sangrias</CardDescription>
                    <CardTitle className="text-2xl text-red-600">{formatBRL(totalSangria)}</CardTitle>
                  </CardHeader>
                </Card>
                <Card className="border-primary">
                  <CardHeader className="pb-2">
                    <CardDescription>Saldo Esperado</CardDescription>
                    <CardTitle className="text-2xl text-primary">{formatBRL(saldoEsperado)}</CardTitle>
                  </CardHeader>
                </Card>
              </div>
            </CardContent>
          )}
        </Card>

        {isMounted && state.isOpen && (
          <Card>
            <CardHeader>
                <CardTitle>Movimentações da Sessão</CardTitle>
                <CardDescription>Todas as movimentações desde a abertura do caixa.</CardDescription>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-96">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Horário</TableHead>
                            <TableHead>Tipo</TableHead>
                            <TableHead>Descrição</TableHead>
                            <TableHead className="text-right">Valor</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {allMovements.length > 0 ? (
                            allMovements.map((mov, index) => (
                                <TableRow key={index}>
                                    <TableCell>{mov.time.toLocaleTimeString('pt-BR')}</TableCell>
                                    <TableCell>
                                      <Badge variant={mov.type === 'Venda' ? 'default' : mov.type === 'Suprimento' ? 'secondary' : 'destructive'}>{mov.type}</Badge>
                                    </TableCell>
                                    <TableCell>{mov.description}</TableCell>
                                    <TableCell className={`text-right font-medium ${mov.type === 'Sangria' ? 'text-red-600' : 'text-green-600'}`}>
                                      {mov.type === 'Sangria' ? '-' : ''}{formatBRL(mov.amount)}
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center">Nenhuma movimentação ainda.</TableCell>
                            </TableRow>
                        )}
                         <TableRow className="bg-muted/50 hover:bg-muted/50">
                           <TableCell colSpan={3} className="font-bold">Abertura de Caixa</TableCell>
                           <TableCell className="text-right font-bold text-green-600">{formatBRL(state.currentSession?.openingBalance || 0)}</TableCell>
                         </TableRow>
                    </TableBody>
                </Table>
                </ScrollArea>
            </CardContent>
          </Card>
        )}

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
                            <TableHead>Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isMounted && history.length > 0 ? (
                            history.map(session => (
                                <TableRow key={session.id}>
                                    <TableCell>#{session.id}</TableCell>
                                    <TableCell>{new Date(session.openingTime).toLocaleString('pt-BR')}</TableCell>
                                    <TableCell>{session.closingTime ? new Date(session.closingTime).toLocaleString('pt-BR') : '-'}</TableCell>
                                    <TableCell>{formatBRL(session.openingBalance)}</TableCell>
                                    <TableCell>{formatBRL(session.totalSales)}</TableCell>
                                    <TableCell>{session.closingBalance ? formatBRL(session.closingBalance) : '-'}</TableCell>
                                    <TableCell>
                                        <Button
                                          variant="destructive"
                                          size="sm"
                                          onClick={() => setSessionToDelete(session)}
                                        >
                                          <Trash className="mr-2 h-4 w-4" />
                                          Excluir
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center">Nenhum histórico de caixa encontrado.</TableCell>
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
            {isMounted && state.currentSession && (
              <div className="py-4 space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Horário de Abertura:</span>
                  <span className="font-medium">{new Date(state.currentSession.openingTime).toLocaleString('pt-BR')}</span>
                </div>
                <Separator />
                <div className="grid grid-cols-2 gap-x-8 gap-y-2">
                   <div className="flex justify-between"><span>Saldo Inicial:</span> <span className="font-medium">{formatBRL(state.currentSession.openingBalance)}</span></div>
                   <div className="flex justify-between"><span>(+) Vendas:</span> <span className="font-medium text-green-600">{formatBRL(totalSales)}</span></div>
                   <div className="flex justify-between"><span>(+) Suprimentos:</span> <span className="font-medium text-blue-600">{formatBRL(totalSuprimento)}</span></div>
                   <div className="flex justify-between"><span>(-) Sangrias:</span> <span className="font-medium text-red-600">{formatBRL(totalSangria)}</span></div>
                </div>
                <Separator />
                 <div className="flex justify-between items-center text-lg">
                  <span className="font-semibold">Lucro Bruto (Vendas):</span>
                  <span className="font-bold text-teal-600">{formatBRL(grossProfit)}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center text-xl text-primary">
                  <span className="font-semibold">Saldo Final Esperado:</span>
                  <span className="font-extrabold">{formatBRL(saldoEsperado)}</span>
                </div>
                <Separator />
                 <div>
                    <h4 className="font-medium mb-2">Resumo por Forma de Pagamento</h4>
                    <div className="space-y-1 text-sm">
                        {Object.keys(paymentMethodTotals).length > 0 ? (
                          <>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Abertura de Caixa (Dinheiro):</span>
                                <span>{formatBRL(state.currentSession.openingBalance)}</span>
                            </div>
                            {Object.entries(paymentMethodTotals).map(([method, total]) => (
                              <div key={method} className="flex justify-between">
                                  <span className="text-muted-foreground">{method}:</span>
                                  <span>{formatBRL(total)}</span>
                              </div>
                            ))}
                          </>
                        ) : <p className="text-xs text-muted-foreground">Nenhuma venda registrada no período.</p>}
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
        
        {adjustmentType && (
          <AdjustmentDialog 
            type={adjustmentType}
            isOpen={!!adjustmentType}
            onClose={() => setAdjustmentType(null)}
            onConfirm={handleAdjustment}
          />
        )}
        
        {sessionToDelete && (
          <DeleteSessionDialog
            isOpen={!!sessionToDelete}
            onClose={() => setSessionToDelete(null)}
            onConfirm={handleConfirmDelete}
            session={sessionToDelete}
          />
        )}
      </div>
  );
}
