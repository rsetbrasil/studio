'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

type Sale = {
  id: string;
  customer: string;
  product: string;
  date: string;
  status: "Finalizada" | "Pendente" | "Cancelada";
  amount: number;
};

type SalesContextType = {
  sales: Sale[];
  addSale: (sale: Omit<Sale, 'id' | 'date' | 'status'>) => void;
};

const initialSales: Sale[] = [
  { id: "SALE001", customer: "João Silva", product: "Coca-Cola 2L", date: "2024-07-28", status: "Finalizada", amount: 7.00 },
  { id: "SALE002", customer: "Maria Oliveira", product: "Skol 350ml Lata", date: "2024-07-28", status: "Finalizada", amount: 3.50 },
  { id: "SALE003", customer: "Carlos Pereira", product: "Heineken 330ml", date: "2024-07-27", status: "Finalizada", amount: 5.50 },
  { id: "SALE004", customer: "Ana Costa", product: "Red Bull", date: "2024-07-27", status: "Finalizada", amount: 9.00 },
  { id: "SALE005", customer: "Pedro Martins", product: "Guaraná 2L", date: "2024-07-26", status: "Finalizada", amount: 6.50 },
];

const SalesContext = createContext<SalesContextType | undefined>(undefined);

export const SalesProvider = ({ children }: { children: ReactNode }) => {
  const [sales, setSales] = useState<Sale[]>(initialSales);
  const [saleCounter, setSaleCounter] = useState(sales.length + 1);

  const addSale = (newSaleData: Omit<Sale, 'id' | 'date' | 'status'>) => {
      const newId = `SALE${String(saleCounter).padStart(3, '0')}`;
      const newDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

      const sale: Sale = {
          ...newSaleData,
          id: newId,
          date: newDate,
          status: "Finalizada",
      };

      setSales(prevSales => [sale, ...prevSales]);
      setSaleCounter(prev => prev + 1);
  };

  return (
    <SalesContext.Provider value={{ sales, addSale }}>
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
