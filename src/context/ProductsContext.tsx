
'use client';

import React, { createContext, useContext, useState, ReactNode, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';

export type Product = {
  id: number;
  name: string;
  price: number;
  stock: number;
  category: string;
  unitOfMeasure: string;
};

type CartItem = {
    id: number;
    quantity: number;
};

type ProductsContextType = {
  products: Product[];
  addProduct: (productData: Omit<Product, 'id'>) => void;
  updateProduct: (productId: number, productData: Omit<Product, 'id'>) => void;
  decreaseStock: (items: CartItem[]) => void;
  increaseStock: (items: CartItem[]) => void;
  getProductById: (id: number) => Product | undefined;
  
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
  { id: 1, name: "AGUA C/GAS CRYSTAL 500ML", price: 2.75, stock: 100, category: "Água", unitOfMeasure: "ML" },
  { id: 2, name: "AGUA S/GAS CRYSTAL 500ML", price: 2.75, stock: 100, category: "Água", unitOfMeasure: "ML" },
  { id: 3, name: "AGUA S/GAS SCHIN 500ML", price: 2.19, stock: 100, category: "Água", unitOfMeasure: "ML" },
  { id: 4, name: "AGUA TONICA ANTARCTICA 350ML", price: 3.49, stock: 100, category: "Refrigerante", unitOfMeasure: "ML" },
  { id: 5, name: "AGUA TONICA SCHWEPPES 350ML", price: 4.19, stock: 100, category: "Refrigerante", unitOfMeasure: "ML" },
  { id: 6, name: "APERITIVO CAMPARI 900ML", price: 48.9, stock: 100, category: "Bebidas", unitOfMeasure: "ML" },
  { id: 7, name: "APERITIVO DE MALTE VIBE 2L", price: 16.9, stock: 100, category: "Bebidas", unitOfMeasure: "L" },
  { id: 8, name: "BEBIDA LACTEA BLUE 270ML", price: 3.49, stock: 100, category: "Bebidas", unitOfMeasure: "ML" },
  { id: 9, name: "CACHACA 51 965ML", price: 15.9, stock: 100, category: "Bebidas", unitOfMeasure: "ML" },
  { id: 10, name: "CACHACA JAMEL 900ML", price: 13.9, stock: 100, category: "Bebidas", unitOfMeasure: "ML" },
  { id: 11, name: "CACHACA PIRASSUNUNCA 965ML", price: 14.9, stock: 100, category: "Bebidas", unitOfMeasure: "ML" },
  { id: 12, name: "CACHACA VELHO BARREIRO 910ML", price: 14.9, stock: 100, category: "Bebidas", unitOfMeasure: "ML" },
  { id: 13, name: "CATUABA SELVAGEM 1L", price: 12.9, stock: 100, category: "Bebidas", unitOfMeasure: "L" },
  { id: 14, name: "CERV AMSTEL 269ML", price: 2.99, stock: 100, category: "Cerveja", unitOfMeasure: "ML" },
  { id: 15, name: "CERV ANTARCTICA PILSEN 350ML", price: 2.79, stock: 100, category: "Cerveja", unitOfMeasure: "ML" },
  { id: 16, name: "CERV BAVARIA 350ML", price: 2.49, stock: 100, category: "Cerveja", unitOfMeasure: "ML" },
  { id: 17, name: "CERV BHLSEN 350ML", price: 3.49, stock: 100, category: "Cerveja", unitOfMeasure: "ML" },
  { id: 18, name: "CERV BRAHMA 269ML", price: 2.79, stock: 100, category: "Cerveja", unitOfMeasure: "ML" },
  { id: 19, name: "CERV BRAHMA 350ML", price: 2.99, stock: 100, category: "Cerveja", unitOfMeasure: "ML" },
  { id: 20, name: "CERV BRAHMA 473ML", price: 4.49, stock: 100, category: "Cerveja", unitOfMeasure: "ML" },
  { id: 21, name: "CERV BRAHMA CHOPP 350ML", price: 2.99, stock: 100, category: "Cerveja", unitOfMeasure: "ML" },
  { id: 22, name: "CERV BUDWEISER 269ML", price: 3.49, stock: 100, category: "Cerveja", unitOfMeasure: "ML" },
  { id: 23, name: "CERV BUDWEISER 330ML", price: 4.49, stock: 100, category: "Cerveja", unitOfMeasure: "ML" },
  { id: 24, name: "CERV BUDWEISER 350ML", price: 3.99, stock: 100, category: "Cerveja", unitOfMeasure: "ML" },
  { id: 25, name: "CERV CARACU 350ML", price: 4.19, stock: 100, category: "Cerveja", unitOfMeasure: "ML" },
  { id: 26, name: "CERV CORONA 330ML", price: 6.99, stock: 100, category: "Cerveja", unitOfMeasure: "ML" },
  { id: 27, name: "CERV CRYSTAL 350ML", price: 2.49, stock: 100, category: "Cerveja", unitOfMeasure: "ML" },
  { id: 28, name: "CERV DEVASSA 350ML", price: 2.99, stock: 100, category: "Cerveja", unitOfMeasure: "ML" },
  { id: 29, name: "CERV DUPLO MALTE 350ML", price: 3.19, stock: 100, category: "Cerveja", unitOfMeasure: "ML" },
  { id: 30, name: "CERV EISENBAHN 350ML", price: 3.99, stock: 100, category: "Cerveja", unitOfMeasure: "ML" },
  { id: 31, name: "CERV HEINEKEN 250ML", price: 4.49, stock: 100, category: "Cerveja", unitOfMeasure: "ML" },
  { id: 32, name: "CERV HEINEKEN 330ML", price: 5.49, stock: 100, category: "Cerveja", unitOfMeasure: "ML" },
  { id: 33, name: "CERV HEINEKEN 350ML", price: 4.99, stock: 100, category: "Cerveja", unitOfMeasure: "ML" },
  { id: 34, name: "CERV HEINEKEN S/ALCOOL 330ML", price: 5.99, stock: 100, category: "Cerveja", unitOfMeasure: "ML" },
  { id: 35, name: "CERV IMPERIO 269ML", price: 2.79, stock: 100, category: "Cerveja", unitOfMeasure: "ML" },
  { id: 36, name: "CERV IMPERIO 350ML", price: 2.99, stock: 100, category: "Cerveja", unitOfMeasure: "ML" },
  { id: 37, name: "CERV ITAIPAVA 269ML", price: 2.49, stock: 100, category: "Cerveja", unitOfMeasure: "ML" },
  { id: 38, name: "CERV ITAIPAVA 350ML", price: 2.79, stock: 100, category: "Cerveja", unitOfMeasure: "ML" },
  { id: 39, name: "CERV ITAIPAVA 473ML", price: 3.99, stock: 100, category: "Cerveja", unitOfMeasure: "ML" },
  { id: 40, name: "CERV KAISER 350ML", price: 2.49, stock: 100, category: "Cerveja", unitOfMeasure: "ML" },
  { id: 41, name: "CERV MALZBIER 350ML", price: 3.49, stock: 100, category: "Cerveja", unitOfMeasure: "ML" },
  { id: 42, name: "CERV ORIGINAL 350ML", price: 3.99, stock: 100, category: "Cerveja", unitOfMeasure: "ML" },
  { id: 43, name: "CERV PETRA 269ML", price: 2.79, stock: 100, category: "Cerveja", unitOfMeasure: "ML" },
  { id: 44, name: "CERV PETRA 350ML", price: 2.99, stock: 100, category: "Cerveja", unitOfMeasure: "ML" },
  { id: 45, name: "CERV SERRANA 350ML", price: 2.49, stock: 100, category: "Cerveja", unitOfMeasure: "ML" },
  { id: 46, name: "CERV SKOL 269ML", price: 2.79, stock: 100, category: "Cerveja", unitOfMeasure: "ML" },
  { id: 47, name: "CERV SKOL 350ML", price: 2.99, stock: 100, category: "Cerveja", unitOfMeasure: "ML" },
  { id: 48, name: "CERV SKOL 473ML", price: 4.49, stock: 100, category: "Cerveja", unitOfMeasure: "ML" },
  { id: 49, name: "CERV STELLA ARTOIS 330ML", price: 4.99, stock: 100, category: "Cerveja", unitOfMeasure: "ML" },
  { id: 50, name: "CERV SUBZERO 350ML", price: 2.79, stock: 100, category: "Cerveja", unitOfMeasure: "ML" },
  { id: 51, name: "CHA LIMAO 350ML", price: 3.99, stock: 100, category: "Bebidas", unitOfMeasure: "ML" },
  { id: 52, name: "CHA MATE LIMAO 300ML", price: 3.49, stock: 100, category: "Bebidas", unitOfMeasure: "ML" },
  { id: 53, name: "CHA MATE NATURAL 300ML", price: 3.49, stock: 100, category: "Bebidas", unitOfMeasure: "ML" },
  { id: 54, name: "CONHAQUE DE GENGIBRE 900ML", price: 16.9, stock: 100, category: "Bebidas", unitOfMeasure: "ML" },
  { id: 55, name: "ENERGETICO 2L", price: 11.9, stock: 100, category: "Energético", unitOfMeasure: "L" },
  { id: 56, name: "ENERGETICO 2L", price: 9.9, stock: 100, category: "Energético", unitOfMeasure: "L" },
  { id: 57, name: "ENERGETICO BLUE RAY 250ML", price: 5.99, stock: 100, category: "Energético", unitOfMeasure: "ML" },
  { id: 58, name: "ENERGETICO FUSION 250ML", price: 5.49, stock: 100, category: "Energético", unitOfMeasure: "ML" },
  { id: 59, name: "ENERGETICO MONSTER 473ML", price: 8.99, stock: 100, category: "Energético", unitOfMeasure: "ML" },
  { id: 60, name: "ENERGETICO RED BULL 250ML", price: 9.99, stock: 100, category: "Energético", unitOfMeasure: "ML" },
  { id: 61, name: "ENERGETICO VIBE 2L", price: 14.9, stock: 100, category: "Energético", unitOfMeasure: "L" },
  { id: 62, name: "GATORADE LIMAO 500ML", price: 4.99, stock: 100, category: "Bebidas", unitOfMeasure: "ML" },
  { id: 63, name: "GELO 5KG", price: 10, stock: 100, category: "Outros", unitOfMeasure: "KG" },
  { id: 64, name: "GELO AGUA DE COCO 200ML", price: 2.5, stock: 100, category: "Outros", unitOfMeasure: "ML" },
  { id: 65, name: "GIM ROCK'S 995ML", price: 29.9, stock: 100, category: "Bebidas", unitOfMeasure: "ML" },
  { id: 66, name: "GIM TANQUERAY 750ML", price: 119.9, stock: 100, category: "Bebidas", unitOfMeasure: "ML" },
  { id: 67, name: "GROSELHA MILANI 1L", price: 9.9, stock: 100, category: "Bebidas", unitOfMeasure: "L" },
  { id: 68, name: "REFRIG ANTARCTICA 2L", price: 8.49, stock: 100, category: "Refrigerante", unitOfMeasure: "L" },
  { id: 69, name: "REFRIG COCA COLA 1L", price: 7.19, stock: 100, category: "Refrigerante", unitOfMeasure: "L" },
  { id: 70, name: "REFRIG COCA COLA 2L", price: 10.9, stock: 100, category: "Refrigerante", unitOfMeasure: "L" },
  { id: 71, name: "REFRIG COCA COLA 2L", price: 9.99, stock: 100, category: "Refrigerante", unitOfMeasure: "L" },
  { id: 72, name: "REFRIG COCA COLA 350ML", price: 3.99, stock: 100, category: "Refrigerante", unitOfMeasure: "ML" },
  { id: 73, name: "REFRIG COCA COLA 600ML", price: 5.99, stock: 100, category: "Refrigerante", unitOfMeasure: "ML" },
  { id: 74, name: "REFRIG COCA COLA S/ACUCAR 2L", price: 9.99, stock: 100, category: "Refrigerante", unitOfMeasure: "L" },
  { id: 75, name: "REFRIG FANTA 2L", price: 8.49, stock: 100, category: "Refrigerante", unitOfMeasure: "L" },
  { id: 76, name: "REFRIG FANTA 350ML", price: 3.49, stock: 100, category: "Refrigerante", unitOfMeasure: "ML" },
  { id: 77, name: "REFRIG GUARANA 2L", price: 7.99, stock: 100, category: "Refrigerante", unitOfMeasure: "L" },
  { id: 78, name: "REFRIG GUARANA 350ML", price: 3.29, stock: 100, category: "Refrigerante", unitOfMeasure: "ML" },
  { id: 79, name: "REFRIG GUARANA S/ACUCAR 2L", price: 7.99, stock: 100, category: "Refrigerante", unitOfMeasure: "L" },
  { id: 80, name: "REFRIG PEPSI 2L", price: 7.99, stock: 100, category: "Refrigerante", unitOfMeasure: "L" },
  { id: 81, name: "REFRIG SCHWEPPES 1,5L", price: 8.99, stock: 100, category: "Refrigerante", unitOfMeasure: "L" },
  { id: 82, name: "REFRIG SODA 2L", price: 7.49, stock: 100, category: "Refrigerante", unitOfMeasure: "L" },
  { id: 83, name: "REFRIG SPRITE 2L", price: 8.49, stock: 100, category: "Refrigerante", unitOfMeasure: "L" },
  { id: 84, name: "RUM MONTILLA 1L", price: 29.9, stock: 100, category: "Bebidas", unitOfMeasure: "L" },
  { id: 85, name: "SAKE JUN DAITI 740ML", price: 24.9, stock: 100, category: "Bebidas", unitOfMeasure: "ML" },
  { id: 86, name: "SUCO DEL VALLE 1L", price: 7.99, stock: 100, category: "Sucos", unitOfMeasure: "L" },
  { id: 87, name: "SUCO DEL VALLE 350ML", price: 4.49, stock: 100, category: "Sucos", unitOfMeasure: "ML" },
  { id: 88, name: "TEQUILA JOSE CUERVO 750ML", price: 99.9, stock: 100, category: "Bebidas", unitOfMeasure: "ML" },
  { id: 89, name: "VERMUTE MARTINI 750ML", price: 39.9, stock: 100, category: "Bebidas", unitOfMeasure: "ML" },
  { id: 90, name: "VINHO CANCAO 750ML", price: 14.9, stock: 100, category: "Vinho", unitOfMeasure: "ML" },
  { id: 91, name: "VINHO CHALEIRA 750ML", price: 12.9, stock: 100, category: "Vinho", unitOfMeasure: "ML" },
  { id: 92, name: "VINHO DOM BOSCO 750ML", price: 15.9, stock: 100, category: "Vinho", unitOfMeasure: "ML" },
  { id: 93, name: "VINHO QUINTA DO MORGADO 750ML", price: 16.9, stock: 100, category: "Vinho", unitOfMeasure: "ML" },
  { id: 94, name: "VINHO SANGUE DE BOI 750ML", price: 13.9, stock: 100, category: "Vinho", unitOfMeasure: "ML" },
  { id: 95, name: "VODKA ASKOV 900ML", price: 19.9, stock: 100, category: "Bebidas", unitOfMeasure: "ML" },
  { id: 96, name: "VODKA BALALAIKA 1L", price: 18.9, stock: 100, category: "Bebidas", unitOfMeasure: "L" },
  { id: 97, name: "VODKA ORLOFF 1L", price: 29.9, stock: 100, category: "Bebidas", unitOfMeasure: "L" },
  { id: 98, name: "VODKA SMIRNOFF 998ML", price: 44.9, stock: 100, category: "Bebidas", unitOfMeasure: "ML" },
  { id: 99, name: "WHISKY BLACK STONE 1L", price: 34.9, stock: 100, category: "Bebidas", unitOfMeasure: "L" },
  { id: 100, name: "WHISKY BUCHANAN'S 12 ANOS 750ML", price: 159.9, stock: 100, category: "Bebidas", unitOfMeasure: "ML" },
  { id: 101, name: "WHISKY CHIVAS 12 ANOS 750ML", price: 149.9, stock: 100, category: "Bebidas", unitOfMeasure: "ML" },
  { id: 102, name: "WHISKY JACK DANIEL'S 1L", price: 139.9, stock: 100, category: "Bebidas", unitOfMeasure: "L" },
  { id: 103, name: "WHISKY JOHNNIE WALKER RED 750ML", price: 99.9, stock: 100, category: "Bebidas", unitOfMeasure: "ML" },
  { id: 104, name: "WHISKY OLD PARR 12 ANOS 750ML", price: 169.9, stock: 100, category: "Bebidas", unitOfMeasure: "ML" },
  { id: 105, name: "WHISKY PASSPORT 1L", price: 69.9, stock: 100, category: "Bebidas", unitOfMeasure: "L" }
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

  const addProduct = (productData: Omit<Product, 'id'>) => {
    const newProduct: Product = {
      ...productData,
      id: productCounter,
    };
    setProducts(prevProducts => [...prevProducts, newProduct]);
    setProductCounter(prev => prev + 1);
  };

  const updateProduct = (productId: number, productData: Omit<Product, 'id'>) => {
    setProducts(currentProducts =>
      currentProducts.map(p =>
        p.id === productId ? { ...p, ...productData, id: productId } : p
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
      products, addProduct, updateProduct, decreaseStock, increaseStock, getProductById,
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

    