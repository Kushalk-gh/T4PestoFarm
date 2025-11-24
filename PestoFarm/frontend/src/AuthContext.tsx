import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface User {
  id?: string;
  email: string;
  fullName: string;
  role: string;
  jwt?: string;
}

interface AuthContextType {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored user data on mount
    const storedUser = localStorage.getItem('user');
    const storedJwt = localStorage.getItem('jwt');

    if (storedUser && storedJwt) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser({ ...parsedUser, jwt: storedJwt });
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('jwt');
      }
    }
    setIsLoading(false);
  }, []);

  const login = (userData: User) => {
    const jwt = userData.jwt || localStorage.getItem('jwt') || undefined;
    const userWithJwt: User = { ...userData, jwt };
    setUser(userWithJwt);
    localStorage.setItem('user', JSON.stringify(userWithJwt));
    if (jwt) {
      localStorage.setItem('jwt', jwt);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('jwt');
  };

  const isAuthenticated = user !== null;

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
