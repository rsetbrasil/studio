
'use client';

import React, { createContext, useContext, useState, ReactNode, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';

export type Product = {
  id: number;
  name: string;
  unitOfMeasure: string;
  cost: number;
  price: number;
  margin: number;
  stock: number;
  category: string;
};

type CartItem = {
    id: number;
    quantity: number;
};

type ProductsContextType = {
  products: Product[];
  addProduct: (productData: Omit<Product, 'id' | 'margin'>) => void;
  updateProduct: (productId: number, productData: Omit<Product, 'id' | 'margin'>) => void;
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

const initialProducts: Product[] = [
  { id: 1, name: "AGUA C/GAS CRYSTAL 500ML", unitOfMeasure: "UN", cost: 1.5, price: 2.75, margin: 83.33, stock: 100, category: "AGUA" },
  { id: 2, name: "AGUA S/GAS CRYSTAL 500ML", unitOfMeasure: "UN", cost: 1.5, price: 2.75, margin: 83.33, stock: 100, category: "AGUA" },
  { id: 3, name: "AGUA S/GAS SCHIN 500ML", unitOfMeasure: "UN", cost: 1.2, price: 2.19, margin: 82.5, stock: 100, category: "AGUA" },
  { id: 4, name: "AGUA TONICA ANTARCTICA 350ML", unitOfMeasure: "LATA", cost: 2.0, price: 3.49, margin: 74.5, stock: 100, category: "REFRIGERANTE" },
  { id: 5, name: "AGUA TONICA SCHWEPPES 350ML", unitOfMeasure: "LATA", cost: 2.5, price: 4.19, margin: 67.6, stock: 100, category: "REFRIGERANTE" },
  { id: 6, name: "APERITIVO CAMPARI 900ML", unitOfMeasure: "UN", cost: 35.0, price: 48.9, margin: 39.71, stock: 100, category: "BEBIDAS" },
  { id: 7, name: "APERITIVO DE MALTE VIBE 2L", unitOfMeasure: "UN", cost: 12.0, price: 16.9, margin: 40.83, stock: 100, category: "BEBIDAS" },
  { id: 8, name: "BEBIDA LACTEA BLUE 270ML", unitOfMeasure: "UN", cost: 2.0, price: 3.49, margin: 74.5, stock: 100, category: "BEBIDAS" },
  { id: 9, name: "CACHACA 51 965ML", unitOfMeasure: "UN", cost: 10.0, price: 15.9, margin: 59.0, stock: 100, category: "BEBIDAS" },
  { id: 10, name: "CACHACA JAMEL 900ML", unitOfMeasure: "UN", cost: 9.0, price: 13.9, margin: 54.44, stock: 100, category: "BEBIDAS" },
  { id: 11, name: "CACHACA PIRASSUNUNCA 965ML", unitOfMeasure: "UN", cost: 9.5, price: 14.9, margin: 56.84, stock: 100, category: "BEBIDAS" },
  { id: 12, name: "CACHACA VELHO BARREIRO 910ML", unitOfMeasure: "UN", cost: 9.5, price: 14.9, margin: 56.84, stock: 100, category: "BEBIDAS" },
  { id: 13, name: "CATUABA SELVAGEM 1L", unitOfMeasure: "UN", cost: 8.0, price: 12.9, margin: 61.25, stock: 100, category: "BEBIDAS" },
  { id: 14, name: "CERV AMSTEL 269ML", unitOfMeasure: "LATA", cost: 1.8, price: 2.99, margin: 66.11, stock: 100, category: "CERVEJA" },
  { id: 15, name: "CERV ANTARCTICA PILSEN 350ML", unitOfMeasure: "LATA", cost: 1.7, price: 2.79, margin: 64.12, stock: 100, category: "CERVEJA" },
  { id: 16, name: "CERV BAVARIA 350ML", unitOfMeasure: "LATA", cost: 1.5, price: 2.49, margin: 66.0, stock: 100, category: "CERVEJA" },
  { id: 17, name: "CERV BHLSEN 350ML", unitOfMeasure: "LATA", cost: 2.0, price: 3.49, margin: 74.5, stock: 100, category: "CERVEJA" },
  { id: 18, name: "CERV BRAHMA 269ML", unitOfMeasure: "LATA", cost: 1.7, price: 2.79, margin: 64.12, stock: 100, category: "CERVEJA" },
  { id: 19, name: "CERV BRAHMA 350ML", unitOfMeasure: "LATA", cost: 1.8, price: 2.99, margin: 66.11, stock: 100, category: "CERVEJA" },
  { id: 20, name: "CERV BRAHMA 473ML", unitOfMeasure: "LATA", cost: 2.8, price: 4.49, margin: 60.36, stock: 100, category: "CERVEJA" },
  { id: 21, name: "CERV BRAHMA CHOPP 350ML", unitOfMeasure: "LATA", cost: 1.8, price: 2.99, margin: 66.11, stock: 100, category: "CERVEJA" },
  { id: 22, name: "CERV BUDWEISER 269ML", unitOfMeasure: "LATA", cost: 2.0, price: 3.49, margin: 74.5, stock: 100, category: "CERVEJA" },
  { id: 23, name: "CERV BUDWEISER 330ML", unitOfMeasure: "UN", cost: 2.8, price: 4.49, margin: 60.36, stock: 100, category: "CERVEJA" },
  { id: 24, name: "CERV BUDWEISER 350ML", unitOfMeasure: "LATA", cost: 2.4, price: 3.99, margin: 66.25, stock: 100, category: "CERVEJA" },
  { id: 25, name: "CERV CARACU 350ML", unitOfMeasure: "LATA", cost: 2.5, price: 4.19, margin: 67.6, stock: 100, category: "CERVEJA" },
  { id: 26, name: "CERV CORONA 330ML", unitOfMeasure: "UN", cost: 4.5, price: 6.99, margin: 55.33, stock: 100, category: "CERVEJA" },
  { id: 27, name: "CERV CRYSTAL 350ML", unitOfMeasure: "LATA", cost: 1.5, price: 2.49, margin: 66.0, stock: 100, category: "CERVEJA" },
  { id: 28, name: "CERV DEVASSA 350ML", unitOfMeasure: "LATA", cost: 1.8, price: 2.99, margin: 66.11, stock: 100, category: "CERVEJA" },
  { id: 29, name: "CERV DUPLO MALTE 350ML", unitOfMeasure: "LATA", cost: 1.9, price: 3.19, margin: 67.89, stock: 100, category: "CERVEJA" },
  { id: 30, name: "CERV EISENBAHN 350ML", unitOfMeasure: "LATA", cost: 2.4, price: 3.99, margin: 66.25, stock: 100, category: "CERVEJA" },
  { id: 31, name: "CERV HEINEKEN 250ML", unitOfMeasure: "UN", cost: 2.8, price: 4.49, margin: 60.36, stock: 100, category: "CERVEJA" },
  { id: 32, name: "CERV HEINEKEN 330ML", unitOfMeasure: "UN", cost: 3.5, price: 5.49, margin: 56.89, stock: 100, category: "CERVEJA" },
  { id: 33, name: "CERV HEINEKEN 350ML", unitOfMeasure: "LATA", cost: 3.0, price: 4.99, margin: 66.33, stock: 100, category: "CERVEJA" },
  { id: 34, name: "CERV HEINEKEN S/ALCOOL 330ML", unitOfMeasure: "UN", cost: 3.8, price: 5.99, margin: 57.63, stock: 100, category: "CERVEJA" },
  { id: 35, name: "CERV IMPERIO 269ML", unitOfMeasure: "LATA", cost: 1.7, price: 2.79, margin: 64.12, stock: 100, category: "CERVEJA" },
  { id: 36, name: "CERV IMPERIO 350ML", unitOfMeasure: "LATA", cost: 1.8, price: 2.99, margin: 66.11, stock: 100, category: "CERVEJA" },
  { id: 37, name: "CERV ITAIPAVA 269ML", unitOfMeasure: "LATA", cost: 1.5, price: 2.49, margin: 66.0, stock: 100, category: "CERVEJA" },
  { id: 38, name: "CERV ITAIPAVA 350ML", unitOfMeasure: "LATA", cost: 1.7, price: 2.79, margin: 64.12, stock: 100, category: "CERVEJA" },
  { id: 39, name: "CERV ITAIPAVA 473ML", unitOfMeasure: "LATA", cost: 2.4, price: 3.99, margin: 66.25, stock: 100, category: "CERVEJA" },
  { id: 40, name: "CERV KAISER 350ML", unitOfMeasure: "LATA", cost: 1.5, price: 2.49, margin: 66.0, stock: 100, category: "CERVEJA" },
  { id: 41, name: "CERV MALZBIER 350ML", unitOfMeasure: "LATA", cost: 2.0, price: 3.49, margin: 74.5, stock: 100, category: "CERVEJA" },
  { id: 42, name: "CERV ORIGINAL 350ML", unitOfMeasure: "LATA", cost: 2.4, price: 3.99, margin: 66.25, stock: 100, category: "CERVEJA" },
  { id: 43, name: "CERV PETRA 269ML", unitOfMeasure: "LATA", cost: 1.7, price: 2.79, margin: 64.12, stock: 100, category: "CERVEJA" },
  { id: 44, name: "CERV PETRA 350ML", unitOfMeasure: "LATA", cost: 1.8, price: 2.99, margin: 66.11, stock: 100, category: "CERVEJA" },
  { id: 45, name: "CERV SERRANA 350ML", unitOfMeasure: "LATA", cost: 1.5, price: 2.49, margin: 66.0, stock: 100, category: "CERVEJA" },
  { id: 46, name: "CERV SKOL 269ML", unitOfMeasure: "LATA", cost: 1.7, price: 2.79, margin: 64.12, stock: 100, category: "CERVEJA" },
  { id: 47, name: "CERV SKOL 350ML", unitOfMeasure: "LATA", cost: 1.8, price: 2.99, margin: 66.11, stock: 100, category: "CERVEJA" },
  { id: 48, name: "CERV SKOL 473ML", unitOfMeasure: "LATA", cost: 2.8, price: 4.49, margin: 60.36, stock: 100, category: "CERVEJA" },
  { id: 49, name: "CERV STELLA ARTOIS 330ML", unitOfMeasure: "UN", cost: 3.0, price: 4.99, margin: 66.33, stock: 100, category: "CERVEJA" },
  { id: 50, name: "CERV SUBZERO 350ML", unitOfMeasure: "LATA", cost: 1.7, price: 2.79, margin: 64.12, stock: 100, category: "CERVEJA" },
  { id: 51, name: "CHA LIMAO 350ML", unitOfMeasure: "LATA", cost: 2.4, price: 3.99, margin: 66.25, stock: 100, category: "BEBIDAS" },
  { id: 52, name: "CHA MATE LIMAO 300ML", unitOfMeasure: "UN", cost: 2.0, price: 3.49, margin: 74.5, stock: 100, category: "BEBIDAS" },
  { id: 53, name: "CHA MATE NATURAL 300ML", unitOfMeasure: "UN", cost: 2.0, price: 3.49, margin: 74.5, stock: 100, category: "BEBIDAS" },
  { id: 54, name: "CONHAQUE DE GENGIBRE 900ML", unitOfMeasure: "UN", cost: 12.0, price: 16.9, margin: 40.83, stock: 100, category: "BEBIDAS" },
  { id: 55, name: "ENERGETICO 2L", unitOfMeasure: "UN", cost: 8.0, price: 11.9, margin: 48.75, stock: 100, category: "ENERGETICO" },
  { id: 56, name: "ENERGETICO 2L", unitOfMeasure: "UN", cost: 7.0, price: 9.9, margin: 41.43, stock: 100, category: "ENERGETICO" },
  { id: 57, name: "ENERGETICO BLUE RAY 250ML", unitOfMeasure: "LATA", cost: 3.5, price: 5.99, margin: 71.14, stock: 100, category: "ENERGETICO" },
  { id: 58, name: "ENERGETICO FUSION 250ML", unitOfMeasure: "LATA", cost: 3.2, price: 5.49, margin: 71.56, stock: 100, category: "ENERGETICO" },
  { id: 59, name: "ENERGETICO MONSTER 473ML", unitOfMeasure: "LATA", cost: 5.5, price: 8.99, margin: 63.45, stock: 100, category: "ENERGETICO" },
  { id: 60, name: "ENERGETICO RED BULL 250ML", unitOfMeasure: "LATA", cost: 6.0, price: 9.99, margin: 66.5, stock: 100, category: "ENERGETICO" },
  { id: 61, name: "ENERGETICO VIBE 2L", unitOfMeasure: "UN", cost: 10.0, price: 14.9, margin: 49.0, stock: 100, category: "ENERGETICO" },
  { id: 62, name: "GATORADE LIMAO 500ML", unitOfMeasure: "UN", cost: 3.0, price: 4.99, margin: 66.33, stock: 100, category: "BEBIDAS" },
  { id: 63, name: "GELO 5KG", unitOfMeasure: "PACOTE", cost: 6.0, price: 10.0, margin: 66.67, stock: 100, category: "OUTROS" },
  { id: 64, name: "GELO AGUA DE COCO 200ML", unitOfMeasure: "UN", cost: 1.5, price: 2.5, margin: 66.67, stock: 100, category: "OUTROS" },
  { id: 65, name: "GIM ROCK'S 995ML", unitOfMeasure: "UN", cost: 20.0, price: 29.9, margin: 49.5, stock: 100, category: "BEBIDAS" },
  { id: 66, name: "GIM TANQUERAY 750ML", unitOfMeasure: "UN", cost: 80.0, price: 119.9, margin: 49.88, stock: 100, category: "BEBIDAS" },
  { id: 67, name: "GROSELHA MILANI 1L", unitOfMeasure: "UN", cost: 6.0, price: 9.9, margin: 65.0, stock: 100, category: "BEBIDAS" },
  { id: 68, name: "REFRIG ANTARCTICA 2L", unitOfMeasure: "UN", cost: 5.0, price: 8.49, margin: 69.8, stock: 100, category: "REFRIGERANTE" },
  { id: 69, name: "REFRIG COCA COLA 1L", unitOfMeasure: "UN", cost: 4.5, price: 7.19, margin: 59.78, stock: 100, category: "REFRIGERANTE" },
  { id: 70, name: "REFRIG COCA COLA 2L", unitOfMeasure: "UN", cost: 7.0, price: 10.9, margin: 55.71, stock: 100, category: "REFRIGERANTE" },
  { id: 71, name: "REFRIG COCA COLA 2L", unitOfMeasure: "UN", cost: 6.5, price: 9.99, margin: 53.69, stock: 100, category: "REFRIGERANTE" },
  { id: 72, name: "REFRIG COCA COLA 350ML", unitOfMeasure: "LATA", cost: 2.4, price: 3.99, margin: 66.25, stock: 100, category: "REFRIGERANTE" },
  { id: 73, name: "REFRIG COCA COLA 600ML", unitOfMeasure: "UN", cost: 3.5, price: 5.99, margin: 71.14, stock: 100, category: "REFRIGERANTE" },
  { id: 74, name: "REFRIG COCA COLA S/ACUCAR 2L", unitOfMeasure: "UN", cost: 6.5, price: 9.99, margin: 53.69, stock: 100, category: "REFRIGERANTE" },
  { id: 75, name: "REFRIG FANTA 2L", unitOfMeasure: "UN", cost: 5.0, price: 8.49, margin: 69.8, stock: 100, category: "REFRIGERANTE" },
  { id: 76, name: "REFRIG FANTA 350ML", unitOfMeasure: "LATA", cost: 2.0, price: 3.49, margin: 74.5, stock: 100, category: "REFRIGERANTE" },
  { id: 77, name: "REFRIG GUARANA 2L", unitOfMeasure: "UN", cost: 4.8, price: 7.99, margin: 66.46, stock: 100, category: "REFRIGERANTE" },
  { id: 78, name: "REFRIG GUARANA 350ML", unitOfMeasure: "LATA", cost: 1.9, price: 3.29, margin: 73.16, stock: 100, category: "REFRIGERANTE" },
  { id: 79, name: "REFRIG GUARANA S/ACUCAR 2L", unitOfMeasure: "UN", cost: 4.8, price: 7.99, margin: 66.46, stock: 100, category: "REFRIGERANTE" },
  { id: 80, name: "REFRIG PEPSI 2L", unitOfMeasure: "UN", cost: 4.8, price: 7.99, margin: 66.46, stock: 100, category: "REFRIGERANTE" },
  { id: 81, name: "REFRIG SCHWEPPES 1,5L", unitOfMeasure: "UN", cost: 5.5, price: 8.99, margin: 63.45, stock: 100, category: "REFRIGERANTE" },
  { id: 82, name: "REFRIG SODA 2L", unitOfMeasure: "UN", cost: 4.5, price: 7.49, margin: 66.44, stock: 100, category: "REFRIGERANTE" },
  { id: 83, name: "REFRIG SPRITE 2L", unitOfMeasure: "UN", cost: 5.0, price: 8.49, margin: 69.8, stock: 100, category: "REFRIGERANTE" },
  { id: 84, name: "RUM MONTILLA 1L", unitOfMeasure: "UN", cost: 20.0, price: 29.9, margin: 49.5, stock: 100, category: "BEBIDAS" },
  { id: 85, name: "SAKE JUN DAITI 740ML", unitOfMeasure: "UN", cost: 18.0, price: 24.9, margin: 38.33, stock: 100, category: "BEBIDAS" },
  { id: 86, name: "SUCO DEL VALLE 1L", unitOfMeasure: "UN", cost: 5.0, price: 7.99, margin: 59.8, stock: 100, category: "SUCOS" },
  { id: 87, name: "SUCO DEL VALLE 350ML", unitOfMeasure: "LATA", cost: 2.8, price: 4.49, margin: 60.36, stock: 100, category: "SUCOS" },
  { id: 88, name: "TEQUILA JOSE CUERVO 750ML", unitOfMeasure: "UN", cost: 70.0, price: 99.9, margin: 42.71, stock: 100, category: "BEBIDAS" },
  { id: 89, name: "VERMUTE MARTINI 750ML", unitOfMeasure: "UN", cost: 28.0, price: 39.9, margin: 42.5, stock: 100, category: "BEBIDAS" },
  { id: 90, name: "VINHO CANCAO 750ML", unitOfMeasure: "UN", cost: 10.0, price: 14.9, margin: 49.0, stock: 100, category: "VINHO" },
  { id: 91, name: "VINHO CHALEIRA 750ML", unitOfMeasure: "UN", cost: 8.0, price: 12.9, margin: 61.25, stock: 100, category: "VINHO" },
  { id: 92, name: "VINHO DOM BOSCO 750ML", unitOfMeasure: "UN", cost: 11.0, price: 15.9, margin: 44.55, stock: 100, category: "VINHO" },
  { id: 93, name: "VINHO QUINTA DO MORGADO 750ML", unitOfMeasure: "UN", cost: 12.0, price: 16.9, margin: 40.83, stock: 100, category: "VINHO" },
  { id: 94, name: "VINHO SANGUE DE BOI 750ML", unitOfMeasure: "UN", cost: 9.0, price: 13.9, margin: 54.44, stock: 100, category: "VINHO" },
  { id: 95, name: "VODKA ASKOV 900ML", unitOfMeasure: "UN", cost: 14.0, price: 19.9, margin: 42.14, stock: 100, category: "BEBIDAS" },
  { id: 96, name: "VODKA BALALAIKA 1L", unitOfMeasure: "UN", cost: 13.0, price: 18.9, margin: 45.38, stock: 100, category: "BEBIDAS" },
  { id: 97, name: "VODKA ORLOFF 1L", unitOfMeasure: "UN", cost: 20.0, price: 29.9, margin: 49.5, stock: 100, category: "BEBIDAS" },
  { id: 98, name: "VODKA SMIRNOFF 998ML", unitOfMeasure: "UN", cost: 30.0, price: 44.9, margin: 49.67, stock: 100, category: "BEBIDAS" },
  { id: 99, name: "WHISKY BLACK STONE 1L", unitOfMeasure: "UN", cost: 25.0, price: 34.9, margin: 39.6, stock: 100, category: "BEBIDAS" },
  { id: 100, name: "WHISKY BUCHANAN'S 12 ANOS 750ML", unitOfMeasure: "UN", cost: 110.0, price: 159.9, margin: 45.36, stock: 100, category: "BEBIDAS" },
  { id: 101, name: "WHISKY CHIVAS 12 ANOS 750ML", unitOfMeasure: "UN", cost: 100.0, price: 149.9, margin: 49.9, stock: 100, category: "BEBIDAS" },
  { id: 102, name: "WHISKY JACK DANIEL'S 1L", unitOfMeasure: "UN", cost: 95.0, price: 139.9, margin: 47.26, stock: 100, category: "BEBIDAS" },
  { id: 103, name: "WHISKY JOHNNIE WALKER RED 750ML", unitOfMeasure: "UN", cost: 70.0, price: 99.9, margin: 42.71, stock: 100, category: "BEBIDAS" },
  { id: 104, name: "WHISKY OLD PARR 12 ANOS 750ML", unitOfMeasure: "UN", cost: 120.0, price: 169.9, margin: 41.58, stock: 100, category: "BEBIDAS" },
  { id: 105, name: "WHISKY PASSPORT 1L", unitOfMeasure: "UN", cost: 50.0, price: 69.9, margin: 39.8, stock: 100, category: "BEBIDAS" },
];


const ProductsContext = createContext<ProductsContextType | undefined>(undefined);

export const ProductsProvider = ({ children }: { children: ReactNode }) => {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [productCounter, setProductCounter] = useState(initialProducts.length + 1);

  const initialCategories = useMemo(() => Array.from(new Set(initialProducts.map(p => p.category))).sort(), []);
  const initialUnits = useMemo(() => Array.from(new Set(initialProducts.map(p => p.unitOfMeasure))).sort(), []);

  const [categories, setCategories] = useState<string[]>(initialCategories);
  const [unitsOfMeasure, setUnitsOfMeasure] = useState<string[]>(initialUnits);
  
  const { toast } = useToast();

  const addProduct = (productData: Omit<Product, 'id' | 'margin'>) => {
    const margin = ((productData.price - productData.cost) / productData.cost) * 100;
    const newProduct: Product = {
      ...productData,
      id: productCounter,
      margin: margin,
    };
    setProducts(prevProducts => [...prevProducts, newProduct]);
    setProductCounter(prev => prev + 1);
  };

  const updateProduct = (productId: number, productData: Omit<Product, 'id' | 'margin'>) => {
    const margin = ((productData.price - productData.cost) / productData.cost) * 100;
    setProducts(currentProducts =>
      currentProducts.map(p =>
        p.id === productId ? { ...p, ...productData, margin: margin, id: productId } : p
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

    
