import '@testing-library/jest-dom/vitest';

// Tests never talk to a real Supabase project; every test that needs the
// client mocks '../lib/supabase' directly. This stub only exists so that
// importing src/lib/supabase.ts (which throws if these are unset) doesn't
// blow up modules that transitively import it during test collection.
import.meta.env.VITE_SUPABASE_URL ||= 'https://test.supabase.co';
import.meta.env.VITE_SUPABASE_ANON_KEY ||= 'test-anon-key';
