
/* ═══════════════════════════════════
   supabase.js — Supabase client init
   ═══════════════════════════════════ */

let supabaseClient = null;

function isSupabaseConfigured() {
  const cfg = window.SUPABASE_CONFIG;
  return !!(cfg && cfg.url && cfg.anonKey && cfg.anonKey !== 'YOUR_SUPABASE_ANON_KEY');
}

function initSupabase() {
  if (!window.supabase || !isSupabaseConfigured()) return null;
  if (!supabaseClient) {
    supabaseClient = window.supabase.createClient(
      window.SUPABASE_CONFIG.url,
      window.SUPABASE_CONFIG.anonKey,
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      }
    );
  }
  return supabaseClient;
}

function getSupabase() {
  return supabaseClient || initSupabase();
}
