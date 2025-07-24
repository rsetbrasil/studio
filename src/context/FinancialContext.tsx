
'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export type Transaction = {
  id: number;
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

const FinancialContext = createContext<FinancialContextType | undefined>(undefined);

export const FinancialProvider = ({ children }: { children: ReactNode }) => {
  const [transactions, setTransactions] = useState<Transaction[]>(() => getInitialState('transactions', []));
  const [transactionCounter, setTransactionCounter] = useState(() => getInitialState('transactionCounter', 1));

  useEffect(() => {
      localStorage.setItem('transactions', JSON.stringify(transactions));
  }, [transactions]);
  
  useEffect(() => {
    localStorage.setItem('transactionCounter', JSON.stringify(transactionCounter));
  }, [transactionCounter]);

  const addTransaction = (transactionData: Omit<Transaction, 'id'>) => {
    const newTransaction: Transaction = {
      ...transactionData,
      id: transactionCounter,
    };
    setTransactions(prevTransactions => [newTransaction, ...prevTransactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    setTransactionCounter(prev => prev + 1);
  };
  
  const resetTransactions = () => {
    setTransactions([]);
    setTransactionCounter(1);
    if (typeof window !== 'undefined') {
        localStorage.removeItem('transactions');
        localStorage.removeItem('transactionCounter');
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
