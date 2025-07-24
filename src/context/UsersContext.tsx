
'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export type UserRole = "Administrador" | "Gerente" | "Vendedor";

export type User = {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  password?: string;
};

type UsersContextType = {
  users: User[];
  addUser: (userData: Omit<User, 'id'>) => void;
  updateUser: (userId: number, userData: Omit<User, 'id'>) => void;
  deleteUser: (userId: number) => void;
  getUserById: (id: number) => User | undefined;
};

const initialUsers: User[] = [
  { id: 1, name: 'Admin User', email: 'admin@pdvrset.com', role: 'Administrador', password: 'admin123' },
  { id: 2, name: 'Vendedor Exemplo', email: 'vendedor@example.com', role: 'Vendedor', password: 'vendedor123' },
];

const getInitialState = <T,>(key: string, defaultValue: T): T => {
    if (typeof window === 'undefined') {
        return defaultValue;
    }
    const storedValue = localStorage.getItem(key);
    if (!storedValue || storedValue === '[]' && key === 'users') {
        localStorage.setItem(key, JSON.stringify(defaultValue));
        return defaultValue;
    }
    try {
        return JSON.parse(storedValue);
    } catch (error) {
        console.error(`Error parsing localStorage key "${key}":`, error);
        return defaultValue;
    }
};


const UsersContext = createContext<UsersContextType | undefined>(undefined);

export const UsersProvider = ({ children }: { children: ReactNode }) => {
  const [users, setUsers] = useState<User[]>(() => getInitialState('users', initialUsers));
  const [userCounter, setUserCounter] = useState<number>(() => getInitialState('userCounter', initialUsers.length + 1));
  const { toast } = useToast();

  useEffect(() => {
    localStorage.setItem('users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('userCounter', JSON.stringify(userCounter));
  }, [userCounter]);

  const addUser = (userData: Omit<User, 'id'>) => {
    const newUser: User = {
      ...userData,
      id: userCounter,
    };
    setUsers(prevUsers => [...prevUsers, newUser]);
    setUserCounter(prev => prev + 1);
    toast({ title: "Usuário adicionado com sucesso!" });
  };

  const updateUser = (userId: number, userData: Omit<User, 'id'>) => {
    setUsers(currentUsers =>
      currentUsers.map(u => {
        if (u.id === userId) {
          const { password, ...rest } = userData;
          const updatedUser = { ...u, ...rest };
          if (password) {
            updatedUser.password = password;
          }
          return updatedUser;
        }
        return u;
      })
    );
    toast({ title: "Usuário atualizado com sucesso!" });
  };

  const deleteUser = (userId: number) => {
    if (users.length <= 1) {
        toast({
            title: "Operação não permitida",
            description: "Não é possível excluir o único usuário do sistema.",
            variant: "destructive",
        });
        return;
    }
    setUsers(currentUsers => currentUsers.filter(u => u.id !== userId));
    toast({ title: "Usuário excluído com sucesso!", variant: "destructive" });
  };

  const getUserById = (id: number) => {
    return users.find(u => u.id === id);
  };

  return (
    <UsersContext.Provider value={{ users, addUser, updateUser, deleteUser, getUserById }}>
      {children}
    </UsersContext.Provider>
  );
};

export const useUsers = () => {
  const context = useContext(UsersContext);
  if (context === undefined) {
    throw new Error('useUsers must be used within a UsersProvider');
  }
  return context;
};
