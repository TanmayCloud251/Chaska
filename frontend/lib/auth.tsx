"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from './api';

interface User {
  id: string;
  name: string | null;
  phone: string | null;
  email: string | null;
  avatar_url: string | null;
  is_chator: boolean;
  chator_since: string | null;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  loginSheetOpen: boolean;
  setLoginSheetOpen: (open: boolean) => void;
  loginWithOtp: (phone: string, code: string) => Promise<User>;
  loginWithGoogle: (email: string, name: string, avatarUrl?: string) => Promise<User>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [loginSheetOpen, setLoginSheetOpen] = useState(false);

  const refreshUser = async () => {
    try {
      const data = await api.getCurrentUser();
      if (data.authenticated && data.user) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const loginWithOtp = async (phone: string, code: string) => {
    try {
      const res = await api.verifyOtp(phone, code);
      setUser(res.user);
      setLoginSheetOpen(false);
      return res.user;
    } catch (error) {
      throw error;
    }
  };

  const loginWithGoogle = async (email: string, name: string, avatarUrl?: string) => {
    try {
      const res = await api.googleLogin(email, name, avatarUrl);
      setUser(res.user);
      setLoginSheetOpen(false);
      return res.user;
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await api.logout();
      setUser(null);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        loginSheetOpen,
        setLoginSheetOpen,
        loginWithOtp,
        loginWithGoogle,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
