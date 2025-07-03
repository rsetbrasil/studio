'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

type OrderItem = {
  id: number;
  name: string;
  price: number;
  quantity: number;
};

type Order = {
  id: string;
  customer: string;
  items: OrderItem[];
  date: string;
  status: "Pendente" | "Finalizado" | "Cancelado";
  total: number;
};

type OrdersContextType = {
  orders: Order[];
  addOrder: (order: Omit<Order, 'id' | 'date' | 'status'>) => void;
};

const OrdersContext = createContext<OrdersContextType | undefined>(undefined);

export const OrdersProvider = ({ children }: { children: ReactNode }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderCounter, setOrderCounter] = useState(1);

  const addOrder = (newOrderData: Omit<Order, 'id' | 'date' | 'status'>) => {
      const newId = `PED${String(orderCounter).padStart(3, '0')}`;
      const newDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

      const order: Order = {
          ...newOrderData,
          id: newId,
          date: newDate,
          status: "Pendente",
      };

      setOrders(prevOrders => [order, ...prevOrders]);
      setOrderCounter(prev => prev + 1);
  };

  return (
    <OrdersContext.Provider value={{ orders, addOrder }}>
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
