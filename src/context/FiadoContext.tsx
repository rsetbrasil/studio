

'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useSales, Sale, SaleItem } from './SalesContext';
import { db } from '@/lib/firebase';
import { collection, doc, getDocs, writeBatch, query, getDoc } from 'firebase/firestore';

export type FiadoTransaction = {
  id: string; 
  date: string;
  type: 'sale' | 'payment';
  amount: number; 
  paymentMethod?: string;
  items?: SaleItem[];
  saleDisplayId?: string;
};

export type FiadoAccount = {
  customerName: string; // This will be the document ID
  balance: number;
  transactions: FiadoTransaction[];
};

type FiadoContextType = {
  accounts: FiadoAccount[];
  addFiadoSale: (sale: Omit<Sale, 'id' | 'date' | 'status'>) => void;
  addPayment: (customerName: string, amount: number, paymentMethod: string) => FiadoTransaction | null;
  isMounted: boolean;
};

const FiadoContext = createContext<FiadoContextType | undefined>(undefined);

export const FiadoProvider = ({ children }: { children: ReactNode }) => {
  const [accounts, setAccounts] = useState<FiadoAccount[]>([]);
  const { addSale: addSaleToHistory, updateSaleStatus } = useSales();
  const [isMounted, setIsMounted] = useState(false);

  const fetchAccounts = async () => {
      try {
          const accountsCollection = collection(db, "fiadoAccounts");
          const q = query(accountsCollection);
          const snapshot = await getDocs(q);
          const accountsList = snapshot.docs.map(d => ({
              customerName: d.id,
              ...d.data()
          } as FiadoAccount));
          setAccounts(accountsList);
      } catch (error) {
          console.error("Error fetching fiado accounts:", error);
      }
  };
  
  useEffect(() => {
    setIsMounted(true);
    fetchAccounts();
  }, []);
  
  const addFiadoSale = async (saleData: Omit<Sale, 'id' | 'date' | 'status'>) => {
    const sale = addSaleToHistory(saleData);
    if (!sale) return;

    const accountRef = doc(db, "fiadoAccounts", sale.customer);
    
    try {
        const batch = writeBatch(db);
        const accountDoc = await getDoc(accountRef);

        const newTransaction: FiadoTransaction = {
            id: sale.id,
            date: sale.date,
            type: 'sale',
            amount: sale.amount,
            items: sale.items,
            saleDisplayId: sale.displayId,
        };

        if (accountDoc.exists()) {
            const currentData = accountDoc.data() as FiadoAccount;
            const updatedTransactions = [newTransaction, ...currentData.transactions];
            batch.update(accountRef, {
                balance: currentData.balance + sale.amount,
                transactions: updatedTransactions,
            });
        } else {
            const newAccount: FiadoAccount = {
                customerName: sale.customer,
                balance: sale.amount,
                transactions: [newTransaction],
            };
            batch.set(accountRef, newAccount);
        }
        await batch.commit();
        await fetchAccounts(); // Refetch to update local state
    } catch (error) {
        console.error("Error adding fiado sale:", error);
    }
  };

  const addPayment = async (customerName: string, amount: number, paymentMethod: string): Promise<FiadoTransaction | null> => {
    const accountRef = doc(db, "fiadoAccounts", customerName);
    
    try {
        const batch = writeBatch(db);
        const accountDoc = await getDoc(accountRef);

        if (!accountDoc.exists()) return null;

        const currentData = accountDoc.data() as FiadoAccount;
        const actualAmount = Math.min(amount, currentData.balance);
        const newBalance = currentData.balance - actualAmount;
        
        const newPayment: FiadoTransaction = {
            id: `PAY-${Date.now()}`,
            date: new Date().toISOString(),
            type: 'payment',
            amount: -actualAmount,
            paymentMethod: paymentMethod,
        };
        
        const updatedTransactions = [newPayment, ...currentData.transactions];
        batch.update(accountRef, {
            balance: newBalance,
            transactions: updatedTransactions,
        });

        if (newBalance <= 0) {
            currentData.transactions.forEach(tx => {
                if (tx.type === 'sale') {
                    // This function needs to be async now or handle updates itself
                    // For now, we assume updateSaleStatus can trigger a Firestore update.
                    updateSaleStatus(tx.id, 'Finalizada');
                }
            });
        }

        await batch.commit();
        await fetchAccounts(); // Refetch to update local state
        return newPayment;
    } catch (error) {
        console.error("Error adding payment:", error);
        return null;
    }
  };

  return (
    <FiadoContext.Provider value={{ accounts, addFiadoSale, addPayment: addPayment as any, isMounted }}>
      {children}
    </FiadoContext.Provider>
  );
};

export const useFiado = () => {
  const context = useContext(FiadoContext);
  if (context === undefined) {
    throw new Error('useFiado must be used within a FiadoProvider');
  }
  return context;
};
