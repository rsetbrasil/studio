
'use client';

import React, { createContext, useContext, useState, ReactNode, useMemo } from 'react';
import { useProducts } from './ProductsContext';

type OrderItem = {
  id: number;
  name: string;
  price: number;
  quantity: number;
};

export type OrderStatus = "Pendente" | "Finalizado" | "Cancelado";

type Order = {
  id: string;
  customer: string;
  items: OrderItem[];
  date: string;
  status: OrderStatus;
  total: number;
};

type OrdersContextType = {
  orders: Order[];
  addOrder: (order: Omit<Order, 'id' | 'date' | 'status'>) => void;
  updateOrderStatus: (orderId: string, newStatus: OrderStatus) => void;
  getOrderById: (orderId: string) => Order | undefined;
  resetOrders: () => void;
  ordersLastMonthPercentage: number;
};

const OrdersContext = createContext<OrdersContextType | undefined>(undefined);

export const OrdersProvider = ({ children }: { children: ReactNode }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderCounter, setOrderCounter] = useState(1);
  const { decreaseStock, increaseStock, getProductById: getProductStockById } = useProducts();

  const addOrder = (newOrderData: Omit<Order, 'id' | 'date' | 'status'>) => {
      const newId = `PED${String(orderCounter).padStart(3, '0')}`;
      const newDate = new Date().toISOString(); 

      const order: Order = {
          ...newOrderData,
          id: newId,
          date: newDate,
          status: "Pendente",
      };

      decreaseStock(order.items);
      setOrders(prevOrders => [order, ...prevOrders]);
      setOrderCounter(prev => prev + 1);
  };

  const updateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    setOrders(currentOrders => {
      const orderIndex = currentOrders.findIndex(o => o.id === orderId);
      if (orderIndex === -1) {
        return currentOrders;
      }
      
      const orderToUpdate = currentOrders[orderIndex];
      const oldStatus = orderToUpdate.status;

      if (oldStatus === newStatus) {
        return currentOrders;
      }

      // Return items to stock
      if (oldStatus === "Pendente" && newStatus === "Cancelado") {
        increaseStock(orderToUpdate.items);
      }
      
      // Decrease stock from inventory (only when creating an order, not when just changing status from Cancelled to Pending)
      if (oldStatus === "Cancelado" && newStatus === "Pendente") {
        const hasEnoughStock = orderToUpdate.items.every(item => {
          const product = getProductStockById(item.id);
          return product && product.stock >= item.quantity;
        });

        if (hasEnoughStock) {
          decreaseStock(orderToUpdate.items);
        } else {
          console.error("Not enough stock to change order status back to Pending.");
          // Maybe show a toast message to the user
          return currentOrders;
        }
      }
      
      const updatedOrders = [...currentOrders];
      updatedOrders[orderIndex] = { ...orderToUpdate, status: newStatus };

      return updatedOrders;
    });
  };

  const getOrderById = (orderId: string): Order | undefined => {
    return orders.find(o => o.id === orderId);
  };
  
  const resetOrders = () => {
    setOrders([]);
    setOrderCounter(1);
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
    <OrdersContext.Provider value={{ orders, addOrder, updateOrderStatus, getOrderById, resetOrders, ordersLastMonthPercentage }}>
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
