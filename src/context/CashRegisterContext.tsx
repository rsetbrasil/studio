
'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { useSales, Sale } from './SalesContext';

export type CashAdjustment = {
  id: string;
  time: string;
  type: 'suprimento' | 'sangria';
  amount: number;
  reason?: string;
};

export type CashRegisterSession = {
  id: number;
  openingTime: string;
  closingTime: string | null;
  openingBalance: number;
  closingBalance: number | null;
  totalSales: number;
  sales: Sale[];
  adjustments: CashAdjustment[];
};

type CashRegisterState = {
  isOpen: boolean;
  currentSession: {
    openingTime: string;
    openingBalance: number;
    adjustments: CashAdjustment[];
  } | null;
};

type CashRegisterContextType = {
  state: CashRegisterState;
  history: CashRegisterSession[];
  openRegister: (openingBalance: number) => void;
  closeRegister: () => void;
  addAdjustment: (adjustment: Omit<CashAdjustment, 'id' | 'time'>) => void;
  getSalesForCurrentSession: () => Sale[];
  resetHistory: () => void;
  isMounted: boolean;
};

const CashRegisterContext = createContext<CashRegisterContextType | undefined>(undefined);

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

const defaultState: CashRegisterState = { isOpen: false, currentSession: null };

export const CashRegisterProvider = ({ children }: { children: ReactNode }) => {
  const { sales } = useSales();
  const [state, setState] = useState<CashRegisterState>(defaultState);
  const [history, setHistory] = useState<CashRegisterSession[]>([]);
  const [sessionCounter, setSessionCounter] = useState<number>(1);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    setState(getInitialState('cashRegisterState', defaultState));
    setHistory(getInitialState('cashRegisterHistory', []));
    setSessionCounter(getInitialState('cashRegisterCounter', 1));
  }, []);

  useEffect(() => {
      if(isMounted) {
        localStorage.setItem('cashRegisterState', JSON.stringify(state));
      }
  }, [state, isMounted]);

  useEffect(() => {
      if(isMounted) {
        localStorage.setItem('cashRegisterHistory', JSON.stringify(history));
      }
  }, [history, isMounted]);

  useEffect(() => {
      if(isMounted) {
        localStorage.setItem('cashRegisterCounter', JSON.stringify(sessionCounter));
      }
  }, [sessionCounter, isMounted]);


  const openRegister = (openingBalance: number) => {
    if (state.isOpen) return;

    setState({
      isOpen: true,
      currentSession: {
        openingBalance,
        openingTime: new Date().toISOString(),
        adjustments: [],
      },
    });
  };
  
  const getSalesForCurrentSession = useCallback(() => {
    if (!isMounted || !state.currentSession) return [];

    const openingTime = new Date(state.currentSession.openingTime);

    const closedSession = history.find(h => h.openingTime === state.currentSession?.openingTime);
    
    if (closedSession?.closingTime) {
      const closingTime = new Date(closedSession.closingTime);
      return sales.filter(sale => {
        const saleDate = new Date(sale.date);
        return saleDate >= openingTime && saleDate <= closingTime;
      });
    }

    return sales.filter(sale => new Date(sale.date) >= openingTime);
  }, [isMounted, state.currentSession, history, sales]);

  const closeRegister = () => {
    if (!state.isOpen || !state.currentSession) return;
    
    const sessionSales = getSalesForCurrentSession();
    const totalSales = sessionSales.reduce((acc, sale) => acc + sale.amount, 0);
    const totalSuprimento = state.currentSession.adjustments
      .filter(a => a.type === 'suprimento')
      .reduce((acc, a) => acc + a.amount, 0);
    const totalSangria = state.currentSession.adjustments
      .filter(a => a.type === 'sangria')
      .reduce((acc, a) => acc + a.amount, 0);
    
    const closingBalance = state.currentSession.openingBalance + totalSales + totalSuprimento - totalSangria;

    const newSession: CashRegisterSession = {
      id: sessionCounter,
      openingTime: state.currentSession.openingTime,
      closingTime: new Date().toISOString(),
      openingBalance: state.currentSession.openingBalance,
      closingBalance: closingBalance,
      totalSales: totalSales,
      sales: sessionSales,
      adjustments: state.currentSession.adjustments,
    };

    setHistory(prev => [newSession, ...prev]);
    setState({ isOpen: false, currentSession: null });
    setSessionCounter(prev => prev + 1);
  };
  
  const addAdjustment = (adjustment: Omit<CashAdjustment, 'id' | 'time'>) => {
    if (!state.isOpen || !state.currentSession) return;

    const newAdjustment: CashAdjustment = {
      ...adjustment,
      id: `ADJ-${Date.now()}`,
      time: new Date().toISOString(),
    };

    setState(prevState => ({
      ...prevState,
      currentSession: prevState.currentSession ? {
        ...prevState.currentSession,
        adjustments: [...prevState.currentSession.adjustments, newAdjustment]
      } : null
    }));
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
    <CashRegisterContext.Provider value={{ state, history, openRegister, closeRegister, getSalesForCurrentSession, addAdjustment, resetHistory, isMounted }}>
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
