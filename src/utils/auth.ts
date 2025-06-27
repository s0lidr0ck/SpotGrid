// Note: This will be moved to server-side
// For now, we'll use placeholders
import toast from 'react-hot-toast';

interface User {
  id: string;
  email: string;
  full_name?: string;
  role: 'client' | 'traffic_admin';
  created_at: string;
  updated_at: string;
}

interface AuthResponse {
  user: User | null;
  token: string | null;
  error: string | null;
}

const JWT_SECRET = import.meta.env.VITE_JWT_SECRET || 'your-fallback-secret';

// Temporary placeholder functions for browser compatibility

// Generate JWT token (placeholder)
export const generateToken = (user: User): string => {
  // This will be moved to server-side
  return `fake-token-${user.id}`;
};

// Verify JWT token (placeholder)
export const verifyToken = (token: string): any => {
  // This will be moved to server-side
  if (token.startsWith('fake-token-')) {
    return { uid: token.replace('fake-token-', ''), email: 'admin@spotgrid.com', role: 'traffic_admin' };
  }
  return null;
};

// Hash password (placeholder)
export const hashPassword = async (password: string): Promise<string> => {
  return `hashed-${password}`;
};

// Verify password (placeholder)
export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  // For demo: admin123 works
  return password === 'admin123';
};

// Sign up user (placeholder)
export const signUp = async (email: string, password: string, fullName?: string): Promise<AuthResponse> => {
  toast.error('Sign up is being migrated to server-side authentication');
  return {
    user: null,
    token: null,
    error: 'Sign up feature is being migrated'
  };
};

// Sign in user (placeholder)
export const signIn = async (email: string, password: string): Promise<AuthResponse> => {
  // Demo login: admin@spotgrid.com / admin123
  if (email === 'admin@spotgrid.com' && password === 'admin123') {
    const user: User = {
      id: 'demo-user-id',
      email: 'admin@spotgrid.com',
      role: 'traffic_admin',
      full_name: 'Admin User',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const token = generateToken(user);
    
    return {
      user,
      token,
      error: null
    };
  }
  
  return {
    user: null,
    token: null,
    error: 'Invalid credentials'
  };
};

// Get current user from token (placeholder)
export const getCurrentUser = async (token: string): Promise<User | null> => {
  const decoded = verifyToken(token);
  if (!decoded) return null;

  // Return demo user for fake tokens
  if (token.startsWith('fake-token-')) {
    return {
      id: decoded.uid,
      email: decoded.email,
      role: decoded.role,
      full_name: 'Admin User',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }
  
  return null;
};

// Auth context helpers
export const getStoredToken = (): string | null => {
  return localStorage.getItem('auth_token');
};

export const setStoredToken = (token: string): void => {
  localStorage.setItem('auth_token', token);
};

export const clearStoredToken = (): void => {
  localStorage.removeItem('auth_token');
};

// Check if user is admin
export const isAdmin = (user: User | null): boolean => {
  return user?.role === 'traffic_admin';
};

// Get user ID for database queries (replaces auth.uid())
export const getCurrentUserId = (): string | null => {
  const token = getStoredToken();
  if (!token) return null;
  
  const decoded = verifyToken(token);
  return decoded?.uid || null;
}; 