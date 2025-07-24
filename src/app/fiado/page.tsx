
"use client";

import React, { useState, useMemo, useRef, Fragment } from "react";
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, DollarSign, Printer, ChevronDown, ChevronRight, ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import { useFiado, type FiadoAccount, type FiadoTransaction } from "@/context/FiadoContext";
import { useCashRegister } from "@/context/CashRegisterContext";
import { formatBRL } from "@/lib/utils";
import { PaymentDialog } from "@/components/fiado/payment-dialog";
import { PaymentReceipt } from "@/components/fiado/payment-receipt";
import { useAuth } from "@/context/AuthContext";
import { Badge } from "@/components/ui/badge";
import type { Sale } from "@/context/SalesContext";
import { useSales } from "@/context/SalesContext";
import { Receipt } from "@/components/pos/receipt";

export default function FiadoPage() {
  const { accounts, addPayment } = useFiado();
  const { addAdjustment, state: cashRegisterState } = useCashRegister();
  const { getSaleById } = useSales();
  const [searchTerm, setSearchTerm] = useState("");
  const [payingAccount, setPayingAccount] = useState<FiadoAccount | null>(null);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [paymentToPrint, setPaymentToPrint] = useState<{ account: FiadoAccount, transaction: FiadoTransaction } | null>(null);
  const [saleToPrint, setSaleToPrint] = useState<Sale | null>(null);

  const paymentReceiptRef = useRef<HTMLDivElement>(null);
  const saleReceiptRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  const filteredAccounts = useMemo(() => {
    return accounts.filter(
      (account) =>
        account.customerName.toLowerCase().includes(searchTerm.toLowerCase()) &&
        account.balance > 0
    );
  }, [accounts, searchTerm]);
    
  const toggleRow = (customerName: string) => {
    setExpandedRows(prev => {
        const newSet = new Set(prev);
        if (newSet.has(customerName)) {
            newSet.delete(customerName);
        } else {
            newSet.add(customerName);
        }
        return newSet;
    });
  };

  const handlePaymentConfirm = (customerName: string, amount: number, paymentMethod: string) => {
    const paymentTransaction = addPayment(customerName, amount, paymentMethod);
    
    if (cashRegisterState.isOpen && paymentTransaction) {
      addAdjustment({
        type: "suprimento",
        amount: amount,
        reason: `Recebimento Fiado: ${customerName}`,
      });
    }
    
    const account = accounts.find(a => a.customerName === customerName);
    if (account && paymentTransaction) {
        setPaymentToPrint({ account, transaction: paymentTransaction });
    }
    
    setPayingAccount(null);
  };
  
  const handlePrintPaymentReceipt = (account: FiadoAccount, transaction: FiadoTransaction) => {
    setSaleToPrint(null);
    setPaymentToPrint({ account, transaction });
  };

  const handlePrintSaleReceipt = (saleId: string) => {
    const sale = getSaleById(saleId);
    if (sale) {
      setPaymentToPrint(null);
      setSaleToPrint(sale);
    }
  };
  
  const handlePrint = () => {
    window.print();
  };

  React.useEffect(() => {
    if ((paymentToPrint && paymentReceiptRef.current) || (saleToPrint && saleReceiptRef.current)) {
        handlePrint();
        setPaymentToPrint(null);
        setSaleToPrint(null);
    }
  }, [paymentToPrint, saleToPrint]);

  return (
    <>
      <div className="p-4 sm:px-6 sm:py-4">
        <Card>
          <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex-1">
              <CardTitle>Controle de Fiado</CardTitle>
              <CardDescription>
                Gerencie as contas a receber dos seus clientes.
              </CardDescription>
            </div>
            <div className="flex w-full flex-col items-stretch gap-2 sm:w-auto sm:flex-row sm:items-center">
              <div className="relative flex-1 sm:flex-initial">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar cliente..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 sm:w-64"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]"></TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead className="text-right">Saldo Devedor</TableHead>
                  <TableHead className="w-[150px] text-center">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAccounts.length > 0 ? (
                  filteredAccounts.map((account) => (
                    <Fragment key={account.customerName}>
                        <TableRow>
                            <TableCell>
                                <Button variant="ghost" size="sm" onClick={() => toggleRow(account.customerName)}>
                                    {expandedRows.has(account.customerName) ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                </Button>
                            </TableCell>
                            <TableCell className="font-medium">
                                {account.customerName}
                            </TableCell>
                            <TableCell className="text-right font-bold text-destructive">
                                {formatBRL(account.balance)}
                            </TableCell>
                            <TableCell className="text-center">
                                <Button
                                size="sm"
                                onClick={() => setPayingAccount(account)}
                                disabled={!cashRegisterState.isOpen}
                                >
                                <DollarSign className="mr-2 h-4 w-4" />
                                Receber
                                </Button>
                            </TableCell>
                        </TableRow>
                        {expandedRows.has(account.customerName) && (
                             <TableRow>
                                <TableCell colSpan={4} className="p-0">
                                    <div className="p-4 bg-muted/50">
                                        <h4 className="font-bold mb-2">Extrato de {account.customerName}</h4>
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Data</TableHead>
                                                    <TableHead>Operação</TableHead>
                                                    <TableHead>Descrição</TableHead>
                                                    <TableHead className="text-right">Valor</TableHead>
                                                    <TableHead className="w-[100px] text-center">Ações</TableHead>
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
                                                    <TableCell className="text-center">
                                                        {tx.type === 'payment' ? (
                                                            <Button variant="ghost" size="icon" onClick={() => handlePrintPaymentReceipt(account, tx)}>
                                                                <Printer className="h-4 w-4" />
                                                            </Button>
                                                        ) : (
                                                            <Button variant="ghost" size="icon" onClick={() => handlePrintSaleReceipt(tx.id)}>
                                                                <Printer className="h-4 w-4" />
                                                            </Button>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </Fragment>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      Nenhum cliente com saldo devedor encontrado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            {!cashRegisterState.isOpen && (
              <p className="text-center text-sm text-destructive mt-4">
                Abra o caixa para registrar novos recebimentos de fiado.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {payingAccount && (
        <PaymentDialog
          isOpen={!!payingAccount}
          onClose={() => setPayingAccount(null)}
          onConfirm={handlePaymentConfirm}
          account={payingAccount}
        />
      )}
      
      <div className="hidden print:block">
        {paymentToPrint && user && (
            <PaymentReceipt 
                ref={paymentReceiptRef}
                account={paymentToPrint.account}
                payment={{ 
                    amount: Math.abs(paymentToPrint.transaction.amount), 
                    paymentMethod: paymentToPrint.transaction.paymentMethod || '',
                    date: paymentToPrint.transaction.date
                }}
                user={user}
            />
        )}
        {saleToPrint && user && (
            <Receipt
                ref={saleReceiptRef}
                sale={{ ...saleToPrint, change: 0, totalPaid: saleToPrint.amount }}
                user={user}
            />
        )}
      </div>
    </>
  );
}
