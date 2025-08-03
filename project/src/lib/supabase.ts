import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please click "Connect to Supabase" button to set up your project.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storageKey: 'gateprep-auth' // Unique storage key to avoid conflicts
  },
  global: {
    fetch: fetch.bind(globalThis)
  }
});

// Admin client for operations that require service role privileges
// Only create when actually needed to avoid multiple instances
export const getSupabaseAdmin = () => {
  if (!supabaseServiceRoleKey) {
    console.warn('Service role key not configured. Admin operations will not work.');
    return null;
  }
  
  // Create a new admin client each time to avoid storage conflicts
  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      storageKey: `gateprep-admin-${Math.random()}` // Unique storage key each time
    },
    global: {
      fetch: fetch.bind(globalThis)
    }
  });
};

// Legacy export - will be null initially, created on demand
export let supabaseAdmin: any = null;

// Test connection function with retry logic and longer delays
export const testConnection = async (retries = 5, initialDelay = 1000) => {
  for (let i = 0; i < retries; i++) {
    try {
      // Try a simple query to test the connection
      const { data, error } = await supabase
        .from('tests')
        .select('count', { count: 'exact', head: true });

      if (!error) {
        console.log('Supabase connection successful');
        return true;
      }

      // If the first query fails, try another table
      const { error: secondError } = await supabase
        .from('test_results')
        .select('count', { count: 'exact', head: true });

      if (!secondError) {
        console.log('Supabase connection successful');
        return true;
      }

      console.warn(`Connection attempt ${i + 1} failed:`, error?.message || secondError?.message);
    } catch (err) {
      console.warn(`Connection attempt ${i + 1} failed:`, err);
    }

    if (i < retries - 1) {
      // Exponential backoff: delay increases with each retry
      const delay = initialDelay * Math.pow(2, i);
      console.log(`Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  console.error('Failed to connect to Supabase after multiple attempts');
  return false;
};