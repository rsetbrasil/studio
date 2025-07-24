
'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { type User } from './UsersContext';

type AuthContextType = {
  user: User | null;
  login: (email: string, pass: string) => boolean;
  logout: () => void;
  isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Default admin user when login is removed
const defaultAdminUser: User = {
  id: 1,
  name: 'Admin User',
  email: 'admin@pdvrset.com',
  role: 'Administrador',
  password: 'admin123'
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // The user is always the default admin, and is always authenticated.
  const [user] = useState<User | null>(defaultAdminUser);
  const isAuthenticated = true;

  const login = (): boolean => {
    // Login is no longer necessary
    return true;
  };

  const logout = () => {
    // Logout is no longer necessary
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
