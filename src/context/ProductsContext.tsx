
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

const initialProducts: Omit<Product, 'price'>[] = [
    { id: 1, name: "AGUA C/GAS CRYSTAL 500ML", category: "AGUA", unitOfMeasure: "FARDO", cost: 15.00, packPrice: 21.00, unitsPerPack: 12, stock: 50 },
    { id: 2, name: "AGUA S/GAS CRYSTAL 500ML", category: "AGUA", unitOfMeasure: "FARDO", cost: 12.00, packPrice: 18.00, unitsPerPack: 12, stock: 60 },
    { id: 3, name: "COCA-COLA 2L", category: "REFRIGERANTE", unitOfMeasure: "FARDO", cost: 45.00, packPrice: 54.00, unitsPerPack: 6, stock: 40 },
    { id: 4, name: "COCA-COLA 350ML", category: "REFRIGERANTE", unitOfMeasure: "FARDO", cost: 28.00, packPrice: 36.00, unitsPerPack: 12, stock: 80 },
    { id: 5, name: "GUARANA ANTARCTICA 2L", category: "REFRIGERANTE", unitOfMeasure: "FARDO", cost: 42.00, packPrice: 51.00, unitsPerPack: 6, stock: 35 },
    { id: 6, name: "GUARANA ANTARCTICA 350ML", category: "REFRIGERANTE", unitOfMeasure: "FARDO", cost: 26.00, packPrice: 33.00, unitsPerPack: 12, stock: 70 },
    { id: 7, name: "CERV SKOL 350ML", category: "CERVEJA", unitOfMeasure: "FARDO", cost: 25.00, packPrice: 31.00, unitsPerPack: 12, stock: 120 },
    { id: 8, name: "CERV BRAHMA 350ML", category: "CERVEJA", unitOfMeasure: "FARDO", cost: 25.50, packPrice: 31.50, unitsPerPack: 12, stock: 110 },
    { id: 9, name: "CERV HEINEKEN 330ML", category: "CERVEJA", unitOfMeasure: "FARDO", cost: 48.00, packPrice: 60.00, unitsPerPack: 12, stock: 90 },
    { id: 10, name: "SUCO LARANJA DEL VALLE 1L", category: "SUCO", unitOfMeasure: "CAIXA", cost: 30.00, packPrice: 42.00, unitsPerPack: 6, stock: 45 },
    { id: 11, name: "SUCO UVA DEL VALLE 1L", category: "SUCO", unitOfMeasure: "CAIXA", cost: 30.00, packPrice: 42.00, unitsPerPack: 6, stock: 40 },
    { id: 12, name: "ENERGETICO RED BULL 250ML", category: "ENERGETICO", unitOfMeasure: "FARDO", cost: 96.00, packPrice: 120.00, unitsPerPack: 24, stock: 30 },
    { id: 13, name: "GATORADE LIMAO 500ML", category: "ISOTONICO", unitOfMeasure: "FARDO", cost: 33.00, packPrice: 45.00, unitsPerPack: 6, stock: 25 },
];


const calculatePrice = (packPrice: number, unitsPerPack: number) => {
    if(!unitsPerPack || unitsPerPack === 0) return packPrice;
    return packPrice / unitsPerPack;
}

const initialProductsWithPrice = initialProducts.map(p => ({
    ...p,
    price: calculatePrice(p.packPrice, p.unitsPerPack)
}))

const initialCategories = Array.from(new Set(initialProducts.map(p => p.category))).sort();
const initialUnits = Array.from(new Set(initialProducts.map(p => p.unitOfMeasure))).sort();
const initialMaxId = Math.max(0, ...initialProducts.map(p => p.id));


const ProductsContext = createContext<ProductsContextType | undefined>(undefined);

export const ProductsProvider = ({ children }: { children: ReactNode }) => {
  const [products, setProducts] = useState<Product[]>(initialProductsWithPrice);
  const [productCounter, setProductCounter] = useState(initialMaxId + 1);

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
