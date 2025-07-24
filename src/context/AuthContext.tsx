
'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User, useUsers } from './UsersContext'; // Assuming useUsers is now Firestore-backed

type AuthContextType = {
  user: User | null;
  login: (email: string, pass: string) => boolean;
  logout: () => void;
  isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { users } = useUsers(); // This will fetch users from Firestore

  useEffect(() => {
    // This effect provides a default authenticated user to bypass login for now.
    // As `useUsers` fetches from Firestore, we wait until we have users to set one.
    if (users.length > 0) {
      const adminUser = users.find(u => u.role === 'Administrador');
      if (adminUser) {
        setUser(adminUser);
        setIsAuthenticated(true);
      } else if (!user) { // fallback to first user if no admin
        setUser(users[0]);
        setIsAuthenticated(true);
      }
    }
  }, [users, user]);


  const login = (email: string, pass: string): boolean => {
    // This login logic is effectively bypassed by the useEffect above for now.
    // If login were to be re-enabled, this would need to check against the Firestore-backed `users`.
    const foundUser = users.find(u => u.email === email && u.password === pass);
    if (foundUser) {
      setUser(foundUser);
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    // In a real scenario, would clear session. Here we just reset state.
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated }}>
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
