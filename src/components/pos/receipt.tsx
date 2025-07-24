
'use client';

import React from 'react';
import { formatBRL } from '@/lib/utils';
import type { Sale, SaleItem } from '@/context/SalesContext';

type ReceiptProps = {
  sale: Sale & { change: number, totalPaid: number };
};

const ReceiptItem = ({ item }: { item: SaleItem }) => (
  <tr className="text-left">
    <td className="py-0.5">{String(item.id).padStart(5, '0')}</td>
    <td className="py-0.5">
      <div>{item.name}</div>
      <div className="text-xs">{item.quantity} x {formatBRL(item.price)}</div>
    </td>
    <td className="py-0.5 text-right">{formatBRL(item.price * item.quantity)}</td>
  </tr>
);

export const Receipt = React.forwardRef<HTMLDivElement, ReceiptProps>(
  ({ sale }, ref) => {
    const subtotal = sale.items.reduce((acc, item) => acc + item.price * item.quantity, 0);

    return (
      <div ref={ref} className="p-2 bg-white text-black text-xs font-mono w-[300px] print-container">
        <div className="text-center mb-2">
            <h1 className="text-sm font-bold">NOME DE FANTASIA</h1>
            <p>NOME DA RAZÃO SOCIAL COM. DE INFORMÁTICA LTDA-ME</p>
            <p>Rua dos Equipamentos, 9 - Sobreloja 101 e 102</p>
            <p>Centro - 20000-000 - Rio de Janeiro/RJ</p>
            <p>(21) 1111-2222 / 3344-5566</p>
            <div className="flex justify-between mt-1">
              <span>CNPJ: 11.111.111/0001-11</span>
              <span>IE: 11.222.333</span>
            </div>
        </div>
        
        <hr className="border-t border-dashed border-black" />

        <div className="my-1">
            <div className="flex justify-between">
                <span>{new Date(sale.date).toLocaleDateString('pt-BR')} {new Date(sale.date).toLocaleTimeString('pt-BR')}</span>
                <span>COMPROVANTE DE VENDA</span>
            </div>
            <div className="flex justify-between">
                <span>CLIENTE: {sale.customer}</span>
                <span className="font-bold">Nº {sale.id.replace('SALE','')}</span>
            </div>
        </div>

        <hr className="border-t border-dashed border-black" />

        <table className="w-full mt-1">
          <thead>
            <tr className="text-left border-b border-dashed border-black">
              <th className="font-normal">CODIGO</th>
              <th className="font-normal">DESCRIÇÃO</th>
              <th className="font-normal text-right">VALOR</th>
            </tr>
          </thead>
          <tbody>
            {sale.items.map((item) => (
              <ReceiptItem key={`${item.id}-${item.name}`} item={item} />
            ))}
          </tbody>
        </table>

        <hr className="border-t border-dashed border-black mt-1" />

        <div className="mt-1 space-y-0.5">
          <div className="flex justify-between">
            <span>Total da Nota R$</span>
            <span>{formatBRL(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span>Valor Recebido R$</span>
            <span>{formatBRL(sale.totalPaid)}</span>
          </div>
          <div className="flex justify-between font-bold">
            <span>Troco R$</span>
            <span>{formatBRL(sale.change)}</span>
          </div>
        </div>

        <div className="mt-1">
            <p>FORMA DE PGTO.: {sale.paymentMethod}</p>
        </div>
        
        <div className="mt-1">
          <p>VENDEDOR(A): VENDEDOR 1</p>
        </div>

        <div className="text-center mt-2">
            <p>Recebi a(s) mercadoria(s) acima descrita(s).</p>
            <div className="border-t border-dashed border-black w-4/5 mx-auto mt-6 mb-1"></div>
            <p>ASSINATURA DO CLIENTE</p>
        </div>

        <div className="text-center mt-4 font-bold">
            <p>* OBRIGADO E VOLTE SEMPRE *</p>
        </div>
      </div>
    );
  }
);

Receipt.displayName = 'Receipt';

    