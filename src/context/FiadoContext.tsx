
'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { useSales, Sale, SaleItem } from './SalesContext';

type FiadoTransaction = {
  id: string; // saleId or paymentId
  date: string;
  type: 'sale' | 'payment';
  amount: number; // positive for sale, negative for payment
  paymentMethod?: string;
  items?: SaleItem[];
};

export type FiadoAccount = {
  customerName: string;
  balance: number;
  transactions: FiadoTransaction[];
};

type FiadoContextType = {
  accounts: FiadoAccount[];
  addFiadoSale: (sale: Omit<Sale, 'id' | 'date' | 'status'>) => void;
  addPayment: (customerName: string, amount: number, paymentMethod: string) => void;
  isMounted: boolean;
};

const FiadoContext = createContext<FiadoContextType | undefined>(undefined);

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

export const FiadoProvider = ({ children }: { children: ReactNode }) => {
  const [accounts, setAccounts] = useState<FiadoAccount[]>([]);
  const { addSale: addSaleToHistory } = useSales();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    setAccounts(getInitialState('fiadoAccounts', []));
  }, []);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('fiadoAccounts', JSON.stringify(accounts));
    }
  }, [accounts, isMounted]);
  
  const addFiadoSale = (saleData: Omit<Sale, 'id' | 'date' | 'status'>) => {
    const sale = addSaleToHistory(saleData);

    setAccounts(prevAccounts => {
        const accountIndex = prevAccounts.findIndex(acc => acc.customerName === sale.customer);
        const newTransaction: FiadoTransaction = {
            id: sale.id,
            date: sale.date,
            type: 'sale',
            amount: sale.amount,
            items: sale.items,
        };

        if (accountIndex > -1) {
            const updatedAccounts = [...prevAccounts];
            const account = updatedAccounts[accountIndex];
            account.balance += sale.amount;
            account.transactions.unshift(newTransaction);
            return updatedAccounts;
        } else {
            const newAccount: FiadoAccount = {
                customerName: sale.customer,
                balance: sale.amount,
                transactions: [newTransaction],
            };
            return [...prevAccounts, newAccount];
        }
    });
  };

  const addPayment = (customerName: string, amount: number, paymentMethod: string) => {
    setAccounts(prevAccounts => {
        const accountIndex = prevAccounts.findIndex(acc => acc.customerName === customerName);
        if (accountIndex === -1) return prevAccounts;

        const updatedAccounts = [...prevAccounts];
        const account = updatedAccounts[accountIndex];
        
        const actualAmount = Math.min(amount, account.balance);
        account.balance -= actualAmount;

        const newPayment: FiadoTransaction = {
            id: `PAY-${Date.now()}`,
            date: new Date().toISOString(),
            type: 'payment',
            amount: -actualAmount,
            paymentMethod: paymentMethod,
        };
        account.transactions.unshift(newPayment);

        return updatedAccounts;
    });
  };

  return (
    <FiadoContext.Provider value={{ accounts, addFiadoSale, addPayment, isMounted }}>
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
