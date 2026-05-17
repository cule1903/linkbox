import { createClient } from "@supabase/supabase-js";
import { hasSupabaseConfig } from "./auth";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!hasSupabaseConfig()) {
  throw new Error("Missing Supabase environment variables.");
}

export const supabase = createClient(supabaseUrl!, supabaseAnonKey!);
