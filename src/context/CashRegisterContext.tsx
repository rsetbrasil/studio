
'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { useSales, Sale } from './SalesContext';
import { db } from '@/lib/firebase';
import { doc, setDoc, getDoc, collection, addDoc, query, orderBy, getDocs, deleteDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

export type CashAdjustment = {
  id: string;
  time: string;
  type: 'suprimento' | 'sangria';
  amount: number;
  reason?: string;
};

export type CashRegisterSession = {
  id: string; // Firestore document ID
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
  openRegister: (openingBalance: number) => Promise<void>;
  closeRegister: () => Promise<void>;
  addAdjustment: (adjustment: Omit<CashAdjustment, 'id' | 'time'>) => Promise<void>;
  deleteSession: (sessionId: string) => Promise<void>;
  getSalesForCurrentSession: () => Sale[];
  resetHistory: () => Promise<void>;
  isMounted: boolean;
};

const CashRegisterContext = createContext<CashRegisterContextType | undefined>(undefined);

const defaultState: CashRegisterState = { isOpen: false, currentSession: null };

export const CashRegisterProvider = ({ children }: { children: ReactNode }) => {
  const { sales } = useSales();
  const [state, setState] = useState<CashRegisterState>(defaultState);
  const [history, setHistory] = useState<CashRegisterSession[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const { toast } = useToast();

  const fetchCurrentState = async () => {
    try {
      const stateDoc = await getDoc(doc(db, "cashRegister", "currentState"));
      if (stateDoc.exists()) {
        setState(stateDoc.data() as CashRegisterState);
      } else {
        // If no state exists, create it with default closed state
        await setDoc(doc(db, "cashRegister", "currentState"), defaultState);
        setState(defaultState);
      }
    } catch (error) {
      console.error("Error fetching cash register state:", error);
      toast({ title: "Erro ao buscar estado do caixa.", variant: "destructive" });
    }
  };
  
  const fetchHistory = async () => {
    try {
      const historyCollection = collection(db, "cashRegisterHistory");
      const q = query(historyCollection, orderBy("closingTime", "desc"));
      const historySnapshot = await getDocs(q);
      const historyList = historySnapshot.docs.map(d => ({ id: d.id, ...d.data() } as CashRegisterSession));
      setHistory(historyList);
    } catch (error) {
        console.error("Error fetching cash register history:", error);
    }
  }

  useEffect(() => {
    setIsMounted(true);
    fetchCurrentState();
    fetchHistory();
  }, []);
  
  const updateStateInFirestore = async (newState: CashRegisterState) => {
    try {
        await setDoc(doc(db, "cashRegister", "currentState"), newState, { merge: true });
        setState(newState);
    } catch(error) {
        console.error("Error updating state in Firestore:", error);
    }
  }

  const openRegister = async (openingBalance: number) => {
    if (state.isOpen) return;

    const newState: CashRegisterState = {
      isOpen: true,
      currentSession: {
        openingBalance,
        openingTime: new Date().toISOString(),
        adjustments: [],
      },
    };
    await updateStateInFirestore(newState);
  };
  
  const getSalesForCurrentSession = useCallback(() => {
    if (!isMounted || !state.currentSession) return [];

    const openingTime = new Date(state.currentSession.openingTime);

    return sales.filter(sale => sale.status !== 'Fiado' && new Date(sale.date) >= openingTime);

  }, [isMounted, state.currentSession, sales]);

  const closeRegister = async () => {
    if (!state.isOpen || !state.currentSession) return;
    
    const sessionSales = getSalesForCurrentSession();
    const totalSales = sessionSales.reduce((acc, sale) => acc + sale.amount, 0);
    const totalSuprimento = (state.currentSession.adjustments || [])
      .filter(a => a.type === 'suprimento')
      .reduce((acc, a) => acc + a.amount, 0);
    const totalSangria = (state.currentSession.adjustments || [])
      .filter(a => a.type === 'sangria')
      .reduce((acc, a) => acc + a.amount, 0);
    
    const closingBalance = state.currentSession.openingBalance + totalSales + totalSuprimento - totalSangria;

    const newSessionData: Omit<CashRegisterSession, 'id'> = {
      openingTime: state.currentSession.openingTime,
      closingTime: new Date().toISOString(),
      openingBalance: state.currentSession.openingBalance,
      closingBalance: closingBalance,
      totalSales: totalSales,
      sales: sessionSales,
      adjustments: state.currentSession.adjustments || [],
    };
    
    try {
        const docRef = await addDoc(collection(db, "cashRegisterHistory"), newSessionData);
        setHistory(prev => [{ id: docRef.id, ...newSessionData }, ...prev]);
        await updateStateInFirestore(defaultState); // Reset state to closed
    } catch (error) {
        console.error("Error closing register:", error);
        toast({ title: "Erro ao fechar o caixa", variant: "destructive" });
    }
  };
  
  const addAdjustment = async (adjustment: Omit<CashAdjustment, 'id' | 'time'>) => {
    if (!state.isOpen || !state.currentSession) return;

    const newAdjustment: CashAdjustment = {
      ...adjustment,
      id: `ADJ-${Date.now()}`,
      time: new Date().toISOString(),
    };

    const newState: CashRegisterState = {
        ...state,
        currentSession: {
            ...state.currentSession,
            adjustments: [...(state.currentSession.adjustments || []), newAdjustment]
        }
    };
    await updateStateInFirestore(newState);
  };
  
  const deleteSession = async (sessionId: string) => {
      try {
        await deleteDoc(doc(db, "cashRegisterHistory", sessionId));
        setHistory(prev => prev.filter(session => session.id !== sessionId));
        toast({ title: "Registro de caixa excluído." });
      } catch (error) {
        console.error("Error deleting session:", error);
        toast({ title: "Erro ao excluir registro.", variant: "destructive" });
      }
  };
  
  const resetHistory = async () => {
    try {
        // Delete all documents from history
        const historySnapshot = await getDocs(collection(db, "cashRegisterHistory"));
        for (const doc of historySnapshot.docs) {
            await deleteDoc(doc.ref);
        }
        setHistory([]);

        // Reset current state if open
        if(state.isOpen){
            await updateStateInFirestore(defaultState);
        }
        
        toast({ title: "Histórico de caixa zerado."});
    } catch (error) {
        console.error("Error resetting history:", error);
        toast({ title: "Erro ao zerar histórico.", variant: "destructive" });
    }
  }

  return (
    <CashRegisterContext.Provider value={{ state, history, openRegister, closeRegister, getSalesForCurrentSession, addAdjustment, deleteSession, resetHistory, isMounted }}>
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
