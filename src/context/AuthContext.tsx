
'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useUsers, type User } from './UsersContext';
import { useRouter } from 'next/navigation';

type AuthContextType = {
  user: User | null;
  login: (email: string, pass: string) => boolean;
  logout: () => void;
  isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const getInitialState = <T,>(key: string, defaultValue: T): T => {
    if (typeof window === 'undefined') {
        return defaultValue;
    }
    const storedValue = sessionStorage.getItem(key); // Use sessionStorage
    if (!storedValue) {
        return defaultValue;
    }
    try {
        return JSON.parse(storedValue);
    } catch (error) {
        console.error(`Error parsing sessionStorage key "${key}":`, error);
        return defaultValue;
    }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => getInitialState('currentUser', null));
  const { users } = useUsers();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      sessionStorage.setItem('currentUser', JSON.stringify(user));
    } else {
      sessionStorage.removeItem('currentUser');
    }
  }, [user]);

  const login = (email: string, pass: string): boolean => {
    const foundUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    // In a real app, you'd hash and compare passwords. Here we do a simple check.
    // The default password for seeded users is their role + '123'
    const defaultPassword = (foundUser?.role.toLowerCase() || "") + "123";
    const userPassword = foundUser?.password || defaultPassword;

    if (foundUser && pass === userPassword) {
      setUser(foundUser);
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
