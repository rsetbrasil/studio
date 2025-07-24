
'use client';

import type { SVGProps } from 'react';
import Image from 'next/image';
import { useCompany } from '@/context/CompanyContext';
import { Package } from 'lucide-react';

export function AppLogo(props: SVGProps<SVGSVGElement> & { className?: string }) {
  const { companyInfo } = useCompany();

  if (companyInfo.logoUrl) {
    return <Image src={companyInfo.logoUrl} alt="Logo" width={24} height={24} className={props.className} />;
  }

  return (
     <Package {...props} />
  );
}
