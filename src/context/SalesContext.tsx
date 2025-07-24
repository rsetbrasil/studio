

'use client';

import React, { createContext, useContext, useState, ReactNode, useMemo, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, writeBatch, query, orderBy, doc, updateDoc, getDoc, serverTimestamp, Timestamp } from 'firebase/firestore';

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
  addSale: (sale: Omit<Sale, 'id' | 'displayId' | 'date' | 'status'>) => Sale;
  updateSale: (
    saleId: string, 
    updatedData: Partial<Omit<Sale, 'id' | 'displayId' | 'date' | 'status'>>,
    originalItems: SaleItem[],
    stockActions: {
      increaseStock: (items: any[]) => Promise<void>;
      decreaseStock: (items: any[]) => Promise<void>;
    }
    ) => Promise<void>;
  updateSaleStatus: (saleId: string, status: SaleStatus) => void;
  getSaleById: (saleId: string) => Sale | undefined;
  cancelSale: (saleId: string, increaseStock: (items: any[]) => void) => void;
  resetSales: () => Promise<void>;
  totalSalesToday: number;
  salesYesterdayPercentage: number;
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

  const addSale = (newSaleData: Omit<Sale, 'id' | 'displayId' | 'date' | 'status'>): Sale => {
      const tempId = `TEMP_SALE_${Date.now()}`;
      const newDate = new Date().toISOString();
      const newDisplayId = `SALE${String(sales.length + 1).padStart(5, '0')}`;

      const sale: Sale = {
          ...newSaleData,
          id: tempId,
          displayId: newDisplayId,
          date: newDate,
          status: newSaleData.paymentMethod === 'Fiado' ? 'Fiado' : "Finalizada",
      };

      // Add to state immediately with a temporary ID
      setSales(prev => [sale, ...prev]);

      // Then, save to Firestore and update the ID
      addDoc(collection(db, 'sales'), {
        ...newSaleData,
        displayId: newDisplayId,
        date: newDate,
        status: newSaleData.paymentMethod === 'Fiado' ? 'Fiado' : "Finalizada",
      }).then(docRef => {
        setSales(prev => prev.map(s => s.id === tempId ? { ...s, id: docRef.id } : s));
      }).catch(error => {
        console.error("Error adding sale:", error);
        // Optionally remove the temp sale from state on error
        setSales(prev => prev.filter(s => s.id !== tempId));
      });
      
      return sale;
  };

  const updateSale = async (
    saleId: string, 
    updatedData: Partial<Omit<Sale, 'id' | 'displayId' | 'date' | 'status'>>,
    originalItems: SaleItem[],
    stockActions: {
      increaseStock: (items: any[]) => Promise<void>;
      decreaseStock: (items: any[]) => Promise<void>;
    }
  ) => {
      try {
        // Revert stock for original items
        await stockActions.increaseStock(originalItems.map(item => ({ id: String(item.id), quantity: item.quantity })));
        
        // Decrease stock for new/updated items
        if(updatedData.items) {
          await stockActions.decreaseStock(updatedData.items.map(item => ({ id: String(item.id), quantity: item.quantity })));
        }

        const saleRef = doc(db, 'sales', saleId);
        await updateDoc(saleRef, updatedData);

        setSales(prevSales => prevSales.map(s => s.id === saleId ? { ...s, ...updatedData } : s));

      } catch (error) {
          console.error("Error updating sale: ", error);
          // Optional: Add logic to revert stock changes on failure
      }
  }
  
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
  
  const { totalSalesToday, salesYesterdayPercentage } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    const todaySales = sales.filter(s => new Date(s.date) >= today && s.status === 'Finalizada');
    const yesterdaySales = sales.filter(s => {
        const saleDate = new Date(s.date);
        return saleDate >= yesterday && saleDate < today && s.status === 'Finalizada';
    });

    const totalToday = todaySales.reduce((acc, s) => acc + s.amount, 0);
    const totalYesterday = yesterdaySales.reduce((acc, s) => acc + s.amount, 0);

    let percentage = 0;
    if (totalYesterday > 0) {
        percentage = ((totalToday - totalYesterday) / totalYesterday) * 100;
    } else if (totalToday > 0) {
        percentage = 100;
    }
    
    return {
      totalSalesToday: totalToday,
      salesYesterdayPercentage: percentage,
    };
  }, [sales]);


  return (
    <SalesContext.Provider value={{ sales, addSale: addSale as any, updateSale, cancelSale, resetSales, totalSalesToday, salesYesterdayPercentage, isMounted, updateSaleStatus, getSaleById }}>
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
