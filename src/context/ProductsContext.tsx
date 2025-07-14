
'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Product = {
  id: number;
  name: string;
  price: number;
  stock: number;
  category: string;
};

type CartItem = {
    id: number;
    quantity: number;
};

type ProductsContextType = {
  products: Product[];
  addProduct: (productData: Omit<Product, 'id'>) => void;
  decreaseStock: (items: CartItem[]) => void;
  increaseStock: (items: CartItem[]) => void;
  getProductById: (id: number) => Product | undefined;
};

const initialProducts: Product[] = [
  { id: 1, name: "Coca-Cola 2L", price: 7.0, stock: 150, category: "Refrigerante" },
  { id: 2, name: "Guaraná Antarctica 2L", price: 6.5, stock: 120, category: "Refrigerante" },
  { id: 3, name: "Skol 350ml Lata", price: 3.5, stock: 300, category: "Cerveja" },
  { id: 4, name: "Brahma 350ml Lata", price: 3.4, stock: 250, category: "Cerveja" },
  { id: 5, name: "Heineken 330ml Long Neck", price: 5.5, stock: 180, category: "Cerveja" },
  { id: 6, name: "Red Bull Energy Drink", price: 9.0, stock: 90, category: "Energético" },
];


const ProductsContext = createContext<ProductsContextType | undefined>(undefined);

export const ProductsProvider = ({ children }: { children: ReactNode }) => {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [productCounter, setProductCounter] = useState(initialProducts.length + 1);

  const addProduct = (productData: Omit<Product, 'id'>) => {
    const newProduct: Product = {
      ...productData,
      id: productCounter,
    };
    setProducts(prevProducts => [...prevProducts, newProduct]);
    setProductCounter(prev => prev + 1);
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

  return (
    <ProductsContext.Provider value={{ products, addProduct, decreaseStock, increaseStock, getProductById }}>
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
