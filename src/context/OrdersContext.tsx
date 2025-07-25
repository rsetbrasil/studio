

'use client';

import React, { createContext, useContext, useState, ReactNode, useMemo, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, doc, updateDoc, writeBatch, query, orderBy, runTransaction } from 'firebase/firestore';
import { useUsers } from './UsersContext';

export type OrderItem = {
  id: number;
  name: string;
  price: number;
  quantity: number;
};

export type OrderStatus = "Pendente" | "Faturado" | "Cancelado";

type Order = {
  id: string; // Firestore ID
  displayId: string; // Sequential ID for display
  customer: string;
  items: OrderItem[];
  date: string;
  status: OrderStatus;
  total: number;
  sellerId: string;
  sellerName: string;
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
  updateOrder: (
    orderId: string,
    updatedData: { customer: string; items: OrderItem[]; total: number },
    originalItems: OrderItem[],
    stockActions: {
      increaseStock: (items: any[]) => Promise<void>;
      decreaseStock: (items: any[]) => Promise<void>;
    }
  ) => Promise<void>;
  getOrderById: (orderId: string) => Order | undefined;
  resetOrders: () => Promise<void>;
  totalOrdersToday: number;
  ordersYesterdayPercentage: number;
  isMounted: boolean;
};

const OrdersContext = createContext<OrdersContextType | undefined>(undefined);

export const OrdersProvider = ({ children }: { children: ReactNode }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const { toast } = useToast();
  const { users, isMounted: usersMounted } = useUsers();
  
  useEffect(() => {
    if (usersMounted) {
      const fetchOrders = async () => {
        try {
          const ordersCollection = collection(db, "orders");
          const q = query(ordersCollection, orderBy("date", "desc"));
          const ordersSnapshot = await getDocs(q);
          const ordersList = ordersSnapshot.docs.map(d => {
            const orderData = d.data() as Order;
            const seller = users.find(u => u.id === orderData.sellerId);
            return {
              ...orderData,
              id: d.id,
              sellerName: seller?.name || 'N/A'
            };
          });
          setOrders(ordersList);
          setIsMounted(true);
        } catch (e) {
          console.error("Error fetching orders:", e);
        }
      }
      fetchOrders();
    }
  }, [usersMounted, users]);
  
  const addOrder = async (newOrderData: Omit<Order, 'id' | 'displayId'| 'date' | 'status'>, decreaseStock: (items: { id: string, quantity: number }[]) => void) => {
      const newDate = new Date().toISOString(); 

      try {
        const itemsToDecrease = newOrderData.items.map(item => ({ id: String(item.id), quantity: item.quantity }));
        await decreaseStock(itemsToDecrease);

        const newId = await runTransaction(db, async (transaction) => {
          const counterRef = doc(db, 'counters', 'ordersCounter');
          const counterDoc = await transaction.get(counterRef);

          let nextId = 1;
          if (counterDoc.exists()) {
            nextId = counterDoc.data().count + 1;
          }
          
          const order: Omit<Order, 'id'> = {
              ...newOrderData,
              displayId: String(nextId),
              date: newDate,
              status: "Pendente",
          };

          const newOrderRef = doc(collection(db, 'orders'));
          transaction.set(newOrderRef, order);

          if (counterDoc.exists()) {
            transaction.update(counterRef, { count: nextId });
          } else {
            transaction.set(counterRef, { count: nextId });
          }

          return { firestoreId: newOrderRef.id, displayId: String(nextId) };
        });

        const newOrderForState: Order = {
          ...newOrderData,
          id: newId.firestoreId,
          displayId: newId.displayId,
          date: newDate,
          status: "Pendente",
        };
        
        setOrders(prevOrders => [newOrderForState, ...prevOrders]);

      } catch (e) {
        console.error("Error adding order:", e);
        toast({ title: "Erro ao criar pedido", variant: "destructive"});
        // Rollback stock decrease
        const { increaseStock } = require('./ProductsContext');
        const itemsToIncrease = newOrderData.items.map(item => ({ id: String(item.id), quantity: item.quantity }));
        increaseStock(itemsToIncrease);
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
            await stockActions.increaseStock(orderToUpdate.items.map(item => ({ id: String(item.id), quantity: item.quantity })));
        }
      
        if (oldStatus === "Cancelado" && newStatus === "Pendente") {
            const hasEnoughStock = orderToUpdate.items.every(item => {
                const product = stockActions.getProductById(String(item.id));
                return product && product.stock >= item.quantity;
            });

            if (hasEnoughStock) {
                await stockActions.decreaseStock(orderToUpdate.items.map(item => ({ id: String(item.id), quantity: item.quantity })));
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
  
    const updateOrder = async (
    orderId: string,
    updatedData: { customer: string; items: OrderItem[]; total: number },
    originalItems: OrderItem[],
    stockActions: {
      increaseStock: (items: any[]) => Promise<void>;
      decreaseStock: (items: any[]) => Promise<void>;
    }
  ) => {
    try {
      await stockActions.increaseStock(
        originalItems.map(item => ({ id: String(item.id), quantity: item.quantity }))
      );

      await stockActions.decreaseStock(
        updatedData.items.map(item => ({ id: String(item.id), quantity: item.quantity }))
      );

      const orderRef = doc(db, "orders", orderId);
      await updateDoc(orderRef, updatedData);

      setOrders(prevOrders =>
        prevOrders.map(o =>
          o.id === orderId ? { ...o, ...updatedData } : o
        )
      );
    } catch (error) {
      console.error("Error updating order:", error);
      toast({ title: 'Erro ao atualizar o pedido', variant: 'destructive' });
    }
  };


  const getOrderById = (orderId: string): Order | undefined => {
    return orders.find(o => o.id === orderId);
  };
  
  const resetOrders = async () => {
    try {
        const batch = writeBatch(db);
        const ordersSnapshot = await getDocs(collection(db, "orders"));
        ordersSnapshot.forEach(doc => {
            batch.delete(doc.ref)
        });
        // Also reset the counter
        batch.delete(doc(db, "counters", "ordersCounter"));
        await batch.commit();
        setOrders([]);
    } catch (e) {
        console.error("Error resetting orders:", e);
        toast({
            title: "Erro ao Zerar Pedidos",
            description: "Não foi possível apagar os pedidos do banco de dados.",
            variant: "destructive"
        });
    }
  };

  const { totalOrdersToday, ordersYesterdayPercentage } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    const todayOrdersCount = orders.filter(o => new Date(o.date) >= today).length;
    const yesterdayOrdersCount = orders.filter(o => {
        const orderDate = new Date(o.date);
        return orderDate >= yesterday && orderDate < today;
    }).length;

    let percentage = 0;
    if (yesterdayOrdersCount > 0) {
        percentage = ((todayOrdersCount - yesterdayOrdersCount) / yesterdayOrdersCount) * 100;
    } else if (todayOrdersCount > 0) {
        percentage = 100;
    }
    
    return {
      totalOrdersToday: todayOrdersCount,
      ordersYesterdayPercentage: percentage,
    };
  }, [orders]);


  return (
    <OrdersContext.Provider value={{ orders, addOrder: addOrder as any, updateOrderStatus: updateOrderStatus as any, updateOrder, getOrderById, resetOrders, totalOrdersToday, ordersYesterdayPercentage, isMounted }}>
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
