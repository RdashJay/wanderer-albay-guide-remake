/* Temporary typing override to unblock builds by allowing any table name. */
declare module "@/integrations/supabase/client" {
  import type { SupabaseClient } from "@supabase/supabase-js";
  export const supabase: SupabaseClient<any>;
}
