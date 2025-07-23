
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
  updateProduct: (productId: number, productData: Omit<Product, 'id'>) => void;
  decreaseStock: (items: CartItem[]) => void;
  increaseStock: (items: CartItem[]) => void;
  getProductById: (id: number) => Product | undefined;
};

const initialProducts: Product[] = [
  { id: 1, name: "AGUA C/GAS CRYSTAL 500ML", price: 2.75, stock: 100, category: "Água" },
  { id: 2, name: "AGUA S/GAS CRYSTAL 500ML", price: 2.75, stock: 100, category: "Água" },
  { id: 3, name: "AGUA S/GAS SCHIN 500ML", price: 2.19, stock: 100, category: "Água" },
  { id: 4, name: "AGUA TONICA ANTARCTICA 350ML", price: 3.49, stock: 100, category: "Refrigerante" },
  { id: 5, name: "AGUA TONICA SCHWEPPES 350ML", price: 4.19, stock: 100, category: "Refrigerante" },
  { id: 6, name: "APERITIVO CAMPARI 900ML", price: 48.9, stock: 100, category: "Bebidas" },
  { id: 7, name: "APERITIVO DE MALTE VIBE 2L", price: 16.9, stock: 100, category: "Bebidas" },
  { id: 8, name: "BEBIDA LACTEA BLUE 270ML", price: 3.49, stock: 100, category: "Bebidas" },
  { id: 9, name: "CACHACA 51 965ML", price: 15.9, stock: 100, category: "Bebidas" },
  { id: 10, name: "CACHACA JAMEL 900ML", price: 13.9, stock: 100, category: "Bebidas" },
  { id: 11, name: "CACHACA PIRASSUNUNCA 965ML", price: 14.9, stock: 100, category: "Bebidas" },
  { id: 12, name: "CACHACA VELHO BARREIRO 910ML", price: 14.9, stock: 100, category: "Bebidas" },
  { id: 13, name: "CATUABA SELVAGEM 1L", price: 12.9, stock: 100, category: "Bebidas" },
  { id: 14, name: "CERV AMSTEL 269ML", price: 2.99, stock: 100, category: "Cerveja" },
  { id: 15, name: "CERV ANTARCTICA PILSEN 350ML", price: 2.79, stock: 100, category: "Cerveja" },
  { id: 16, name: "CERV BAVARIA 350ML", price: 2.49, stock: 100, category: "Cerveja" },
  { id: 17, name: "CERV BHLSEN 350ML", price: 3.49, stock: 100, category: "Cerveja" },
  { id: 18, name: "CERV BRAHMA 269ML", price: 2.79, stock: 100, category: "Cerveja" },
  { id: 19, name: "CERV BRAHMA 350ML", price: 2.99, stock: 100, category: "Cerveja" },
  { id: 20, name: "CERV BRAHMA 473ML", price: 4.49, stock: 100, category: "Cerveja" },
  { id: 21, name: "CERV BRAHMA CHOPP 350ML", price: 2.99, stock: 100, category: "Cerveja" },
  { id: 22, name: "CERV BUDWEISER 269ML", price: 3.49, stock: 100, category: "Cerveja" },
  { id: 23, name: "CERV BUDWEISER 330ML", price: 4.49, stock: 100, category: "Cerveja" },
  { id: 24, name: "CERV BUDWEISER 350ML", price: 3.99, stock: 100, category: "Cerveja" },
  { id: 25, name: "CERV CARACU 350ML", price: 4.19, stock: 100, category: "Cerveja" },
  { id: 26, name: "CERV CORONA 330ML", price: 6.99, stock: 100, category: "Cerveja" },
  { id: 27, name: "CERV CRYSTAL 350ML", price: 2.49, stock: 100, category: "Cerveja" },
  { id: 28, name: "CERV DEVASSA 350ML", price: 2.99, stock: 100, category: "Cerveja" },
  { id: 29, name: "CERV DUPLO MALTE 350ML", price: 3.19, stock: 100, category: "Cerveja" },
  { id: 30, name: "CERV EISENBAHN 350ML", price: 3.99, stock: 100, category: "Cerveja" },
  { id: 31, name: "CERV HEINEKEN 250ML", price: 4.49, stock: 100, category: "Cerveja" },
  { id: 32, name: "CERV HEINEKEN 330ML", price: 5.49, stock: 100, category: "Cerveja" },
  { id: 33, name: "CERV HEINEKEN 350ML", price: 4.99, stock: 100, category: "Cerveja" },
  { id: 34, name: "CERV HEINEKEN S/ALCOOL 330ML", price: 5.99, stock: 100, category: "Cerveja" },
  { id: 35, name: "CERV IMPERIO 269ML", price: 2.79, stock: 100, category: "Cerveja" },
  { id: 36, name: "CERV IMPERIO 350ML", price: 2.99, stock: 100, category: "Cerveja" },
  { id: 37, name: "CERV ITAIPAVA 269ML", price: 2.49, stock: 100, category: "Cerveja" },
  { id: 38, name: "CERV ITAIPAVA 350ML", price: 2.79, stock: 100, category: "Cerveja" },
  { id: 39, name: "CERV ITAIPAVA 473ML", price: 3.99, stock: 100, category: "Cerveja" },
  { id: 40, name: "CERV KAISER 350ML", price: 2.49, stock: 100, category: "Cerveja" },
  { id: 41, name: "CERV MALZBIER 350ML", price: 3.49, stock: 100, category: "Cerveja" },
  { id: 42, name: "CERV ORIGINAL 350ML", price: 3.99, stock: 100, category: "Cerveja" },
  { id: 43, name: "CERV PETRA 269ML", price: 2.79, stock: 100, category: "Cerveja" },
  { id: 44, name: "CERV PETRA 350ML", price: 2.99, stock: 100, category: "Cerveja" },
  { id: 45, name: "CERV SERRANA 350ML", price: 2.49, stock: 100, category: "Cerveja" },
  { id: 46, name: "CERV SKOL 269ML", price: 2.79, stock: 100, category: "Cerveja" },
  { id: 47, name: "CERV SKOL 350ML", price: 2.99, stock: 100, category: "Cerveja" },
  { id: 48, name: "CERV SKOL 473ML", price: 4.49, stock: 100, category: "Cerveja" },
  { id: 49, name: "CERV STELLA ARTOIS 330ML", price: 4.99, stock: 100, category: "Cerveja" },
  { id: 50, name: "CERV SUBZERO 350ML", price: 2.79, stock: 100, category: "Cerveja" },
  { id: 51, name: "CHA LIMAO 350ML", price: 3.99, stock: 100, category: "Bebidas" },
  { id: 52, name: "CHA MATE LIMAO 300ML", price: 3.49, stock: 100, category: "Bebidas" },
  { id: 53, name: "CHA MATE NATURAL 300ML", price: 3.49, stock: 100, category: "Bebidas" },
  { id: 54, name: "CONHAQUE DE GENGIBRE 900ML", price: 16.9, stock: 100, category: "Bebidas" },
  { id: 55, name: "ENERGETICO 2L", price: 11.9, stock: 100, category: "Energético" },
  { id: 56, name: "ENERGETICO 2L", price: 9.9, stock: 100, category: "Energético" },
  { id: 57, name: "ENERGETICO BLUE RAY 250ML", price: 5.99, stock: 100, category: "Energético" },
  { id: 58, name: "ENERGETICO FUSION 250ML", price: 5.49, stock: 100, category: "Energético" },
  { id: 59, name: "ENERGETICO MONSTER 473ML", price: 8.99, stock: 100, category: "Energético" },
  { id: 60, name: "ENERGETICO RED BULL 250ML", price: 9.99, stock: 100, category: "Energético" },
  { id: 61, name: "ENERGETICO VIBE 2L", price: 14.9, stock: 100, category: "Energético" },
  { id: 62, name: "GATORADE LIMAO 500ML", price: 4.99, stock: 100, category: "Bebidas" },
  { id: 63, name: "GELO 5KG", price: 10, stock: 100, category: "Outros" },
  { id: 64, name: "GELO AGUA DE COCO 200ML", price: 2.5, stock: 100, category: "Outros" },
  { id: 65, name: "GIM ROCK'S 995ML", price: 29.9, stock: 100, category: "Bebidas" },
  { id: 66, name: "GIM TANQUERAY 750ML", price: 119.9, stock: 100, category: "Bebidas" },
  { id: 67, name: "GROSELHA MILANI 1L", price: 9.9, stock: 100, category: "Bebidas" },
  { id: 68, name: "REFRIG ANTARCTICA 2L", price: 8.49, stock: 100, category: "Refrigerante" },
  { id: 69, name: "REFRIG COCA COLA 1L", price: 7.19, stock: 100, category: "Refrigerante" },
  { id: 70, name: "REFRIG COCA COLA 2L", price: 10.9, stock: 100, category: "Refrigerante" },
  { id: 71, name: "REFRIG COCA COLA 2L", price: 9.99, stock: 100, category: "Refrigerante" },
  { id: 72, name: "REFRIG COCA COLA 350ML", price: 3.99, stock: 100, category: "Refrigerante" },
  { id: 73, name: "REFRIG COCA COLA 600ML", price: 5.99, stock: 100, category: "Refrigerante" },
  { id: 74, name: "REFRIG COCA COLA S/ACUCAR 2L", price: 9.99, stock: 100, category: "Refrigerante" },
  { id: 75, name: "REFRIG FANTA 2L", price: 8.49, stock: 100, category: "Refrigerante" },
  { id: 76, name: "REFRIG FANTA 350ML", price: 3.49, stock: 100, category: "Refrigerante" },
  { id: 77, name: "REFRIG GUARANA 2L", price: 7.99, stock: 100, category: "Refrigerante" },
  { id: 78, name: "REFRIG GUARANA 350ML", price: 3.29, stock: 100, category: "Refrigerante" },
  { id: 79, name: "REFRIG GUARANA S/ACUCAR 2L", price: 7.99, stock: 100, category: "Refrigerante" },
  { id: 80, name: "REFRIG PEPSI 2L", price: 7.99, stock: 100, category: "Refrigerante" },
  { id: 81, name: "REFRIG SCHWEPPES 1,5L", price: 8.99, stock: 100, category: "Refrigerante" },
  { id: 82, name: "REFRIG SODA 2L", price: 7.49, stock: 100, category: "Refrigerante" },
  { id: 83, name: "REFRIG SPRITE 2L", price: 8.49, stock: 100, category: "Refrigerante" },
  { id: 84, name: "RUM MONTILLA 1L", price: 29.9, stock: 100, category: "Bebidas" },
  { id: 85, name: "SAKE JUN DAITI 740ML", price: 24.9, stock: 100, category: "Bebidas" },
  { id: 86, name: "SUCO DEL VALLE 1L", price: 7.99, stock: 100, category: "Sucos" },
  { id: 87, name: "SUCO DEL VALLE 350ML", price: 4.49, stock: 100, category: "Sucos" },
  { id: 88, name: "TEQUILA JOSE CUERVO 750ML", price: 99.9, stock: 100, category: "Bebidas" },
  { id: 89, name: "VERMUTE MARTINI 750ML", price: 39.9, stock: 100, category: "Bebidas" },
  { id: 90, name: "VINHO CANCAO 750ML", price: 14.9, stock: 100, category: "Vinho" },
  { id: 91, name: "VINHO CHALEIRA 750ML", price: 12.9, stock: 100, category: "Vinho" },
  { id: 92, name: "VINHO DOM BOSCO 750ML", price: 15.9, stock: 100, category: "Vinho" },
  { id: 93, name: "VINHO QUINTA DO MORGADO 750ML", price: 16.9, stock: 100, category: "Vinho" },
  { id: 94, name: "VINHO SANGUE DE BOI 750ML", price: 13.9, stock: 100, category: "Vinho" },
  { id: 95, name: "VODKA ASKOV 900ML", price: 19.9, stock: 100, category: "Bebidas" },
  { id: 96, name: "VODKA BALALAIKA 1L", price: 18.9, stock: 100, category: "Bebidas" },
  { id: 97, name: "VODKA ORLOFF 1L", price: 29.9, stock: 100, category: "Bebidas" },
  { id: 98, name: "VODKA SMIRNOFF 998ML", price: 44.9, stock: 100, category: "Bebidas" },
  { id: 99, name: "WHISKY BLACK STONE 1L", price: 34.9, stock: 100, category: "Bebidas" },
  { id: 100, name: "WHISKY BUCHANAN'S 12 ANOS 750ML", price: 159.9, stock: 100, category: "Bebidas" },
  { id: 101, name: "WHISKY CHIVAS 12 ANOS 750ML", price: 149.9, stock: 100, category: "Bebidas" },
  { id: 102, name: "WHISKY JACK DANIEL'S 1L", price: 139.9, stock: 100, category: "Bebidas" },
  { id: 103, name: "WHISKY JOHNNIE WALKER RED 750ML", price: 99.9, stock: 100, category: "Bebidas" },
  { id: 104, name: "WHISKY OLD PARR 12 ANOS 750ML", price: 169.9, stock: 100, category: "Bebidas" },
  { id: 105, name: "WHISKY PASSPORT 1L", price: 69.9, stock: 100, category: "Bebidas" }
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

  return (
    <ProductsContext.Provider value={{ products, addProduct, updateProduct, decreaseStock, increaseStock, getProductById }}>
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
