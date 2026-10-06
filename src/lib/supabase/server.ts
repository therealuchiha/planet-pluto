import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/lib/database.types";
import { getSupabaseEnv, isSupabaseConfigured } from "./env";

/**
 * Server Supabase client for Server Components, Server Actions and Route Handlers.
 *
 * `cookies()` is async in Next.js 15+/16 and MUST be awaited.
 * Create a new client per request — never share it across requests.
 */
export async function createClient() {
  const cookieStore = await cookies();
  const { url, key } = getSupabaseEnv();

  return createServerClient<Database>(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // `set` throws when called from a Server Component (read-only cookies).
          // Safe to ignore: the proxy refreshes the session on every request.
        }
      },
    },
  });
}

/** Returns the authenticated user (verified against Supabase Auth) or null. */
export async function getUser() {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/** Current user + their profile row, or nulls when signed out. */
export async function getCurrentProfile() {
  if (!isSupabaseConfigured()) return { user: null, profile: null };
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { user: null, profile: null };

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  return { user, profile };
}
