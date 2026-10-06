"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type AuthState = { error?: string; message?: string } | undefined;

function safeNext(next: FormDataEntryValue | null) {
  const v = typeof next === "string" ? next : "";
  // Only allow same-origin relative paths to avoid open redirects
  return v.startsWith("/") && !v.startsWith("//") ? v : "/dashboard";
}

export async function signIn(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { error: "Email and password are required." };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  redirect(safeNext(formData.get("next")));
}

export async function signUp(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const username = String(formData.get("username") ?? "").trim();

  if (!email || !password) return { error: "Email and password are required." };
  if (password.length < 8) return { error: "Password must be at least 8 characters." };
  if (username && !/^[a-zA-Z0-9_]{3,24}$/.test(username)) {
    return { error: "Username must be 3–24 characters: letters, numbers, underscores." };
  }

  // headers() is async in Next 15+/16
  const h = await headers();
  const origin = h.get("origin") ?? `https://${h.get("host")}`;

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { username: username || undefined },
      emailRedirectTo: `${origin}/auth/callback?next=/dashboard`,
    },
  });
  if (error) return { error: error.message };

  // If email confirmation is disabled, a session is returned immediately.
  if (data.session) {
    revalidatePath("/", "layout");
    redirect("/dashboard");
  }
  return { message: "Check your inbox to confirm your email, then sign in." };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}

export async function updateProfile(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated." };

  const username = String(formData.get("username") ?? "").trim();
  const avatarUrl = String(formData.get("avatar_url") ?? "").trim();

  if (!/^[a-zA-Z0-9_]{3,24}$/.test(username)) {
    return { error: "Username must be 3–24 characters: letters, numbers, underscores." };
  }
  if (avatarUrl && !/^https:\/\//.test(avatarUrl)) {
    return { error: "Avatar URL must start with https://" };
  }

  const { error } = await supabase
    .from("profiles")
    .update({ username, avatar_url: avatarUrl || null })
    .eq("id", user.id);

  if (error) {
    return { error: error.code === "23505" ? "That username is taken." : error.message };
  }
  revalidatePath("/", "layout");
  return { message: "Profile updated." };
}
