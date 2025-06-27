// Temporary stub to replace Supabase imports
// This allows the app to start while we gradually migrate to the new system

import toast from 'react-hot-toast';

// Stub supabase object
export const supabase = {
  auth: {
    signInWithPassword: () => {
      console.log('Supabase stub: auth - use new login system');
      return Promise.resolve({ data: null, error: { message: 'Use new login system' } });
    },
    signOut: () => {
      console.log('Supabase stub: auth - use logout button');
      return Promise.resolve({ error: null });
    },
    getSession: () => {
      return Promise.resolve({ data: { session: null }, error: null });
    }
  },
  from: (table: string) => ({
    select: (columns?: string) => {
      const baseQuery = {
        eq: (column: string, value: any) => baseQuery,
        in: (column: string, values: any[]) => baseQuery,
        not: (column: string, operator: string, value?: any) => baseQuery,
        order: (column: string, options?: any) => baseQuery,
        limit: (count: number) => baseQuery,
        single: () => {
          console.log(`Supabase stub: ${table} single query - returning empty data`);
          return Promise.resolve({ data: null, error: null });
        },
        then: (resolve: any) => {
          console.log(`Supabase stub: ${table} query - returning empty data`);
          return Promise.resolve({ data: [], error: null }).then(resolve);
        }
      };
      return baseQuery;
    },
    insert: (data: any) => {
      console.log('Supabase stub: insert operation - not implemented');
      return Promise.resolve({ data: null, error: { message: 'Feature not implemented' } });
    },
    update: (data: any) => ({
      eq: (column: string, value: any) => {
        console.log('Supabase stub: update operation - not implemented');
        return Promise.resolve({ data: null, error: { message: 'Feature not implemented' } });
      }
    }),
    delete: () => ({
      eq: (column: string, value: any) => {
        console.log('Supabase stub: delete operation - not implemented');
        return Promise.resolve({ data: null, error: { message: 'Feature not implemented' } });
      }
    })
  }),
  channel: (name: string) => {
    const subscription = {
      on: (event: string, filter: any, callback: Function) => subscription,
      subscribe: () => {
        console.log('Real-time subscriptions are being migrated');
        return subscription;
      },
      unsubscribe: () => {
        console.log('Unsubscribing from real-time channel');
      }
    };
    return subscription;
  }
};

// Helper function to show migration message
export const showMigrationMessage = (feature: string) => {
  console.log(`${feature} is being migrated to the new database system`);
};

// Export helper functions that might be used
export const handleSupabaseError = (error: any): string => {
  return error.message || 'An unexpected error occurred';
};

export const executeQuery = async <T>(
  query: Promise<{ data: T | null; error: any }>,
  errorMessage = 'Operation failed'
): Promise<T> => {
  const { data, error } = await query;
  if (error) {
    throw new Error(handleSupabaseError(error));
  }
  if (!data) {
    throw new Error('No data returned');
  }
  return data;
}; 