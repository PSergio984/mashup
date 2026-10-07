"use server";

import { createClient as createServerClient } from "@/lib/supabase/server";
import { Profile } from "@/lib/types";

export async function updateProfile(
  data: {
    display_name?: string;
    bio?: string;
    avatar_url?: string;
  },
  client?: any
): Promise<{ success: boolean; profile?: Profile; error?: string }> {
  const supabase = client || (await createServerClient());
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Must be logged in to update profile" };
  }

  const updatePayload: Record<string, any> = {};
  if (data.display_name !== undefined) {
    updatePayload.display_name = data.display_name.trim() || "User";
  }
  if (data.bio !== undefined) {
    updatePayload.bio = data.bio.trim();
  }
  if (data.avatar_url !== undefined) {
    updatePayload.avatar_url = data.avatar_url;
  }

  const { data: updated, error } = await supabase
    .from("profiles")
    .update(updatePayload)
    .eq("id", user.id)
    .select()
    .single();

  if (error || !updated) {
    return {
      success: false,
      error: error?.message || "Failed to update profile",
    };
  }

  return { success: true, profile: updated };
}

export async function getProfileByUsername(
  username: string,
  client?: any
): Promise<Profile | null> {
  const supabase = client || (await createServerClient());

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username)
    .single();

  if (error || !data) {
    return null;
  }

  return data;
}

export async function getProfileById(
  id: string,
  client?: any
): Promise<Profile | null> {
  const supabase = client || (await createServerClient());

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    return null;
  }

  return data;
}
