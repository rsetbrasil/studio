
'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useSales, Sale } from './SalesContext';

export type CashRegisterSession = {
  id: number;
  openingTime: string;
  closingTime: string | null;
  openingBalance: number;
  closingBalance: number | null;
  totalSales: number;
  sales: Sale[];
};

type CashRegisterState = {
  isOpen: boolean;
  currentSession: {
    openingTime: string;
    openingBalance: number;
  } | null;
};

type CashRegisterContextType = {
  state: CashRegisterState;
  history: CashRegisterSession[];
  openRegister: (openingBalance: number) => void;
  closeRegister: () => void;
  getSalesForCurrentSession: () => Sale[];
};

const CashRegisterContext = createContext<CashRegisterContextType | undefined>(undefined);

export const CashRegisterProvider = ({ children }: { children: ReactNode }) => {
  const { sales } = useSales();
  const [state, setState] = useState<CashRegisterState>({
    isOpen: false,
    currentSession: null,
  });
  const [history, setHistory] = useState<CashRegisterSession[]>([]);
  const [sessionCounter, setSessionCounter] = useState(1);

  const openRegister = (openingBalance: number) => {
    if (state.isOpen) return;

    setState({
      isOpen: true,
      currentSession: {
        openingBalance,
        openingTime: new Date().toISOString(),
      },
    });
  };
  
  const getSalesForCurrentSession = () => {
    if (!state.currentSession) return [];

    return sales.filter(sale => new Date(sale.date) >= new Date(state.currentSession!.openingTime));
  }

  const closeRegister = () => {
    if (!state.isOpen || !state.currentSession) return;
    
    const sessionSales = getSalesForCurrentSession();
    const totalSales = sessionSales.reduce((acc, sale) => acc + sale.amount, 0);
    const closingBalance = state.currentSession.openingBalance + totalSales;

    const newSession: CashRegisterSession = {
      id: sessionCounter,
      openingTime: state.currentSession.openingTime,
      closingTime: new Date().toISOString(),
      openingBalance: state.currentSession.openingBalance,
      closingBalance: closingBalance,
      totalSales: totalSales,
      sales: sessionSales,
    };

    setHistory(prev => [newSession, ...prev]);
    setState({ isOpen: false, currentSession: null });
    setSessionCounter(prev => prev + 1);
  };

  return (
    <CashRegisterContext.Provider value={{ state, history, openRegister, closeRegister, getSalesForCurrentSession }}>
      {children}
    </CashRegisterContext.Provider>
  );
};

export const useCashRegister = () => {
  const context = useContext(CashRegisterContext);
  if (context === undefined) {
    throw new Error('useCashRegister must be used within a CashRegisterProvider');
  }
  return context;
};
