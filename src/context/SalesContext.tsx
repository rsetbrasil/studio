

'use client';

import React, { createContext, useContext, useState, ReactNode, useMemo, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, writeBatch, query, orderBy, doc, updateDoc, getDoc } from 'firebase/firestore';

export type SaleItem = {
  id: number;
  name: string;
  price: number;
  quantity: number;
  unit: string;
  cost: number;
};

export type SaleStatus = "Finalizada" | "Pendente" | "Cancelada" | "Fiado";

export type Sale = {
  id: string; // Firestore ID
  displayId: string; // Sequential ID
  customer: string;
  items: SaleItem[];
  paymentMethod: string;
  date: string;
  status: SaleStatus;
  amount: number;
};

type OrderForSale = {
  customer: string;
  items: SaleItem[];
  total: number;
}

type SalesContextType = {
  sales: Sale[];
  addSale: (sale: Omit<Sale, 'id' | 'displayId' | 'date' | 'status'>) => Sale | null;
  updateSaleStatus: (saleId: string, status: SaleStatus) => void;
  getSaleById: (saleId: string) => Sale | undefined;
  cancelSale: (saleId: string, increaseStock: (items: any[]) => void) => void;
  resetSales: () => Promise<void>;
  totalSalesValue: number;
  salesLastMonthPercentage: number;
  isMounted: boolean;
};

const SalesContext = createContext<SalesContextType | undefined>(undefined);

export const SalesProvider = ({ children }: { children: ReactNode }) => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  const fetchSales = async () => {
      try {
          const salesCollection = collection(db, "sales");
          const q = query(salesCollection, orderBy("date", "desc"));
          const snapshot = await getDocs(q);
          setSales(snapshot.docs.map(d => ({ ...d.data(), id: d.id } as Sale)));
      } catch (error) {
          console.error("Error fetching sales:", error);
      }
  }

  useEffect(() => {
    setIsMounted(true);
    fetchSales();
  }, []);

  const addSale = (newSaleData: Omit<Sale, 'id' | 'displayId' | 'date' | 'status'>): Sale | null => {
      const newDate = new Date().toISOString();
      // This is not robust for multi-user env, but works for now.
      // A dedicated counter in Firestore would be better.
      const newDisplayId = `SALE${String(sales.length + 1).padStart(5, '0')}`;

      const sale: Omit<Sale, 'id'> = {
          ...newSaleData,
          displayId: newDisplayId,
          date: newDate,
          status: newSaleData.paymentMethod === 'Fiado' ? 'Fiado' : "Finalizada",
      };

      try {
        const docRef = addDoc(collection(db, 'sales'), sale);
        const newSaleWithId = { ...sale, id: docRef.id };
        setSales(prev => [newSaleWithId, ...prev]);
        return newSaleWithId;
      } catch (error) {
        console.error("Error adding sale:", error);
        return null;
      }
  };
  
  const updateSaleStatus = async (saleId: string, status: SaleStatus) => {
     try {
        const saleRef = doc(db, "sales", saleId);
        await updateDoc(saleRef, { status });
        setSales(currentSales =>
          currentSales.map(s =>
            s.id === saleId ? { ...s, status } : s
          )
        );
     } catch(e) {
         console.error("Error updating sale status:", e);
     }
  };
  
  const getSaleById = (saleId: string): Sale | undefined => {
    return sales.find(s => s.id === saleId);
  }

  const cancelSale = async (saleId: string, increaseStock: (items: any[]) => void) => {
    const saleToCancel = sales.find(s => s.id === saleId);
    if (!saleToCancel || saleToCancel.status !== 'Finalizada') return;

    try {
        const saleRef = doc(db, 'sales', saleId);
        await updateDoc(saleRef, { status: 'Cancelada' });
        increaseStock(saleToCancel.items);
        setSales(currentSales => 
            currentSales.map(s => 
                s.id === saleId ? { ...s, status: 'Cancelada' } : s
            )
        );
    } catch (error) {
        console.error("Error cancelling sale:", error);
    }
  };

  const resetSales = async () => {
    try {
        const batch = writeBatch(db);
        const snapshot = await getDocs(collection(db, "sales"));
        snapshot.forEach(doc => batch.delete(doc.ref));
        await batch.commit();
        setSales([]);
    } catch (error) {
        console.error("Error resetting sales:", error);
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
    <SalesContext.Provider value={{ sales, addSale: addSale as any, cancelSale, resetSales, totalSalesValue, salesLastMonthPercentage, isMounted, updateSaleStatus, getSaleById }}>
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
