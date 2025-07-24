
'use client';

import React from 'react';
import { formatBRL } from '@/lib/utils';
import type { User } from '@/context/UsersContext';
import { useCompany } from '@/context/CompanyContext';
import { FiadoAccount } from '@/context/FiadoContext';

type PaymentReceiptProps = {
  account: FiadoAccount;
  payment: {
      amount: number;
      paymentMethod: string;
      date: string;
  };
  user: User;
};

export const PaymentReceipt = React.forwardRef<HTMLDivElement, PaymentReceiptProps>(
  ({ account, payment, user }, ref) => {
    const { companyInfo } = useCompany();
    
    const transactionTimeBalance = account.transactions
        .filter(tx => new Date(tx.date) > new Date(payment.date))
        .reduce((acc, tx) => acc - tx.amount, account.balance);
        
    const newBalance = transactionTimeBalance - payment.amount;

    return (
      <div ref={ref} className="p-1 bg-white text-black text-xs font-mono w-[300px] print-container relative">
        <div className="text-center mb-2">
            <h1 className="text-sm font-bold">{companyInfo.tradeName}</h1>
            <p>{companyInfo.businessName}</p>
            <p>{companyInfo.address}</p>
            <p>{companyInfo.cityStateZip}</p>
            <p>{companyInfo.phone}</p>
            <div className="flex justify-between mt-1 px-1">
              <span>CNPJ: {companyInfo.cnpj}</span>
              <span>IE: {companyInfo.ie}</span>
            </div>
        </div>
        
        <hr className="border-t border-dashed border-black" />

        <div className="my-1 px-1">
            <div className="flex justify-between">
                <span>{new Date(payment.date).toLocaleString('pt-BR')}</span>
                <span className="font-bold">COMPROVANTE DE PAGAMENTO</span>
            </div>
             <div className="flex justify-between">
                <span>CLIENTE: {account.customerName}</span>
            </div>
        </div>

        <hr className="border-t border-dashed border-black" />

        <div className="mt-2 space-y-1 px-1 text-sm">
          <div className="flex justify-between">
            <span>Saldo Anterior:</span>
            <span>{formatBRL(transactionTimeBalance)}</span>
          </div>
           <div className="flex justify-between font-bold">
            <span>Valor Pago:</span>
            <span className="text-base">{formatBRL(payment.amount)}</span>
          </div>
          <div className="flex justify-between">
            <span>Novo Saldo:</span>
            <span>{formatBRL(newBalance < 0 ? 0 : newBalance)}</span>
          </div>
        </div>
        
        <hr className="border-t border-dashed border-black mt-2" />

        <div className="mt-1 px-1">
            <p>FORMA DE PGTO.: {payment.paymentMethod}</p>
        </div>
        
        <div className="mt-1 px-1">
          <p>OPERADOR(A): {user?.name || 'Não identificado'}</p>
        </div>

        <div className="text-center mt-6">
            <div className="border-t border-black w-4/5 mx-auto"></div>
            <p className="mt-1">Assinatura do Cliente</p>
        </div>

        <div className="text-center mt-4 font-bold">
            <p>* OBRIGADO E VOLTE SEMPRE *</p>
        </div>
      </div>
    );
  }
);

PaymentReceipt.displayName = 'PaymentReceipt';
