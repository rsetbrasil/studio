
'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc, writeBatch, query, where } from 'firebase/firestore';

export type Product = {
  id: string; // Firestore ID is a string
  name: string;
  unitOfMeasure: string;
  cost: number;
  price: number;
  stock: number;
  category: string;
  unitsPerPack: number;
  packPrice: number;
  imageUrl?: string;
};

type ProductFormData = Omit<Product, 'id' | 'price'>;

type CartItem = {
    id: string;
    quantity: number;
};

type ProductsContextType = {
  products: Product[];
  addProduct: (productData: ProductFormData) => Promise<void>;
  updateProduct: (productId: string, productData: ProductFormData) => Promise<void>;
  deleteProduct: (productId: string, sales: any[], orders: any[]) => Promise<void>;
  decreaseStock: (items: CartItem[]) => Promise<void>;
  increaseStock: (items: CartItem[]) => Promise<void>;
  getProductById: (id: string) => Product | undefined;
  resetProducts: () => Promise<void>;
  loadProducts: (products: ProductFormData[]) => Promise<void>;
  isMounted: boolean; // Keep for UI rendering logic, but data loading is async now
  
  categories: string[];
  unitsOfMeasure: string[];
  addCategory: (category: string) => Promise<void>;
  updateCategory: (oldCategory: string, newCategory: string) => Promise<void>;
  deleteCategory: (category: string) => Promise<void>;
  addUnitOfMeasure: (unit: string) => Promise<void>;
  updateUnitOfMeasure: (oldUnit: string, newUnit: string) => Promise<void>;
  deleteUnitOfMeasure: (unit: string) => Promise<void>;
};

const calculatePrice = (packPrice: number, unitsPerPack: number) => {
    if(!unitsPerPack || unitsPerPack === 0) return packPrice;
    return packPrice / unitsPerPack;
}

const initialCategories: string[] = [
  "ÀGUAS", "BOMBONIERE", "CERVEJAS", "APERITIVO", "REFRIGERANTES", "DRINKS", 
  "CACHAÇA", "CARVÃO", "WHISCKS", "CHAMPANHE", "TABACARIA", "VODKAS", 
  "ENÈRGETICOS", "MANTIMENTOS", "ACHOCOLATADOS", "SUCOS", "VINHOS"
];
const initialUnits: string[] = ["UNIDADE", "FARDO", "CAIXA", "UNID", "MAÇO"];


const ProductsContext = createContext<ProductsContextType | undefined>(undefined);

export const ProductsProvider = ({ children }: { children: ReactNode }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [unitsOfMeasure, setUnitsOfMeasure] = useState<string[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  
  const { toast } = useToast();
  
  const fetchProducts = async () => {
    const productsCollection = collection(db, "products");
    const productsSnapshot = await getDocs(productsCollection);
    const productsList = productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
    setProducts(productsList);
  };

  const fetchMetadata = async () => {
    const categoriesSnapshot = await getDocs(collection(db, "categories"));
    if (categoriesSnapshot.empty) {
        const batch = writeBatch(db);
        initialCategories.forEach(cat => {
            const docRef = doc(collection(db, "categories"));
            batch.set(docRef, { name: cat });
        });
        await batch.commit();
        setCategories(initialCategories.sort());
    } else {
        setCategories(categoriesSnapshot.docs.map(doc => doc.data().name).sort());
    }

    const unitsSnapshot = await getDocs(collection(db, "unitsOfMeasure"));
    if (unitsSnapshot.empty) {
        const batch = writeBatch(db);
        initialUnits.forEach(unit => {
            const docRef = doc(collection(db, "unitsOfMeasure"));
            batch.set(docRef, { name: unit });
        });
        await batch.commit();
        setUnitsOfMeasure(initialUnits.sort());
    } else {
        setUnitsOfMeasure(unitsSnapshot.docs.map(doc => doc.data().name).sort());
    }
  };
  
  useEffect(() => {
    setIsMounted(true);
    fetchProducts();
    fetchMetadata();
  }, []);

  const addProduct = async (productData: ProductFormData) => {
    try {
        const newProduct = {
            ...productData,
            price: calculatePrice(productData.packPrice, productData.unitsPerPack)
        };
        const docRef = await addDoc(collection(db, "products"), newProduct);
        setProducts(prev => [...prev, { id: docRef.id, ...newProduct }]);
        toast({ title: "Produto adicionado com sucesso!" });
    } catch (error) {
        console.error("Error adding product: ", error);
        toast({ title: "Erro ao adicionar produto", variant: "destructive" });
    }
  };

  const updateProduct = async (productId: string, productData: ProductFormData) => {
    try {
        const productRef = doc(db, "products", productId);
        const updatedProductData = {
            ...productData,
            price: calculatePrice(productData.packPrice, productData.unitsPerPack)
        };
        await updateDoc(productRef, updatedProductData);
        setProducts(prev => prev.map(p => p.id === productId ? { id: productId, ...updatedProductData } : p));
        toast({ title: "Produto atualizado com sucesso!" });
    } catch (error) {
        console.error("Error updating product: ", error);
        toast({ title: "Erro ao atualizar produto", variant: "destructive" });
    }
  };

  const deleteProduct = async (productId: string, sales: any[], orders: any[]) => {
    // This check should eventually be against Firestore data, not local context data
    const isProductInSale = sales.some(sale => sale.items.some((item:any) => item.id === productId));
    const isProductInOrder = orders.some(order => order.items.some((item:any) => item.id === productId));

    if (isProductInSale || isProductInOrder) {
      toast({
        title: "Produto em Uso",
        description: "Não é possível excluir um produto que já foi vendido ou está em um pedido.",
        variant: "destructive",
      });
      return;
    }
    
    try {
        await deleteDoc(doc(db, "products", productId));
        setProducts(prev => prev.filter(p => p.id !== productId));
        toast({ title: "Produto excluído com sucesso!", variant: 'destructive' });
    } catch (error) {
        console.error("Error deleting product: ", error);
        toast({ title: "Erro ao excluir produto", variant: "destructive" });
    }
  };
  
  const loadProducts = async (newProducts: ProductFormData[]) => {
      try {
        const batch = writeBatch(db);
        const productsCollection = collection(db, "products");
        
        // Clear existing products
        const existingDocs = await getDocs(productsCollection);
        existingDocs.forEach(doc => batch.delete(doc.ref));

        // Ensure all categories and units from the import exist
        const newCategories = [...new Set(newProducts.map(p => p.category.toUpperCase()))];
        const newUnits = [...new Set(newProducts.map(p => p.unitOfMeasure.toUpperCase()))];
        
        newCategories.forEach(cat => addCategory(cat));
        newUnits.forEach(unit => addUnitOfMeasure(unit));

        // Add new products
        newProducts.forEach(p => {
            const docRef = doc(productsCollection);
            batch.set(docRef, {
                ...p,
                category: p.category.toUpperCase(),
                unitOfMeasure: p.unitOfMeasure.toUpperCase(),
                price: calculatePrice(p.packPrice, p.unitsPerPack)
            });
        });
        
        await batch.commit();
        await fetchProducts(); // Refetch all products to get new IDs
        await fetchMetadata(); // Refetch metadata to include any new ones
        toast({ title: `${newProducts.length} produtos importados com sucesso.` });
      } catch (error) {
         console.error("Error loading products: ", error);
         toast({ title: "Erro ao importar produtos.", variant: "destructive" });
      }
  };

  const updateStock = async (items: CartItem[], operation: 'increase' | 'decrease') => {
      const batch = writeBatch(db);
      const updatedProductsLocally = [...products];

      for (const item of items) {
          const productRef = doc(db, "products", item.id);
          const productIndex = updatedProductsLocally.findIndex(p => p.id === item.id);
          if (productIndex !== -1) {
              const currentStock = updatedProductsLocally[productIndex].stock;
              const newStock = operation === 'increase'
                  ? currentStock + item.quantity
                  : currentStock - item.quantity;
              
              batch.update(productRef, { stock: newStock });
              updatedProductsLocally[productIndex].stock = newStock;
          }
      }
      
      try {
          await batch.commit();
          setProducts(updatedProductsLocally);
      } catch (error) {
          console.error("Error updating stock: ", error);
          toast({ title: "Erro ao atualizar estoque", variant: "destructive" });
          fetchProducts(); // Refetch to sync with db on error
      }
  };

  const decreaseStock = (items: CartItem[]) => updateStock(items, 'decrease');
  const increaseStock = (items: CartItem[]) => updateStock(items, 'increase');
  const getProductById = (id: string) => products.find(p => p.id === id);
  
  const resetProducts = async () => {
    try {
        const batch = writeBatch(db);
        const productsSnapshot = await getDocs(collection(db, "products"));
        productsSnapshot.forEach(doc => batch.delete(doc.ref));
        await batch.commit();
        setProducts([]);
        toast({ title: "Produtos zerados com sucesso."});
    } catch(e) {
        toast({ title: "Erro ao zerar produtos.", variant: 'destructive'});
    }
  }

  // --- Metadata Management ---
  const addCategory = async (category: string) => {
    const upperCategory = category.toUpperCase();
    if (upperCategory && !categories.includes(upperCategory)) {
      const q = query(collection(db, 'categories'), where("name", "==", upperCategory));
      const snapshot = await getDocs(q);
      if(snapshot.empty){
        await addDoc(collection(db, 'categories'), { name: upperCategory });
        setCategories(prev => [...prev, upperCategory].sort());
      }
    }
  };

  const updateCategory = async (oldCategory: string, newCategory: string) => {
    const upperNewCategory = newCategory.toUpperCase();
    if (!upperNewCategory || upperNewCategory === oldCategory) return;
    
    // Update category name in categories collection
    const q = query(collection(db, 'categories'), where("name", "==", oldCategory));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
        const docRef = snapshot.docs[0].ref;
        await updateDoc(docRef, { name: upperNewCategory });
    }
    
    // This part is complex in firestore, would require a batch update on all products.
    // For now, let's just update the local state and category list.
    // A more robust solution would be a cloud function to handle this data migration.
    setCategories(prev => prev.map(c => c === oldCategory ? upperNewCategory : c).sort());
    setProducts(prev => prev.map(p => p.category === oldCategory ? { ...p, category: upperNewCategory } : p));
  };

  const deleteCategory = async (category: string) => {
    const isCategoryInUse = products.some(p => p.category === category);
    if (isCategoryInUse) {
        toast({ title: "Categoria em uso", variant: "destructive" });
        return;
    }
    const q = query(collection(db, 'categories'), where("name", "==", category));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
        await deleteDoc(snapshot.docs[0].ref);
        setCategories(prev => prev.filter(c => c !== category));
    }
  };
  
  const addUnitOfMeasure = async (unit: string) => {
    const upperUnit = unit.toUpperCase();
    if (upperUnit && !unitsOfMeasure.includes(upperUnit)) {
       const q = query(collection(db, 'unitsOfMeasure'), where("name", "==", upperUnit));
        const snapshot = await getDocs(q);
        if(snapshot.empty){
          await addDoc(collection(db, 'unitsOfMeasure'), { name: upperUnit });
          setUnitsOfMeasure(prev => [...prev, upperUnit].sort());
        }
    }
  };

  const updateUnitOfMeasure = async (oldUnit: string, newUnit: string) => {
    const upperNewUnit = newUnit.toUpperCase();
    if (!upperNewUnit || upperNewUnit === oldUnit) return;
    const q = query(collection(db, 'unitsOfMeasure'), where("name", "==", oldUnit));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
        await updateDoc(snapshot.docs[0].ref, { name: upperNewUnit });
    }
    setUnitsOfMeasure(prev => prev.map(u => u === oldUnit ? upperNewUnit : u).sort());
    setProducts(prev => prev.map(p => p.unitOfMeasure === oldUnit ? { ...p, unitOfMeasure: upperNewUnit } : p));
  };

  const deleteUnitOfMeasure = async (unit: string) => {
    const isUnitInUse = products.some(p => p.unitOfMeasure === unit);
    if (isUnitInUse) {
        toast({ title: "Unidade de medida em uso", variant: "destructive"});
        return;
    }
    const q = query(collection(db, 'unitsOfMeasure'), where("name", "==", unit));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
        await deleteDoc(snapshot.docs[0].ref);
        setUnitsOfMeasure(prev => prev.filter(u => u !== unit));
    }
  };


  return (
    <ProductsContext.Provider value={{ 
      products, addProduct, updateProduct, deleteProduct, decreaseStock, increaseStock, getProductById, resetProducts, loadProducts, isMounted,
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
