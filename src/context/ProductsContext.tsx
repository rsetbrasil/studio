
'use client';

import React, { createContext, useContext, useState, ReactNode, useMemo } from 'react';
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
  
  categories: string[];
  unitsOfMeasure: string[];
  addCategory: (category: string) => void;
  updateCategory: (oldCategory: string, newCategory: string) => void;
  deleteCategory: (category: string) => void;
  addUnitOfMeasure: (unit: string) => void;
  updateUnitOfMeasure: (oldUnit: string, newUnit: string) => void;
  deleteUnitOfMeasure: (unit: string) => void;
};

const initialProducts: Omit<Product, 'price'>[] = [
    { id: 1, name: "AGUA C/GAS CRYSTAL 500ML", unitOfMeasure: "FARDO", cost: 9.0, stock: 100, category: "AGUA", unitsPerPack: 6, packPrice: 16.50 },
    { id: 2, name: "AGUA S/GAS CRYSTAL 500ML", unitOfMeasure: "FARDO", cost: 9.0, stock: 100, category: "AGUA", unitsPerPack: 6, packPrice: 16.50 },
    { id: 3, name: "AGUA S/GAS SCHIN 500ML", unitOfMeasure: "FARDO", cost: 7.2, stock: 100, category: "AGUA", unitsPerPack: 6, packPrice: 13.14 },
    { id: 4, name: "AGUA TONICA ANTARCTICA 350ML", unitOfMeasure: "UNIDADE", cost: 2.0, stock: 100, category: "REFRIGERANTE", unitsPerPack: 1, packPrice: 3.49 },
    { id: 5, name: "AGUA TONICA SCHWEPPES 350ML", unitOfMeasure: "UNIDADE", cost: 2.5, stock: 100, category: "REFRIGERANTE", unitsPerPack: 1, packPrice: 4.19 },
    { id: 6, name: "APERITIVO CAMPARI 900ML", unitOfMeasure: "UNIDADE", cost: 35.0, stock: 100, category: "DESTILADOS", unitsPerPack: 1, packPrice: 48.90 },
    { id: 7, name: "APERITIVO DE MALTE VIBE 2L", unitOfMeasure: "UNIDADE", cost: 12.0, stock: 100, category: "DESTILADOS", unitsPerPack: 1, packPrice: 16.90 },
    { id: 8, name: "BEBIDA LACTEA BLUE 270ML", unitOfMeasure: "UNIDADE", cost: 2.0, stock: 100, category: "OUTROS", unitsPerPack: 1, packPrice: 3.49 },
    { id: 9, name: "CACHACA 51 965ML", unitOfMeasure: "UNIDADE", cost: 10.0, stock: 100, category: "DESTILADOS", unitsPerPack: 1, packPrice: 15.90 },
    { id: 10, name: "CACHACA JAMEL 900ML", unitOfMeasure: "UNIDADE", cost: 9.0, stock: 100, category: "DESTILADOS", unitsPerPack: 1, packPrice: 13.90 },
    { id: 11, name: "CACHACA PIRASSUNUNCA 965ML", unitOfMeasure: "UNIDADE", cost: 9.5, stock: 100, category: "DESTILADOS", unitsPerPack: 1, packPrice: 14.90 },
    { id: 12, name: "CACHACA VELHO BARREIRO 910ML", unitOfMeasure: "UNIDADE", cost: 9.5, stock: 100, category: "DESTILADOS", unitsPerPack: 1, packPrice: 14.90 },
    { id: 13, name: "CATUABA SELVAGEM 1L", unitOfMeasure: "UNIDADE", cost: 8.0, stock: 100, category: "VINHOS", unitsPerPack: 1, packPrice: 12.90 },
    { id: 14, name: "CERV AMSTEL 269ML", unitOfMeasure: "LATA", cost: 1.8, stock: 100, category: "CERVEJA", unitsPerPack: 1, packPrice: 2.99 },
    { id: 15, name: "CERV ANTARCTICA PILSEN 350ML", unitOfMeasure: "LATA", cost: 1.7, stock: 100, category: "CERVEJA", unitsPerPack: 1, packPrice: 2.79 },
    { id: 16, name: "CERV BAVARIA 350ML", unitOfMeasure: "LATA", cost: 1.5, stock: 100, category: "CERVEJA", unitsPerPack: 1, packPrice: 2.49 },
    { id: 17, name: "CERV BHLSEN 350ML", unitOfMeasure: "LATA", cost: 2.0, stock: 100, category: "CERVEJA", unitsPerPack: 1, packPrice: 3.49 },
    { id: 18, name: "CERV BRAHMA 269ML", unitOfMeasure: "LATA", cost: 1.7, stock: 100, category: "CERVEJA", unitsPerPack: 1, packPrice: 2.79 },
    { id: 19, name: "CERV BRAHMA 350ML", unitOfMeasure: "LATA", cost: 1.8, stock: 100, category: "CERVEJA", unitsPerPack: 1, packPrice: 2.99 },
    { id: 20, name: "CERV BRAHMA 473ML", unitOfMeasure: "LATA", cost: 2.8, stock: 100, category: "CERVEJA", unitsPerPack: 1, packPrice: 4.49 },
    { id: 21, name: "CERV BRAHMA CHOPP 350ML", unitOfMeasure: "LATA", cost: 1.8, stock: 100, category: "CERVEJA", unitsPerPack: 1, packPrice: 2.99 },
    { id: 22, name: "CERV BUDWEISER 269ML", unitOfMeasure: "LATA", cost: 2.0, stock: 100, category: "CERVEJA", unitsPerPack: 1, packPrice: 3.49 },
    { id: 23, name: "CERV BUDWEISER 330ML", unitOfMeasure: "LONG NECK", cost: 2.8, stock: 100, category: "CERVEJA", unitsPerPack: 1, packPrice: 4.49 },
    { id: 24, name: "CERV BUDWEISER 350ML", unitOfMeasure: "LATA", cost: 2.4, stock: 100, category: "CERVEJA", unitsPerPack: 1, packPrice: 3.99 },
    { id: 25, name: "CERV CARACU 350ML", unitOfMeasure: "LATA", cost: 2.5, stock: 100, category: "CERVEJA", unitsPerPack: 1, packPrice: 4.19 },
    { id: 26, name: "CERV CORONA 330ML", unitOfMeasure: "LONG NECK", cost: 4.5, stock: 100, category: "CERVEJA", unitsPerPack: 1, packPrice: 6.99 },
    { id: 27, name: "CERV CRYSTAL 350ML", unitOfMeasure: "LATA", cost: 1.5, stock: 100, category: "CERVEJA", unitsPerPack: 1, packPrice: 2.49 },
    { id: 28, name: "CERV DEVASSA 350ML", unitOfMeasure: "LATA", cost: 1.8, stock: 100, category: "CERVEJA", unitsPerPack: 1, packPrice: 2.99 },
    { id: 29, name: "CERV DUPLO MALTE 350ML", unitOfMeasure: "LATA", cost: 1.9, stock: 100, category: "CERVEJA", unitsPerPack: 1, packPrice: 3.19 },
    { id: 30, name: "CERV EISENBAHN 350ML", unitOfMeasure: "LATA", cost: 2.4, stock: 100, category: "CERVEJA", unitsPerPack: 1, packPrice: 3.99 },
    { id: 31, name: "CERV HEINEKEN 250ML", unitOfMeasure: "LONG NECK", cost: 2.8, stock: 100, category: "CERVEJA", unitsPerPack: 1, packPrice: 4.49 },
    { id: 32, name: "CERV HEINEKEN 330ML", unitOfMeasure: "LONG NECK", cost: 3.5, stock: 100, category: "CERVEJA", unitsPerPack: 1, packPrice: 5.49 },
    { id: 33, name: "CERV HEINEKEN 350ML", unitOfMeasure: "LATA", cost: 3.0, stock: 100, category: "CERVEJA", unitsPerPack: 1, packPrice: 4.99 },
    { id: 34, name: "CERV HEINEKEN S/ALCOOL 330ML", unitOfMeasure: "LONG NECK", cost: 3.8, stock: 100, category: "CERVEJA", unitsPerPack: 1, packPrice: 5.99 },
    { id: 35, name: "CERV IMPERIO 269ML", unitOfMeasure: "LATA", cost: 1.7, stock: 100, category: "CERVEJA", unitsPerPack: 1, packPrice: 2.79 },
    { id: 36, name: "CERV IMPERIO 350ML", unitOfMeasure: "LATA", cost: 1.8, stock: 100, category: "CERVEJA", unitsPerPack: 1, packPrice: 2.99 },
    { id: 37, name: "CERV ITAIPAVA 269ML", unitOfMeasure: "LATA", cost: 1.5, stock: 100, category: "CERVEJA", unitsPerPack: 1, packPrice: 2.49 },
    { id: 38, name: "CERV ITAIPAVA 350ML", unitOfMeasure: "LATA", cost: 1.7, stock: 100, category: "CERVEJA", unitsPerPack: 1, packPrice: 2.79 },
    { id: 39, name: "CERV ITAIPAVA 473ML", unitOfMeasure: "LATA", cost: 2.4, stock: 100, category: "CERVEJA", unitsPerPack: 1, packPrice: 3.99 },
    { id: 40, name: "CERV KAISER 350ML", unitOfMeasure: "LATA", cost: 1.5, stock: 100, category: "CERVEJA", unitsPerPack: 1, packPrice: 2.49 },
    { id: 41, name: "CERV MALZBIER 350ML", unitOfMeasure: "LATA", cost: 2.0, stock: 100, category: "CERVEJA", unitsPerPack: 1, packPrice: 3.49 },
    { id: 42, name: "CERV ORIGINAL 350ML", unitOfMeasure: "LATA", cost: 2.4, stock: 100, category: "CERVEJA", unitsPerPack: 1, packPrice: 3.99 },
    { id: 43, name: "CERV PETRA 269ML", unitOfMeasure: "LATA", cost: 1.7, stock: 100, category: "CERVEJA", unitsPerPack: 1, packPrice: 2.79 },
    { id: 44, name: "CERV PETRA 350ML", unitOfMeasure: "LATA", cost: 1.8, stock: 100, category: "CERVEJA", unitsPerPack: 1, packPrice: 2.99 },
    { id: 45, name: "CERV SERRANA 350ML", unitOfMeasure: "LATA", cost: 1.5, stock: 100, category: "CERVEJA", unitsPerPack: 1, packPrice: 2.49 },
    { id: 46, name: "CERV SKOL 269ML", unitOfMeasure: "LATA", cost: 1.7, stock: 100, category: "CERVEJA", unitsPerPack: 1, packPrice: 2.79 },
    { id: 47, name: "CERV SKOL 350ML", unitOfMeasure: "LATA", cost: 1.8, stock: 100, category: "CERVEJA", unitsPerPack: 1, packPrice: 2.99 },
    { id: 48, name: "CERV SKOL 473ML", unitOfMeasure: "LATA", cost: 2.8, stock: 100, category: "CERVEJA", unitsPerPack: 1, packPrice: 4.49 },
    { id: 49, name: "CERV STELLA ARTOIS 330ML", unitOfMeasure: "LONG NECK", cost: 3.0, stock: 100, category: "CERVEJA", unitsPerPack: 1, packPrice: 4.99 },
    { id: 50, name: "CERV SUBZERO 350ML", unitOfMeasure: "LATA", cost: 1.7, stock: 100, category: "CERVEJA", unitsPerPack: 1, packPrice: 2.79 },
    { id: 51, name: "CHA LIMAO 350ML", unitOfMeasure: "LATA", cost: 2.4, stock: 100, category: "SUCOS E CHAS", unitsPerPack: 1, packPrice: 3.99 },
    { id: 52, name: "CHA MATE LIMAO 300ML", unitOfMeasure: "UNIDADE", cost: 2.0, stock: 100, category: "SUCOS E CHAS", unitsPerPack: 1, packPrice: 3.49 },
    { id: 53, name: "CHA MATE NATURAL 300ML", unitOfMeasure: "UNIDADE", cost: 2.0, stock: 100, category: "SUCOS E CHAS", unitsPerPack: 1, packPrice: 3.49 },
    { id: 54, name: "CONHAQUE DE GENGIBRE 900ML", unitOfMeasure: "UNIDADE", cost: 12.0, stock: 100, category: "DESTILADOS", unitsPerPack: 1, packPrice: 16.90 },
    { id: 55, name: "ENERGETICO 2L", unitOfMeasure: "UNIDADE", cost: 8.0, stock: 100, category: "ENERGETICO", unitsPerPack: 1, packPrice: 11.90 },
    { id: 56, name: "ENERGETICO 2L", unitOfMeasure: "UNIDADE", cost: 7.0, stock: 100, category: "ENERGETICO", unitsPerPack: 1, packPrice: 9.90 },
    { id: 57, name: "ENERGETICO BLUE RAY 250ML", unitOfMeasure: "LATA", cost: 3.5, stock: 100, category: "ENERGETICO", unitsPerPack: 1, packPrice: 5.99 },
    { id: 58, name: "ENERGETICO FUSION 250ML", unitOfMeasure: "LATA", cost: 3.2, stock: 100, category: "ENERGETICO", unitsPerPack: 1, packPrice: 5.49 },
    { id: 59, name: "ENERGETICO MONSTER 473ML", unitOfMeasure: "LATA", cost: 5.5, stock: 100, category: "ENERGETICO", unitsPerPack: 1, packPrice: 8.99 },
    { id: 60, name: "ENERGETICO RED BULL 250ML", unitOfMeasure: "LATA", cost: 6.0, stock: 100, category: "ENERGETICO", unitsPerPack: 1, packPrice: 9.99 },
    { id: 61, name: "ENERGETICO VIBE 2L", unitOfMeasure: "UNIDADE", cost: 10.0, stock: 100, category: "ENERGETICO", unitsPerPack: 1, packPrice: 14.90 },
    { id: 62, name: "GATORADE LIMAO 500ML", unitOfMeasure: "UNIDADE", cost: 3.0, stock: 100, category: "OUTROS", unitsPerPack: 1, packPrice: 4.99 },
    { id: 63, name: "GELO 5KG", unitOfMeasure: "PACOTE", cost: 6.0, stock: 100, category: "CONVENIENCIA", unitsPerPack: 1, packPrice: 10.00 },
    { id: 64, name: "GELO AGUA DE COCO 200ML", unitOfMeasure: "UNIDADE", cost: 1.5, stock: 100, category: "CONVENIENCIA", unitsPerPack: 1, packPrice: 2.50 },
    { id: 65, name: "GIM ROCK'S 995ML", unitOfMeasure: "UNIDADE", cost: 20.0, stock: 100, category: "DESTILADOS", unitsPerPack: 1, packPrice: 29.90 },
    { id: 66, name: "GIM TANQUERAY 750ML", unitOfMeasure: "UNIDADE", cost: 80.0, stock: 100, category: "DESTILADOS", unitsPerPack: 1, packPrice: 119.90 },
    { id: 67, name: "GROSELHA MILANI 1L", unitOfMeasure: "UNIDADE", cost: 6.0, stock: 100, category: "OUTROS", unitsPerPack: 1, packPrice: 9.90 },
    { id: 68, name: "REFRIG ANTARCTICA 2L", unitOfMeasure: "PET", cost: 5.0, stock: 100, category: "REFRIGERANTE", unitsPerPack: 1, packPrice: 8.49 },
    { id: 69, name: "REFRIG COCA COLA 1L", unitOfMeasure: "PET", cost: 4.5, stock: 100, category: "REFRIGERANTE", unitsPerPack: 1, packPrice: 7.19 },
    { id: 70, name: "REFRIG COCA COLA 2L", unitOfMeasure: "PET", cost: 7.0, stock: 100, category: "REFRIGERANTE", unitsPerPack: 1, packPrice: 10.90 },
    { id: 71, name: "REFRIG COCA COLA 2L", unitOfMeasure: "PET", cost: 6.5, stock: 100, category: "REFRIGERANTE", unitsPerPack: 1, packPrice: 9.99 },
    { id: 72, name: "REFRIG COCA COLA 350ML", unitOfMeasure: "LATA", cost: 2.4, stock: 100, category: "REFRIGERANTE", unitsPerPack: 1, packPrice: 3.99 },
    { id: 73, name: "REFRIG COCA COLA 600ML", unitOfMeasure: "PET", cost: 3.5, stock: 100, category: "REFRIGERANTE", unitsPerPack: 1, packPrice: 5.99 },
    { id: 74, name: "REFRIG COCA COLA S/ACUCAR 2L", unitOfMeasure: "PET", cost: 6.5, stock: 100, category: "REFRIGERANTE", unitsPerPack: 1, packPrice: 9.99 },
    { id: 75, name: "REFRIG FANTA 2L", unitOfMeasure: "PET", cost: 5.0, stock: 100, category: "REFRIGERANTE", unitsPerPack: 1, packPrice: 8.49 },
    { id: 76, name: "REFRIG FANTA 350ML", unitOfMeasure: "LATA", cost: 2.0, stock: 100, category: "REFRIGERANTE", unitsPerPack: 1, packPrice: 3.49 },
    { id: 77, name: "REFRIG GUARANA 2L", unitOfMeasure: "PET", cost: 4.8, stock: 100, category: "REFRIGERANTE", unitsPerPack: 1, packPrice: 7.99 },
    { id: 78, name: "REFRIG GUARANA 350ML", unitOfMeasure: "LATA", cost: 1.9, stock: 100, category: "REFRIGERANTE", unitsPerPack: 1, packPrice: 3.29 },
    { id: 79, name: "REFRIG GUARANA S/ACUCAR 2L", unitOfMeasure: "PET", cost: 4.8, stock: 100, category: "REFRIGERANTE", unitsPerPack: 1, packPrice: 7.99 },
    { id: 80, name: "REFRIG PEPSI 2L", unitOfMeasure: "PET", cost: 4.8, stock: 100, category: "REFRIGERANTE", unitsPerPack: 1, packPrice: 7.99 },
    { id: 81, name: "REFRIG SCHWEPPES 1,5L", unitOfMeasure: "PET", cost: 5.5, stock: 100, category: "REFRIGERANTE", unitsPerPack: 1, packPrice: 8.99 },
    { id: 82, name: "REFRIG SODA 2L", unitOfMeasure: "PET", cost: 4.5, stock: 100, category: "REFRIGERANTE", unitsPerPack: 1, packPrice: 7.49 },
    { id: 83, name: "REFRIG SPRITE 2L", unitOfMeasure: "PET", cost: 5.0, stock: 100, category: "REFRIGERANTE", unitsPerPack: 1, packPrice: 8.49 },
    { id: 84, name: "RUM MONTILLA 1L", unitOfMeasure: "UNIDADE", cost: 20.0, stock: 100, category: "DESTILADOS", unitsPerPack: 1, packPrice: 29.90 },
    { id: 85, name: "SAKE JUN DAITI 740ML", unitOfMeasure: "UNIDADE", cost: 18.0, stock: 100, category: "DESTILADOS", unitsPerPack: 1, packPrice: 24.90 },
    { id: 86, name: "SUCO DEL VALLE 1L", unitOfMeasure: "CAIXA", cost: 5.0, stock: 100, category: "SUCOS E CHAS", unitsPerPack: 1, packPrice: 7.99 },
    { id: 87, name: "SUCO DEL VALLE 350ML", unitOfMeasure: "LATA", cost: 2.8, stock: 100, category: "SUCOS E CHAS", unitsPerPack: 1, packPrice: 4.49 },
    { id: 88, name: "TEQUILA JOSE CUERVO 750ML", unitOfMeasure: "UNIDADE", cost: 70.0, stock: 100, category: "DESTILADOS", unitsPerPack: 1, packPrice: 99.90 },
    { id: 89, name: "VERMUTE MARTINI 750ML", unitOfMeasure: "UNIDADE", cost: 28.0, stock: 100, category: "DESTILADOS", unitsPerPack: 1, packPrice: 39.90 },
    { id: 90, name: "VINHO CANCAO 750ML", unitOfMeasure: "UNIDADE", cost: 10.0, stock: 100, category: "VINHOS", unitsPerPack: 1, packPrice: 14.90 },
    { id: 91, name: "VINHO CHALEIRA 750ML", unitOfMeasure: "UNIDADE", cost: 8.0, stock: 100, category: "VINHOS", unitsPerPack: 1, packPrice: 12.90 },
    { id: 92, name: "VINHO DOM BOSCO 750ML", unitOfMeasure: "UNIDADE", cost: 11.0, stock: 100, category: "VINHOS", unitsPerPack: 1, packPrice: 15.90 },
    { id: 93, name: "VINHO QUINTA DO MORGADO 750ML", unitOfMeasure: "UNIDADE", cost: 12.0, stock: 100, category: "VINHOS", unitsPerPack: 1, packPrice: 16.90 },
    { id: 94, name: "VINHO SANGUE DE BOI 750ML", unitOfMeasure: "UNIDADE", cost: 9.0, stock: 100, category: "VINHOS", unitsPerPack: 1, packPrice: 13.90 },
    { id: 95, name: "VODKA ASKOV 900ML", unitOfMeasure: "UNIDADE", cost: 14.0, stock: 100, category: "DESTILADOS", unitsPerPack: 1, packPrice: 19.90 },
    { id: 96, name: "VODKA BALALAIKA 1L", unitOfMeasure: "UNIDADE", cost: 13.0, stock: 100, category: "DESTILADOS", unitsPerPack: 1, packPrice: 18.90 },
    { id: 97, name: "VODKA ORLOFF 1L", unitOfMeasure: "UNIDADE", cost: 20.0, stock: 100, category: "DESTILADOS", unitsPerPack: 1, packPrice: 29.90 },
    { id: 98, name: "VODKA SMIRNOFF 998ML", unitOfMeasure: "UNIDADE", cost: 30.0, stock: 100, category: "DESTILADOS", unitsPerPack: 1, packPrice: 44.90 },
    { id: 99, name: "WHISKY BLACK STONE 1L", unitOfMeasure: "UNIDADE", cost: 25.0, stock: 100, category: "DESTILADOS", unitsPerPack: 1, packPrice: 34.90 },
    { id: 100, name: "WHISKY BUCHANAN'S 12 ANOS 750ML", unitOfMeasure: "UNIDADE", cost: 110.0, stock: 100, category: "DESTILADOS", unitsPerPack: 1, packPrice: 159.90 },
    { id: 101, name: "WHISKY CHIVAS 12 ANOS 750ML", unitOfMeasure: "UNIDADE", cost: 100.0, stock: 100, category: "DESTILADOS", unitsPerPack: 1, packPrice: 149.90 },
    { id: 102, name: "WHISKY JACK DANIEL'S 1L", unitOfMeasure: "UNIDADE", cost: 95.0, stock: 100, category: "DESTILADOS", unitsPerPack: 1, packPrice: 139.90 },
    { id: 103, name: "WHISKY JOHNNIE WALKER RED 750ML", unitOfMeasure: "UNIDADE", cost: 70.0, stock: 100, category: "DESTILADOS", unitsPerPack: 1, packPrice: 99.90 },
    { id: 104, name: "WHISKY OLD PARR 12 ANOS 750ML", unitOfMeasure: "UNIDADE", cost: 120.0, stock: 100, category: "DESTILADOS", unitsPerPack: 1, packPrice: 169.90 },
    { id: 105, name: "WHISKY PASSPORT 1L", unitOfMeasure: "UNIDADE", cost: 50.0, stock: 100, category: "DESTILADOS", unitsPerPack: 1, packPrice: 69.90 },
];

const calculatePrice = (packPrice: number, unitsPerPack: number) => {
    if(!unitsPerPack || unitsPerPack === 0) return packPrice;
    return packPrice / unitsPerPack;
}

const initialProductsWithPrice = initialProducts.map(p => ({
    ...p,
    price: calculatePrice(p.packPrice, p.unitsPerPack)
}))


const ProductsContext = createContext<ProductsContextType | undefined>(undefined);

export const ProductsProvider = ({ children }: { children: ReactNode }) => {
  const [products, setProducts] = useState<Product[]>(initialProductsWithPrice);
  const [productCounter, setProductCounter] = useState(initialProducts.length + 1);

  const initialCategories = useMemo(() => Array.from(new Set(initialProducts.map(p => p.category))).sort(), []);
  const initialUnits = useMemo(() => Array.from(new Set(initialProducts.map(p => p.unitOfMeasure))).sort(), []);

  const [categories, setCategories] = useState<string[]>(initialCategories);
  const [unitsOfMeasure, setUnitsOfMeasure] = useState<string[]>(initialUnits);
  
  const { toast } = useToast();

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
      products, addProduct, updateProduct, decreaseStock, increaseStock, getProductById, resetProducts,
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
