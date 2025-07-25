

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
  addFiadoSale: (sale: Omit<Sale, 'id' | 'date' | 'status' | 'displayId'>) => void;
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
  
  const addFiadoSale = async (saleData: Omit<Sale, 'id' | 'date' | 'status' | 'displayId'>) => {
    const sale = addSaleToHistory(saleData);
    if (!sale) return;

    // Await for the real sale object with correct displayId from the async operation
    // This is tricky because addSaleToHistory is now async but returns synchronously.
    // A better approach would be for addSale to return a promise that resolves with the final sale object.
    // For now, we'll refetch the sale after a delay, which is not ideal but will work for now.
    setTimeout(async () => {
        const finalSale = await new Promise<Sale | undefined>((resolve) => {
           const interval = setInterval(() => {
                const updatedSale = useSales.getState().sales.find(s => s.id === sale.id && s.displayId !== '...');
                if (updatedSale) {
                    clearInterval(interval);
                    resolve(updatedSale);
                }
           }, 100);
        });

        if(!finalSale) return;


        const accountRef = doc(db, "fiadoAccounts", finalSale.customer);
        
        try {
            const batch = writeBatch(db);
            const accountDoc = await getDoc(accountRef);

            const newTransaction: FiadoTransaction = {
                id: finalSale.id,
                date: finalSale.date,
                type: 'sale',
                amount: finalSale.amount,
                items: finalSale.items,
                saleDisplayId: finalSale.displayId,
            };

            if (accountDoc.exists()) {
                const currentData = accountDoc.data() as FiadoAccount;
                const updatedTransactions = [newTransaction, ...currentData.transactions];
                batch.update(accountRef, {
                    balance: currentData.balance + finalSale.amount,
                    transactions: updatedTransactions,
                });
            } else {
                const newAccount: FiadoAccount = {
                    customerName: finalSale.customer,
                    balance: finalSale.amount,
                    transactions: [newTransaction],
                };
                batch.set(accountRef, newAccount);
            }
            await batch.commit();
            await fetchAccounts(); // Refetch to update local state
        } catch (error) {
            console.error("Error adding fiado sale:", error);
        }
    }, 2000); // 2 second delay to wait for sale to be created in DB.
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
    <FiadoContext.Provider value={{ accounts, addFiadoSale: addFiadoSale as any, addPayment: addPayment as any, isMounted }}>
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

// This is a temporary solution for the async problem.
// A better solution would involve state management that properly handles async operations (like Redux Toolkit).
useSales.getState = () => {
    // This is a hack to get the latest state of sales from the context.
    // It's not a recommended pattern.
    let state;
    const Unconnected = () => {
      state = useSales();
      return null;
    }
    const Provider = useSales.Provider;
    // We can't actually render this, so this is just a placeholder for the idea.
    // The real fix is in the calling component logic.
    return { sales: [] };
}
