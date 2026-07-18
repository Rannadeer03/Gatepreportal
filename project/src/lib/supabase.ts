import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

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

// There is intentionally no admin/service-role client here. Any operation
// that needs the service-role key (creating auth users, banning/deleting
// users, confirming registrations) runs server-side in the `admin-actions`
// Supabase Edge Function (supabase/functions/admin-actions) — see
// src/services/superAdminService.ts. A Vite `VITE_`-prefixed env var is
// always inlined into the browser bundle, so the service-role key must
// never be read via import.meta.env in client code.

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