import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: number;
  nome: string;
  email: string;
  tipo: string;
  ativo: boolean;
  perfil: string;
  empresa?: {
    id: number;
    nome: string;
  };
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (userData: User) => void;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  hasRole: (roles: string[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  // Load user from localStorage on mount
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        console.log('[AuthContext] User loaded from localStorage:', userData);
      }
    } catch (error) {
      console.error('[AuthContext] Error loading user from localStorage:', error);
      localStorage.removeItem('user');
    }
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    console.log('[AuthContext] User logged in:', userData);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('webhookSettings');
    localStorage.removeItem('selected_empresa_nome');
    localStorage.removeItem('dashboard_title');
    localStorage.removeItem('app_area_title');
    console.log('[AuthContext] User logged out');
  };

  const updateUser = (userData: Partial<User>) => {
    if (!user) return;
    
    const updatedUser = { ...user, ...userData };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
    console.log('[AuthContext] User updated:', updatedUser);
  };

  const hasRole = (roles: string[]): boolean => {
    if (!user) return false;
    return roles.some(role => 
      user.tipo?.toLowerCase() === role.toLowerCase() ||
      user.perfil?.toLowerCase() === role.toLowerCase()
    );
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      login,
      logout,
      updateUser,
      hasRole
    }}>
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