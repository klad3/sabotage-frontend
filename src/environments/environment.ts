/**
 * Environment configuration for development.
 * 
 * SECURITY NOTE about Supabase keys:
 * - The `anonKey` IS SAFE to expose in frontend code. It's designed to be public.
 * - Security is enforced through Row Level Security (RLS) policies in the database.
 * - NEVER expose the `service_role` key in frontend code - it bypasses RLS!
 * 
 * For production builds, consider using CI/CD environment variable replacement.
 */
export const environment = {
  production: false,
  supabase: {
    // Project URL from Supabase Dashboard > Settings > API
    url: 'https://yibyqcigkwqsmvfaohzg.supabase.co',
    // "anon public" key from Supabase Dashboard > Settings > API (safe to expose)
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlpYnlxY2lna3dxc212ZmFvaHpnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYzNDY2MDUsImV4cCI6MjA4MTkyMjYwNX0.pGxyVGm_bpq5_OB47CgCUM9BXhzuPuS8vw7TALk1VvU',
  },
  whatsapp: {
    phoneNumber: '51933866156',
  },
};

