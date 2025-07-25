

'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc, writeBatch } from 'firebase/firestore';

export type UserRole = "Administrador" | "Gerente" | "Vendedor";

export type User = {
  id: string; // Firestore ID
  name: string;
  email: string;
  role: UserRole;
  password?: string;
};

type UsersContextType = {
  users: User[];
  addUser: (userData: Omit<User, 'id'>) => Promise<void>;
  updateUser: (userId: string, userData: Omit<User, 'id'>) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  getUserById: (id: string) => User | undefined;
  isMounted: boolean;
};

const initialUsers: Omit<User, 'id'>[] = [
  { name: 'Admin User', email: 'admin@pdvrset.com', role: 'Administrador', password: 'admin123' },
  { name: 'Vendedor Exemplo', email: 'vendedor@example.com', role: 'Vendedor', password: 'vendedor123' },
];

const UsersContext = createContext<UsersContextType | undefined>(undefined);

export const UsersProvider = ({ children }: { children: ReactNode }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const { toast } = useToast();

  const fetchUsers = async () => {
      try {
          const usersCollection = collection(db, "users");
          const snapshot = await getDocs(usersCollection);
          if (snapshot.empty) {
              const batch = writeBatch(db);
              initialUsers.forEach(user => {
                  const docRef = doc(collection(db, "users"));
                  batch.set(docRef, user);
              });
              await batch.commit();
              await fetchUsers(); // refetch to get IDs
          } else {
              setUsers(snapshot.docs.map(d => ({ ...d.data(), id: d.id } as User)));
          }
          setIsMounted(true);
      } catch (error) {
          console.error("Error fetching users:", error);
      }
  }
  
  useEffect(() => {
    fetchUsers();
  }, []);

  const addUser = async (userData: Omit<User, 'id'>) => {
    try {
        const docRef = await addDoc(collection(db, "users"), userData);
        setUsers(prev => [...prev, { ...userData, id: docRef.id }]);
        toast({ title: "Usuário adicionado com sucesso!" });
    } catch (error) {
        console.error("Error adding user:", error);
        toast({ title: "Erro ao adicionar usuário", variant: "destructive" });
    }
  };

  const updateUser = async (userId: string, userData: Omit<User, 'id'>) => {
    try {
        const userRef = doc(db, "users", userId);
        const { password, ...rest } = userData;
        const dataToUpdate: any = rest;
        if (password) {
            dataToUpdate.password = password; // In a real app, hash this
        }
        await updateDoc(userRef, dataToUpdate);
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, ...dataToUpdate } : u));
        toast({ title: "Usuário atualizado com sucesso!" });
    } catch (error) {
        console.error("Error updating user:", error);
        toast({ title: "Erro ao atualizar usuário", variant: "destructive" });
    }
  };

  const deleteUser = async (userId: string) => {
    if (users.length <= 1) {
        toast({
            title: "Operação não permitida",
            description: "Não é possível excluir o único usuário do sistema.",
            variant: "destructive",
        });
        return;
    }
    
    try {
        await deleteDoc(doc(db, "users", userId));
        setUsers(prev => prev.filter(u => u.id !== userId));
        toast({ title: "Usuário excluído com sucesso!", variant: "destructive" });
    } catch (error) {
        console.error("Error deleting user:", error);
        toast({ title: "Erro ao excluir usuário", variant: "destructive" });
    }
  };

  const getUserById = (id: string) => {
    return users.find(u => u.id === id);
  };

  return (
    <UsersContext.Provider value={{ users, addUser, updateUser, deleteUser, getUserById: getUserById as any, isMounted }}>
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
