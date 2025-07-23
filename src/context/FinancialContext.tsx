
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

const initialTransactions: Transaction[] = [
  { id: 1, date: "2024-07-28", description: "Venda - Pedido SALE001", type: "Receita", status: "Pago", amount: 7.00 },
  { id: 2, date: "2024-07-28", description: "Venda - Pedido SALE002", type: "Receita", status: "Pago", amount: 3.50 },
  { id: 3, date: "2024-07-29", description: "Compra de estoque - Fornecedor A", type: "Despesa", status: "Pago", amount: 500.00 },
  { id: 4, date: "2024-07-30", description: "Pagamento de Aluguel", type: "Despesa", status: "Pendente", amount: 1200.00 },
  { id: 5, date: "2024-08-01", description: "Venda - Cliente B", type: "Receita", status: "Pendente", amount: 350.00 },
  { id: 6, date: "2024-08-02", description: "Pagamento de Salários", type: "Despesa", status: "Pago", amount: 2500.00 },
];

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
