
'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User, useUsers } from './UsersContext'; 

type AuthContextType = {
  user: User | null;
  login: (email: string, pass: string) => boolean;
  logout: () => void;
  isAuthenticated: boolean;
  isAuthLoading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthLoading, setAuthLoading] = useState(true);
  const { users } = useUsers(); 

  useEffect(() => {
    // Check for a logged-in user in localStorage to persist session
    const loggedInUserEmail = localStorage.getItem('loggedInUser');
    if (loggedInUserEmail && users.length > 0) {
      const foundUser = users.find(u => u.email === loggedInUserEmail);
      if (foundUser) {
        setUser(foundUser);
        setIsAuthenticated(true);
      }
    }
    setAuthLoading(false);
  }, [users]);


  const login = (email: string, pass: string): boolean => {
    const foundUser = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === pass);
    if (foundUser) {
      setUser(foundUser);
      setIsAuthenticated(true);
      localStorage.setItem('loggedInUser', foundUser.email);
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('loggedInUser');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated, isAuthLoading }}>
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
