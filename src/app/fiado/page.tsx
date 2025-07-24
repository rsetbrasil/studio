
"use client";

import React, { useState, useMemo, useRef } from "react";
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
import { Search, UserPlus, DollarSign, Eye, Printer } from "lucide-react";
import { useFiado, type FiadoAccount } from "@/context/FiadoContext";
import { useCashRegister } from "@/context/CashRegisterContext";
import { formatBRL } from "@/lib/utils";
import { PaymentDialog } from "@/components/fiado/payment-dialog";
import { AccountStatementDialog } from "@/components/fiado/account-statement-dialog";
import { PaymentReceipt } from "@/components/fiado/payment-receipt";
import { useAuth } from "@/context/AuthContext";

type PaymentInfo = {
  amount: number;
  paymentMethod: string;
};

export default function FiadoPage() {
  const { accounts, addPayment } = useFiado();
  const { addAdjustment, state: cashRegisterState } = useCashRegister();
  const [searchTerm, setSearchTerm] = useState("");
  const [payingAccount, setPayingAccount] = useState<FiadoAccount | null>(null);
  const [viewingAccount, setViewingAccount] = useState<FiadoAccount | null>(null);
  const [lastPayment, setLastPayment] = useState<{ account: FiadoAccount, payment: PaymentInfo } | null>(null);
  const receiptRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  const filteredAccounts = useMemo(() => {
    return accounts.filter(
      (account) =>
        account.customerName.toLowerCase().includes(searchTerm.toLowerCase()) &&
        account.balance > 0
    );
  }, [accounts, searchTerm]);

  const handlePaymentConfirm = (customerName: string, amount: number, paymentMethod: string) => {
    addPayment(customerName, amount, paymentMethod);
    
    // Add payment to cash register as a "suprimento"
    if (cashRegisterState.isOpen) {
      addAdjustment({
        type: "suprimento",
        amount: amount,
        reason: `Recebimento Fiado: ${customerName}`,
      });
    }
    
    const account = accounts.find(a => a.customerName === customerName);
    if (account) {
        setLastPayment({ account, payment: { amount, paymentMethod } });
    }
    
    setPayingAccount(null);
  };
  
  const handlePrint = () => {
    window.print();
  };

  React.useEffect(() => {
    if (lastPayment && receiptRef.current) {
        handlePrint();
        setLastPayment(null);
    }
  }, [lastPayment]);

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
                  <TableHead>Cliente</TableHead>
                  <TableHead className="text-right">Saldo Devedor</TableHead>
                  <TableHead className="w-[200px] text-center">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAccounts.length > 0 ? (
                  filteredAccounts.map((account) => (
                    <TableRow key={account.customerName}>
                      <TableCell className="font-medium">
                        {account.customerName}
                      </TableCell>
                      <TableCell className="text-right font-bold text-destructive">
                        {formatBRL(account.balance)}
                      </TableCell>
                      <TableCell className="text-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setViewingAccount(account)}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          Extrato
                        </Button>
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
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="h-24 text-center">
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
      
      {viewingAccount && (
        <AccountStatementDialog
            isOpen={!!viewingAccount}
            onClose={() => setViewingAccount(null)}
            account={viewingAccount}
        />
      )}

      <div className="hidden print:block">
        {lastPayment && user && (
            <PaymentReceipt 
                ref={receiptRef}
                account={lastPayment.account}
                payment={lastPayment.payment}
                user={user}
            />
        )}
      </div>
    </>
  );
}
