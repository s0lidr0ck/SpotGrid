// Note: Direct database connections from browser are not supported
// This file is prepared for server-side usage
import toast from 'react-hot-toast';

// Temporary placeholder - actual database operations will go through API
const pool = null;

// Error handler helper
export const handleDatabaseError = (error: any): string => {
  console.error('Database error:', error);
  
  if (error.code === '23505') {
    return 'A record with this name already exists';
  }
  
  if (error.code === '42501') {
    return 'You do not have permission to perform this action';
  }
  
  if (error.code === '23503') {
    return 'This record cannot be modified because it is referenced by other records';
  }
  
  return error.message || 'An unexpected error occurred';
};

// Query executor with error handling
export const executeQuery = async <T>(
  text: string,
  params: any[] = [],
  errorMessage = 'Operation failed'
): Promise<T[]> => {
  // Temporary placeholder - will be replaced with API calls
  toast.error('Database operations are being migrated to API calls');
  return [];
};

// Single row query
export const querySingle = async <T>(
  text: string,
  params: any[] = [],
  errorMessage = 'Operation failed'
): Promise<T | null> => {
  const rows = await executeQuery<T>(text, params, errorMessage);
  return rows.length > 0 ? rows[0] : null;
};

// Transaction helper
export const withTransaction = async <T>(
  callback: (client: any) => Promise<T>
): Promise<T> => {
  // Temporary placeholder - will be replaced with API calls
  toast.error('Database transactions are being migrated to API calls');
  throw new Error('Database transactions are being migrated');
};

// export { pool }; // Commented out for browser compatibility 