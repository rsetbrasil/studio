
'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export type CompanyInfo = {
  systemName: string;
  logoUrl: string;
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

const initialCompanyInfo: CompanyInfo = {
  systemName: "SipStream",
  logoUrl: "",
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

  const fetchCompanyInfo = async () => {
      try {
          const docRef = doc(db, "company", "info");
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
              setCompanyInfo(docSnap.data() as CompanyInfo);
          } else {
              // If no info exists, create it with default values
              await setDoc(docRef, initialCompanyInfo);
              setCompanyInfo(initialCompanyInfo);
          }
      } catch (error) {
          console.error("Error fetching company info:", error);
      }
  }

  useEffect(() => {
    setIsMounted(true);
    fetchCompanyInfo();
  }, []);

  const updateCompanyInfo = async (info: CompanyInfo) => {
    try {
        const docRef = doc(db, "company", "info");
        await setDoc(docRef, info);
        setCompanyInfo(info);
    } catch (error) {
        console.error("Error updating company info:", error);
    }
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
