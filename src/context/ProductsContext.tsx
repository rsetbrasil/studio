
'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export type Product = {
  id: number;
  name: string;
  unitOfMeasure: string; // Ex: Fardo, Caixa
  cost: number; // Custo do pacote/fardo
  price: number; // Preço de venda unitário (calculado)
  stock: number; // Estoque em pacotes/fardos
  category: string;
  unitsPerPack: number; // Unidades por fardo/pacote
  packPrice: number; // Preço de venda do fardo/pacote
  imageUrl?: string;
};

type CartItem = {
    id: number;
    quantity: number;
};

type ProductsContextType = {
  products: Product[];
  addProduct: (productData: Omit<Product, 'id' | 'price'>) => void;
  updateProduct: (productId: number, productData: Omit<Product, 'id' | 'price'>) => void;
  decreaseStock: (items: CartItem[]) => void;
  increaseStock: (items: CartItem[]) => void;
  getProductById: (id: number) => Product | undefined;
  resetProducts: () => void;
  loadProducts: (products: Omit<Product, 'price'>[]) => void;
  
  categories: string[];
  unitsOfMeasure: string[];
  addCategory: (category: string) => void;
  updateCategory: (oldCategory: string, newCategory: string) => void;
  deleteCategory: (category: string) => void;
  addUnitOfMeasure: (unit: string) => void;
  updateUnitOfMeasure: (oldUnit: string, newUnit: string) => void;
  deleteUnitOfMeasure: (unit: string) => void;
};

const calculatePrice = (packPrice: number, unitsPerPack: number) => {
    if(!unitsPerPack || unitsPerPack === 0) return packPrice;
    return packPrice / unitsPerPack;
}

const initialProductsRaw: Omit<Product, 'price'>[] = [
    { id: 1, name: 'AGUA DE COCO MAIS COCO 1L', category: 'ÀGUAS', unitOfMeasure: 'Unidade', cost: 13.64, packPrice: 15.90, unitsPerPack: 1, stock: 0.0 },
    { id: 2, name: 'AGUA DE COCO SOCOCO FRUTAS 200ML', category: 'ÀGUAS', unitOfMeasure: 'Unidade', cost: 2.46, packPrice: 3.90, unitsPerPack: 1, stock: 8.0 },
    { id: 3, name: 'AGUA DE COCO SOCOCO MARACUJA 200ML', category: 'ÀGUAS', unitOfMeasure: 'Unidade', cost: 2.46, packPrice: 3.90, unitsPerPack: 1, stock: 3.0 },
    { id: 4, name: 'AGUA DE COCO SOCOCO MELANCIA 200ML', category: 'ÀGUAS', unitOfMeasure: 'Unidade', cost: 2.46, packPrice: 3.90, unitsPerPack: 1, stock: 6.0 },
    { id: 5, name: 'AGUA DE COCO SOCOCO TANGERINA 200ML', category: 'ÀGUAS', unitOfMeasure: 'Unidade', cost: 2.46, packPrice: 3.90, unitsPerPack: 1, stock: 2.0 },
    { id: 6, name: 'AGUA SERRA GRANDE 1,5L', category: 'ÀGUAS', unitOfMeasure: 'Fardo', cost: 0.00, packPrice: 0.03, unitsPerPack: 6, stock: 0.0 },
    { id: 7, name: 'AGUA SERRA GRANDE 12X510ML', category: 'ÀGUAS', unitOfMeasure: 'Fardo', cost: 0.00, packPrice: 0.00, unitsPerPack: 12, stock: 0.0 },
    { id: 8, name: 'AGUA SERRA GRANDE 5L', category: 'ÀGUAS', unitOfMeasure: 'Unidade', cost: 0.00, packPrice: 0.00, unitsPerPack: 1, stock: 0.0 },
    { id: 9, name: 'AGUA SERRA GRANDE COM GÁS 12X510ML', category: 'ÀGUAS', unitOfMeasure: 'Fardo', cost: 0.00, packPrice: 0.00, unitsPerPack: 12, stock: 0.0 },
    { id: 10, name: 'AGUÁ CRYSTAL COM GAS 12X500ML', category: 'ÀGUAS', unitOfMeasure: 'Fardo', cost: 19.32, packPrice: 20.00, unitsPerPack: 12, stock: 10.0 },
    { id: 11, name: 'AMENDOIM CROKISSIMO SANTA HELENA 36UNID', category: 'BOMBONIERE', unitOfMeasure: 'Unidade', cost: 18.50, packPrice: 19.95, unitsPerPack: 1, stock: 13.0 },
    { id: 12, name: 'AMENDOIM DORI CART JAPONES 10X5', category: 'BOMBONIERE', unitOfMeasure: 'Caixa', cost: 33.00, packPrice: 34.90, unitsPerPack: 50, stock: 2.0 },
    { id: 13, name: 'AMENDOIM JAPONES 145G 4UND', category: 'BOMBONIERE', unitOfMeasure: 'Fardo', cost: 0.00, packPrice: 0.00, unitsPerPack: 1, stock: 0.0 },
    { id: 14, name: 'AMSTEL LATA 12X350ML', category: 'CERVEJAS', unitOfMeasure: 'Fardo', cost: 33.12, packPrice: 34.90, unitsPerPack: 12, stock: 0.0 },
    { id: 15, name: 'APEROL 1L', category: 'APERITIVO', unitOfMeasure: 'Unidade', cost: 36.95, packPrice: 39.90, unitsPerPack: 1, stock: 29.0 },
    { id: 16, name: 'ATITUTTY DE CAJU 12X300ML', category: 'REFRIGERANTES', unitOfMeasure: 'Fardo', cost: 10.75, packPrice: 11.50, unitsPerPack: 12, stock: 67.0 },
    { id: 17, name: 'ATITUTTY GUARANA 12X300ML', category: 'REFRIGERANTES', unitOfMeasure: 'Fardo', cost: 10.75, packPrice: 11.50, unitsPerPack: 12, stock: 25.0 },
    { id: 18, name: 'ATITUTTY UVA 12X300ML', category: 'REFRIGERANTES', unitOfMeasure: 'Fardo', cost: 10.75, packPrice: 11.50, unitsPerPack: 12, stock: 17.0 },
    { id: 19, name: 'BACON MINEIRO FD12X35G', category: 'BOMBONIERE', unitOfMeasure: 'Fardo', cost: 11.30, packPrice: 11.80, unitsPerPack: 12, stock: 48.0 },
    { id: 20, name: 'BALA DORI YOGURTE MORANGO', category: 'BOMBONIERE', unitOfMeasure: 'Unidade', cost: 0.00, packPrice: 0.00, unitsPerPack: 1, stock: 0.0 },
    { id: 21, name: 'BALA ICEKISS CEREJA', category: 'BOMBONIERE', unitOfMeasure: 'Unidade', cost: 6.80, packPrice: 7.30, unitsPerPack: 1, stock: 28.0 },
    { id: 22, name: 'BALA ICEKISS EUCALIPTO', category: 'BOMBONIERE', unitOfMeasure: 'Unidade', cost: 6.80, packPrice: 7.30, unitsPerPack: 1, stock: 24.0 },
    { id: 23, name: 'BALA ICEKISS EXT FORTE ', category: 'BOMBONIERE', unitOfMeasure: 'Unidade', cost: 6.80, packPrice: 7.30, unitsPerPack: 1, stock: 29.0 },
    { id: 24, name: 'BALA ICEKISS MENTA ', category: 'BOMBONIERE', unitOfMeasure: 'Unidade', cost: 6.80, packPrice: 7.30, unitsPerPack: 1, stock: 31.0 },
    { id: 25, name: 'BALA ICEKISS SORTIDA ', category: 'BOMBONIERE', unitOfMeasure: 'Unidade', cost: 6.80, packPrice: 7.30, unitsPerPack: 1, stock: 12.0 },
    { id: 26, name: 'BALA MEL SAMS 500ML', category: 'BOMBONIERE', unitOfMeasure: 'Unidade', cost: 7.50, packPrice: 8.00, unitsPerPack: 1, stock: 2.0 },
    { id: 27, name: 'BALA PIPPER SAMS 500G', category: 'BOMBONIERE', unitOfMeasure: 'Unidade', cost: 0.00, packPrice: 8.80, unitsPerPack: 1, stock: 0.0 },
    { id: 28, name: 'BALA SANTA RITA MAST MENTA 500G', category: 'BOMBONIERE', unitOfMeasure: 'Unidade', cost: 6.80, packPrice: 7.20, unitsPerPack: 1, stock: 8.0 },
    { id: 29, name: 'BALA SANTA RITA MAST SORT 500G', category: 'BOMBONIERE', unitOfMeasure: 'Unidade', cost: 6.80, packPrice: 7.20, unitsPerPack: 1, stock: 30.0 },
    { id: 30, name: 'BALY MAÇÃ VERDE 6X2L', category: 'ENÈRGETICOS', unitOfMeasure: 'Fardo', cost: 66.25, packPrice: 68.90, unitsPerPack: 6, stock: 12.0 },
    { id: 31, name: 'BALY MELÂNCIA 6X2L', category: 'ENÈRGETICOS', unitOfMeasure: 'Fardo', cost: 66.18, packPrice: 68.90, unitsPerPack: 6, stock: 69.0 },
    { id: 32, name: 'BALY MORANGO E PESSÊGO 6X2L', category: 'ENÈRGETICOS', unitOfMeasure: 'Fardo', cost: 66.23, packPrice: 68.90, unitsPerPack: 6, stock: 13.0 },
    { id: 33, name: 'BALY TRADICIONAL 6X2L', category: 'ENÈRGETICOS', unitOfMeasure: 'Fardo', cost: 66.25, packPrice: 68.90, unitsPerPack: 6, stock: 18.0 },
    { id: 34, name: 'BANDEJA DE DOCINHOS 12UNI', category: 'BOMBONIERE', unitOfMeasure: 'Fardo', cost: 0.00, packPrice: 9.00, unitsPerPack: 1, stock: 0.0 },
    { id: 35, name: 'BATON GAROTO UNIDADE MERCEARIA', category: 'BOMBONIERE', unitOfMeasure: 'Unidade', cost: 1.18, packPrice: 2.00, unitsPerPack: 1, stock: 6.0 },
    { id: 36, name: 'BEATS CAIPIRINHA LATA 8X269ML', category: 'DRINKS', unitOfMeasure: 'Fardo', cost: 0.00, packPrice: 34.90, unitsPerPack: 8, stock: 0.0 },
    { id: 37, name: 'BEATS GT LATA 8X269ML', category: 'DRINKS', unitOfMeasure: 'Fardo', cost: 32.00, packPrice: 33.90, unitsPerPack: 8, stock: 0.0 },
    { id: 38, name: 'BEATS RED MIX L/N 12X269ML', category: 'DRINKS', unitOfMeasure: 'Fardo', cost: 0.00, packPrice: 0.00, unitsPerPack: 12, stock: 0.0 },
    { id: 39, name: 'BEATS RED MIX LATA 8X269ML', category: 'DRINKS', unitOfMeasure: 'Fardo', cost: 38.34, packPrice: 39.90, unitsPerPack: 8, stock: 0.0 },
    { id: 40, name: 'BEATS TROPICAL LATA 8X269ML', category: 'DRINKS', unitOfMeasure: 'Fardo', cost: 32.09, packPrice: 34.90, unitsPerPack: 8, stock: 0.0 },
    { id: 41, name: 'BECKS LATA 8X350ML', category: 'CERVEJAS', unitOfMeasure: 'Unid', cost: 0.00, packPrice: 0.00, unitsPerPack: 8, stock: 0.0 },
    { id: 42, name: 'BISC AMORI CHOCOLATE 36X125G', category: 'BOMBONIERE', unitOfMeasure: 'Caixa', cost: 65.90, packPrice: 67.90, unitsPerPack: 36, stock: 9.0 },
    { id: 43, name: 'BOHEMIA LATA 12X3350ML', category: 'CERVEJAS', unitOfMeasure: 'Fardo', cost: 31.75, packPrice: 32.90, unitsPerPack: 12, stock: 194.0 },
    { id: 44, name: 'BOMBOM GAROTO SORTIDO CX 250G', category: 'BOMBONIERE', unitOfMeasure: 'Unidade', cost: 0.00, packPrice: 13.50, unitsPerPack: 1, stock: 0.0 },
    { id: 45, name: 'BOMBOM LACTA SORTIDO CX 250G', category: 'BOMBONIERE', unitOfMeasure: 'Unidade', cost: 11.00, packPrice: 11.90, unitsPerPack: 1, stock: 30.0 },
    { id: 46, name: 'BOMBOM NESTLE SORTIDO CX 251G', category: 'BOMBONIERE', unitOfMeasure: 'Unidade', cost: 11.00, packPrice: 11.90, unitsPerPack: 1, stock: 0.0 },
    { id: 47, name: 'BOMBOM SERENATA DE AMOR ', category: 'BOMBONIERE', unitOfMeasure: 'Unidade', cost: 37.07, packPrice: 41.90, unitsPerPack: 1, stock: 16.0 },
    { id: 48, name: 'BOMBOM SONHO DE VALSA', category: 'BOMBONIERE', unitOfMeasure: 'Unidade', cost: 44.00, packPrice: 45.50, unitsPerPack: 1, stock: 10.0 },
    { id: 49, name: 'BOMBOM SONHO/OURO', category: 'BOMBONIERE', unitOfMeasure: 'Unidade', cost: 0.00, packPrice: 13.50, unitsPerPack: 1, stock: 0.0 },
    { id: 50, name: 'BOMBOM SORTIDO OURO BRANCO 1KG', category: 'BOMBONIERE', unitOfMeasure: 'Unidade', cost: 44.00, packPrice: 45.50, unitsPerPack: 1, stock: 11.0 },
    { id: 51, name: 'BRAHAMA 350ML LATA MERCEARIA', category: 'CERVEJAS', unitOfMeasure: 'Unidade', cost: 3.25, packPrice: 4.50, unitsPerPack: 1, stock: 8.0 },
    { id: 52, name: 'BRAHMA DUPLO MALTE LATA 12X350ML', category: 'CERVEJAS', unitOfMeasure: 'Fardo', cost: 38.50, packPrice: 39.50, unitsPerPack: 12, stock: 1356.0 },
    { id: 53, name: 'BRAHMA L/N 24X330ML', category: 'CERVEJAS', unitOfMeasure: 'Fardo', cost: 0.00, packPrice: 0.00, unitsPerPack: 24, stock: 0.0 },
    { id: 54, name: 'SccCmzBNXfJ2HurQRMmA', category: 'BOMBONIERE', unitOfMeasure: 'Caixa', cost: 108.00, packPrice: 110.90, unitsPerPack: 24, stock: 312.0 },
    { id: 55, name: 'BUDWEISER L/N 330ML MERCEARIA', category: 'CERVEJAS', unitOfMeasure: 'Unidade', cost: 4.91, packPrice: 6.00, unitsPerPack: 1, stock: 8.0 },
    { id: 56, name: 'BUDWEISER LATA 12X350ML', category: 'CERVEJAS', unitOfMeasure: 'Fardo', cost: 39.50, packPrice: 41.50, unitsPerPack: 12, stock: 88.0 },
    { id: 57, name: 'BUDWEISER LATA ZERO 8X350ML', category: 'CERVEJAS', unitOfMeasure: 'Fardo', cost: 27.27, packPrice: 28.80, unitsPerPack: 8, stock: 8.0 },
    { id: 58, name: 'CABARE ICE FRUTAS VERMELHA 12X275ML', category: 'VODKAS', unitOfMeasure: 'Fardo', cost: 68.00, packPrice: 70.90, unitsPerPack: 12, stock: 56.0 },
    { id: 59, name: 'CABARE ICE LIMÃO 12X275ML', category: 'VODKAS', unitOfMeasure: 'Fardo', cost: 67.66, packPrice: 69.90, unitsPerPack: 12, stock: 300.0 },
    { id: 60, name: 'CACHAÇA VALE REAL PRATA 12X48OML', category: 'CACHAÇA', unitOfMeasure: 'Fardo', cost: 23.70, packPrice: 25.90, unitsPerPack: 12, stock: 29.0 },
    { id: 61, name: 'CACHAÇA 51 OURO CAIXA', category: 'CACHAÇA', unitOfMeasure: 'Caixa', cost: 144.78, packPrice: 146.50, unitsPerPack: 1, stock: 75.0 },
    { id: 62, name: 'CACHAÇA 51 OURO UNIDADE', category: 'CACHAÇA', unitOfMeasure: 'Unidade', cost: 12.06, packPrice: 12.65, unitsPerPack: 1, stock: 24.0 },
    { id: 63, name: 'CACHAÇA 51 PRATA CAIXA ', category: 'CACHAÇA', unitOfMeasure: 'Caixa', cost: 115.00, packPrice: 117.50, unitsPerPack: 12, stock: 62.0 },
    { id: 64, name: 'CACHAÇA 51 PRATA UNIDADE', category: 'CACHAÇA', unitOfMeasure: 'Unidade', cost: 9.58, packPrice: 10.50, unitsPerPack: 1, stock: 24.0 },
    { id: 65, name: 'CACHAÇA BANANAZINHA 900ML', category: 'CACHAÇA', unitOfMeasure: 'Unidade', cost: 35.00, packPrice: 38.90, unitsPerPack: 1, stock: 2.0 },
    { id: 66, name: 'CACHAÇA CABARE AMBURANA 700ML', category: 'CACHAÇA', unitOfMeasure: 'Unidade', cost: 0.00, packPrice: 37.70, unitsPerPack: 1, stock: 0.0 },
    { id: 67, name: 'CACHAÇA CABARE OURO 700ML', category: 'CACHAÇA', unitOfMeasure: 'Unidade', cost: 0.00, packPrice: 35.40, unitsPerPack: 1, stock: 0.0 },
    { id: 68, name: 'CACHAÇA CABARE PRATA 700ML', category: 'CACHAÇA', unitOfMeasure: 'Unidade', cost: 0.00, packPrice: 0.00, unitsPerPack: 1, stock: 0.0 },
    { id: 69, name: 'CACHAÇA CARANGUEJO 12X480ML', category: 'CACHAÇA', unitOfMeasure: 'Fardo', cost: 28.00, packPrice: 29.90, unitsPerPack: 12, stock: 74.0 },
    { id: 70, name: 'CACHAÇA D OURO OURO 12X480ML', category: 'CACHAÇA', unitOfMeasure: 'Fardo', cost: 30.50, packPrice: 31.40, unitsPerPack: 12, stock: 21.0 },
    { id: 71, name: 'CACHAÇA D OURO PRATA 12X480ML', category: 'CACHAÇA', unitOfMeasure: 'Fardo', cost: 29.82, packPrice: 30.70, unitsPerPack: 12, stock: 81.0 },
    { id: 72, name: 'CACHAÇA VALE REAL OURO 12X480ML', category: 'CACHAÇA', unitOfMeasure: 'Fardo', cost: 25.01, packPrice: 25.90, unitsPerPack: 12, stock: 8.0 },
    { id: 73, name: 'CAJUINA LATA MERCEARIA', category: 'REFRIGERANTES', unitOfMeasure: 'Unidade', cost: 2.66, packPrice: 4.00, unitsPerPack: 1, stock: 2.0 },
    { id: 74, name: 'CAJUINA MINI MERCEARIA', category: 'REFRIGERANTES', unitOfMeasure: 'Unidade', cost: 1.56, packPrice: 2.50, unitsPerPack: 1, stock: 11.0 },
    { id: 75, name: 'CAJUINA SÃO GERALDO 2L', category: 'REFRIGERANTES', unitOfMeasure: 'Fardo', cost: 49.08, packPrice: 52.90, unitsPerPack: 6, stock: 1.0 },
    { id: 76, name: 'CAJUINA SÃO GERALDO 6X1L', category: 'REFRIGERANTES', unitOfMeasure: 'Fardo', cost: 31.92, packPrice: 33.90, unitsPerPack: 6, stock: 17.0 },
    { id: 77, name: 'CAJUINA SÃO GERALDO LATA 12X3350ML', category: 'REFRIGERANTES', unitOfMeasure: 'Fardo', cost: 32.00, packPrice: 33.40, unitsPerPack: 12, stock: 34.0 },
    { id: 78, name: 'CAJUINA SÃO GERALDO LATA ZERO 12X350ML', category: 'REFRIGERANTES', unitOfMeasure: 'Fardo', cost: 31.50, packPrice: 32.90, unitsPerPack: 12, stock: 1.0 },
    { id: 79, name: 'CAJUINA SÃO GERALDO MINI 12X200ML', category: 'REFRIGERANTES', unitOfMeasure: 'Fardo', cost: 20.00, packPrice: 21.50, unitsPerPack: 12, stock: 19.0 },
    { id: 80, name: 'CAMPARI 900ML CAIXA', category: 'APERITIVO', unitOfMeasure: 'Caixa', cost: 528.00, packPrice: 546.00, unitsPerPack: 12, stock: 3.0 },
    { id: 81, name: 'CAMPARI 900ML UNIDADE', category: 'APERITIVO', unitOfMeasure: 'Unidade', cost: 44.00, packPrice: 46.50, unitsPerPack: 1, stock: 27.0 },
    { id: 82, name: 'CARVÃO VEGETAL VICTOR 3KL', category: 'CARVÃO', unitOfMeasure: 'Unidade', cost: 7.00, packPrice: 7.70, unitsPerPack: 1, stock: 0.0 },
    { id: 83, name: 'CAVALO BRANCO 1L UNIDADE', category: 'WHISCKS', unitOfMeasure: 'Unidade', cost: 55.75, packPrice: 58.90, unitsPerPack: 1, stock: 17.0 },
    { id: 84, name: 'CAVALO BRANCO CAIXA 12X1L', category: 'WHISCKS', unitOfMeasure: 'Caixa', cost: 669.00, packPrice: 694.80, unitsPerPack: 12, stock: 16.0 },
    { id: 85, name: 'CEBOLITOS 10X21GR', category: 'BOMBONIERE', unitOfMeasure: 'Unidade', cost: 8.60, packPrice: 9.40, unitsPerPack: 1, stock: 16.0 },
    { id: 86, name: 'CEBOLITOS 45G UNIDADE', category: 'BOMBONIERE', unitOfMeasure: 'Unidade', cost: 3.05, packPrice: 3.40, unitsPerPack: 1, stock: 0.0 },
    { id: 87, name: 'CEBOLITOS UNIDADE MERCEARIA', category: 'BOMBONIERE', unitOfMeasure: 'Unidade', cost: 3.40, packPrice: 4.00, unitsPerPack: 1, stock: 3.0 },
    { id: 88, name: 'CHANDON 1,5L BRUT ROSE', category: 'CHAMPANHE', unitOfMeasure: 'Unidade', cost: 0.00, packPrice: 0.00, unitsPerPack: 1, stock: 0.0 },
    { id: 89, name: 'CHANDON BRUT ROSE 750ML', category: 'CHAMPANHE', unitOfMeasure: 'Unidade', cost: 0.00, packPrice: 0.00, unitsPerPack: 1, stock: 0.0 },
    { id: 90, name: 'CHANDON PASSION ROSE 750ML', category: 'CHAMPANHE', unitOfMeasure: 'Unidade', cost: 0.00, packPrice: 0.00, unitsPerPack: 1, stock: 0.0 },
    { id: 91, name: 'CHEETOS UNIDADE MERCEARIA', category: 'BOMBONIERE', unitOfMeasure: 'Unidade', cost: 2.40, packPrice: 3.50, unitsPerPack: 1, stock: 5.0 },
    { id: 92, name: 'CHEETOS BOLA QUEIJO SUIÇO 33G', category: 'BOMBONIERE', unitOfMeasure: 'Unidade', cost: 2.40, packPrice: 2.60, unitsPerPack: 1, stock: 38.0 },
    { id: 93, name: 'CHEETOS CRUNCHY 48G', category: 'BOMBONIERE', unitOfMeasure: 'Unidade', cost: 2.40, packPrice: 2.60, unitsPerPack: 1, stock: 9.0 },
    { id: 94, name: 'CHEETOS LUA 35G', category: 'BOMBONIERE', unitOfMeasure: 'Unidade', cost: 2.40, packPrice: 2.60, unitsPerPack: 1, stock: 12.0 },
    { id: 95, name: 'CHEETOS ONDA REQUEIJÃO 10 UNIDADES', category: 'BOMBONIERE', unitOfMeasure: 'Fardo', cost: 8.60, packPrice: 9.40, unitsPerPack: 1, stock: 11.0 },
    { id: 96, name: 'CHEETOS ONDA REQUEIJÃO 40G', category: 'BOMBONIERE', unitOfMeasure: 'Unidade', cost: 2.40, packPrice: 2.60, unitsPerPack: 1, stock: 39.0 },
    { id: 97, name: 'CHEETOS PIMENTA MEXICANA 47G', category: 'BOMBONIERE', unitOfMeasure: 'Unidade', cost: 2.40, packPrice: 2.60, unitsPerPack: 1, stock: 49.0 },
    { id: 98, name: 'CHICLE BIGBIG HORTELÃ 315G', category: 'BOMBONIERE', unitOfMeasure: 'Unidade', cost: 7.50, packPrice: 7.80, unitsPerPack: 1, stock: 3.0 },
    { id: 99, name: 'CHICLE BIGBIG MORANGO 315G', category: 'BOMBONIERE', unitOfMeasure: 'Unidade', cost: 7.50, packPrice: 7.80, unitsPerPack: 1, stock: 1.0 },
    { id: 100, name: 'CHICLE BIGBIG TUTTI FRUT 315G', category: 'BOMBONIERE', unitOfMeasure: 'Unidade', cost: 7.50, packPrice: 7.80, unitsPerPack: 1, stock: 3.0 },
    { id: 101, name: 'CHICLE BIGBIG UVA 315G', category: 'BOMBONIERE', unitOfMeasure: 'Unidade', cost: 7.50, packPrice: 7.80, unitsPerPack: 1, stock: 4.0 },
    { id: 102, name: 'CHICLE CLISS CARTELA HORTELÃ 12X1', category: 'BOMBONIERE', unitOfMeasure: 'Unidade', cost: 7.50, packPrice: 8.50, unitsPerPack: 1, stock: 8.0 },
    { id: 103, name: 'CHICLE CLISS CARTELA MENTA 12X1', category: 'BOMBONIERE', unitOfMeasure: 'Unidade', cost: 7.50, packPrice: 8.90, unitsPerPack: 1, stock: 12.0 },
    { id: 104, name: 'CHICLE CLISS CARTELA TUTTI FRUT 12X1', category: 'BOMBONIERE', unitOfMeasure: 'Unidade', cost: 0.00, packPrice: 7.90, unitsPerPack: 12, stock: 0.0 },
    { id: 105, name: 'CHICLE PLUTONITA BABA DE BRUXA', category: 'BOMBONIERE', unitOfMeasure: 'Unidade', cost: 6.90, packPrice: 7.10, unitsPerPack: 1, stock: 5.0 },
    { id: 106, name: 'CHICLE PLUTONITA CABEÇA DE ABOBORA 180G', category: 'BOMBONIERE', unitOfMeasure: 'Unidade', cost: 6.90, packPrice: 7.10, unitsPerPack: 1, stock: 9.0 },
    { id: 107, name: 'CHIVAS 12 ANOS', category: 'WHISCKS', unitOfMeasure: 'Unidade', cost: 94.80, packPrice: 97.90, unitsPerPack: 1, stock: 0.0 },
    { id: 108, name: 'CHOC BATON GAROTO BRANCO 30X16G', category: 'BOMBONIERE', unitOfMeasure: 'Fardo', cost: 33.77, packPrice: 35.90, unitsPerPack: 30, stock: 53.0 },
    { id: 109, name: 'CHOC BATON GAROTO LEITE 30X160G', category: 'BOMBONIERE', unitOfMeasure: 'Fardo', cost: 34.00, packPrice: 36.90, unitsPerPack: 30, stock: 34.0 },
    { id: 110, name: 'CHOC BIS AO LEITE 16UND', category: 'BOMBONIERE', unitOfMeasure: 'Unidade', cost: 4.82, packPrice: 5.99, unitsPerPack: 1, stock: 95.0 },
    { id: 111, name: 'CHOC CROCANTE GAROTO 30X25G', category: 'BOMBONIERE', unitOfMeasure: 'Caixa', cost: 0.00, packPrice: 57.90, unitsPerPack: 30, stock: 0.0 },
    { id: 112, name: 'CHOC GAROTO CARIBE 30X28G', category: 'BOMBONIERE', unitOfMeasure: 'Caixa', cost: 0.00, packPrice: 60.90, unitsPerPack: 30, stock: 0.0 },
    { id: 113, name: 'CHOC MMS AO LEITE 18X45GR', category: 'BOMBONIERE', unitOfMeasure: 'Fardo', cost: 57.98, packPrice: 59.50, unitsPerPack: 18, stock: 0.0 },
    { id: 114, name: 'CHOC MMS TUBO 12X30G', category: 'BOMBONIERE', unitOfMeasure: 'Fardo', cost: 42.50, packPrice: 43.70, unitsPerPack: 12, stock: 1.0 },
    { id: 115, name: 'CHOC NESTLE CHOKITO 30X32G', category: 'BOMBONIERE', unitOfMeasure: 'Caixa', cost: 58.61, packPrice: 59.90, unitsPerPack: 30, stock: 9.0 },
    { id: 116, name: 'CHOC NESTLE LOLLO 30X32GR', category: 'BOMBONIERE', unitOfMeasure: 'Caixa', cost: 59.02, packPrice: 60.90, unitsPerPack: 30, stock: 4.0 },
    { id: 117, name: 'CHOC NESTLE PRESTIGIO 30X33G', category: 'BOMBONIERE', unitOfMeasure: 'Caixa', cost: 0.00, packPrice: 58.90, unitsPerPack: 30, stock: 0.0 },
    { id: 118, name: 'CHOC SNICKERS 20X45G', category: 'BOMBONIERE', unitOfMeasure: 'Caixa', cost: 59.00, packPrice: 60.90, unitsPerPack: 20, stock: 21.0 },
    { id: 119, name: 'CHOC SNICKERS BRANCO 20X42G', category: 'BOMBONIERE', unitOfMeasure: 'Fardo', cost: 56.90, packPrice: 59.90, unitsPerPack: 20, stock: 2.0 },
    { id: 120, name: 'CHOC SNICKERS DARK 20X42GR', category: 'BOMBONIERE', unitOfMeasure: 'Fardo', cost: 57.60, packPrice: 59.90, unitsPerPack: 20, stock: 3.0 },
    { id: 121, name: 'CHOCOCANDY DISPLAY 11G', category: 'BOMBONIERE', unitOfMeasure: 'Unidade', cost: 12.50, packPrice: 13.50, unitsPerPack: 1, stock: 9.0 },
    { id: 122, name: 'CHUP DOCE DE LEITE 1,5K', category: 'BOMBONIERE', unitOfMeasure: 'Caixa', cost: 0.00, packPrice: 23.60, unitsPerPack: 1, stock: 0.0 },
    { id: 123, name: 'CIGARRO CLEAN BY CLICK', category: 'TABACARIA', unitOfMeasure: 'Maço', cost: 87.50, packPrice: 88.50, unitsPerPack: 12, stock: 1.0 },
    { id: 124, name: 'CIGARRO CLUB ONE BRANCO', category: 'TABACARIA', unitOfMeasure: 'Unidade', cost: 0.00, packPrice: 27.90, unitsPerPack: 1, stock: 0.0 },
    { id: 125, name: 'CIGARRO CLUB ONE VERMELHO', category: 'TABACARIA', unitOfMeasure: 'Unidade', cost: 0.00, packPrice: 27.90, unitsPerPack: 1, stock: 1.0 },
    { id: 126, name: 'CIGARRO CRETEC MENTHOL CARTEIRA', category: 'TABACARIA', unitOfMeasure: 'Unidade', cost: 17.40, packPrice: 19.40, unitsPerPack: 1, stock: 10.0 },
    { id: 127, name: 'CIGARRO DUNHILL', category: 'TABACARIA', unitOfMeasure: 'Maço', cost: 133.04, packPrice: 136.80, unitsPerPack: 10, stock: 16.0 },
    { id: 128, name: 'CIGARRO DUNHILL AZUL', category: 'TABACARIA', unitOfMeasure: 'Maço', cost: 98.00, packPrice: 100.90, unitsPerPack: 10, stock: 5.0 },
    { id: 129, name: 'CIGARRO DUNHILL DOUBLE REFRESH', category: 'TABACARIA', unitOfMeasure: 'Maço', cost: 132.20, packPrice: 134.40, unitsPerPack: 10, stock: 1.0 },
    { id: 130, name: 'CIGARRO DUNHILL PRATA', category: 'TABACARIA', unitOfMeasure: 'Maço', cost: 98.00, packPrice: 105.90, unitsPerPack: 10, stock: 0.0 },
    { id: 131, name: 'CIGARRO DUNHILL RED', category: 'TABACARIA', unitOfMeasure: 'Maço', cost: 99.00, packPrice: 108.50, unitsPerPack: 10, stock: 4.0 },
    { id: 132, name: 'CIGARRO GIFT BRANCO', category: 'TABACARIA', unitOfMeasure: 'Maço', cost: 26.00, packPrice: 28.90, unitsPerPack: 10, stock: 0.0 },
    { id: 133, name: 'CIGARRO GIFT VERMELHO', category: 'TABACARIA', unitOfMeasure: 'Maço', cost: 26.00, packPrice: 28.90, unitsPerPack: 10, stock: 60.0 },
    { id: 134, name: 'CIGARRO GLOBAL MERCEARIA', category: 'TABACARIA', unitOfMeasure: 'Unidade', cost: 7.08, packPrice: 9.00, unitsPerPack: 1, stock: 4.0 },
    { id: 135, name: 'CIGARRO GUDANG GARAM CARTEIRA', category: 'TABACARIA', unitOfMeasure: 'Unidade', cost: 24.00, packPrice: 26.00, unitsPerPack: 1, stock: 40.0 },
    { id: 136, name: 'CIGARRO GUDANG GARAN CARTEIRA', category: 'TABACARIA', unitOfMeasure: 'Unidade', cost: 24.00, packPrice: 26.00, unitsPerPack: 1, stock: 8.0 },
    { id: 137, name: 'CIGARRO K-LINT SILVER', category: 'TABACARIA', unitOfMeasure: 'Maço', cost: 58.36, packPrice: 59.90, unitsPerPack: 10, stock: 29.0 },
    { id: 138, name: 'CIGARRO KENT AZUL', category: 'TABACARIA', unitOfMeasure: 'Maço', cost: 102.98, packPrice: 112.90, unitsPerPack: 10, stock: 55.0 },
    { id: 139, name: 'CIGARRO KENT PRATA', category: 'TABACARIA', unitOfMeasure: 'Maço', cost: 109.50, packPrice: 112.90, unitsPerPack: 10, stock: 11.0 },
    { id: 140, name: 'CIGARRO LUCKY STRIKE DOUBLEICE', category: 'TABACARIA', unitOfMeasure: 'Maço', cost: 118.00, packPrice: 121.20, unitsPerPack: 10, stock: 30.0 },
    { id: 141, name: 'CIGARRO LUCKY STRIKE VERMELHO BOX', category: 'TABACARIA', unitOfMeasure: 'Maço', cost: 69.30, packPrice: 73.80, unitsPerPack: 10, stock: 39.0 },
    { id: 142, name: 'CIGARRO MARLBORO RED BOX', category: 'TABACARIA', unitOfMeasure: 'Maço', cost: 81.29, packPrice: 81.90, unitsPerPack: 10, stock: 35.0 },
    { id: 143, name: 'CIGARRO NISE BRANCO', category: 'TABACARIA', unitOfMeasure: 'Maço', cost: 27.00, packPrice: 29.90, unitsPerPack: 10, stock: 20.0 },
    { id: 144, name: 'CIGARRO NISE VERMELHO', category: 'TABACARIA', unitOfMeasure: 'Maço', cost: 31.00, packPrice: 32.90, unitsPerPack: 10, stock: 37.0 },
    { id: 145, name: 'CIGARRO PANDORA BRANCO', category: 'TABACARIA', unitOfMeasure: 'Unidade', cost: 27.00, packPrice: 29.90, unitsPerPack: 1, stock: 103.0 },
    { id: 146, name: 'CIGARRO PANDORA VERMELHO', category: 'TABACARIA', unitOfMeasure: 'Unidade', cost: 26.00, packPrice: 29.90, unitsPerPack: 1, stock: 47.0 },
    { id: 147, name: 'CIGARRO PONCIO IGNITE', category: 'TABACARIA', unitOfMeasure: 'Unidade', cost: 20.00, packPrice: 21.00, unitsPerPack: 1, stock: 10.0 },
    { id: 148, name: 'CIGARRO ROTHMANS AZUL', category: 'TABACARIA', unitOfMeasure: 'Maço', cost: 83.61, packPrice: 89.30, unitsPerPack: 10, stock: 43.0 },
    { id: 149, name: 'CIGARRO ROTHMANS BOX WHITE BLUE', category: 'TABACARIA', unitOfMeasure: 'Maço', cost: 72.22, packPrice: 75.20, unitsPerPack: 1, stock: 23.0 },
    { id: 150, name: 'CIGARRO ROTHMANS GLOBAL AZUL BOX', category: 'TABACARIA', unitOfMeasure: 'Maço', cost: 70.80, packPrice: 72.80, unitsPerPack: 1, stock: 54.0 },
    { id: 151, name: 'CIGARRO ROTHMANS GLOBAL VERMELHO BOX', category: 'TABACARIA', unitOfMeasure: 'Maço', cost: 70.80, packPrice: 72.80, unitsPerPack: 1, stock: 19.0 },
    { id: 152, name: 'CIGARRO ROTHMANS INTER 2 CAPS BOX', category: 'TABACARIA', unitOfMeasure: 'Unidade', cost: 103.90, packPrice: 108.30, unitsPerPack: 1, stock: 28.0 },
    { id: 153, name: 'CIGARRO ROTHMANS INTERNACIONAL', category: 'TABACARIA', unitOfMeasure: 'Maço', cost: 99.90, packPrice: 104.25, unitsPerPack: 10, stock: 38.0 },
    { id: 154, name: 'CIGARRO ROTHMANS PRATA', category: 'TABACARIA', unitOfMeasure: 'Maço', cost: 87.40, packPrice: 89.30, unitsPerPack: 10, stock: 16.0 },
    { id: 155, name: 'CIGARRO ROTHMANS VERMELHO', category: 'TABACARIA', unitOfMeasure: 'Maço', cost: 82.06, packPrice: 89.30, unitsPerPack: 10, stock: 55.0 },
    { id: 156, name: 'CIGARRO ROTHMANS WHITE RED BOX', category: 'TABACARIA', unitOfMeasure: 'Maço', cost: 66.00, packPrice: 75.20, unitsPerPack: 1, stock: 16.0 },
    { id: 157, name: 'COCA COLA 1,5 ZERO', category: 'REFRIGERANTES', unitOfMeasure: 'Fardo', cost: 37.86, packPrice: 39.90, unitsPerPack: 6, stock: 72.0 },
    { id: 158, name: 'COCA COLA 1,5L', category: 'REFRIGERANTES', unitOfMeasure: 'Fardo', cost: 38.88, packPrice: 40.90, unitsPerPack: 6, stock: 81.0 },
    { id: 159, name: 'COCA COLA 1L', category: 'REFRIGERANTES', unitOfMeasure: 'Fardo', cost: 35.10, packPrice: 37.50, unitsPerPack: 6, stock: 12.0 },
    { id: 160, name: 'COCA COLA 1L ZERO', category: 'REFRIGERANTES', unitOfMeasure: 'Fardo', cost: 33.42, packPrice: 35.90, unitsPerPack: 6, stock: 90.0 },
    { id: 161, name: 'COCA COLA 2L', category: 'REFRIGERANTES', unitOfMeasure: 'Fardo', cost: 52.50, packPrice: 54.90, unitsPerPack: 6, stock: 63.0 },
    { id: 162, name: 'COCA COLA 2L MERCEARIA', category: 'REFRIGERANTES', unitOfMeasure: 'Unidade', cost: 8.76, packPrice: 12.00, unitsPerPack: 1, stock: 2.0 },
    { id: 163, name: 'COCA COLA 2L ZERO', category: 'REFRIGERANTES', unitOfMeasure: 'Fardo', cost: 49.47, packPrice: 52.90, unitsPerPack: 6, stock: 138.0 },
    { id: 164, name: 'COCA COLA 2L ZERO MERCEARIA', category: 'REFRIGERANTES', unitOfMeasure: 'Unidade', cost: 8.24, packPrice: 12.00, unitsPerPack: 1, stock: 3.0 },
    { id: 165, name: 'COCA COLA 600 NORMAL', category: 'REFRIGERANTES', unitOfMeasure: 'Fardo', cost: 43.08, packPrice: 44.90, unitsPerPack: 12, stock: 84.0 },
    { id: 166, name: 'COCA COLA 600 ZERO', category: 'REFRIGERANTES', unitOfMeasure: 'Fardo', cost: 40.20, packPrice: 41.90, unitsPerPack: 12, stock: 105.0 },
    { id: 167, name: 'COCA COLA CAFE LATA 220ML', category: 'REFRIGERANTES', unitOfMeasure: 'Fardo', cost: 0.00, packPrice: 0.00, unitsPerPack: 1, stock: 0.0 },
    { id: 168, name: 'COCA COLA LATA 350ML MERCEARIA', category: 'REFRIGERANTES', unitOfMeasure: 'Unidade', cost: 2.82, packPrice: 4.50, unitsPerPack: 1, stock: 7.0 },
    { id: 169, name: 'COCA COLA LATA 6X350ML', category: 'REFRIGERANTES', unitOfMeasure: 'Fardo', cost: 16.83, packPrice: 17.70, unitsPerPack: 6, stock: 365.0 },
    { id: 170, name: 'COCA COLA LATA ZERO 6X350ML', category: 'REFRIGERANTES', unitOfMeasure: 'Fardo', cost: 16.43, packPrice: 17.45, unitsPerPack: 6, stock: 1310.0 },
    { id: 171, name: 'COCA COLA LATA ZERO MERCEARIA', category: 'REFRIGERANTES', unitOfMeasure: 'Unidade', cost: 2.72, packPrice: 4.50, unitsPerPack: 1, stock: 13.0 },
    { id: 172, name: 'COCA COLA LS RETORNAVEL', category: 'REFRIGERANTES', unitOfMeasure: 'Caixa', cost: 42.72, packPrice: 46.90, unitsPerPack: 12, stock: 32.0 },
    { id: 173, name: 'COCA COLA MINI MERCEARIA', category: 'REFRIGERANTES', unitOfMeasure: 'Unidade', cost: 2.09, packPrice: 3.50, unitsPerPack: 1, stock: 11.0 },
    { id: 174, name: 'COCA COLA MINI PET 12X250ML', category: 'REFRIGERANTES', unitOfMeasure: 'Fardo', cost: 25.44, packPrice: 27.00, unitsPerPack: 12, stock: 6.0 },
    { id: 175, name: 'COCA COLA MINI PET 6X250ML', category: 'REFRIGERANTES', unitOfMeasure: 'Fardo', cost: 0.00, packPrice: 15.00, unitsPerPack: 6, stock: 0.0 },
    { id: 176, name: 'COCA COLA VZ LATA 310ML', category: 'REFRIGERANTES', unitOfMeasure: 'Fardo', cost: 37.80, packPrice: 39.0, unitsPerPack: 3, stock: 1.0 },
    { id: 177, name: 'COROTE AZUL 500ML', category: 'VODKAS', unitOfMeasure: 'Unidade', cost: 3.83, packPrice: 4.00, unitsPerPack: 1, stock: 19.0 },
    { id: 178, name: 'COROTE BLUEBERRY 500ML', category: 'VODKAS', unitOfMeasure: 'Unidade', cost: 3.83, packPrice: 4.00, unitsPerPack: 1, stock: 3.0 },
    { id: 179, name: 'COROTE CEREJA 500ML', category: 'VODKAS', unitOfMeasure: 'Unidade', cost: 3.83, packPrice: 4.00, unitsPerPack: 1, stock: 5.0 },
    { id: 180, name: 'COROTE LIMÃO 500ML', category: 'VODKAS', unitOfMeasure: 'Unidade', cost: 3.83, packPrice: 4.00, unitsPerPack: 1, stock: 5.0 },
    { id: 181, name: 'COROTE PESSEGO 500ML', category: 'VODKAS', unitOfMeasure: 'Unidade', cost: 3.83, packPrice: 4.00, unitsPerPack: 1, stock: 4.0 },
    { id: 182, name: 'COROTE SABORES 12X500ML', category: 'VODKAS', unitOfMeasure: 'Fardo', cost: 45.00, packPrice: 48.00, unitsPerPack: 12, stock: 6.0 },
    { id: 183, name: 'COROTE SKOL BEATS 12X500ML', category: 'VODKAS', unitOfMeasure: 'Fardo', cost: 45.00, packPrice: 48.00, unitsPerPack: 12, stock: 5.0 },
    { id: 184, name: 'COROTE UVC 500ML', category: 'VODKAS', unitOfMeasure: 'Unidade', cost: 3.83, packPrice: 4.00, unitsPerPack: 1, stock: 1.0 },
    { id: 185, name: 'COROTE VERMELHO 500ML', category: 'VODKAS', unitOfMeasure: 'Unidade', cost: 3.83, packPrice: 4.00, unitsPerPack: 1, stock: 1.0 },
    { id: 186, name: 'CRYSTAL AGUA SEM GAS 12X500ML', category: 'ÀGUAS', unitOfMeasure: 'Fardo', cost: 17.40, packPrice: 18.00, unitsPerPack: 12, stock: 1.0 },
    { id: 187, name: 'CRYSTAL AGUA S/GAS 1,5L', category: 'ÀGUAS', unitOfMeasure: 'Fardo', cost: 17.04, packPrice: 18.00, unitsPerPack: 6, stock: 2.0 },
    { id: 188, name: 'DEVASSA LATA 12X350ML', category: 'CERVEJAS', unitOfMeasure: 'Fardo', cost: 36.72, packPrice: 38.90, unitsPerPack: 12, stock: 4.0 },
    { id: 189, name: 'DEVASSA LATA PURO MALTE 12X350ML', category: 'CERVEJAS', unitOfMeasure: 'Fardo', cost: 38.88, packPrice: 40.90, unitsPerPack: 12, stock: 1.0 },
    { id: 190, name: 'EISENBAHN PILSEN 12X350ML', category: 'CERVEJAS', unitOfMeasure: 'Fardo', cost: 40.00, packPrice: 42.00, unitsPerPack: 12, stock: 1.0 },
    { id: 191, name: 'FANTA GUARANA 2L', category: 'REFRIGERANTES', unitOfMeasure: 'Fardo', cost: 37.38, packPrice: 39.90, unitsPerPack: 6, stock: 3.0 },
    { id: 192, name: 'FANTA LARANJA 2L', category: 'REFRIGERANTES', unitOfMeasure: 'Fardo', cost: 38.04, packPrice: 40.90, unitsPerPack: 6, stock: 1.0 },
    { id: 193, name: 'FANTA LARANJA LATA 6X350ML', category: 'REFRIGERANTES', unitOfMeasure: 'Fardo', cost: 16.83, packPrice: 17.70, unitsPerPack: 6, stock: 2.0 },
    { id: 194, name: 'FESTVAL CAJU 12X200ML', category: 'REFRIGERANTES', unitOfMeasure: 'Fardo', cost: 18.00, packPrice: 19.90, unitsPerPack: 12, stock: 1.0 },
    { id: 195, name: 'FESTVAL UVA 12X200ML', category: 'REFRIGERANTES', unitOfMeasure: 'Fardo', cost: 18.00, packPrice: 19.90, unitsPerPack: 12, stock: 1.0 },
    { id: 196, name: 'FONTES DE MINAS 5L', category: 'ÀGUAS', unitOfMeasure: 'Unidade', cost: 0.00, packPrice: 0.00, unitsPerPack: 1, stock: 0.0 },
    { id: 197, name: 'FONTES DE MINAS AGUA S/GAS 1,5L', category: 'ÀGUAS', unitOfMeasure: 'Fardo', cost: 16.92, packPrice: 17.50, unitsPerPack: 6, stock: 1.0 },
    { id: 198, name: 'GAROTO BOMBOM SORTIDO 250G', category: 'BOMBONIERE', unitOfMeasure: 'Unidade', cost: 0.00, packPrice: 11.90, unitsPerPack: 1, stock: 0.0 },
    { id: 199, name: 'GUARANA ANTARTICA 1,5L', category: 'REFRIGERANTES', unitOfMeasure: 'Fardo', cost: 37.00, packPrice: 38.90, unitsPerPack: 6, stock: 2.0 },
    { id: 200, name: 'GUARANA ANTARTICA 1L', category: 'REFRIGERANTES', unitOfMeasure: 'Fardo', cost: 33.42, packPrice: 35.90, unitsPerPack: 6, stock: 0.0 },
    { id: 201, name: 'GUARANA ANTARTICA 2L', category: 'REFRIGERANTES', unitOfMeasure: 'Fardo', cost: 47.88, packPrice: 49.90, unitsPerPack: 6, stock: 2.0 },
    { id: 202, name: 'GUARANA ANTARTICA 600ML', category: 'REFRIGERANTES', unitOfMeasure: 'Fardo', cost: 42.24, packPrice: 43.90, unitsPerPack: 12, stock: 6.0 },
    { id: 203, name: 'GUARANA ANTARTICA LATA 6X350ML', category: 'REFRIGERANTES', unitOfMeasure: 'Fardo', cost: 16.43, packPrice: 17.40, unitsPerPack: 6, stock: 15.0 },
    { id: 204, name: 'GUARANA ANTARTICA LATA ZERO 6X350ML', category: 'REFRIGERANTES', unitOfMeasure: 'Fardo', cost: 16.43, packPrice: 17.40, unitsPerPack: 6, stock: 0.0 },
    { id: 205, name: 'GUARANA KUAT 2L', category: 'REFRIGERANTES', unitOfMeasure: 'Fardo', cost: 35.82, packPrice: 37.90, unitsPerPack: 6, stock: 2.0 },
    { id: 206, name: 'HEINEKEN LONG NECK 24X330ML', category: 'CERVEJAS', unitOfMeasure: 'Caixa', cost: 128.88, packPrice: 135.00, unitsPerPack: 24, stock: 6.0 },
    { id: 207, name: 'HEINEKEN LATA 12X350ML', category: 'CERVEJAS', unitOfMeasure: 'Fardo', cost: 40.08, packPrice: 42.90, unitsPerPack: 12, stock: 7.0 },
    { id: 208, name: 'HEINEKEN LONG NECK 6X330ML', category: 'CERVEJAS', unitOfMeasure: 'Fardo', cost: 0.00, packPrice: 32.90, unitsPerPack: 6, stock: 0.0 },
    { id: 209, name: 'HEINEKEN LONG NECK MERCEARIA', category: 'CERVEJAS', unitOfMeasure: 'Unidade', cost: 5.37, packPrice: 5.99, unitsPerPack: 1, stock: 3.0 },
    { id: 210, name: 'JACK DANIELS MEL 1L', category: 'WHISCKS', unitOfMeasure: 'Unidade', cost: 105.00, packPrice: 109.90, unitsPerPack: 1, stock: 4.0 },
    { id: 211, name: 'JACK DANIELS N 7 1L', category: 'WHISCKS', unitOfMeasure: 'Unidade', cost: 95.00, packPrice: 99.90, unitsPerPack: 1, stock: 10.0 },
    { id: 212, name: 'JOHNIE WALKER RED LABEL 1L', category: 'WHISCKS', unitOfMeasure: 'Unidade', cost: 79.00, packPrice: 81.90, unitsPerPack: 1, stock: 10.0 },
    { id: 213, name: 'KIT KAT BRANCO 24X41G', category: 'BOMBONIERE', unitOfMeasure: 'Caixa', cost: 0.00, packPrice: 64.90, unitsPerPack: 24, stock: 0.0 },
    { id: 214, name: 'KIT KAT AO LEITE 24X41G', category: 'BOMBONIERE', unitOfMeasure: 'Caixa', cost: 0.00, packPrice: 64.90, unitsPerPack: 24, stock: 0.0 },
    { id: 215, name: 'KRISPY KREAM CHOCOLATE 10X5', category: 'BOMBONIERE', unitOfMeasure: 'Fardo', cost: 0.00, packPrice: 0.00, unitsPerPack: 50, stock: 0.0 },
    { id: 216, name: 'LEITE DE COCO SOCOCO 200ML', category: 'MANTIMENTOS', unitOfMeasure: 'Unidade', cost: 4.40, packPrice: 4.90, unitsPerPack: 1, stock: 8.0 },
    { id: 217, name: 'LIMONADA CLight 1L', category: 'SUCOS', unitOfMeasure: 'Unidade', cost: 0.00, packPrice: 5.00, unitsPerPack: 1, stock: 0.0 },
    { id: 218, name: 'MENTOS SABORES 12X3', category: 'BOMBONIERE', unitOfMeasure: 'Fardo', cost: 24.00, packPrice: 25.00, unitsPerPack: 3, stock: 1.0 },
    { id: 219, name: 'MOUSSE DE LIMÃO E MARACUJÁ 10X5', category: 'BOMBONIERE', unitOfMeasure: 'Fardo', cost: 0.00, packPrice: 0.00, unitsPerPack: 50, stock: 0.0 },
    { id: 220, name: 'NESCAU 2,0', category: 'ACHOCOLATADOS', unitOfMeasure: 'Unidade', cost: 13.00, packPrice: 13.50, unitsPerPack: 1, stock: 2.0 },
    { id: 221, name: 'NESCAU 400G', category: 'ACHOCOLATADOS', unitOfMeasure: 'Unidade', cost: 6.20, packPrice: 6.50, unitsPerPack: 1, stock: 1.0 },
    { id: 222, name: 'NESTLE CHOCOLATE CLASSIC 1KG', category: 'BOMBONIERE', unitOfMeasure: 'Unidade', cost: 25.00, packPrice: 26.90, unitsPerPack: 1, stock: 3.0 },
    { id: 223, name: 'OLD PARR 1L', category: 'WHISCKS', unitOfMeasure: 'Unidade', cost: 105.00, packPrice: 109.90, unitsPerPack: 1, stock: 11.0 },
    { id: 224, name: 'OVALTINE 200G', category: 'ACHOCOLATADOS', unitOfMeasure: 'Unidade', cost: 5.90, packPrice: 6.20, unitsPerPack: 1, stock: 0.0 },
    { id: 225, name: 'OVALTINE 400G', category: 'ACHOCOLATADOS', unitOfMeasure: 'Unidade', cost: 10.00, packPrice: 10.50, unitsPerPack: 1, stock: 0.0 },
    { id: 226, name: 'PAÇOQUITA SANTA HELENA 24X21G', category: 'BOMBONIERE', unitOfMeasure: 'Unidade', cost: 22.00, packPrice: 23.50, unitsPerPack: 1, stock: 2.0 },
    { id: 227, name: 'PAÇOQUITA SANTA HELENA 400G', category: 'BOMBONIERE', unitOfMeasure: 'Unidade', cost: 12.00, packPrice: 12.50, unitsPerPack: 1, stock: 0.0 },
    { id: 228, name: 'PAÇOQUITA SANTA HELENA 50X16G', category: 'BOMBONIERE', unitOfMeasure: 'Caixa', cost: 20.00, packPrice: 21.50, unitsPerPack: 50, stock: 11.0 },
    { id: 229, name: 'PARMALAT CHOCOLATE 200ML', category: 'ACHOCOLATADOS', unitOfMeasure: 'Unidade', cost: 1.50, packPrice: 1.80, unitsPerPack: 1, stock: 1.0 },
    { id: 230, name: 'PEPSI 2L', category: 'REFRIGERANTES', unitOfMeasure: 'Fardo', cost: 35.82, packPrice: 37.90, unitsPerPack: 6, stock: 0.0 },
    { id: 231, name: 'PEPSI LATA 6X350ML', category: 'REFRIGERANTES', unitOfMeasure: 'Fardo', cost: 16.43, packPrice: 17.40, unitsPerPack: 6, stock: 0.0 },
    { id: 232, name: 'PIRAQUÊ CREAM CRACKER 200G', category: 'MANTIMENTOS', unitOfMeasure: 'Unidade', cost: 3.00, packPrice: 3.30, unitsPerPack: 1, stock: 1.0 },
    { id: 233, name: 'PIRAQUÊ MAISENA 200G', category: 'MANTIMENTOS', unitOfMeasure: 'Unidade', cost: 3.00, packPrice: 3.30, unitsPerPack: 1, stock: 1.0 },
    { id: 234, name: 'PITU 900ML', category: 'CACHAÇA', unitOfMeasure: 'Unidade', cost: 10.00, packPrice: 10.50, unitsPerPack: 1, stock: 1.0 },
    { id: 235, name: 'PITU CAIXA 12X900ML', category: 'CACHAÇA', unitOfMeasure: 'Caixa', cost: 120.00, packPrice: 126.00, unitsPerPack: 12, stock: 1.0 },
    { id: 236, name: 'PORTO SEGURO AGUA DE COCO 1L', category: 'ÀGUAS', unitOfMeasure: 'Unidade', cost: 5.00, packPrice: 5.50, unitsPerPack: 1, stock: 0.0 },
    { id: 237, name: 'PRINGLES ORIGINAL 12X124G', category: 'BOMBONIERE', unitOfMeasure: 'Fardo', cost: 168.00, packPrice: 175.00, unitsPerPack: 12, stock: 0.0 },
    { id: 238, name: 'SALGADINHO BACONZITOS 10X5', category: 'BOMBONIERE', unitOfMeasure: 'Fardo', cost: 0.00, packPrice: 0.00, unitsPerPack: 50, stock: 0.0 },
    { id: 239, name: 'SALGADINHO CEBOLITOS 10X5', category: 'BOMBONIERE', unitOfMeasure: 'Fardo', cost: 0.00, packPrice: 0.00, unitsPerPack: 50, stock: 0.0 },
    { id: 240, name: 'SALGADINHO CHEETOS 10X5', category: 'BOMBONIERE', unitOfMeasure: 'Fardo', cost: 0.00, packPrice: 0.00, unitsPerPack: 50, stock: 0.0 },
    { id: 241, name: 'SALGADINHO DORITOS 10X5', category: 'BOMBONIERE', unitOfMeasure: 'Fardo', cost: 0.00, packPrice: 0.00, unitsPerPack: 50, stock: 0.0 },
    { id: 242, name: 'SALGADINHO FANTA 10X5', category: 'BOMBONIERE', unitOfMeasure: 'Fardo', cost: 0.00, packPrice: 0.00, unitsPerPack: 50, stock: 0.0 },
    { id: 243, name: 'SALGADINHO FOFURA 10X5', category: 'BOMBONIERE', unitOfMeasure: 'Fardo', cost: 0.00, packPrice: 0.00, unitsPerPack: 50, stock: 0.0 },
    { id: 244, name: 'SALGADINHO RUFFLES 10X5', category: 'BOMBONIERE', unitOfMeasure: 'Fardo', cost: 0.00, packPrice: 0.00, unitsPerPack: 50, stock: 0.0 },
    { id: 245, name: 'SALGADINHO SKOL 10X5', category: 'BOMBONIERE', unitOfMeasure: 'Fardo', cost: 0.00, packPrice: 0.00, unitsPerPack: 50, stock: 0.0 },
    { id: 246, name: 'SALGADINHO TOP 10X5', category: 'BOMBONIERE', unitOfMeasure: 'Fardo', cost: 0.00, packPrice: 0.00, unitsPerPack: 50, stock: 0.0 },
    { id: 247, name: 'SKOL LATA 12X350ML', category: 'CERVEJAS', unitOfMeasure: 'Fardo', cost: 28.00, packPrice: 29.90, unitsPerPack: 12, stock: 28.0 },
    { id: 248, name: 'SKOL PURO MALTE 12X350ML', category: 'CERVEJAS', unitOfMeasure: 'Fardo', cost: 30.00, packPrice: 31.90, unitsPerPack: 12, stock: 0.0 },
    { id: 249, name: 'SKOL BEATS SENSE 8X269ML', category: 'DRINKS', unitOfMeasure: 'Fardo', cost: 28.80, packPrice: 29.90, unitsPerPack: 8, stock: 0.0 },
    { id: 250, name: 'SKOL BEATS SPIRIT 8X269ML', category: 'DRINKS', unitOfMeasure: 'Fardo', cost: 28.80, packPrice: 29.90, unitsPerPack: 8, stock: 0.0 },
    { id: 251, name: 'SKOL BEATS ULTIMATE 8X269ML', category: 'DRINKS', unitOfMeasure: 'Fardo', cost: 28.80, packPrice: 29.90, unitsPerPack: 8, stock: 0.0 },
    { id: 252, name: 'SUCO DEL VALLE LARANJA 1L', category: 'SUCOS', unitOfMeasure: 'Unidade', cost: 5.00, packPrice: 5.50, unitsPerPack: 1, stock: 0.0 },
    { id: 253, name: 'SUCO DEL VALLE UVA 1L', category: 'SUCOS', unitOfMeasure: 'Unidade', cost: 5.00, packPrice: 5.50, unitsPerPack: 1, stock: 0.0 },
    { id: 254, name: 'SUCO DEL VALLE UVA 6X1L', category: 'SUCOS', unitOfMeasure: 'Fardo', cost: 30.00, packPrice: 33.00, unitsPerPack: 6, stock: 0.0 },
    { id: 255, name: 'SUCO PRATICO CAJU 1L', category: 'SUCOS', unitOfMeasure: 'Unidade', cost: 0.00, packPrice: 6.00, unitsPerPack: 1, stock: 0.0 },
    { id: 256, name: 'SUCO PRATICO UVA 1L', category: 'SUCOS', unitOfMeasure: 'Unidade', cost: 0.00, packPrice: 6.00, unitsPerPack: 1, stock: 0.0 },
    { id: 257, name: 'SUCO TANG LARANJA 25G', category: 'SUCOS', unitOfMeasure: 'Unidade', cost: 0.00, packPrice: 1.00, unitsPerPack: 1, stock: 0.0 },
    { id: 258, name: 'SUCO TANG UVA 25G', category: 'SUCOS', unitOfMeasure: 'Unidade', cost: 0.00, packPrice: 1.00, unitsPerPack: 1, stock: 0.0 },
    { id: 259, name: 'VINHO SANTA HELENA 750ML', category: 'VINHOS', unitOfMeasure: 'Unidade', cost: 25.00, packPrice: 27.00, unitsPerPack: 1, stock: 0.0 },
    { id: 260, name: 'VODKA SMIRNOFF 1L', category: 'VODKAS', unitOfMeasure: 'Unidade', cost: 35.00, packPrice: 37.00, unitsPerPack: 1, stock: 1.0 },
    { id: 261, name: 'WHISCK BUCHANANS 12ANOS 1L', category: 'WHISCKS', unitOfMeasure: 'Unidade', cost: 120.00, packPrice: 125.00, unitsPerPack: 1, stock: 0.0 },
    { id: 262, name: 'YPIOCA EMPALHADA PRATA 700ML', category: 'CACHAÇA', unitOfMeasure: 'Fardo', cost: 0.00, packPrice: 32.90, unitsPerPack: 1, stock: 0.0 },
    { id: 263, name: 'YPIOCA GUARANA CX 12X1L', category: 'CACHAÇA', unitOfMeasure: 'Caixa', cost: 214.08, packPrice: 218.90, unitsPerPack: 12, stock: 4.0 },
    { id: 264, name: 'YPIOCA GUARANA UNIDADE', category: 'CACHAÇA', unitOfMeasure: 'Unidade', cost: 17.84, packPrice: 19.90, unitsPerPack: 1, stock: 37.0 },
    { id: 265, name: 'YPIOCA LIMA LIMÃO CX 12X1L', category: 'CACHAÇA', unitOfMeasure: 'Caixa', cost: 204.95, packPrice: 209.90, unitsPerPack: 12, stock: 18.0 },
    { id: 266, name: 'YPIOCA LIMA LIMÃO UNIDADE', category: 'CACHAÇA', unitOfMeasure: 'Unidade', cost: 17.08, packPrice: 17.70, unitsPerPack: 1, stock: 19.0 },
    { id: 267, name: 'YPIOCA MESTRE OURO CX 12X965ML', category: 'CACHAÇA', unitOfMeasure: 'Caixa', cost: 289.90, packPrice: 295.90, unitsPerPack: 12, stock: 3.0 },
];
const initialProducts = initialProductsRaw.map(p => ({
    ...p,
    price: calculatePrice(p.packPrice, p.unitsPerPack),
    // Normalize unit of measure
    unitOfMeasure: p.unitOfMeasure.charAt(0).toUpperCase() + p.unitOfMeasure.slice(1).toLowerCase(),
}));

const initialCategories = [...new Set(initialProducts.map(p => p.category))].sort();
const initialUnits = [...new Set(initialProducts.map(p => p.unitOfMeasure))].sort();

const ProductsContext = createContext<ProductsContextType | undefined>(undefined);

// Helper functions to get initial state from localStorage
const getInitialState = <T,>(key: string, defaultValue: T): T => {
    if (typeof window !== 'undefined') {
        const storedValue = localStorage.getItem(key);
        if (storedValue) {
            try {
                // If the stored value is for the initial hardcoded products, don't use it.
                // This is a simple check; a more robust solution might involve versioning.
                if (key === 'products' && JSON.parse(storedValue).length < initialProducts.length) {
                    return defaultValue;
                }
                return JSON.parse(storedValue);
            } catch (error) {
                console.error(`Error parsing localStorage key "${key}":`, error);
                return defaultValue;
            }
        }
    }
    return defaultValue;
};


export const ProductsProvider = ({ children }: { children: ReactNode }) => {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [productCounter, setProductCounter] = useState<number>(initialProducts.length + 1);
  const [categories, setCategories] = useState<string[]>(initialCategories);
  const [unitsOfMeasure, setUnitsOfMeasure] = useState<string[]>(initialUnits);
  const [isLoaded, setIsLoaded] = useState(false);
  
  const { toast } = useToast();
  
  useEffect(() => {
    // Load from localStorage only on the client side after the component has mounted
    setProducts(getInitialState('products', initialProducts));
    setProductCounter(getInitialState('productCounter', initialProducts.length + 1));
    setCategories(getInitialState('categories', initialCategories));
    setUnitsOfMeasure(getInitialState('unitsOfMeasure', initialUnits));
    setIsLoaded(true);
  }, []);

  // Effect to save state to localStorage whenever it changes, but only after initial load
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('products', JSON.stringify(products));
    }
  }, [products, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('productCounter', JSON.stringify(productCounter));
    }
  }, [productCounter, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('categories', JSON.stringify(categories));
    }
  }, [categories, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('unitsOfMeasure', JSON.stringify(unitsOfMeasure));
    }
  }, [unitsOfMeasure, isLoaded]);


  const addProduct = (productData: Omit<Product, 'id' | 'price'>) => {
    const newProduct: Product = {
      ...productData,
      id: productCounter,
      price: calculatePrice(productData.packPrice, productData.unitsPerPack),
    };
    setProducts(prevProducts => [...prevProducts, newProduct]);
    setProductCounter(prev => prev + 1);
  };

  const updateProduct = (productId: number, productData: Omit<Product, 'id' | 'price'>) => {
    setProducts(currentProducts =>
      currentProducts.map(p =>
        p.id === productId ? { 
            ...p, 
            ...productData, 
            id: productId, 
            price: calculatePrice(productData.packPrice, productData.unitsPerPack) 
        } : p
      )
    );
  };
  
  const loadProducts = (newProducts: Omit<Product, 'price'>[]) => {
    const productsWithPrice = newProducts.map(p => ({
      ...p,
      price: calculatePrice(p.packPrice, p.unitsPerPack)
    }));
    setProducts(productsWithPrice);

    const maxId = Math.max(0, ...productsWithPrice.map(p => p.id));
    setProductCounter(maxId + 1);
    
    const newCategories = Array.from(new Set(productsWithPrice.map(p => p.category))).sort();
    setCategories(newCategories);

    const newUnits = Array.from(new Set(productsWithPrice.map(p => p.unitOfMeasure))).sort();
    setUnitsOfMeasure(newUnits);
  };

  const updateStock = (items: CartItem[], operation: 'increase' | 'decrease') => {
    setProducts(currentProducts => {
      const updatedProducts = [...currentProducts];
      items.forEach(item => {
        const productIndex = updatedProducts.findIndex(p => p.id === item.id);
        if (productIndex !== -1) {
          const newStock = operation === 'increase'
            ? updatedProducts[productIndex].stock + item.quantity
            : updatedProducts[productIndex].stock - item.quantity;
          
          updatedProducts[productIndex] = {
            ...updatedProducts[productIndex],
            stock: newStock,
          };
        }
      });
      return updatedProducts;
    });
  };

  const decreaseStock = (items: CartItem[]) => {
    updateStock(items, 'decrease');
  };

  const increaseStock = (items: CartItem[]) => {
    updateStock(items, 'increase');
  };

  const getProductById = (id: number) => {
    return products.find(p => p.id === id);
  };
  
  const resetProducts = () => {
    setProducts([]);
    setProductCounter(1);
    setCategories([]);
    setUnitsOfMeasure([]);
    if(typeof window !== 'undefined'){
        localStorage.removeItem('products');
        localStorage.removeItem('productCounter');
        localStorage.removeItem('categories');
        localStorage.removeItem('unitsOfMeasure');
    }
  }

  const addCategory = (category: string) => {
    if (category && !categories.includes(category)) {
      setCategories(prev => [...prev, category].sort());
    }
  };

  const updateCategory = (oldCategory: string, newCategory: string) => {
    if (!newCategory || newCategory === oldCategory) return;
    setCategories(prev => prev.map(c => c === oldCategory ? newCategory : c).sort());
    setProducts(prev => prev.map(p => p.category === oldCategory ? { ...p, category: newCategory } : p));
  };

  const deleteCategory = (category: string) => {
    const isCategoryInUse = products.some(p => p.category === category);
    if (isCategoryInUse) {
        toast({
            title: "Categoria em uso",
            description: "Não é possível excluir uma categoria que está sendo usada por produtos.",
            variant: "destructive",
        });
        return;
    }
    setCategories(prev => prev.filter(c => c !== category));
  };
  
  const addUnitOfMeasure = (unit: string) => {
    if (unit && !unitsOfMeasure.includes(unit)) {
        setUnitsOfMeasure(prev => [...prev, unit].sort());
    }
  };

  const updateUnitOfMeasure = (oldUnit: string, newUnit: string) => {
    if (!newUnit || newUnit === oldUnit) return;
    setUnitsOfMeasure(prev => prev.map(u => u === oldUnit ? newUnit : u).sort());
    setProducts(prev => prev.map(p => p.unitOfMeasure === oldUnit ? { ...p, unitOfMeasure: newUnit } : p));
  };

  const deleteUnitOfMeasure = (unit: string) => {
    const isUnitInUse = products.some(p => p.unitOfMeasure === unit);
    if (isUnitInUse) {
        toast({
            title: "Unidade de medida em uso",
            description: "Não é possível excluir uma unidade de medida que está sendo usada por produtos.",
            variant: "destructive",
        });
        return;
    }
    setUnitsOfMeasure(prev => prev.filter(u => u !== unit));
  };


  return (
    <ProductsContext.Provider value={{ 
      products, addProduct, updateProduct, decreaseStock, increaseStock, getProductById, resetProducts, loadProducts,
      categories, unitsOfMeasure, addCategory, updateCategory, deleteCategory,
      addUnitOfMeasure, updateUnitOfMeasure, deleteUnitOfMeasure
    }}>
      {children}
    </ProductsContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductsContext);
  if (context === undefined) {
    throw new Error('useProducts must be used within a ProductsProvider');
  }
  return context;
};
