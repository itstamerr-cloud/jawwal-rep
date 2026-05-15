import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ??
  "https://dywqaaopzrshoezbgbol.supabase.co";

const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR5d3FhYW9wenJzaG9lemJnYm9sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg3Nzg4NTIsImV4cCI6MjA5NDM1NDg1Mn0.In6XpcdMbVHRG5InEokGtJXtP4olbWnC7y_SHuVsZCE";

export function createBrowserClient() {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}
