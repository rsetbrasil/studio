
'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export type CompanyInfo = {
  tradeName: string;
  businessName: string;
  address: string;
  cityStateZip: string;
  phone: string;
  cnpj: string;
  ie: string;
};

type CompanyContextType = {
  companyInfo: CompanyInfo;
  updateCompanyInfo: (info: CompanyInfo) => void;
  isMounted: boolean;
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

const initialCompanyInfo: CompanyInfo = {
  tradeName: "NOME DE FANTASIA",
  businessName: "NOME DA RAZÃO SOCIAL COM. DE INFORMÁTICA LTDA-ME",
  address: "Rua dos Equipamentos, 9 - Sobreloja 101 e 102",
  cityStateZip: "Centro - 20000-000 - Rio de Janeiro/RJ",
  phone: "(21) 1111-2222 / 3344-5566",
  cnpj: "11.111.111/0001-11",
  ie: "11.222.333",
};

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

export const CompanyProvider = ({ children }: { children: ReactNode }) => {
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>(initialCompanyInfo);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const storedInfo = getInitialState<CompanyInfo>('companyInfo', initialCompanyInfo);
    setCompanyInfo(storedInfo);
  }, []);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('companyInfo', JSON.stringify(companyInfo));
    }
  }, [companyInfo, isMounted]);

  const updateCompanyInfo = (info: CompanyInfo) => {
    setCompanyInfo(info);
  };

  return (
    <CompanyContext.Provider value={{ companyInfo, updateCompanyInfo, isMounted }}>
      {children}
    </CompanyContext.Provider>
  );
};

export const useCompany = () => {
  const context = useContext(CompanyContext);
  if (context === undefined) {
    throw new Error('useCompany must be used within a CompanyProvider');
  }
  return context;
};
