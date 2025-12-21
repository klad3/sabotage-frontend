/**
 * Environment configuration for production.
 * 
 * SECURITY NOTE about Supabase keys:
 * - The `anonKey` IS SAFE to expose in frontend code. It's designed to be public.
 * - Security is enforced through Row Level Security (RLS) policies in the database.
 * - NEVER expose the `service_role` key in frontend code - it bypasses RLS!
 * 
 * RECOMMENDED: In CI/CD, replace these values with environment variables:
 *   - SUPABASE_URL
 *   - SUPABASE_ANON_KEY
 */
export const environment = {
    production: true,
    supabase: {
        // Project URL from Supabase Dashboard > Settings > API
        url: 'https://pgzeggouckqodqwomcok.supabase.co',
        // "anon public" key from Supabase Dashboard > Settings > API (safe to expose)
        anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBnemVnZ291Y2txb2Rxd29tY29rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYyNjY3NjksImV4cCI6MjA4MTg0Mjc2OX0.KJBJF8iMAUSPC7wmA4dKrXIcvl_0gsrwKts8PLJhC-g',
    },
    whatsapp: {
        phoneNumber: '51933866156',
    },
};

