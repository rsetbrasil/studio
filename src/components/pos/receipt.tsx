
'use client';

import React from 'react';
import { formatBRL } from '@/lib/utils';
import type { Sale, SaleItem } from '@/context/SalesContext';
import type { User } from '@/context/UsersContext';
import { useCompany } from '@/context/CompanyContext';

type ReceiptProps = {
  sale: Sale & { change: number, totalPaid: number };
  user: User | null;
};

const ReceiptItem = ({ item }: { item: SaleItem }) => (
  <>
    <tr className="text-left">
      <td className="py-0.5">{String(item.id).padStart(5, '0')}</td>
      <td className="py-0.5">
        <div>{item.name}</div>
        <div className="text-xs">{item.quantity} x {formatBRL(item.price)}</div>
      </td>
      <td className="py-0.5 text-right">{formatBRL(item.price * item.quantity)}</td>
    </tr>
    <tr>
        <td colSpan={3} className="border-b border-dashed border-black py-0.5"></td>
    </tr>
  </>
);

export const Receipt = React.forwardRef<HTMLDivElement, ReceiptProps>(
  ({ sale, user }, ref) => {
    const { companyInfo } = useCompany();

    return (
      <div ref={ref} className="p-1 bg-white text-black text-xs font-mono w-[300px] print-container relative">
        <div className="text-center mb-2">
            <h1 className="text-sm font-bold">{companyInfo.tradeName}</h1>
            <p className="whitespace-nowrap">{companyInfo.businessName}</p>
            <p className="whitespace-nowrap">{companyInfo.address}</p>
            <p className="whitespace-nowrap">{companyInfo.cityStateZip}</p>
            <p className="whitespace-nowrap">{companyInfo.phone}</p>
            <div className="flex justify-between mt-1 px-1">
              <span>CNPJ: {companyInfo.cnpj}</span>
              <span>IE: {companyInfo.ie}</span>
            </div>
        </div>
        
        <hr className="border-t border-dashed border-black" />

        <div className="my-1 px-1">
            <div className="flex justify-between">
                <span>{new Date(sale.date).toLocaleDateString('pt-BR')} {new Date(sale.date).toLocaleTimeString('pt-BR')}</span>
                <span className="whitespace-nowrap">COMPROVANTE DE VENDA</span>
            </div>
            <div className="flex justify-between">
                <span>CLIENTE: {sale.customer}</span>
                <span className="font-bold">Nº {sale.displayId.replace('SALE','')}</span>
            </div>
        </div>

        <hr className="border-t border-dashed border-black" />

        <table className="w-full mt-1">
          <thead>
            <tr className="text-left border-b border-dashed border-black">
              <th className="font-normal px-1">CODIGO</th>
              <th className="font-normal px-1">DESCRIÇÃO</th>
              <th className="font-normal text-right px-1">VALOR</th>
            </tr>
          </thead>
          <tbody>
            {sale.items.map((item, index) => (
              <ReceiptItem key={`${item.id}-${item.name}-${index}`} item={item} />
            ))}
          </tbody>
        </table>

        <hr className="border-t border-dashed border-black mt-1" />

        <div className="mt-1 space-y-0.5 px-1">
          <div className="flex justify-between">
            <span>Total da Nota R$</span>
            <span>{formatBRL(sale.amount)}</span>
          </div>
           {sale.status === 'Finalizada' && (
            <>
              <div className="flex justify-between">
                <span>Valor Recebido R$</span>
                <span>{formatBRL(sale.totalPaid)}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>Troco R$</span>
                <span>{formatBRL(sale.change)}</span>
              </div>
            </>
          )}
        </div>

        <div className="mt-1 px-1">
            <p>FORMA DE PGTO.: {sale.paymentMethod}</p>
        </div>
        
        <div className="mt-1 px-1">
          <p>VENDEDOR(A): {user?.name || 'Não identificado'}</p>
        </div>

        <div className="text-center mt-2 relative h-16">
          {sale.status === 'Finalizada' && (
              <div className="absolute inset-0 flex items-center justify-center">
                  <div 
                      className="border-2 border-gray-400 rounded-lg p-2 text-gray-400 font-bold text-5xl opacity-50 transform -rotate-12 select-none"
                      style={{ textShadow: '1px 1px 1px rgba(0,0,0,0.1)' }}
                  >
                      PAGO
                  </div>
              </div>
          )}
            <p className='absolute bottom-8 w-full'>Recebi a(s) mercadoria(s) acima descrita(s).</p>
            <div className="absolute bottom-6 w-full border-t border-dashed border-black w-4/5 mx-auto"></div>
        </div>

        <div className="text-center mt-4 font-bold">
            <p>* OBRIGADO E VOLTE SEMPRE *</p>
        </div>
      </div>
    );
  }
);

Receipt.displayName = 'Receipt';
