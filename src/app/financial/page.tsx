
"use client";

import React, { useState, useMemo } from "react";
import { addDays, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { DateRange } from "react-day-picker";
import { AppShell } from "@/components/app-shell";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatBRL, cn } from "@/lib/utils";
import { ArrowDownCircle, ArrowUpCircle, DollarSign, PlusCircle, Calendar as CalendarIcon } from "lucide-react";
import { useFinancial, type Transaction } from "@/context/FinancialContext";
import { TransactionDialog } from "@/components/financial/transaction-dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";


export default function FinancialPage() {
  const { transactions, addTransaction } = useFinancial();
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: addDays(new Date(), -30),
    to: new Date(),
  })

  const filteredTransactions = useMemo(() => {
    if (!date?.from) return [];
    return transactions.filter(t => {
      const transactionDate = new Date(t.date);
      // Adjust for timezone offset
      transactionDate.setMinutes(transactionDate.getMinutes() + transactionDate.getTimezoneOffset());
      const from = date.from ? new Date(date.from.setHours(0, 0, 0, 0)) : null;
      const to = date.to ? new Date(date.to.setHours(23, 59, 59, 999)) : from;
      if (!from) return true;
      return transactionDate >= from && transactionDate <= (to || from);
    });
  }, [transactions, date]);

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "Pago":
        return "default";
      case "Pendente":
        return "secondary";
      default:
        return "outline";
    }
  };

  const totalReceitasPagas = filteredTransactions.filter(t => t.type === 'Receita' && t.status === 'Pago').reduce((acc, t) => acc + t.amount, 0);
  const totalDespesasPagas = filteredTransactions.filter(t => t.type === 'Despesa' && t.status === 'Pago').reduce((acc, t) => acc + t.amount, 0);
  const fluxoDeCaixaLiquido = totalReceitasPagas - totalDespesasPagas;

  const handleConfirm = (transactionData: Omit<Transaction, "id">) => {
    addTransaction(transactionData);
    setDialogOpen(false);
  };

  return (
    <AppShell>
      <div className="p-4 sm:px-6 sm:py-4 space-y-6">

        <Card>
          <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Fluxo de Caixa</CardTitle>
              <CardDescription>Analise as entradas e saídas em um período específico.</CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Popover>
                  <PopoverTrigger asChild>
                  <Button
                      id="date"
                      variant={"outline"}
                      className={cn(
                      "w-full sm:w-[300px] justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                      )}
                  >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date?.from ? (
                      date.to ? (
                          <>
                          {format(date.from, "LLL dd, y", { locale: ptBR })} -{" "}
                          {format(date.to, "LLL dd, y", { locale: ptBR })}
                          </>
                      ) : (
                          format(date.from, "LLL dd, y", { locale: ptBR })
                      )
                      ) : (
                      <span>Escolha uma data</span>
                      )}
                  </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                      initialFocus
                      mode="range"
                      defaultMonth={date?.from}
                      selected={date}
                      onSelect={setDate}
                      numberOfMonths={2}
                      locale={ptBR}
                  />
                  </PopoverContent>
              </Popover>
               <Button onClick={() => setDialogOpen(true)}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Adicionar Transação
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total de Receitas (Pagas)</CardTitle>
                  <ArrowUpCircle className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatBRL(totalReceitasPagas)}</div>
                  <p className="text-xs text-muted-foreground">Entradas no período</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total de Despesas (Pagas)</CardTitle>
                  <ArrowDownCircle className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatBRL(totalDespesasPagas)}</div>
                  <p className="text-xs text-muted-foreground">Saídas no período</p>
                </CardContent>
              </Card>
              <Card className={fluxoDeCaixaLiquido >= 0 ? 'border-green-500' : 'border-red-500'}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Fluxo de Caixa Líquido</CardTitle>
                  <DollarSign className={`h-4 w-4 ${fluxoDeCaixaLiquido >= 0 ? 'text-green-500' : 'text-red-500'}`} />
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${fluxoDeCaixaLiquido >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatBRL(fluxoDeCaixaLiquido)}</div>
                  <p className="text-xs text-muted-foreground">Resultado do período selecionado</p>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Movimentações no Período</CardTitle>
            <CardDescription>
            Acompanhe as transações financeiras do período selecionado.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.length > 0 ? (
                  filteredTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>{new Date(transaction.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</TableCell>
                      <TableCell className="font-medium">{transaction.description}</TableCell>
                      <TableCell>
                        <span className={`flex items-center ${transaction.type === 'Receita' ? 'text-green-600' : 'text-red-600'}`}>
                          {transaction.type === 'Receita' ? <ArrowUpCircle className="mr-2 h-4 w-4" /> : <ArrowDownCircle className="mr-2 h-4 w-4" />}
                          {transaction.type}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(transaction.status) as any}>
                          {transaction.status}
                        </Badge>
                      </TableCell>
                      <TableCell className={`text-right font-medium ${transaction.type === 'Receita' ? 'text-green-600' : 'text-red-600'}`}>
                        {transaction.type === 'Despesa' && '- '}{formatBRL(transaction.amount)}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      Nenhuma transação registrada no período selecionado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
      <TransactionDialog
        isOpen={isDialogOpen}
        onClose={() => setDialogOpen(false)}
        onConfirm={handleConfirm}
      />
    </AppShell>
  );
}
