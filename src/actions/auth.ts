"use server";

import { createClient as createServerClient } from "@/lib/supabase/server";
import { validateRegistration, RegisterInput } from "@/lib/validations";
import { AuthUser } from "@/lib/types";


export async function signUp(
  data: RegisterInput,
  client?: any
): Promise<{ success: boolean; user?: any; error?: string }> {
  const validation = validateRegistration(data);
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  const supabase = client || (await createServerClient());

  // Check if username is already taken in profiles
  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("id")
    .eq("username", data.username.trim().toLowerCase())
    .maybeSingle();

  if (existingProfile) {
    return { success: false, error: "Username is already taken" };
  }

  const { data: authData, error } = await supabase.auth.signUp({
    email: data.email.trim(),
    password: data.password,
    options: {
      data: {
        username: data.username.trim().toLowerCase(),
        display_name: data.display_name.trim(),
      },
    },
  });

  if (error || !authData.user) {
    return {
      success: false,
      error: error?.message || "Failed to sign up",
    };
  }

  // Ensure public.profiles record is created if trigger has any latency or if auto-confirmed
  await supabase
    .from("profiles")
    .upsert({
      id: authData.user.id,
      username: data.username.trim().toLowerCase(),
      display_name: data.display_name.trim(),
    }, { onConflict: "id" });

  return { success: true, user: authData.user };
}

export async function signIn(
  email: string,
  password: string,
  client?: any
): Promise<{ success: boolean; user?: any; error?: string }> {
  const supabase = client || (await createServerClient());

  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  });

  if (error || !data.user) {
    return {
      success: false,
      error: error?.message || "Invalid credentials",
    };
  }

  return { success: true, user: data.user };
}

export async function signOut(
  client?: any
): Promise<{ success: boolean; error?: string }> {
  const supabase = client || (await createServerClient());

  const { error } = await supabase.auth.signOut();
  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function getCurrentUser(client?: any): Promise<AuthUser | null> {
  const supabase = client || (await createServerClient());

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return {
    id: user.id,
    email: user.email,
    profile: profile || null,
  };
}
