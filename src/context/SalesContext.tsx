
'use client';

import React, { createContext, useContext, useState, ReactNode, useMemo } from 'react';
import { useProducts } from './ProductsContext';

type SaleItem = {
  id: number;
  name: string;
  price: number;
  quantity: number;
};

export type Sale = {
  id: string;
  customer: string;
  items: SaleItem[];
  paymentMethod: string;
  date: string;
  status: "Finalizada" | "Pendente" | "Cancelada";
  amount: number;
};

type SalesContextType = {
  sales: Sale[];
  addSale: (sale: Omit<Sale, 'id' | 'date' | 'status'>) => Sale;
  cancelSale: (saleId: string) => void;
  resetSales: () => void;
  totalSalesValue: number;
  salesLastMonthPercentage: number;
};

const initialSales: Sale[] = [];

const SalesContext = createContext<SalesContextType | undefined>(undefined);

export const SalesProvider = ({ children }: { children: ReactNode }) => {
  const { increaseStock } = useProducts();
  const [sales, setSales] = useState<Sale[]>(initialSales);
  const [saleCounter, setSaleCounter] = useState(sales.length + 1);

  const addSale = (newSaleData: Omit<Sale, 'id' | 'date' | 'status'>): Sale => {
      const newId = `SALE${String(saleCounter).padStart(3, '0')}`;
      const newDate = new Date().toISOString();

      const sale: Sale = {
          ...newSaleData,
          id: newId,
          date: newDate,
          status: "Finalizada",
      };

      setSales(prevSales => [sale, ...prevSales]);
      setSaleCounter(prev => prev + 1);
      return sale;
  };

  const cancelSale = (saleId: string) => {
    setSales(currentSales => {
        const saleToCancel = currentSales.find(s => s.id === saleId);
        if (saleToCancel && saleToCancel.status === 'Finalizada') {
            increaseStock(saleToCancel.items);
            return currentSales.map(s => 
                s.id === saleId ? { ...s, status: 'Cancelada' } : s
            );
        }
        return currentSales;
    });
  };

  const resetSales = () => {
    setSales([]);
    setSaleCounter(1);
  };

  const totalSalesValue = useMemo(() => sales.reduce((acc, sale) => sale.status === 'Finalizada' ? acc + sale.amount : acc, 0), [sales]);

  const salesLastMonthPercentage = useMemo(() => {
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
    const twoMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, 1);
    
    const lastMonthSales = sales.filter(s => new Date(s.date) >= lastMonth && new Date(s.date) <= lastMonthEnd).length;
    const twoMonthsAgoSales = sales.filter(s => new Date(s.date) >= twoMonthsAgo && new Date(s.date) < lastMonth).length;
    
    if (twoMonthsAgoSales === 0) {
      return lastMonthSales > 0 ? 100 : 0;
    }
    
    return ((lastMonthSales - twoMonthsAgoSales) / twoMonthsAgoSales) * 100;
  }, [sales]);


  return (
    <SalesContext.Provider value={{ sales, addSale, cancelSale, resetSales, totalSalesValue, salesLastMonthPercentage }}>
      {children}
    </SalesContext.Provider>
  );
};

export const useSales = () => {
  const context = useContext(SalesContext);
  if (context === undefined) {
    throw new Error('useSales must be used within a SalesProvider');
  }
  return context;
};
