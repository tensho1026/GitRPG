import { createClient } from "@supabase/supabase-js";

// Client for client-side operations (uses anonymous key)
// export const supabase = createClient(
//   process.env.NEXT_PUBLIC_SUPABASE_URL!,
//   process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! // Anon Keyを使用
// );

// Client for server-side operations (uses service role key)
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Service role key for server operations
);
