
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatBRL(value: number) {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

export function formatCurrencyInput(value: string): string {
  if (!value) return '';
  // Remove all non-digit characters
  const numericValue = value.replace(/\D/g, '');

  if (numericValue === '') {
    return '';
  }

  // Convert to number and divide by 100 to handle cents
  const numberValue = Number(numericValue) / 100;

  // Format back to BRL string, but without the currency symbol for input fields
  return numberValue.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function parseCurrencyBRL(value: string): number {
    if (!value) return 0;
    // Remove thousand separators and replace comma with dot for decimal
    const parsableValue = value.replace(/\./g, '').replace(',', '.');
    const number = parseFloat(parsableValue);
    return isNaN(number) ? 0 : number;
}
