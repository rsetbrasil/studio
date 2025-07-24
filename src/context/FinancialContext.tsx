
'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

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

const initialTransactions: Transaction[] = [];

const FinancialContext = createContext<FinancialContextType | undefined>(undefined);

export const FinancialProvider = ({ children }: { children: ReactNode }) => {
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [transactionCounter, setTransactionCounter] = useState(initialTransactions.length + 1);

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
