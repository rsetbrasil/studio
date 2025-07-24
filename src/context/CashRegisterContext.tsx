
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
  resetHistory: () => void;
};

const CashRegisterContext = createContext<CashRegisterContextType | undefined>(undefined);

const getInitialState = (): CashRegisterState => {
    if (typeof window !== 'undefined') {
        const storedState = localStorage.getItem('cashRegisterState');
        if (storedState) {
            return JSON.parse(storedState);
        }
    }
    return { isOpen: false, currentSession: null };
};

const getInitialHistory = (): CashRegisterSession[] => {
    if (typeof window !== 'undefined') {
        const storedHistory = localStorage.getItem('cashRegisterHistory');
        if (storedHistory) {
            return JSON.parse(storedHistory);
        }
    }
    return [];
};

const getInitialCounter = (): number => {
    if (typeof window !== 'undefined') {
        const storedCounter = localStorage.getItem('cashRegisterCounter');
        if (storedCounter) {
            return JSON.parse(storedCounter);
        }
    }
    return 1;
};


export const CashRegisterProvider = ({ children }: { children: ReactNode }) => {
  const { sales } = useSales();
  const [state, setState] = useState<CashRegisterState>(getInitialState);
  const [history, setHistory] = useState<CashRegisterSession[]>(getInitialHistory);
  const [sessionCounter, setSessionCounter] = useState<number>(getInitialCounter);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // This ensures we only read from localStorage on the client-side after hydration.
    setState(getInitialState());
    setHistory(getInitialHistory());
    setSessionCounter(getInitialCounter());
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('cashRegisterState', JSON.stringify(state));
      localStorage.setItem('cashRegisterHistory', JSON.stringify(history));
      localStorage.setItem('cashRegisterCounter', JSON.stringify(sessionCounter));
    }
  }, [state, history, sessionCounter, isLoaded]);


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

    const openingTime = new Date(state.currentSession.openingTime);

    // Find the corresponding session in history if it exists
    const closedSession = history.find(h => h.openingTime === state.currentSession?.openingTime);
    
    // If the session is closed, filter sales until its closing time.
    if (closedSession?.closingTime) {
      const closingTime = new Date(closedSession.closingTime);
      return sales.filter(sale => {
        const saleDate = new Date(sale.date);
        return saleDate >= openingTime && saleDate <= closingTime;
      });
    }

    // If the session is still open, filter all sales since it was opened.
    return sales.filter(sale => new Date(sale.date) >= openingTime);
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
  
  const resetHistory = () => {
    setHistory([]);
    setSessionCounter(1);
    if(state.isOpen){
      setState({ isOpen: false, currentSession: null });
    }
     if (typeof window !== 'undefined') {
        localStorage.removeItem('cashRegisterState');
        localStorage.removeItem('cashRegisterHistory');
        localStorage.removeItem('cashRegisterCounter');
    }
  }

  return (
    <CashRegisterContext.Provider value={{ state, history, openRegister, closeRegister, getSalesForCurrentSession, resetHistory }}>
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
