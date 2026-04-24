/**
 * Supabase Client Configuration
 * Derived from user provided keys.
 */
const SUPABASE_CONFIG = {
    URL: 'https://hkzebzcfwlblibsgaeui.supabase.co',
    ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhremViemNmd2xibGlic2dhZXVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM2NDQ2NjMsImV4cCI6MjA4OTIyMDY2M30.2wC0EBEkHtAyrmZPQPOdG-vuYJjz_8Ky-WyrouqSFDU'
};

// Initialize the Supabase client
try {
    if (typeof window.supabase !== 'undefined') {
        window.supabaseClient = window.supabase.createClient(SUPABASE_CONFIG.URL, SUPABASE_CONFIG.ANON_KEY);
    } else {
        console.error("Supabase library not found. Cannot initialize client.");
    }
} catch (e) {
    console.error("Failed to initialize Supabase client:", e);
}
