
'use client';

import React, { createContext, useContext, useState, ReactNode, useMemo, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, writeBatch, query, orderBy, doc, updateDoc, getDoc, serverTimestamp, Timestamp, runTransaction } from 'firebase/firestore';
import { useUsers } from './UsersContext';

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
  sellerId: string;
  sellerName: string;
};

type OrderForSale = {
  customer: string;
  items: SaleItem[];
  total: number;
}

type SalesContextType = {
  sales: Sale[];
  addSale: (sale: Omit<Sale, 'id' | 'displayId' | 'date' | 'status'>) => Promise<Sale>;
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
  const { users, isMounted: usersMounted } = useUsers();

  useEffect(() => {
    if (usersMounted) {
      const fetchSales = async () => {
          try {
              const salesCollection = collection(db, "sales");
              const q = query(salesCollection, orderBy("date", "desc"));
              const snapshot = await getDocs(q);
              const salesList = snapshot.docs.map(d => {
                  const saleData = d.data() as Sale;
                  const seller = users.find(u => u.id === saleData.sellerId);
                  return {
                      ...saleData,
                      id: d.id,
                      sellerName: seller?.name || 'N/A'
                  };
              });
              setSales(salesList);
              setIsMounted(true);
          } catch (error) {
              console.error("Error fetching sales:", error);
          }
      }
      fetchSales();
    }
  }, [usersMounted, users]);

  const addSale = async (newSaleData: Omit<Sale, 'id' | 'displayId' | 'date' | 'status'>): Promise<Sale> => {
      const tempId = `TEMP_SALE_${Date.now()}`;
      const newDate = new Date().toISOString();
      const newDisplayId = '...'; // Placeholder
      
      const optimisticSale: Sale = {
          ...newSaleData,
          id: tempId,
          displayId: newDisplayId,
          date: newDate,
          status: newSaleData.paymentMethod === 'Fiado' ? 'Fiado' : "Finalizada",
      };

      setSales(prev => [optimisticSale, ...prev]);

      try {
        const newId = await runTransaction(db, async (transaction) => {
          const counterRef = doc(db, 'counters', 'salesCounter');
          const counterDoc = await transaction.get(counterRef);
          
          let nextId = 1;
          if (counterDoc.exists()) {
            nextId = counterDoc.data().count + 1;
          }
          
          const finalSaleData = {
            ...newSaleData,
            displayId: String(nextId),
            date: newDate,
            status: newSaleData.paymentMethod === 'Fiado' ? 'Fiado' : "Finalizada",
          };
          
          const newSaleRef = doc(collection(db, 'sales'));
          transaction.set(newSaleRef, finalSaleData);
          
          if (counterDoc.exists()) {
            transaction.update(counterRef, { count: nextId });
          } else {
            transaction.set(counterRef, { count: nextId });
          }
          
          return { firestoreId: newSaleRef.id, displayId: String(nextId) };
        });
        
        const finalSale: Sale = {
          ...newSaleData,
          id: newId.firestoreId,
          displayId: newId.displayId,
          date: newDate,
           status: newSaleData.paymentMethod === 'Fiado' ? 'Fiado' : "Finalizada",
        };
        
        setSales(prev => prev.map(s => s.id === tempId ? finalSale : s));
        return finalSale;

      } catch (error) {
         console.error("Error adding sale transactionally:", error);
         setSales(prev => prev.filter(s => s.id !== tempId));
         throw error; // Re-throw the error to be caught by the caller
      }
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
        await stockActions.increaseStock(originalItems.map(item => ({ id: String(item.id), quantity: item.quantity })));
        
        if(updatedData.items) {
          await stockActions.decreaseStock(updatedData.items.map(item => ({ id: String(item.id), quantity: item.quantity })));
        }

        const saleRef = doc(db, 'sales', saleId);
        await updateDoc(saleRef, updatedData);

        setSales(prevSales => prevSales.map(s => s.id === saleId ? { ...s, ...updatedData } : s));

      } catch (error) {
          console.error("Error updating sale: ", error);
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
        // Also reset the counter
        batch.delete(doc(db, "counters", "salesCounter"));
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
