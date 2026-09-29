import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import {
  fetchCurrentUser,
  loginWithCredentials,
  logoutUser,
  getStoredToken
} from '../services/authService';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isSuperAdmin: boolean;
  isAuthorizedUser: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  hasProjectAccess: (projectCode: string) => boolean;
  hasStateAccess: (stateName: string) => boolean;
  hasTabAccess: (tabId: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize session on mount
  useEffect(() => {
    let isMounted = true;

    async function initAuth() {
      try {
        const currentUser = await fetchCurrentUser();
        if (isMounted) {
          if (currentUser) {
            setUser(currentUser);
            setToken(getStoredToken());
          } else {
            setUser(null);
            setToken(null);
          }
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        if (isMounted) {
          setUser(null);
          setToken(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    initAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await loginWithCredentials(email, password);
      if (response.success && response.user && response.token) {
        setUser(response.user);
        setToken(response.token);
        return { success: true };
      }
      return {
        success: false,
        message: response.message || 'Invalid email or password.'
      };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await logoutUser();
      setUser(null);
      setToken(null);
      // Update browser URL
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        window.history.pushState({}, '', '/login');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const isSuperAdmin = user?.role === 'Super Admin';
  const isAuthorizedUser = user?.role === 'Authorized User';

  const hasProjectAccess = (projectCode: string): boolean => {
    if (!user) return false;
    if (isSuperAdmin) return true;
    if (user.allowedProjectCodes?.includes('*')) return true;
    if (user.allowedProjectCodes?.includes(projectCode)) return true;
    return false;
  };

  const hasStateAccess = (stateName: string): boolean => {
    if (!user) return false;
    if (isSuperAdmin) return true;
    if (!user.stateName || user.stateName === 'Pan-India') return true;
    return user.stateName.toLowerCase() === stateName.toLowerCase();
  };

  const hasTabAccess = (tabId: string): boolean => {
    if (!user) return false;
    // Super Admin has access to all views
    if (isSuperAdmin) return true;
    // Restricted tabs for Authorized User
    if (tabId === 'audit_admin') {
      return false; // Restricted to Super Admin
    }
    return true;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: Boolean(user),
        isLoading,
        isSuperAdmin,
        isAuthorizedUser,
        login,
        logout,
        hasProjectAccess,
        hasStateAccess,
        hasTabAccess
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
