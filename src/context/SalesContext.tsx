'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

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
  resetSales: () => void;
};

const initialSales: Sale[] = [
  { 
    id: "SALE001", 
    customer: "João Silva", 
    items: [{ id: 1, name: "Coca-Cola 2L", price: 7.00, quantity: 1 }], 
    paymentMethod: "Dinheiro",
    date: "2024-07-28", 
    status: "Finalizada", 
    amount: 7.00 
  },
  { 
    id: "SALE002", 
    customer: "Maria Oliveira", 
    items: [{ id: 3, name: "Skol 350ml Lata", price: 3.50, quantity: 1 }],
    paymentMethod: "Débito",
    date: "2024-07-28", 
    status: "Finalizada", 
    amount: 3.50 
  },
];

const SalesContext = createContext<SalesContextType | undefined>(undefined);

export const SalesProvider = ({ children }: { children: ReactNode }) => {
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

  const resetSales = () => {
    setSales([]);
    setSaleCounter(1);
  };

  return (
    <SalesContext.Provider value={{ sales, addSale, resetSales }}>
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
