
'use client';

import React, { createContext, useContext, useState, ReactNode, useMemo, useEffect } from 'react';

export type SaleItem = {
  id: number;
  name: string;
  price: number;
  quantity: number;
  unit: string;
};

export type SaleStatus = "Finalizada" | "Pendente" | "Cancelada" | "Fiado";

export type Sale = {
  id: string;
  customer: string;
  items: SaleItem[];
  paymentMethod: string;
  date: string;
  status: SaleStatus;
  amount: number;
};

type SalesContextType = {
  sales: Sale[];
  addSale: (sale: Omit<Sale, 'id' | 'date' | 'status'>) => Sale;
  updateSaleStatus: (saleId: string, status: SaleStatus) => void;
  getSaleById: (saleId: string) => Sale | undefined;
  cancelSale: (saleId: string, increaseStock: (items: any[]) => void) => void;
  resetSales: () => void;
  totalSalesValue: number;
  salesLastMonthPercentage: number;
  isMounted: boolean;
};

const getInitialState = <T,>(key: string, defaultValue: T): T => {
    if (typeof window === 'undefined') {
        return defaultValue;
    }
    const storedValue = localStorage.getItem(key);
    if (!storedValue) {
        return defaultValue;
    }
    try {
        return JSON.parse(storedValue);
    } catch (error) {
        console.error(`Error parsing localStorage key "${key}":`, error);
        return defaultValue;
    }
};

const SalesContext = createContext<SalesContextType | undefined>(undefined);

export const SalesProvider = ({ children }: { children: ReactNode }) => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [saleCounter, setSaleCounter] = useState<number>(1);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    setSales(getInitialState('sales', []));
    setSaleCounter(getInitialState('saleCounter', 1));
  }, []);
  
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('sales', JSON.stringify(sales));
    }
  }, [sales, isMounted]);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('saleCounter', JSON.stringify(saleCounter));
    }
  }, [saleCounter, isMounted]);


  const addSale = (newSaleData: Omit<Sale, 'id' | 'date' | 'status'>): Sale => {
      const newId = `SALE${String(saleCounter).padStart(5, '0')}`;
      const newDate = new Date().toISOString();

      const sale: Sale = {
          ...newSaleData,
          id: newId,
          date: newDate,
          status: newSaleData.paymentMethod === 'Fiado' ? 'Fiado' : "Finalizada",
      };

      setSales(prevSales => [sale, ...prevSales]);
      setSaleCounter(prev => prev + 1);
      return sale;
  };
  
  const updateSaleStatus = (saleId: string, status: SaleStatus) => {
     setSales(currentSales =>
      currentSales.map(s =>
        s.id === saleId ? { ...s, status } : s
      )
    );
  };
  
  const getSaleById = (saleId: string): Sale | undefined => {
    return sales.find(s => s.id === saleId);
  }

  const cancelSale = (saleId: string, increaseStock: (items: any[]) => void) => {
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
    if (typeof window !== 'undefined') {
        localStorage.removeItem('sales');
        localStorage.removeItem('saleCounter');
    }
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
    <SalesContext.Provider value={{ sales, addSale, cancelSale, resetSales, totalSalesValue, salesLastMonthPercentage, isMounted, updateSaleStatus, getSaleById }}>
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

    
