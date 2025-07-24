
'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useSales } from './SalesContext'; 
import { useOrders } from './OrdersContext';

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
  deleteProduct: (productId: number) => void;
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

const initialProducts: Product[] = [
  {id: 1, name: 'AGUA DE COCO MAIS COCO 1L', category: 'ÀGUAS', unitOfMeasure: 'UNIDADE', cost: 13.64, packPrice: 15.9, unitsPerPack: 1, stock: 0, price: 15.9},
  {id: 2, name: 'AGUA DE COCO SOCOCO FRUTAS 200ML', category: 'ÀGUAS', unitOfMeasure: 'UNIDADE', cost: 2.46, packPrice: 3.9, unitsPerPack: 1, stock: 8, price: 3.9},
  {id: 3, name: 'AGUA DE COCO SOCOCO MARACUJA 200ML', category: 'ÀGUAS', unitOfMeasure: 'UNIDADE', cost: 2.46, packPrice: 3.9, unitsPerPack: 1, stock: 3, price: 3.9},
  {id: 4, name: 'AGUA DE COCO SOCOCO MELANCIA 200ML', category: 'ÀGUAS', unitOfMeasure: 'UNIDADE', cost: 2.46, packPrice: 3.9, unitsPerPack: 1, stock: 6, price: 3.9},
  {id: 5, name: 'AGUA DE COCO SOCOCO TANGERINA 200ML', category: 'ÀGUAS', unitOfMeasure: 'UNIDADE', cost: 2.46, packPrice: 3.9, unitsPerPack: 1, stock: 2, price: 3.9},
  {id: 6, name: 'AGUA SERRA GRANDE 1,5L', category: 'ÀGUAS', unitOfMeasure: 'FARDO', cost: 0, packPrice: 0.03, unitsPerPack: 6, stock: 0, price: 0.005},
  {id: 7, name: 'AGUA SERRA GRANDE 12X510ML', category: 'ÀGUAS', unitOfMeasure: 'Fardo', cost: 0, packPrice: 0, unitsPerPack: 12, stock: 0, price: 0},
  {id: 8, name: 'AGUA SERRA GRANDE 5L', category: 'ÀGUAS', unitOfMeasure: 'Unidade', cost: 0, packPrice: 0, unitsPerPack: 1, stock: 0, price: 0},
  {id: 9, name: 'AGUA SERRA GRANDE COM GÁS 12X510ML', category: 'ÀGUAS', unitOfMeasure: 'Fardo', cost: 0, packPrice: 0, unitsPerPack: 12, stock: 0, price: 0},
  {id: 10, name: 'AGUÁ CRYSTAL COM GAS 12X500ML', category: 'ÀGUAS', unitOfMeasure: 'Fardo', cost: 19.32, packPrice: 20, unitsPerPack: 12, stock: 10, price: 1.6666666666666667},
  {id: 11, name: 'AMENDOIM CROKISSIMO SANTA HELENA 36UNID', category: 'BOMBONIERE', unitOfMeasure: 'UNIDADE', cost: 18.5, packPrice: 19.95, unitsPerPack: 1, stock: 13, price: 19.95},
  {id: 12, name: 'AMENDOIM DORI CART JAPONES 10X5', category: 'BOMBONIERE', unitOfMeasure: 'CAIXA', cost: 33, packPrice: 34.9, unitsPerPack: 50, stock: 2, price: 0.698},
  {id: 13, name: 'AMENDOIM JAPONES 145G 4UND', category: 'BOMBONIERE', unitOfMeasure: 'Fardo', cost: 0, packPrice: 0, unitsPerPack: 1, stock: 0, price: 0},
  {id: 14, name: 'AMSTEL LATA 12X350ML', category: 'CERVEJAS', unitOfMeasure: 'FARDO', cost: 33.12, packPrice: 34.9, unitsPerPack: 12, stock: 0, price: 2.9083333333333335},
  {id: 15, name: 'APEROL 1L', category: 'APERITIVO', unitOfMeasure: 'UNIDADE', cost: 36.95, packPrice: 39.9, unitsPerPack: 1, stock: 29, price: 39.9},
  {id: 16, name: 'ATITUTTY DE CAJU 12X300ML', category: 'REFRIGERANTES', unitOfMeasure: 'FARDO', cost: 10.75, packPrice: 11.5, unitsPerPack: 12, stock: 67, price: 0.9583333333333334},
  {id: 17, name: 'ATITUTTY GUARANA 12X300ML', category: 'REFRIGERANTES', unitOfMeasure: 'FARDO', cost: 10.75, packPrice: 11.5, unitsPerPack: 12, stock: 25, price: 0.9583333333333334},
  {id: 18, name: 'ATITUTTY UVA 12X300ML', category: 'REFRIGERANTES', unitOfMeasure: 'FARDO', cost: 10.75, packPrice: 11.5, unitsPerPack: 12, stock: 17, price: 0.9583333333333334},
  {id: 19, name: 'BACON MINEIRO FD12X35G', category: 'BOMBONIERE', unitOfMeasure: 'Fardo', cost: 11.3, packPrice: 11.8, unitsPerPack: 12, stock: 48, price: 0.9833333333333333},
  {id: 20, name: 'BALA DORI YOGURTE MORANGO', category: 'BOMBONIERE', unitOfMeasure: 'Unidade', cost: 0, packPrice: 0, unitsPerPack: 1, stock: 0, price: 0},
  {id: 21, name: 'BALA ICEKISS CEREJA', category: 'BOMBONIERE', unitOfMeasure: 'UNIDADE', cost: 6.8, packPrice: 7.3, unitsPerPack: 1, stock: 28, price: 7.3},
  {id: 22, name: 'BALA ICEKISS EUCALIPTO', category: 'BOMBONIERE', unitOfMeasure: 'UNIDADE', cost: 6.8, packPrice: 7.3, unitsPerPack: 1, stock: 24, price: 7.3},
  {id: 23, name: 'BALA ICEKISS EXT FORTE ', category: 'BOMBONIERE', unitOfMeasure: 'UNIDADE', cost: 6.8, packPrice: 7.3, unitsPerPack: 1, stock: 29, price: 7.3},
  {id: 24, name: 'BALA ICEKISS MENTA ', category: 'BOMBONIERE', unitOfMeasure: 'UNIDADE', cost: 6.8, packPrice: 7.3, unitsPerPack: 1, stock: 31, price: 7.3},
  {id: 25, name: 'BALA ICEKISS SORTIDA ', category: 'BOMBONIERE', unitOfMeasure: 'UNIDADE', cost: 6.8, packPrice: 7.3, unitsPerPack: 1, stock: 12, price: 7.3},
  {id: 26, name: 'BALA MEL SAMS 500ML', category: 'BOMBONIERE', unitOfMeasure: 'UNIDADE', cost: 7.5, packPrice: 8, unitsPerPack: 1, stock: 2, price: 8},
  {id: 27, name: 'BALA PIPPER SAMS 500G', category: 'BOMBONIERE', unitOfMeasure: 'Unidade', cost: 0, packPrice: 8.8, unitsPerPack: 1, stock: 0, price: 8.8},
  {id: 28, name: 'BALA SANTA RITA MAST MENTA 500G', category: 'BOMBONIERE', unitOfMeasure: 'UNIDADE', cost: 6.8, packPrice: 7.2, unitsPerPack: 1, stock: 8, price: 7.2},
  {id: 29, name: 'BALA SANTA RITA MAST SORT 500G', category: 'BOMBONIERE', unitOfMeasure: 'UNIDADE', cost: 6.8, packPrice: 7.2, unitsPerPack: 1, stock: 30, price: 7.2},
  {id: 30, name: 'BALY MAÇÃ VERDE 6X2L', category: 'ENÈRGETICOS', unitOfMeasure: 'FARDO', cost: 66.25, packPrice: 68.9, unitsPerPack: 6, stock: 12, price: 11.483333333333333},
  {id: 31, name: 'BALY MELÂNCIA 6X2L', category: 'ENÈRGETICOS', unitOfMeasure: 'FARDO', cost: 66.18, packPrice: 68.9, unitsPerPack: 6, stock: 69, price: 11.483333333333333},
  {id: 32, name: 'BALY MORANGO E PESSÊGO 6X2L', category: 'ENÈRGETICOS', unitOfMeasure: 'FARDO', cost: 66.23, packPrice: 68.9, unitsPerPack: 6, stock: 13, price: 11.483333333333333},
  {id: 33, name: 'BALY TRADICIONAL 6X2L', category: 'ENÈRGETICOS', unitOfMeasure: 'FARDO', cost: 66.25, packPrice: 68.9, unitsPerPack: 6, stock: 18, price: 11.483333333333333},
  {id: 34, name: 'BANDEJA DE DOCINHOS 12UNI', category: 'BOMBONIERE', unitOfMeasure: 'Fardo', cost: 0, packPrice: 9, unitsPerPack: 1, stock: 0, price: 9},
  {id: 35, name: 'BATON GAROTO UNIDADE MERCEARIA', category: 'BOMBONIERE', unitOfMeasure: 'UNIDADE', cost: 1.18, packPrice: 2, unitsPerPack: 1, stock: 6, price: 2},
  {id: 36, name: 'BEATS CAIPIRINHA LATA 8X269ML', category: 'DRINKS', unitOfMeasure: 'Fardo', cost: 0, packPrice: 34.9, unitsPerPack: 8, stock: 0, price: 4.3625},
  {id: 37, name: 'BEATS GT LATA 8X269ML', category: 'DRINKS', unitOfMeasure: 'FARDO', cost: 32, packPrice: 33.9, unitsPerPack: 8, stock: 0, price: 4.2375},
  {id: 38, name: 'BEATS RED MIX L/N 12X269ML', category: 'DRINKS', unitOfMeasure: 'Fardo', cost: 0, packPrice: 0, unitsPerPack: 12, stock: 0, price: 0},
  {id: 39, name: 'BEATS RED MIX LATA 8X269ML', category: 'DRINKS', unitOfMeasure: 'Fardo', cost: 38.34, packPrice: 39.9, unitsPerPack: 8, stock: 0, price: 4.9875},
  {id: 40, name: 'BEATS TROPICAL LATA 8X269ML', category: 'DRINKS', unitOfMeasure: 'FARDO', cost: 32.09, packPrice: 34.9, unitsPerPack: 8, stock: 0, price: 4.3625},
  {id: 41, name: 'BECKS LATA 8X350ML', category: 'CERVEJAS', unitOfMeasure: 'UNID', cost: 0, packPrice: 0, unitsPerPack: 8, stock: 0, price: 0},
  {id: 42, name: 'BISC AMORI CHOCOLATE 36X125G', category: 'BOMBONIERE', unitOfMeasure: 'CAIXA', cost: 65.9, packPrice: 67.9, unitsPerPack: 36, stock: 9, price: 1.886111111111111},
  {id: 43, name: 'BOHEMIA LATA 12X3350ML', category: 'CERVEJAS', unitOfMeasure: 'FARDO', cost: 31.75, packPrice: 32.9, unitsPerPack: 12, stock: 194, price: 2.7416666666666666},
  {id: 44, name: 'BOMBOM GAROTO SORTIDO CX 250G', category: 'BOMBONIERE', unitOfMeasure: 'Unidade', cost: 0, packPrice: 13.5, unitsPerPack: 1, stock: 0, price: 13.5},
  {id: 45, name: 'BOMBOM LACTA SORTIDO CX 250G', category: 'BOMBONIERE', unitOfMeasure: 'UNIDADE', cost: 11, packPrice: 11.9, unitsPerPack: 1, stock: 30, price: 11.9},
  {id: 46, name: 'BOMBOM NESTLE SORTIDO CX 251G', category: 'BOMBONIERE', unitOfMeasure: 'UNIDADE', cost: 11, packPrice: 11.9, unitsPerPack: 1, stock: 0, price: 11.9},
  {id: 47, name: 'BOMBOM SERENATA DE AMOR ', category: 'BOMBONIERE', unitOfMeasure: 'UNIDADE', cost: 37.07, packPrice: 41.9, unitsPerPack: 1, stock: 16, price: 41.9},
  {id: 48, name: 'BOMBOM SONHO DE VALSA', category: 'BOMBONIERE', unitOfMeasure: 'Unidade', cost: 44, packPrice: 45.5, unitsPerPack: 1, stock: 10, price: 45.5},
  {id: 49, name: 'BOMBOM SONHO/OURO', category: 'BOMBONIERE', unitOfMeasure: 'Unidade', cost: 0, packPrice: 13.5, unitsPerPack: 1, stock: 0, price: 13.5},
  {id: 50, name: 'BOMBOM SORTIDO OURO BRANCO 1KG', category: 'BOMBONIERE', unitOfMeasure: 'UNIDADE', cost: 44, packPrice: 45.5, unitsPerPack: 1, stock: 11, price: 45.5},
  {id: 51, name: 'BRAHAMA 350ML LATA MERCEARIA', category: 'CERVEJAS', unitOfMeasure: 'UNIDADE', cost: 3.25, packPrice: 4.5, unitsPerPack: 1, stock: 8, price: 4.5},
  {id: 52, name: 'BRAHMA DUPLO MALTE LATA 12X350ML', category: 'CERVEJAS', unitOfMeasure: 'FARDO', cost: 38.5, packPrice: 39.5, unitsPerPack: 12, stock: 1356, price: 3.2916666666666665},
  {id: 53, name: 'BRAHMA L/N 24X330ML', category: 'CERVEJAS', unitOfMeasure: 'FARDO', cost: 0, packPrice: 0, unitsPerPack: 24, stock: 0, price: 0},
  {id: 54, name: 'SccCmzBNXfJ2HurQRMmA', category: 'BOMBONIERE', unitOfMeasure: 'CAIXA', cost: 108, packPrice: 110.9, unitsPerPack: 24, stock: 312, price: 4.620833333333333},
  {id: 55, name: 'BUDWEISER L/N 330ML MERCEARIA', category: 'CERVEJAS', unitOfMeasure: 'UNIDADE', cost: 4.91, packPrice: 6, unitsPerPack: 1, stock: 8, price: 6},
  {id: 56, name: 'BUDWEISER LATA 12X350ML', category: 'CERVEJAS', unitOfMeasure: 'FARDO', cost: 39.5, packPrice: 41.5, unitsPerPack: 12, stock: 88, price: 3.4583333333333335},
  {id: 57, name: 'BUDWEISER LATA ZERO 8X350ML', category: 'CERVEJAS', unitOfMeasure: 'FARDO', cost: 27.27, packPrice: 28.8, unitsPerPack: 8, stock: 8, price: 3.6},
  {id: 58, name: 'CABARE ICE FRUTAS VERMELHA 12X275ML', category: 'VODKAS', unitOfMeasure: 'FARDO', cost: 68, packPrice: 70.9, unitsPerPack: 12, stock: 56, price: 5.908333333333333},
  {id: 59, name: 'CABARE ICE LIMÃO 12X275ML', category: 'VODKAS', unitOfMeasure: 'FARDO', cost: 67.66, packPrice: 69.9, unitsPerPack: 12, stock: 300, price: 5.825},
  {id: 60, name: 'CACHAÇA VALE REAL PRATA 12X48OML', category: 'CACHAÇA', unitOfMeasure: 'FARDO', cost: 23.7, packPrice: 25.9, unitsPerPack: 12, stock: 29, price: 2.1583333333333335},
  {id: 61, name: 'CACHAÇA 51 OURO CAIXA', category: 'CACHAÇA', unitOfMeasure: 'CAIXA', cost: 144.78, packPrice: 146.5, unitsPerPack: 1, stock: 75, price: 146.5},
  {id: 62, name: 'CACHAÇA 51 OURO UNIDADE', category: 'CACHAÇA', unitOfMeasure: 'UNIDADE', cost: 12.06, packPrice: 12.65, unitsPerPack: 1, stock: 24, price: 12.65},
  {id: 63, name: 'CACHAÇA 51 PRATA CAIXA ', category: 'CACHAÇA', unitOfMeasure: 'CAIXA', cost: 115, packPrice: 117.5, unitsPerPack: 12, stock: 62, price: 9.791666666666666},
  {id: 64, name: 'CACHAÇA 51 PRATA UNIDADE', category: 'CACHAÇA', unitOfMeasure: 'UNIDADE', cost: 9.58, packPrice: 10.5, unitsPerPack: 1, stock: 24, price: 10.5},
  {id: 65, name: 'CACHAÇA BANANAZINHA 900ML', category: 'CACHAÇA', unitOfMeasure: 'UNIDADE', cost: 35, packPrice: 38.9, unitsPerPack: 1, stock: 2, price: 38.9},
  {id: 66, name: 'CACHAÇA CABARE AMBURANA 700ML', category: 'CACHAÇA', unitOfMeasure: 'Unidade', cost: 0, packPrice: 37.7, unitsPerPack: 1, stock: 0, price: 37.7},
  {id: 67, name: 'CACHAÇA CABARE OURO 700ML', category: 'CACHAÇA', unitOfMeasure: 'Unidade', cost: 0, packPrice: 35.4, unitsPerPack: 1, stock: 0, price: 35.4},
  {id: 68, name: 'CACHAÇA CABARE PRATA 700ML', category: 'CACHAÇA', unitOfMeasure: 'Unidade', cost: 0, packPrice: 0, unitsPerPack: 1, stock: 0, price: 0},
  {id: 69, name: 'CACHAÇA CARANGUEJO 12X480ML', category: 'CACHAÇA', unitOfMeasure: 'FARDO', cost: 28, packPrice: 29.9, unitsPerPack: 12, stock: 74, price: 2.4916666666666665},
  {id: 70, name: 'CACHAÇA D OURO OURO 12X480ML', category: 'CACHAÇA', unitOfMeasure: 'FARDO', cost: 30.5, packPrice: 31.4, unitsPerPack: 12, stock: 21, price: 2.6166666666666667},
  {id: 71, name: 'CACHAÇA D OURO PRATA 12X480ML', category: 'CACHAÇA', unitOfMeasure: 'FARDO', cost: 29.82, packPrice: 30.7, unitsPerPack: 12, stock: 81, price: 2.5583333333333335},
  {id: 72, name: 'CACHAÇA VALE REAL OURO 12X480ML', category: 'CACHAÇA', unitOfMeasure: 'FARDO', cost: 25.01, packPrice: 25.9, unitsPerPack: 12, stock: 8, price: 2.1583333333333335},
  {id: 73, name: 'CAJUINA LATA MERCEARIA', category: 'REFRIGERANTES', unitOfMeasure: 'UNIDADE', cost: 2.66, packPrice: 4, unitsPerPack: 1, stock: 2, price: 4},
  {id: 74, name: 'CAJUINA MINI MERCEARIA', category: 'REFRIGERANTES', unitOfMeasure: 'UNIDADE', cost: 1.56, packPrice: 2.5, unitsPerPack: 1, stock: 11, price: 2.5},
  {id: 75, name: 'CAJUINA SÃO GERALDO 2L', category: 'REFRIGERANTES', unitOfMeasure: 'FARDO', cost: 49.08, packPrice: 52.9, unitsPerPack: 6, stock: 1, price: 8.816666666666666},
  {id: 76, name: 'CAJUINA SÃO GERALDO 6X1L', category: 'REFRIGERANTES', unitOfMeasure: 'FARDO', cost: 31.92, packPrice: 33.9, unitsPerPack: 6, stock: 17, price: 5.65},
  {id: 77, name: 'CAJUINA SÃO GERALDO LATA 12X3350ML', category: 'REFRIGERANTES', unitOfMeasure: 'FARDO', cost: 32, packPrice: 33.4, unitsPerPack: 12, stock: 34, price: 2.783333333333333},
  {id: 78, name: 'CAJUINA SÃO GERALDO LATA ZERO 12X350ML', category: 'REFRIGERANTES', unitOfMeasure: 'FARDO', cost: 31.5, packPrice: 32.9, unitsPerPack: 12, stock: 1, price: 2.7416666666666666},
  {id: 79, name: 'CAJUINA SÃO GERALDO MINI 12X200ML', category: 'REFRIGERANTES', unitOfMeasure: 'Fardo', cost: 20, packPrice: 21.5, unitsPerPack: 12, stock: 19, price: 1.7916666666666667},
  {id: 80, name: 'CAMPARI 900ML CAIXA', category: 'APERITIVO', unitOfMeasure: 'CAIXA', cost: 528, packPrice: 546, unitsPerPack: 12, stock: 3, price: 45.5},
  {id: 81, name: 'CAMPARI 900ML UNIDADE', category: 'APERITIVO', unitOfMeasure: 'UNIDADE', cost: 44, packPrice: 46.5, unitsPerPack: 1, stock: 27, price: 46.5},
  {id: 82, name: 'CARVÃO VEGETAL VICTOR 3KL', category: 'CARVÃO', unitOfMeasure: 'Unidade', cost: 7, packPrice: 7.7, unitsPerPack: 1, stock: 0, price: 7.7},
  {id: 83, name: 'CAVALO BRANCO 1L UNIDADE', category: 'WHISCKS', unitOfMeasure: 'UNIDADE', cost: 55.75, packPrice: 58.9, unitsPerPack: 1, stock: 17, price: 58.9},
  {id: 84, name: 'CAVALO BRANCO CAIXA 12X1L', category: 'WHISCKS', unitOfMeasure: 'CAIXA', cost: 669, packPrice: 694.8, unitsPerPack: 12, stock: 16, price: 57.9},
  {id: 85, name: 'CEBOLITOS 10X21GR', category: 'BOMBONIERE', unitOfMeasure: 'UNIDADE', cost: 8.6, packPrice: 9.4, unitsPerPack: 1, stock: 16, price: 9.4},
  {id: 86, name: 'CEBOLITOS 45G UNIDADE', category: 'BOMBONIERE', unitOfMeasure: 'UNIDADE', cost: 3.05, packPrice: 3.4, unitsPerPack: 1, stock: 0, price: 3.4},
  {id: 87, name: 'CEBOLITOS UNIDADE MERCEARIA', category: 'BOMBONIERE', unitOfMeasure: 'UNIDADE', cost: 3.4, packPrice: 4, unitsPerPack: 1, stock: 3, price: 4},
  {id: 88, name: 'CHANDON 1,5L BRUT ROSE', category: 'CHAMPANHE', unitOfMeasure: 'Unidade', cost: 0, packPrice: 0, unitsPerPack: 1, stock: 0, price: 0},
  {id: 89, name: 'CHANDON BRUT ROSE 750ML', category: 'CHAMPANHE', unitOfMeasure: 'Unidade', cost: 0, packPrice: 0, unitsPerPack: 1, stock: 0, price: 0},
  {id: 90, name: 'CHANDON PASSION ROSE 750ML', category: 'CHAMPANHE', unitOfMeasure: 'Unidade', cost: 0, packPrice: 0, unitsPerPack: 1, stock: 0, price: 0},
  {id: 91, name: 'CHEETOS UNIDADE MERCEARIA', category: 'BOMBONIERE', unitOfMeasure: 'UNIDADE', cost: 2.4, packPrice: 3.5, unitsPerPack: 1, stock: 5, price: 3.5},
  {id: 92, name: 'CHEETOS BOLA QUEIJO SUIÇO 33G', category: 'BOMBONIERE', unitOfMeasure: 'Unidade', cost: 2.4, packPrice: 2.6, unitsPerPack: 1, stock: 38, price: 2.6},
  {id: 93, name: 'CHEETOS CRUNCHY 48G', category: 'BOMBONIERE', unitOfMeasure: 'UNIDADE', cost: 2.4, packPrice: 2.6, unitsPerPack: 1, stock: 9, price: 2.6},
  {id: 94, name: 'CHEETOS LUA 35G', category: 'BOMBONIERE', unitOfMeasure: 'UNIDADE', cost: 2.4, packPrice: 2.6, unitsPerPack: 1, stock: 12, price: 2.6},
  {id: 95, name: 'CHEETOS ONDA REQUEIJÃO 10 UNIDADES', category: 'BOMBONIERE', unitOfMeasure: 'Fardo', cost: 8.6, packPrice: 9.4, unitsPerPack: 1, stock: 11, price: 9.4},
  {id: 96, name: 'CHEETOS ONDA REQUEIJÃO 40G', category: 'BOMBONIERE', unitOfMeasure: 'Unidade', cost: 2.4, packPrice: 2.6, unitsPerPack: 1, stock: 39, price: 2.6},
  {id: 97, name: 'CHEETOS PIMENTA MEXICANA 47G', category: 'BOMBONIERE', unitOfMeasure: 'UNIDADE', cost: 2.4, packPrice: 2.6, unitsPerPack: 1, stock: 49, price: 2.6},
  {id: 98, name: 'CHICLE BIGBIG HORTELÃ 315G', category: 'BOMBONIERE', unitOfMeasure: 'UNIDADE', cost: 7.5, packPrice: 7.8, unitsPerPack: 1, stock: 3, price: 7.8},
  {id: 99, name: 'CHICLE BIGBIG MORANGO 315G', category: 'BOMBONIERE', unitOfMeasure: 'Unidade', cost: 7.5, packPrice: 7.8, unitsPerPack: 1, stock: 1, price: 7.8},
  {id: 100, name: 'CHICLE BIGBIG TUTTI FRUT 315G', category: 'BOMBONIERE', unitOfMeasure: 'UNIDADE', cost: 7.5, packPrice: 7.8, unitsPerPack: 1, stock: 3, price: 7.8},
  {id: 101, name: 'CHICLE BIGBIG UVA 315G', category: 'BOMBONIERE', unitOfMeasure: 'UNIDADE', cost: 7.5, packPrice: 7.8, unitsPerPack: 1, stock: 4, price: 7.8},
  {id: 102, name: 'CHICLE CLISS CARTELA HORTELÃ 12X1', category: 'BOMBONIERE', unitOfMeasure: 'UNIDADE', cost: 7.5, packPrice: 8.5, unitsPerPack: 1, stock: 8, price: 8.5},
  {id: 103, name: 'CHICLE CLISS CARTELA MENTA 12X1', category: 'BOMBONIERE', unitOfMeasure: 'UNIDADE', cost: 7.5, packPrice: 8.9, unitsPerPack: 1, stock: 12, price: 8.9},
  {id: 104, name: 'CHICLE CLISS CARTELA TUTTI FRUT 12X1', category: 'BOMBONIERE', unitOfMeasure: 'Unidade', cost: 0, packPrice: 7.9, unitsPerPack: 12, stock: 0, price: 0.6583333333333333},
  {id: 105, name: 'CHICLE PLUTONITA BABA DE BRUXA', category: 'BOMBONIERE', unitOfMeasure: 'UNIDADE', cost: 6.9, packPrice: 7.1, unitsPerPack: 1, stock: 5, price: 7.1},
  {id: 106, name: 'CHICLE PLUTONITA CABEÇA DE ABOBORA 180G', category: 'BOMBONIERE', unitOfMeasure: 'UNIDADE', cost: 6.9, packPrice: 7.1, unitsPerPack: 1, stock: 9, price: 7.1},
  {id: 107, name: 'CHIVAS 12 ANOS', category: 'WHISCKS', unitOfMeasure: 'UNIDADE', cost: 94.8, packPrice: 97.9, unitsPerPack: 1, stock: 0, price: 97.9},
  {id: 108, name: 'CHOC BATON GAROTO BRANCO 30X16G', category: 'BOMBONIERE', unitOfMeasure: 'FARDO', cost: 33.77, packPrice: 35.9, unitsPerPack: 30, stock: 53, price: 1.1966666666666668},
  {id: 109, name: 'CHOC BATON GAROTO LEITE 30X160G', category: 'BOMBONIERE', unitOfMeasure: 'FARDO', cost: 34, packPrice: 36.9, unitsPerPack: 30, stock: 34, price: 1.23},
  {id: 110, name: 'CHOC BIS AO LEITE 16UND', category: 'BOMBONIERE', unitOfMeasure: 'UNIDADE', cost: 4.82, packPrice: 5.99, unitsPerPack: 1, stock: 95, price: 5.99},
  {id: 111, name: 'CHOC CROCANTE GAROTO 30X25G', category: 'BOMBONIERE', unitOfMeasure: 'Caixa', cost: 0, packPrice: 57.9, unitsPerPack: 30, stock: 0, price: 1.93},
  {id: 112, name: 'CHOC GAROTO CARIBE 30X28G', category: 'BOMBONIERE', unitOfMeasure: 'Caixa', cost: 0, packPrice: 60.9, unitsPerPack: 30, stock: 0, price: 2.03},
  {id: 113, name: 'CHOC MMS AO LEITE 18X45GR', category: 'BOMBONIERE', unitOfMeasure: 'FARDO', cost: 57.98, packPrice: 59.5, unitsPerPack: 18, stock: 0, price: 3.3055555555555554},
  {id: 114, name: 'CHOC MMS TUBO 12X30G', category: 'BOMBONIERE', unitOfMeasure: 'FARDO', cost: 42.5, packPrice: 43.7, unitsPerPack: 12, stock: 1, price: 3.6416666666666665},
  {id: 115, name: 'CHOC NESTLE CHOKITO 30X32G', category: 'BOMBONIERE', unitOfMeasure: 'CAIXA', cost: 58.61, packPrice: 59.9, unitsPerPack: 30, stock: 9, price: 1.9966666666666666},
  {id: 116, name: 'CHOC NESTLE LOLLO 30X32GR', category: 'BOMBONIERE', unitOfMeasure: 'CAIXA', cost: 59.02, packPrice: 60.9, unitsPerPack: 30, stock: 4, price: 2.03},
  {id: 117, name: 'CHOC NESTLE PRESTIGIO 30X33G', category: 'BOMBONIERE', unitOfMeasure: 'Caixa', cost: 0, packPrice: 58.9, unitsPerPack: 30, stock: 0, price: 1.9633333333333333},
  {id: 118, name: 'CHOC SNICKERS 20X45G', category: 'BOMBONIERE', unitOfMeasure: 'CAIXA', cost: 59, packPrice: 60.9, unitsPerPack: 20, stock: 21, price: 3.045},
  {id: 119, name: 'CHOC SNICKERS BRANCO 20X42G', category: 'BOMBONIERE', unitOfMeasure: 'FARDO', cost: 56.9, packPrice: 59.9, unitsPerPack: 20, stock: 2, price: 2.995},
  {id: 120, name: 'CHOC SNICKERS DARK 20X42GR', category: 'BOMBONIERE', unitOfMeasure: 'FARDO', cost: 57.6, packPrice: 59.9, unitsPerPack: 20, stock: 3, price: 2.995},
  {id: 121, name: 'CHOCOCANDY DISPLAY 11G', category: 'BOMBONIERE', unitOfMeasure: 'UNIDADE', cost: 12.5, packPrice: 13.5, unitsPerPack: 1, stock: 9, price: 13.5},
  {id: 122, name: 'CHUP DOCE DE LEITE 1,5K', category: 'BOMBONIERE', unitOfMeasure: 'Caixa', cost: 0, packPrice: 23.6, unitsPerPack: 1, stock: 0, price: 23.6},
  {id: 123, name: 'CIGARRO CLEAN BY CLICK', category: 'TABACARIA', unitOfMeasure: 'MAÇO', cost: 87.5, packPrice: 88.5, unitsPerPack: 12, stock: 1, price: 7.375},
  {id: 124, name: 'CIGARRO CLUB ONE BRANCO', category: 'TABACARIA', unitOfMeasure: 'Unidade', cost: 0, packPrice: 27.9, unitsPerPack: 1, stock: 0, price: 27.9},
  {id: 125, name: 'CIGARRO CLUB ONE VERMELHO', category: 'TABACARIA', unitOfMeasure: 'Unidade', cost: 0, packPrice: 27.9, unitsPerPack: 1, stock: 1, price: 27.9},
  {id: 126, name: 'CIGARRO CRETEC MENTHOL CARTEIRA', category: 'TABACARIA', unitOfMeasure: 'Unidade', cost: 17.4, packPrice: 19.4, unitsPerPack: 1, stock: 10, price: 19.4},
  {id: 127, name: 'CIGARRO DUNHILL', category: 'TABACARIA', unitOfMeasure: 'MAÇO', cost: 133.04, packPrice: 136.8, unitsPerPack: 10, stock: 16, price: 13.68},
  {id: 128, name: 'CIGARRO DUNHILL AZUL', category: 'TABACARIA', unitOfMeasure: 'MAÇO', cost: 98, packPrice: 100.9, unitsPerPack: 10, stock: 5, price: 10.09},
  {id: 129, name: 'CIGARRO DUNHILL DOUBLE REFRESH', category: 'TABACARIA', unitOfMeasure: 'MAÇO', cost: 132.2, packPrice: 134.4, unitsPerPack: 10, stock: 1, price: 13.44},
  {id: 130, name: 'CIGARRO DUNHILL PRATA', category: 'TABACARIA', unitOfMeasure: 'MAÇO', cost: 98, packPrice: 105.9, unitsPerPack: 10, stock: 0, price: 10.59},
  {id: 131, name: 'CIGARRO DUNHILL RED', category: 'TABACARIA', unitOfMeasure: 'MAÇO', cost: 99, packPrice: 108.5, unitsPerPack: 10, stock: 4, price: 10.85},
  {id: 132, name: 'CIGARRO GIFT BRANCO', category: 'TABACARIA', unitOfMeasure: 'MAÇO', cost: 26, packPrice: 28.9, unitsPerPack: 10, stock: 0, price: 2.89},
  {id: 133, name: 'CIGARRO GIFT VERMELHO', category: 'TABACARIA', unitOfMeasure: 'MAÇO', cost: 26, packPrice: 28.9, unitsPerPack: 10, stock: 60, price: 2.89},
  {id: 134, name: 'CIGARRO GLOBAL MERCEARIA', category: 'TABACARIA', unitOfMeasure: 'UNIDADE', cost: 7.08, packPrice: 9, unitsPerPack: 1, stock: 4, price: 9},
  {id: 135, name: 'CIGARRO GUDANG GARAM CARTEIRA', category: 'TABACARIA', unitOfMeasure: 'UNIDADE', cost: 24, packPrice: 26, unitsPerPack: 1, stock: 40, price: 26},
  {id: 136, name: 'CIGARRO GUDANG GARAN CARTEIRA', category: 'TABACARIA', unitOfMeasure: 'UNIDADE', cost: 24, packPrice: 26, unitsPerPack: 1, stock: 8, price: 26},
  {id: 137, name: 'CIGARRO K-LINT SILVER', category: 'TABACARIA', unitOfMeasure: 'MAÇO', cost: 58.36, packPrice: 59.9, unitsPerPack: 10, stock: 29, price: 5.99},
  {id: 138, name: 'CIGARRO KENT AZUL', category: 'TABACARIA', unitOfMeasure: 'MAÇO', cost: 102.98, packPrice: 112.9, unitsPerPack: 10, stock: 55, price: 11.29},
  {id: 139, name: 'CIGARRO KENT PRATA', category: 'TABACARIA', unitOfMeasure: 'MAÇO', cost: 109.5, packPrice: 112.9, unitsPerPack: 10, stock: 11, price: 11.29},
  {id: 140, name: 'CIGARRO LUCKY STRIKE DOUBLEICE', category: 'TABACARIA', unitOfMeasure: 'MAÇO', cost: 118, packPrice: 121.2, unitsPerPack: 10, stock: 30, price: 12.12},
  {id: 141, name: 'CIGARRO LUCKY STRIKE VERMELHO BOX', category: 'TABACARIA', unitOfMeasure: 'MAÇO', cost: 69.3, packPrice: 73.8, unitsPerPack: 10, stock: 39, price: 7.38},
  {id: 142, name: 'CIGARRO MARLBORO RED BOX', category: 'TABACARIA', unitOfMeasure: 'MAÇO', cost: 81.29, packPrice: 81.9, unitsPerPack: 10, stock: 35, price: 8.19},
  {id: 143, name: 'CIGARRO NISE BRANCO', category: 'TABACARIA', unitOfMeasure: 'MAÇO', cost: 27, packPrice: 29.9, unitsPerPack: 10, stock: 20, price: 2.99},
  {id: 144, name: 'CIGARRO NISE VERMELHO', category: 'TABACARIA', unitOfMeasure: 'MAÇO', cost: 31, packPrice: 32.9, unitsPerPack: 10, stock: 37, price: 3.29},
  {id: 145, name: 'CIGARRO PANDORA BRANCO', category: 'TABACARIA', unitOfMeasure: 'UNIDADE', cost: 27, packPrice: 29.9, unitsPerPack: 1, stock: 103, price: 29.9},
  {id: 146, name: 'CIGARRO PANDORA VERMELHO', category: 'TABACARIA', unitOfMeasure: 'UNIDADE', cost: 26, packPrice: 29.9, unitsPerPack: 1, stock: 47, price: 29.9},
  {id: 147, name: 'CIGARRO PONCIO IGNITE', category: 'TABACARIA', unitOfMeasure: 'UNIDADE', cost: 20, packPrice: 21, unitsPerPack: 1, stock: 10, price: 21},
  {id: 148, name: 'CIGARRO ROTHMANS AZUL', category: 'TABACARIA', unitOfMeasure: 'MAÇO', cost: 83.61, packPrice: 89.3, unitsPerPack: 10, stock: 43, price: 8.93},
  {id: 149, name: 'CIGARRO ROTHMANS BOX WHITE BLUE', category: 'TABACARIA', unitOfMeasure: 'MAÇO', cost: 72.22, packPrice: 75.2, unitsPerPack: 1, stock: 23, price: 75.2},
  {id: 150, name: 'CIGARRO ROTHMANS GLOBAL AZUL BOX', category: 'TABACARIA', unitOfMeasure: 'MAÇO', cost: 70.8, packPrice: 72.8, unitsPerPack: 1, stock: 54, price: 72.8},
  {id: 151, name: 'CIGARRO ROTHMANS GLOBAL VERMELHO BOX', category: 'TABACARIA', unitOfMeasure: 'MAÇO', cost: 70.8, packPrice: 72.8, unitsPerPack: 1, stock: 19, price: 72.8},
  {id: 152, name: 'CIGARRO ROTHMANS INTER 2 CAPS BOX', category: 'TABACARIA', unitOfMeasure: 'UNIDADE', cost: 103.9, packPrice: 108.3, unitsPerPack: 1, stock: 28, price: 108.3},
  {id: 153, name: 'CIGARRO ROTHMANS INTERNACIONAL', category: 'TABACARIA', unitOfMeasure: 'MAÇO', cost: 99.9, packPrice: 104.25, unitsPerPack: 10, stock: 38, price: 10.425},
  {id: 154, name: 'CIGARRO ROTHMANS PRATA', category: 'TABACARIA', unitOfMeasure: 'MAÇO', cost: 87.4, packPrice: 89.3, unitsPerPack: 10, stock: 16, price: 8.93},
  {id: 155, name: 'CIGARRO ROTHMANS VERMELHO', category: 'TABACARIA', unitOfMeasure: 'MAÇO', cost: 82.06, packPrice: 89.3, unitsPerPack: 10, stock: 55, price: 8.93},
  {id: 156, name: 'CIGARRO ROTHMANS WHITE RED BOX', category: 'TABACARIA', unitOfMeasure: 'MAÇO', cost: 66, packPrice: 75.2, unitsPerPack: 1, stock: 16, price: 75.2},
  {id: 157, name: 'COCA COLA 1,5 ZERO', category: 'REFRIGERANTES', unitOfMeasure: 'FARDO', cost: 37.86, packPrice: 39.9, unitsPerPack: 6, stock: 72, price: 6.65},
  {id: 158, name: 'COCA COLA 1,5L', category: 'REFRIGERANTES', unitOfMeasure: 'FARDO', cost: 38.88, packPrice: 40.9, unitsPerPack: 6, stock: 81, price: 6.816666666666666},
  {id: 159, name: 'COCA COLA 1L', category: 'REFRIGERANTES', unitOfMeasure: 'FARDO', cost: 35.1, packPrice: 37.5, unitsPerPack: 6, stock: 12, price: 6.25},
  {id: 160, name: 'COCA COLA 1L ZERO', category: 'REFRIGERANTES', unitOfMeasure: 'FARDO', cost: 33.42, packPrice: 35.9, unitsPerPack: 6, stock: 90, price: 5.983333333333333},
  {id: 161, name: 'COCA COLA 2L', category: 'REFRIGERANTES', unitOfMeasure: 'FARDO', cost: 52.5, packPrice: 54.9, unitsPerPack: 6, stock: 63, price: 9.15},
  {id: 162, name: 'COCA COLA 2L MERCEARIA', category: 'REFRIGERANTES', unitOfMeasure: 'UNIDADE', cost: 8.76, packPrice: 12, unitsPerPack: 1, stock: 2, price: 12},
  {id: 163, name: 'COCA COLA 2L ZERO', category: 'REFRIGERANTES', unitOfMeasure: 'FARDO', cost: 49.47, packPrice: 52.9, unitsPerPack: 6, stock: 138, price: 8.816666666666666},
  {id: 164, name: 'COCA COLA 2L ZERO MERCEARIA', category: 'REFRIGERANTES', unitOfMeasure: 'UNIDADE', cost: 8.24, packPrice: 12, unitsPerPack: 1, stock: 3, price: 12},
  {id: 165, name: 'COCA COLA 600 NORMAL', category: 'REFRIGERANTES', unitOfMeasure: 'FARDO', cost: 43.08, packPrice: 44.9, unitsPerPack: 12, stock: 84, price: 3.7416666666666665},
  {id: 166, name: 'COCA COLA 600 ZERO', category: 'REFRIGERANTES', unitOfMeasure: 'FARDO', cost: 40.2, packPrice: 41.9, unitsPerPack: 12, stock: 105, price: 3.4916666666666665},
  {id: 167, name: 'COCA COLA CAFE LATA 220ML', category: 'REFRIGERANTES', unitOfMeasure: 'Fardo', cost: 0, packPrice: 0, unitsPerPack: 1, stock: 0, price: 0},
  {id: 168, name: 'COCA COLA LATA 350ML MERCEARIA', category: 'REFRIGERANTES', unitOfMeasure: 'UNIDADE', cost: 2.82, packPrice: 4.5, unitsPerPack: 1, stock: 7, price: 4.5},
  {id: 169, name: 'COCA COLA LATA 6X350ML', category: 'REFRIGERANTES', unitOfMeasure: 'FARDO', cost: 16.83, packPrice: 17.7, unitsPerPack: 6, stock: 365, price: 2.95},
  {id: 170, name: 'COCA COLA LATA ZERO 6X350ML', category: 'REFRIGERANTES', unitOfMeasure: 'FARDO', cost: 16.43, packPrice: 17.45, unitsPerPack: 6, stock: 1310, price: 2.9083333333333335},
  {id: 171, name: 'COCA COLA LATA ZERO MERCEARIA', category: 'REFRIGERANTES', unitOfMeasure: 'UNIDADE', cost: 2.72, packPrice: 4.5, unitsPerPack: 1, stock: 13, price: 4.5},
  {id: 172, name: 'COCA COLA LS RETORNAVEL', category: 'REFRIGERANTES', unitOfMeasure: 'CAIXA', cost: 42.72, packPrice: 46.9, unitsPerPack: 12, stock: 32, price: 3.9083333333333334},
  {id: 173, name: 'COCA COLA MINI MERCEARIA', category: 'REFRIGERANTES', unitOfMeasure: 'UNIDADE', cost: 2.09, packPrice: 3.5, unitsPerPack: 1, stock: 11, price: 3.5},
  {id: 174, name: 'COCA COLA MINI PET 12X250ML', category: 'REFRIGERANTES', unitOfMeasure: 'FARDO', cost: 25.44, packPrice: 27, unitsPerPack: 12, stock: 6, price: 2.25},
  {id: 175, name: 'COCA COLA MINI PET 6X250ML', category: 'REFRIGERANTES', unitOfMeasure: 'Fardo', cost: 0, packPrice: 15, unitsPerPack: 6, stock: 0, price: 2.5},
  {id: 176, name: 'COCA COLA VZ LATA 310ML', category: 'REFRIGERANTES', unitOfMeasure: 'FARDO', cost: 37.8, packPrice: 39.3, unitsPerPack: 1, stock: 1, price: 39.3},
  {id: 177, name: 'COROTE AZUL 500ML', category: 'VODKAS', unitOfMeasure: 'UNIDADE', cost: 3.83, packPrice: 4, unitsPerPack: 1, stock: 19, price: 4},
  {id: 178, name: 'COROTE BLUEBERRY 500ML', category: 'VODKAS', unitOfMeasure: 'UNIDADE', cost: 3.83, packPrice: 4, unitsPerPack: 1, stock: 3, price: 4},
  {id: 179, name: 'COROTE CEREJA 500ML', category: 'VODKAS', unitOfMeasure: 'UNIDADE', cost: 3.83, packPrice: 4, unitsPerPack: 1, stock: 5, price: 4},
  {id: 180, name: 'COROTE LIMÃO 500ML', category: 'VODKAS', unitOfMeasure: 'UNIDADE', cost: 3.83, packPrice: 4, unitsPerPack: 1, stock: 5, price: 4},
  {id: 181, name: 'COROTE PESSEGO 500ML', category: 'VODKAS', unitOfMeasure: 'UNIDADE', cost: 3.83, packPrice: 4, unitsPerPack: 1, stock: 4, price: 4},
  {id: 182, name: 'COROTE SABORES 12X500ML', category: 'VODKAS', unitOfMeasure: 'FARDO', cost: 45, packPrice: 48, unitsPerPack: 12, stock: 6, price: 4},
  {id: 183, name: 'COROTE SKOL BEATS 12X500ML', category: 'VODKAS', unitOfMeasure: 'FARDO', cost: 45, packPrice: 48, unitsPerPack: 12, stock: 5, price: 4},
  {id: 184, name: 'COROTE UVC 500ML', category: 'VODKAS', unitOfMeasure: 'UNIDADE', cost: 3.83, packPrice: 4, unitsPerPack: 1, stock: 1, price: 4},
  {id: 185, name: 'COROTE VERMELHO 500ML', category: 'VODKAS', unitOfMeasure: 'UNIDADE', cost: 3.83, packPrice: 4, unitsPerPack: 1, stock: 1, price: 4},
  {id: 186, name: 'CRYSTAL AGUA SEM GAS 12X500ML', category: 'ÀGUAS', unitOfMeasure: 'Fardo', cost: 17.4, packPrice: 18, unitsPerPack: 12, stock: 1, price: 1.5},
  {id: 187, name: 'CRYSTAL AGUA S/GAS 1,5L', category: 'ÀGUAS', unitOfMeasure: 'FARDO', cost: 17.04, packPrice: 18, unitsPerPack: 6, stock: 2, price: 3},
  {id: 188, name: 'DEVASSA LATA 12X350ML', category: 'CERVEJAS', unitOfMeasure: 'FARDO', cost: 36.72, packPrice: 38.9, unitsPerPack: 12, stock: 4, price: 3.2416666666666665},
  {id: 189, name: 'DEVASSA LATA PURO MALTE 12X350ML', category: 'CERVEJAS', unitOfMeasure: 'FARDO', cost: 38.88, packPrice: 40.9, unitsPerPack: 12, stock: 1, price: 3.4083333333333334},
  {id: 190, name: 'EISENBAHN PILSEN 12X350ML', category: 'CERVEJAS', unitOfMeasure: 'FARDO', cost: 40, packPrice: 42, unitsPerPack: 12, stock: 1, price: 3.5},
  {id: 191, name: 'FANTA GUARANA 2L', category: 'REFRIGERANTES', unitOfMeasure: 'FARDO', cost: 37.38, packPrice: 39.9, unitsPerPack: 6, stock: 3, price: 6.65},
  {id: 192, name: 'FANTA LARANJA 2L', category: 'REFRIGERANTES', unitOfMeasure: 'FARDO', cost: 38.04, packPrice: 40.9, unitsPerPack: 6, stock: 1, price: 6.816666666666666},
  {id: 193, name: 'FANTA LARANJA LATA 6X350ML', category: 'REFRIGERANTES', unitOfMeasure: 'FARDO', cost: 16.83, packPrice: 17.7, unitsPerPack: 6, stock: 2, price: 2.95},
  {id: 194, name: 'FESTVAL CAJU 12X200ML', category: 'REFRIGERANTES', unitOfMeasure: 'Fardo', cost: 18, packPrice: 19.9, unitsPerPack: 12, stock: 1, price: 1.6583333333333333},
  {id: 195, name: 'FESTVAL UVA 12X200ML', category: 'REFRIGERANTES', unitOfMeasure: 'Fardo', cost: 18, packPrice: 19.9, unitsPerPack: 12, stock: 1, price: 1.6583333333333333},
  {id: 196, name: 'FONTES DE MINAS 5L', category: 'ÀGUAS', unitOfMeasure: 'UNIDADE', cost: 0, packPrice: 0, unitsPerPack: 1, stock: 0, price: 0},
  {id: 197, name: 'FONTES DE MINAS AGUA S/GAS 1,5L', category: 'ÀGUAS', unitOfMeasure: 'FARDO', cost: 16.92, packPrice: 17.5, unitsPerPack: 6, stock: 1, price: 2.9166666666666665},
  {id: 198, name: 'GAROTO BOMBOM SORTIDO 250G', category: 'BOMBONIERE', unitOfMeasure: 'Unidade', cost: 0, packPrice: 11.9, unitsPerPack: 1, stock: 0, price: 11.9},
  {id: 199, name: 'GUARANA ANTARTICA 1,5L', category: 'REFRIGERANTES', unitOfMeasure: 'FARDO', cost: 37, packPrice: 38.9, unitsPerPack: 6, stock: 2, price: 6.483333333333333},
  {id: 200, name: 'GUARANA ANTARTICA 1L', category: 'REFRIGERANTES', unitOfMeasure: 'FARDO', cost: 33.42, packPrice: 35.9, unitsPerPack: 6, stock: 0, price: 5.983333333333333},
  {id: 201, name: 'GUARANA ANTARTICA 2L', category: 'REFRIGERANTES', unitOfMeasure: 'FARDO', cost: 47.88, packPrice: 49.9, unitsPerPack: 6, stock: 2, price: 8.316666666666666},
  {id: 202, name: 'GUARANA ANTARTICA 600ML', category: 'REFRIGERANTES', unitOfMeasure: 'FARDO', cost: 42.24, packPrice: 43.9, unitsPerPack: 12, stock: 6, price: 3.6583333333333334},
  {id: 203, name: 'GUARANA ANTARTICA LATA 6X350ML', category: 'REFRIGERANTES', unitOfMeasure: 'FARDO', cost: 16.43, packPrice: 17.4, unitsPerPack: 6, stock: 15, price: 2.9},
  {id: 204, name: 'GUARANA ANTARTICA LATA ZERO 6X350ML', category: 'REFRIGERANTES', unitOfMeasure: 'FARDO', cost: 16.43, packPrice: 17.4, unitsPerPack: 6, stock: 0, price: 2.9},
  {id: 205, name: 'GUARANA KUAT 2L', category: 'REFRIGERANTES', unitOfMeasure: 'FARDO', cost: 35.82, packPrice: 37.9, unitsPerPack: 6, stock: 2, price: 6.316666666666666},
  {id: 206, name: 'HEINEKEN LONG NECK 24X330ML', category: 'CERVEJAS', unitOfMeasure: 'CAIXA', cost: 128.88, packPrice: 135, unitsPerPack: 24, stock: 6, price: 5.625},
  {id: 207, name: 'HEINEKEN LATA 12X350ML', category: 'CERVEJAS', unitOfMeasure: 'FARDO', cost: 40.08, packPrice: 42.9, unitsPerPack: 12, stock: 7, price: 3.575},
  {id: 208, name: 'HEINEKEN LONG NECK 6X330ML', category: 'CERVEJAS', unitOfMeasure: 'Fardo', cost: 0, packPrice: 32.9, unitsPerPack: 6, stock: 0, price: 5.483333333333333},
  {id: 209, name: 'HEINEKEN LONG NECK MERCEARIA', category: 'CERVEJAS', unitOfMeasure: 'UNIDADE', cost: 5.37, packPrice: 5.99, unitsPerPack: 1, stock: 3, price: 5.99},
  {id: 210, name: 'JACK DANIELS MEL 1L', category: 'WHISCKS', unitOfMeasure: 'UNIDADE', cost: 105, packPrice: 109.9, unitsPerPack: 1, stock: 4, price: 109.9},
  {id: 211, name: 'JACK DANIELS N 7 1L', category: 'WHISCKS', unitOfMeasure: 'UNIDADE', cost: 95, packPrice: 99.9, unitsPerPack: 1, stock: 10, price: 99.9},
  {id: 212, name: 'JOHNIE WALKER RED LABEL 1L', category: 'WHISCKS', unitOfMeasure: 'UNIDADE', cost: 79, packPrice: 81.9, unitsPerPack: 1, stock: 10, price: 81.9},
  {id: 213, name: 'KIT KAT BRANCO 24X41G', category: 'BOMBONIERE', unitOfMeasure: 'Caixa', cost: 0, packPrice: 64.9, unitsPerPack: 24, stock: 0, price: 2.7041666666666665},
  {id: 214, name: 'KIT KAT AO LEITE 24X41G', category: 'BOMBONIERE', unitOfMeasure: 'Caixa', cost: 0, packPrice: 64.9, unitsPerPack: 24, stock: 0, price: 2.7041666666666665},
  {id: 215, name: 'KRISPY KREAM CHOCOLATE 10X5', category: 'BOMBONIERE', unitOfMeasure: 'Fardo', cost: 0, packPrice: 0, unitsPerPack: 50, stock: 0, price: 0},
  {id: 216, name: 'LEITE DE COCO SOCOCO 200ML', category: 'MANTIMENTOS', unitOfMeasure: 'UNIDADE', cost: 4.4, packPrice: 4.9, unitsPerPack: 1, stock: 8, price: 4.9},
  {id: 217, name: 'LIMONADA CLight 1L', category: 'SUCOS', unitOfMeasure: 'UNIDADE', cost: 0, packPrice: 5, unitsPerPack: 1, stock: 0, price: 5},
  {id: 218, name: 'MENTOS SABORES 12X3', category: 'BOMBONIERE', unitOfMeasure: 'FARDO', cost: 24, packPrice: 25, unitsPerPack: 3, stock: 1, price: 8.333333333333334},
  {id: 219, name: 'MOUSSE DE LIMÃO E MARACUJÁ 10X5', category: 'BOMBONIERE', unitOfMeasure: 'Fardo', cost: 0, packPrice: 0, unitsPerPack: 50, stock: 0, price: 0},
  {id: 220, name: 'NESCAU 2,0', category: 'ACHOCOLATADOS', unitOfMeasure: 'UNIDADE', cost: 13, packPrice: 13.5, unitsPerPack: 1, stock: 2, price: 13.5},
  {id: 221, name: 'NESCAU 400G', category: 'ACHOCOLATADOS', unitOfMeasure: 'UNIDADE', cost: 6.2, packPrice: 6.5, unitsPerPack: 1, stock: 1, price: 6.5},
  {id: 222, name: 'NESTLE CHOCOLATE CLASSIC 1KG', category: 'BOMBONIERE', unitOfMeasure: 'UNIDADE', cost: 25, packPrice: 26.9, unitsPerPack: 1, stock: 3, price: 26.9},
  {id: 223, name: 'OLD PARR 1L', category: 'WHISCKS', unitOfMeasure: 'UNIDADE', cost: 105, packPrice: 109.9, unitsPerPack: 1, stock: 11, price: 109.9},
  {id: 224, name: 'OVALTINE 200G', category: 'ACHOCOLATADOS', unitOfMeasure: 'UNIDADE', cost: 5.9, packPrice: 6.2, unitsPerPack: 1, stock: 0, price: 6.2},
  {id: 225, name: 'OVALTINE 400G', category: 'ACHOCOLATADOS', unitOfMeasure: 'UNIDADE', cost: 10, packPrice: 10.5, unitsPerPack: 1, stock: 0, price: 10.5},
  {id: 226, name: 'PAÇOQUITA SANTA HELENA 24X21G', category: 'BOMBONIERE', unitOfMeasure: 'UNIDADE', cost: 22, packPrice: 23.5, unitsPerPack: 1, stock: 2, price: 23.5},
  {id: 227, name: 'PAÇOQUITA SANTA HELENA 400G', category: 'BOMBONIERE', unitOfMeasure: 'UNIDADE', cost: 12, packPrice: 12.5, unitsPerPack: 1, stock: 0, price: 12.5},
  {id: 228, name: 'PAÇOQUITA SANTA HELENA 50X16G', category: 'BOMBONIERE', unitOfMeasure: 'CAIXA', cost: 20, packPrice: 21.5, unitsPerPack: 50, stock: 11, price: 0.43},
  {id: 229, name: 'PARMALAT CHOCOLATE 200ML', category: 'ACHOCOLATADOS', unitOfMeasure: 'UNIDADE', cost: 1.5, packPrice: 1.8, unitsPerPack: 1, stock: 1, price: 1.8},
  {id: 230, name: 'PEPSI 2L', category: 'REFRIGERANTES', unitOfMeasure: 'FARDO', cost: 35.82, packPrice: 37.9, unitsPerPack: 6, stock: 0, price: 6.316666666666666},
  {id: 231, name: 'PEPSI LATA 6X350ML', category: 'REFRIGERANTES', unitOfMeasure: 'FARDO', cost: 16.43, packPrice: 17.4, unitsPerPack: 6, stock: 0, price: 2.9},
  {id: 232, name: 'PIRAQUÊ CREAM CRACKER 200G', category: 'MANTIMENTOS', unitOfMeasure: 'UNIDADE', cost: 3, packPrice: 3.3, unitsPerPack: 1, stock: 1, price: 3.3},
  {id: 233, name: 'PIRAQUÊ MAISENA 200G', category: 'MANTIMENTOS', unitOfMeasure: 'UNIDADE', cost: 3, packPrice: 3.3, unitsPerPack: 1, stock: 1, price: 3.3},
  {id: 234, name: 'PITU 900ML', category: 'CACHAÇA', unitOfMeasure: 'UNIDADE', cost: 10, packPrice: 10.5, unitsPerPack: 1, stock: 1, price: 10.5},
  {id: 235, name: 'PITU CAIXA 12X900ML', category: 'CACHAÇA', unitOfMeasure: 'CAIXA', cost: 120, packPrice: 126, unitsPerPack: 12, stock: 1, price: 10.5},
  {id: 236, name: 'PORTO SEGURO AGUA DE COCO 1L', category: 'ÀGUAS', unitOfMeasure: 'UNIDADE', cost: 5, packPrice: 5.5, unitsPerPack: 1, stock: 0, price: 5.5},
  {id: 237, name: 'PRINGLES ORIGINAL 12X124G', category: 'BOMBONIERE', unitOfMeasure: 'FARDO', cost: 168, packPrice: 175, unitsPerPack: 12, stock: 0, price: 14.583333333333334},
  {id: 238, name: 'SALGADINHO BACONZITOS 10X5', category: 'BOMBONIERE', unitOfMeasure: 'Fardo', cost: 0, packPrice: 0, unitsPerPack: 50, stock: 0, price: 0},
  {id: 239, name: 'SALGADINHO CEBOLITOS 10X5', category: 'BOMBONIERE', unitOfMeasure: 'Fardo', cost: 0, packPrice: 0, unitsPerPack: 50, stock: 0, price: 0},
  {id: 240, name: 'SALGADINHO CHEETOS 10X5', category: 'BOMBONIERE', unitOfMeasure: 'Fardo', cost: 0, packPrice: 0, unitsPerPack: 50, stock: 0, price: 0},
  {id: 241, name: 'SALGADINHO DORITOS 10X5', category: 'BOMBONIERE', unitOfMeasure: 'Fardo', cost: 0, packPrice: 0, unitsPerPack: 50, stock: 0, price: 0},
  {id: 242, name: 'SALGADINHO FANTA 10X5', category: 'BOMBONIERE', unitOfMeasure: 'Fardo', cost: 0, packPrice: 0, unitsPerPack: 50, stock: 0, price: 0},
  {id: 243, name: 'SALGADINHO FOFURA 10X5', category: 'BOMBONIERE', unitOfMeasure: 'Fardo', cost: 0, packPrice: 0, unitsPerPack: 50, stock: 0, price: 0},
  {id: 244, name: 'SALGADINHO RUFFLES 10X5', category: 'BOMBONIERE', unitOfMeasure: 'Fardo', cost: 0, packPrice: 0, unitsPerPack: 50, stock: 0, price: 0},
  {id: 245, name: 'SALGADINHO SKOL 10X5', category: 'BOMBONIERE', unitOfMeasure: 'Fardo', cost: 0, packPrice: 0, unitsPerPack: 50, stock: 0, price: 0},
  {id: 246, name: 'SALGADINHO TOP 10X5', category: 'BOMBONIERE', unitOfMeasure: 'Fardo', cost: 0, packPrice: 0, unitsPerPack: 50, stock: 0, price: 0},
  {id: 247, name: 'SKOL LATA 12X350ML', category: 'CERVEJAS', unitOfMeasure: 'FARDO', cost: 28, packPrice: 29.9, unitsPerPack: 12, stock: 28, price: 2.4916666666666665},
  {id: 248, name: 'SKOL PURO MALTE 12X350ML', category: 'CERVEJAS', unitOfMeasure: 'FARDO', cost: 30, packPrice: 31.9, unitsPerPack: 12, stock: 0, price: 2.6583333333333333},
  {id: 249, name: 'SKOL BEATS SENSE 8X269ML', category: 'DRINKS', unitOfMeasure: 'FARDO', cost: 28.8, packPrice: 29.9, unitsPerPack: 8, stock: 0, price: 3.7375},
  {id: 250, name: 'SKOL BEATS SPIRIT 8X269ML', category: 'DRINKS', unitOfMeasure: 'FARDO', cost: 28.8, packPrice: 29.9, unitsPerPack: 8, stock: 0, price: 3.7375},
  {id: 251, name: 'SKOL BEATS ULTIMATE 8X269ML', category: 'DRINKS', unitOfMeasure: 'FARDO', cost: 28.8, packPrice: 29.9, unitsPerPack: 8, stock: 0, price: 3.7375},
  {id: 252, name: 'SUCO DEL VALLE LARANJA 1L', category: 'SUCOS', unitOfMeasure: 'UNIDADE', cost: 5, packPrice: 5.5, unitsPerPack: 1, stock: 0, price: 5.5},
  {id: 253, name: 'SUCO DEL VALLE UVA 1L', category: 'SUCOS', unitOfMeasure: 'UNIDADE', cost: 5, packPrice: 5.5, unitsPerPack: 1, stock: 0, price: 5.5},
  {id: 254, name: 'SUCO DEL VALLE UVA 6X1L', category: 'SUCOS', unitOfMeasure: 'FARDO', cost: 30, packPrice: 33, unitsPerPack: 6, stock: 0, price: 5.5},
  {id: 255, name: 'SUCO PRATICO CAJU 1L', category: 'SUCOS', unitOfMeasure: 'UNIDADE', cost: 0, packPrice: 6, unitsPerPack: 1, stock: 0, price: 6},
  {id: 256, name: 'SUCO PRATICO UVA 1L', category: 'SUCOS', unitOfMeasure: 'UNIDADE', cost: 0, packPrice: 6, unitsPerPack: 1, stock: 0, price: 6},
  {id: 257, name: 'SUCO TANG LARANJA 25G', category: 'SUCOS', unitOfMeasure: 'UNIDADE', cost: 0, packPrice: 1, unitsPerPack: 1, stock: 0, price: 1},
  {id: 258, name: 'SUCO TANG UVA 25G', category: 'SUCOS', unitOfMeasure: 'UNIDADE', cost: 0, packPrice: 1, unitsPerPack: 1, stock: 0, price: 1},
  {id: 259, name: 'VINHO SANTA HELENA 750ML', category: 'VINHOS', unitOfMeasure: 'UNIDADE', cost: 25, packPrice: 27, unitsPerPack: 1, stock: 0, price: 27},
  {id: 260, name: 'VODKA SMIRNOFF 1L', category: 'VODKAS', unitOfMeasure: 'UNIDADE', cost: 35, packPrice: 37, unitsPerPack: 1, stock: 1, price: 37},
  {id: 261, name: 'WHISCK BUCHANANS 12ANOS 1L', category: 'WHISCKS', unitOfMeasure: 'UNIDADE', cost: 120, packPrice: 125, unitsPerPack: 1, stock: 0, price: 125},
  {id: 262, name: 'YPIOCA EMPALHADA PRATA 700ML', category: 'CACHAÇA', unitOfMeasure: 'Fardo', cost: 0, packPrice: 32.9, unitsPerPack: 1, stock: 0, price: 32.9},
  {id: 263, name: 'YPIOCA GUARANA CX 12X1L', category: 'CACHAÇA', unitOfMeasure: 'CAIXA', cost: 214.08, packPrice: 218.9, unitsPerPack: 12, stock: 4, price: 18.241666666666668},
  {id: 264, name: 'YPIOCA GUARANA UNIDADE', category: 'CACHAÇA', unitOfMeasure: 'UNIDADE', cost: 17.84, packPrice: 19.9, unitsPerPack: 1, stock: 37, price: 19.9},
  {id: 265, name: 'YPIOCA LIMA LIMÃO CX 12X1L', category: 'CACHAÇA', unitOfMeasure: 'CAIXA', cost: 204.95, packPrice: 209.9, unitsPerPack: 12, stock: 18, price: 17.491666666666667},
  {id: 266, name: 'YPIOCA LIMA LIMÃO UNIDADE', category: 'CACHAÇA', unitOfMeasure: 'UNIDADE', cost: 17.08, packPrice: 17.7, unitsPerPack: 1, stock: 19, price: 17.7},
  {id: 267, name: 'YPIOCA MESTRE OURO CX 12X965ML', category: 'CACHAÇA', unitOfMeasure: 'CAIXA', cost: 289.9, packPrice: 295.9, unitsPerPack: 12, stock: 3, price: 24.658333333333334},
];

const initialCategories: string[] = [
  "ÀGUAS", "BOMBONIERE", "CERVEJAS", "APERITIVO", "REFRIGERANTES", "DRINKS", 
  "CACHAÇA", "CARVÃO", "WHISCKS", "CHAMPANHE", "TABACARIA", "VODKAS", 
  "ENÈRGETICOS", "MANTIMENTOS", "ACHOCOLATADOS", "SUCOS", "VINHOS"
];
const initialUnits: string[] = ["UNIDADE", "FARDO", "CAIXA", "UNID", "MAÇO"];


const ProductsContext = createContext<ProductsContextType | undefined>(undefined);

// Helper functions to get initial state from localStorage
const getInitialState = <T,>(key: string, defaultValue: T): T => {
    if (typeof window !== 'undefined') {
        const storedValue = localStorage.getItem(key);
        if (storedValue) {
            try {
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
  const { sales } = useSales();
  const { orders } = useOrders();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [productCounter, setProductCounter] = useState<number>(1);
  const [categories, setCategories] = useState<string[]>([]);
  const [unitsOfMeasure, setUnitsOfMeasure] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  
  const { toast } = useToast();
  
  useEffect(() => {
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

  const deleteProduct = (productId: number) => {
    const isProductInSale = sales.some(sale => sale.items.some(item => item.id === productId));
    const isProductInOrder = orders.some(order => order.items.some(item => item.id === productId));

    if (isProductInSale || isProductInOrder) {
      toast({
        title: "Produto em Uso",
        description: "Não é possível excluir um produto que já foi vendido ou está em um pedido.",
        variant: "destructive",
      });
      return;
    }

    setProducts(prevProducts => prevProducts.filter(p => p.id !== productId));
    toast({
      title: "Produto Excluído",
      description: "O produto foi removido com sucesso.",
    });
  };
  
  const loadProducts = (newProducts: Omit<Product, 'price'>[]) => {
    const productsWithPrice = newProducts.map(p => ({
      ...p,
      price: calculatePrice(p.packPrice, p.unitsPerPack)
    }));
    setProducts(productsWithPrice);

    if (productsWithPrice.length > 0) {
      const maxId = Math.max(...productsWithPrice.map(p => p.id).filter(id => !isNaN(id) && id !== null));
      setProductCounter(maxId > 0 ? maxId + 1 : 1);
    } else {
      setProductCounter(1);
    }
    
    const newCategories = Array.from(new Set(productsWithPrice.map(p => p.category.trim()).filter(c => c))).sort();
    setCategories(newCategories.length > 0 ? newCategories : initialCategories);

    const newUnits = Array.from(new Set(productsWithPrice.map(p => p.unitOfMeasure.trim()).filter(u => u))).sort();
    setUnitsOfMeasure(newUnits.length > 0 ? newUnits : initialUnits);
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
      products, addProduct, updateProduct, deleteProduct, decreaseStock, increaseStock, getProductById, resetProducts, loadProducts,
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
