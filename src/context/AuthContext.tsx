import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiClient } from '../utils/api-client';
import toast from 'react-hot-toast';

interface User {
  id: string;
  email: string;
  role: string;
  full_name?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const getErrorMessage = (error: any): string => {
    try {
      // Handle network errors
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        return 'Unable to connect to the server. Please check your internet connection and try again.';
      }

      // If the error is already a string, return it
      if (typeof error.message === 'string' && !error.message.startsWith('{')) {
        return error.message;
      }

      // Try to parse the error message if it's a JSON string
      const errorData = JSON.parse(error.message);
      if (errorData.body) {
        const bodyData = JSON.parse(errorData.body);
        return bodyData.message || 'An error occurred during login';
      }
      return errorData.message || 'An error occurred during login';
    } catch {
      // If parsing fails, return the original message or a default one
      return error.message || 'An error occurred during login';
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: loginError } = await apiClient.login(email, password);

      if (loginError) {
        setError(loginError.message);
        toast.error(loginError.message);
        return;
      }

      if (!data || !data.token) {
        throw new Error('No user data returned');
      }

      // Store the token
      apiClient.setToken(data.token);

      setUser({
        id: data.user.id,
        email: data.user.email,
        role: data.user.role,
        full_name: data.user.full_name
      });
      setIsAuthenticated(true);

    } catch (error: any) {
      const errorMessage = getErrorMessage(error);
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await apiClient.logout();
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.warn('Logout error (ignored):', error);
    }
  };

  const clearError = () => setError(null);

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        
        if (!token) {
          setLoading(false);
          return;
        }

        const { data, error } = await apiClient.getCurrentUser();
        
        if (error || !data) {
          apiClient.setToken(null);
          setLoading(false);
          return;
        }

        setUser({
          id: data.user.id,
          email: data.user.email,
          role: data.user.role,
          full_name: data.user.full_name
        });
        setIsAuthenticated(true);
      } catch (error: any) {
        console.error('Session check error:', error);
        apiClient.setToken(null);
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        isAuthenticated,
        login,
        logout,
        clearError
      }}
    >
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