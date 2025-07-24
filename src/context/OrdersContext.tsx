
'use client';

import React, { createContext, useContext, useState, ReactNode, useMemo, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, doc, updateDoc, writeBatch, query, orderBy } from 'firebase/firestore';

type OrderItem = {
  id: number;
  name: string;
  price: number;
  quantity: number;
};

export type OrderStatus = "Pendente" | "Finalizado" | "Cancelado";

type Order = {
  id: string; // Firestore ID
  displayId: string; // Sequential ID for display
  customer: string;
  items: OrderItem[];
  date: string;
  status: OrderStatus;
  total: number;
};

type OrdersContextType = {
  orders: Order[];
  addOrder: (order: Omit<Order, 'id' | 'displayId' | 'date' | 'status'>, decreaseStock: (items: any[]) => void) => void;
  updateOrderStatus: (
    orderId: string, 
    newStatus: OrderStatus, 
    stockActions: { 
      increaseStock: (items: any[]) => void, 
      decreaseStock: (items: any[]) => void, 
      getProductById: (id: string) => any 
    }
  ) => void;
  getOrderById: (orderId: string) => Order | undefined;
  resetOrders: () => Promise<void>;
  ordersLastMonthPercentage: number;
  isMounted: boolean;
};

const OrdersContext = createContext<OrdersContextType | undefined>(undefined);

export const OrdersProvider = ({ children }: { children: ReactNode }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const { toast } = useToast();
  
  const fetchOrders = async () => {
    try {
      const ordersCollection = collection(db, "orders");
      const q = query(ordersCollection, orderBy("date", "desc"));
      const ordersSnapshot = await getDocs(q);
      const ordersList = ordersSnapshot.docs.map(d => ({ ...d.data(), id: d.id } as Order));
      setOrders(ordersList);
    } catch (e) {
      console.error("Error fetching orders:", e);
    }
  }

  useEffect(() => {
    setIsMounted(true);
    fetchOrders();
  }, []);
  
  const getNextDisplayId = async () => {
      // This counter should be stored in Firestore for consistency in a real multi-user environment
      // For simplicity here, we'll base it on the current number of orders + 1
      const orderCount = orders.length; 
      return `PED${String(orderCount + 1).padStart(3, '0')}`;
  }

  const addOrder = async (newOrderData: Omit<Order, 'id' | 'displayId'| 'date' | 'status'>, decreaseStock: (items: any[]) => void) => {
      const newDisplayId = await getNextDisplayId();
      const newDate = new Date().toISOString(); 

      const order: Omit<Order, 'id'> = {
          ...newOrderData,
          displayId: newDisplayId,
          date: newDate,
          status: "Pendente",
      };
      
      try {
        await decreaseStock(order.items);
        const docRef = await addDoc(collection(db, 'orders'), order);
        setOrders(prevOrders => [{ ...order, id: docRef.id }, ...prevOrders]);
      } catch (e) {
        console.error("Error adding order:", e);
        toast({ title: "Erro ao criar pedido", variant: "destructive"});
        // Revert stock if order creation fails
        // This is a simplified rollback. A more robust solution would use Firestore transactions.
        // For now, we assume increaseStock exists and can revert the change.
        const { increaseStock } = require('./ProductsContext');
        increaseStock(order.items);
      }
  };

  const updateOrderStatus = async (
    orderId: string, 
    newStatus: OrderStatus,
    stockActions: { 
      increaseStock: (items: any[]) => Promise<void>, 
      decreaseStock: (items: any[]) => Promise<void>, 
      getProductById: (id: string) => any 
    }
  ) => {
    const orderToUpdate = orders.find(o => o.id === orderId);
    if (!orderToUpdate) return;
    
    const oldStatus = orderToUpdate.status;
    if (oldStatus === newStatus) return;

    try {
        if (oldStatus === "Pendente" && newStatus === "Cancelado") {
            await stockActions.increaseStock(orderToUpdate.items);
        }
      
        if (oldStatus === "Cancelado" && newStatus === "Pendente") {
            const hasEnoughStock = orderToUpdate.items.every(item => {
                const product = stockActions.getProductById(String(item.id));
                return product && product.stock >= item.quantity;
            });

            if (hasEnoughStock) {
                await stockActions.decreaseStock(orderToUpdate.items);
            } else {
                toast({
                    title: "Estoque insuficiente",
                    description: "Não há estoque suficiente para reativar o pedido.",
                    variant: "destructive"
                });
                return;
            }
        }
        
        const orderRef = doc(db, "orders", orderId);
        await updateDoc(orderRef, { status: newStatus });

        setOrders(currentOrders => 
            currentOrders.map(o => o.id === orderId ? { ...o, status: newStatus } : o)
        );
    } catch(e) {
        console.error("Error updating order status:", e);
        toast({ title: "Erro ao atualizar status do pedido", variant: "destructive"});
    }
  };

  const getOrderById = (orderId: string): Order | undefined => {
    return orders.find(o => o.id === orderId);
  };
  
  const resetOrders = async () => {
    try {
        const batch = writeBatch(db);
        const ordersSnapshot = await getDocs(collection(db, "orders"));
        ordersSnapshot.forEach(doc => batch.delete(doc.ref));
        await batch.commit();
        setOrders([]);
    } catch (e) {
        console.error("Error resetting orders:", e);
    }
  };

  const ordersLastMonthPercentage = useMemo(() => {
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
    const twoMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, 1);
    
    const lastMonthOrders = orders.filter(o => new Date(o.date) >= lastMonth && new Date(o.date) <= lastMonthEnd).length;
    const twoMonthsAgoOrders = orders.filter(o => new Date(o.date) >= twoMonthsAgo && new Date(o.date) < lastMonth).length;
    
    if (twoMonthsAgoOrders === 0) {
      return lastMonthOrders > 0 ? 100 : 0;
    }
    
    return ((lastMonthOrders - twoMonthsAgoOrders) / twoMonthsAgoOrders) * 100;
  }, [orders]);

  return (
    <OrdersContext.Provider value={{ orders, addOrder, updateOrderStatus, getOrderById, resetOrders, ordersLastMonthPercentage, isMounted }}>
      {children}
    </OrdersContext.Provider>
  );
};

export const useOrders = () => {
  const context = useContext(OrdersContext);
  if (context === undefined) {
    throw new Error('useOrders must be used within an OrdersProvider');
  }
  return context;
};
