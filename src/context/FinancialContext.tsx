
'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, writeBatch, query, orderBy, doc } from 'firebase/firestore';

export type Transaction = {
  id: string;
  date: string;
  description: string;
  type: "Receita" | "Despesa";
  status: "Pago" | "Pendente";
  amount: number;
};

type FinancialContextType = {
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  resetTransactions: () => void;
};

const FinancialContext = createContext<FinancialContextType | undefined>(undefined);

export const FinancialProvider = ({ children }: { children: ReactNode }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const fetchTransactions = async () => {
      try {
          const transCollection = collection(db, "transactions");
          const q = query(transCollection, orderBy("date", "desc"));
          const snapshot = await getDocs(q);
          setTransactions(snapshot.docs.map(d => ({ ...d.data(), id: d.id } as Transaction)));
      } catch (error) {
          console.error("Error fetching transactions:", error);
      }
  }

  useEffect(() => {
    fetchTransactions();
  }, []);
  
  const addTransaction = async (transactionData: Omit<Transaction, 'id'>) => {
    try {
        const docRef = await addDoc(collection(db, "transactions"), transactionData);
        const newTransaction = { ...transactionData, id: docRef.id };
        setTransactions(prev => [newTransaction, ...prev].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    } catch (error) {
        console.error("Error adding transaction:", error);
    }
  };
  
  const resetTransactions = async () => {
    try {
        const batch = writeBatch(db);
        const snapshot = await getDocs(collection(db, "transactions"));
        snapshot.forEach(doc => batch.delete(doc.ref));
        await batch.commit();
        setTransactions([]);
    } catch (error) {
        console.error("Error resetting transactions:", error);
    }
  };

  return (
    <FinancialContext.Provider value={{ transactions, addTransaction, resetTransactions }}>
      {children}
    </FinancialContext.Provider>
  );
};

export const useFinancial = () => {
  const context = useContext(FinancialContext);
  if (context === undefined) {
    throw new Error('useFinancial must be used within a FinancialProvider');
  }
  return context;
};
