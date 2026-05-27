import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  "https://twejbceepgxnocirdpnp.supabase.co";

const supabaseAnonKey =
  "sb_publishable_kM1ha95lEUqP9d6cAnK_GQ_OnfOcAsV";

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
);