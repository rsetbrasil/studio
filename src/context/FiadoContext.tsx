

'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { useSales, Sale, SaleItem } from './SalesContext';
import { db } from '@/lib/firebase';
import { collection, doc, getDocs, writeBatch, query, getDoc, runTransaction, updateDoc } from 'firebase/firestore';

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
  addFiadoSale: (sale: Omit<Sale, 'id' | 'date' | 'status' | 'displayId'>) => Promise<void>;
  addPayment: (customerName: string, amount: number, paymentMethod: string) => FiadoTransaction | null;
  isMounted: boolean;
};

const FiadoContext = createContext<FiadoContextType | undefined>(undefined);

export const FiadoProvider = ({ children }: { children: ReactNode }) => {
  const [accounts, setAccounts] = useState<FiadoAccount[]>([]);
  const { addSale: addSaleToHistory } = useSales();
  const [isMounted, setIsMounted] = useState(false);
  
  const fetchAccounts = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    fetchAccounts();
    setIsMounted(true);
  }, [fetchAccounts]);
  
  const addFiadoSale = async (saleData: Omit<Sale, 'id' | 'date' | 'status' | 'displayId'>) => {
    try {
        const finalSale = await addSaleToHistory(saleData);
        if (!finalSale) return;

        const accountRef = doc(db, "fiadoAccounts", finalSale.customer);
        
        await runTransaction(db, async (transaction) => {
            const accountDoc = await transaction.get(accountRef);

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
                transaction.update(accountRef, {
                    balance: currentData.balance + finalSale.amount,
                    transactions: updatedTransactions,
                });
            } else {
                const newAccount: FiadoAccount = {
                    customerName: finalSale.customer,
                    balance: finalSale.amount,
                    transactions: [newTransaction],
                };
                transaction.set(accountRef, newAccount);
            }
        });
        
        await fetchAccounts(); // Refetch to update local state
    } catch (error) {
        console.error("Error adding fiado sale:", error);
    }
  };

  const addPayment = async (customerName: string, amount: number, paymentMethod: string): Promise<FiadoTransaction | null> => {
    const accountRef = doc(db, "fiadoAccounts", customerName);
    
    try {
        let newPayment: FiadoTransaction | null = null;
        
        await runTransaction(db, async (transaction) => {
            const accountDoc = await transaction.get(accountRef);
            if (!accountDoc.exists()) {
                throw "Account not found!";
            }

            const currentData = accountDoc.data() as FiadoAccount;
            const actualAmount = Math.min(amount, currentData.balance);
            const newBalance = currentData.balance - actualAmount;
            
            newPayment = {
                id: `PAY-${Date.now()}`,
                date: new Date().toISOString(),
                type: 'payment',
                amount: -actualAmount,
                paymentMethod: paymentMethod,
            };
            
            const updatedTransactions = [newPayment, ...currentData.transactions];
            transaction.update(accountRef, {
                balance: newBalance,
                transactions: updatedTransactions,
            });
        });

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
