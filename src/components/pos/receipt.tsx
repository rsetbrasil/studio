
'use client';

import React from 'react';
import { formatBRL } from '@/lib/utils';
import type { Sale } from '@/context/SalesContext';
import { PDVRsetLogo } from '../icons';

type ReceiptProps = {
  sale: Sale & { change: number };
};

export const Receipt = React.forwardRef<HTMLDivElement, ReceiptProps>(
  ({ sale }, ref) => {
    const subtotal = sale.items.reduce((acc, item) => acc + item.price * item.quantity, 0);

    return (
      <div ref={ref} className="p-4 bg-white text-black text-sm font-mono w-[300px] print-container">
        <div className="text-center mb-4">
            <PDVRsetLogo className="h-8 w-8 mx-auto text-black" />
            <h2 className="text-lg font-bold">PDVRset</h2>
            <p>CNPJ: 00.000.000/0001-00</p>
            <p>Rua Exemplo, 123, Cidade, Estado</p>
            <p>{new Date(sale.date).toLocaleString('pt-BR')}</p>
        </div>
        
        <div className="text-center border-t border-b border-dashed border-black py-1 my-2">
            <h3 className="font-bold">COMPROVANTE DE VENDA</h3>
        </div>

        <div>
            <p><strong>Cliente:</strong> {sale.customer}</p>
        </div>

        <div className="mt-2">
          <h3 className="font-bold mb-1">Itens:</h3>
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left">Qtd.</th>
                <th className="text-left">Produto</th>
                <th className="text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {sale.items.map((item) => (
                <tr key={item.id}>
                  <td>{item.quantity}</td>
                  <td>{item.name}</td>
                  <td className="text-right">{formatBRL(item.price * item.quantity)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="border-t border-dashed border-black mt-2 pt-2 space-y-1">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>{formatBRL(subtotal)}</span>
          </div>
           {sale.amount - subtotal > 0 && (
            <div className="flex justify-between">
              <span>Taxas:</span>
              <span>{formatBRL(sale.amount - subtotal)}</span>
            </div>
           )}
          <div className="flex justify-between font-bold text-base">
            <span>TOTAL:</span>
            <span>{formatBRL(sale.amount)}</span>
          </div>
        </div>

        <div className="border-t border-dashed border-black mt-2 pt-2 space-y-1">
          <div className="flex justify-between">
            <span>Forma de Pagamento:</span>
            <span>{sale.paymentMethod}</span>
          </div>
          {sale.change > 0 && (
            <div className="flex justify-between">
              <span>Troco:</span>
              <span>{formatBRL(sale.change)}</span>
            </div>
          )}
        </div>

        <div className="text-center mt-4">
            <p>Obrigado pela preferência!</p>
        </div>
      </div>
    );
  }
);

Receipt.displayName = 'Receipt';
