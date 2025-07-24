
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

const initialProducts: Product[] = [];
const initialCategories: string[] = [];
const initialUnits: string[] = [];

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
  const [products, setProducts] = useState<Product[]>([]);
  const [productCounter, setProductCounter] = useState<number>(1);
  const [categories, setCategories] = useState<string[]>([]);
  const [unitsOfMeasure, setUnitsOfMeasure] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  
  const { toast } = useToast();
  
  useEffect(() => {
    // Load from localStorage only on the client side after the component has mounted
    setProducts(getInitialState('products', initialProducts));
    setProductCounter(getInitialState('productCounter', 1));
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
