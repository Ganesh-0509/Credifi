import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AppContextType {
  token: string | null;
  role: string | null;
  user: string | null;
  login: (token: string, role: string, user: string) => void;
  logout: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(localStorage.getItem('credifi_token'));
  const [role, setRole] = useState<string | null>(localStorage.getItem('credifi_role'));
  const [user, setUser] = useState<string | null>(localStorage.getItem('credifi_user'));

  const login = (token: string, role: string, user: string) => {
    setToken(token);
    setRole(role);
    setUser(user);
    localStorage.setItem('credifi_token', token);
    localStorage.setItem('credifi_role', role);
    localStorage.setItem('credifi_user', user);
  };

  const logout = () => {
    setToken(null);
    setRole(null);
    setUser(null);
    localStorage.removeItem('credifi_token');
    localStorage.removeItem('credifi_role');
    localStorage.removeItem('credifi_user');
  };

  return (
    <AppContext.Provider value={{
      token, role, user, login, logout
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
