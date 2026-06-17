"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface User {
  username: string;
  role: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, role: string, name: string) => void;
  logout: () => void;
  isLoading: boolean;
  isSidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: () => {},
  logout: () => {},
  isLoading: true,
  isSidebarOpen: false,
  setSidebarOpen: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    // Check if user is logged in (using localStorage for prototype)
    const storedUser = localStorage.getItem("siposma_user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = (username: string, role: string, name: string) => {
    const newUser = { username, role, name };
    setUser(newUser);
    localStorage.setItem("siposma_user", JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("siposma_user");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading, isSidebarOpen, setSidebarOpen }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
