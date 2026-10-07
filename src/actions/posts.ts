"use server";

import { createClient as createServerClient } from "@/lib/supabase/server";
import { validatePostContent } from "@/lib/validations";
import { Post, PostWithDetails } from "@/lib/types";

export async function createPost(
  content: string,
  client?: any
): Promise<{ success: boolean; post?: Post; error?: string }> {
  const validation = validatePostContent(content);
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  const supabase = client || (await createServerClient());
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Must be logged in to post" };
  }

  const { data, error } = await supabase
    .from("posts")
    .insert({
      user_id: user.id,
      content: validation.content!,
    })
    .select()
    .single();

  if (error || !data) {
    return {
      success: false,
      error: error?.message || "Failed to create post",
    };
  }

  return { success: true, post: data };
}

export async function deletePost(
  postId: string,
  client?: any
): Promise<{ success: boolean; error?: string }> {
  const supabase = client || (await createServerClient());
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Must be logged in to delete a post" };
  }

  // Verify ownership
  const { data: post, error: fetchError } = await supabase
    .from("posts")
    .select("user_id")
    .eq("id", postId)
    .single();

  if (fetchError || !post) {
    return { success: false, error: "Post not found" };
  }

  if (post.user_id !== user.id) {
    return { success: false, error: "Unauthorized to delete this post" };
  }

  const { error: deleteError } = await supabase
    .from("posts")
    .delete()
    .eq("id", postId);

  if (deleteError) {
    return { success: false, error: deleteError.message };
  }

  return { success: true };
}

export async function getFeedPosts(client?: any): Promise<PostWithDetails[]> {
  const supabase = client || (await createServerClient());
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: posts, error } = await supabase
    .from("posts")
    .select(`
      id,
      user_id,
      content,
      created_at,
      author:profiles!posts_user_id_fkey (
        id,
        username,
        display_name,
        avatar_url,
        bio,
        created_at
      ),
      likes:likes (user_id),
      comments:comments (id)
    `)
    .order("created_at", { ascending: false });

  if (error || !posts) {
    return [];
  }

  return posts.map((p: any) => ({
    id: p.id,
    user_id: p.user_id,
    content: p.content,
    created_at: p.created_at,
    author: Array.isArray(p.author) ? p.author[0] : p.author,
    likes_count: p.likes?.length || 0,
    comments_count: p.comments?.length || 0,
    is_liked_by_user: user
      ? p.likes?.some((l: any) => l.user_id === user.id)
      : false,
  }));
}

export async function getUserPosts(
  userId: string,
  client?: any
): Promise<PostWithDetails[]> {
  const supabase = client || (await createServerClient());
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: posts, error } = await supabase
    .from("posts")
    .select(`
      id,
      user_id,
      content,
      created_at,
      author:profiles!posts_user_id_fkey (
        id,
        username,
        display_name,
        avatar_url,
        bio,
        created_at
      ),
      likes:likes (user_id),
      comments:comments (id)
    `)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error || !posts) {
    return [];
  }

  return posts.map((p: any) => ({
    id: p.id,
    user_id: p.user_id,
    content: p.content,
    created_at: p.created_at,
    author: Array.isArray(p.author) ? p.author[0] : p.author,
    likes_count: p.likes?.length || 0,
    comments_count: p.comments?.length || 0,
    is_liked_by_user: user
      ? p.likes?.some((l: any) => l.user_id === user.id)
      : false,
  }));
}

export async function getPostById(
  postId: string,
  client?: any
): Promise<PostWithDetails | null> {
  const supabase = client || (await createServerClient());
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: p, error } = await supabase
    .from("posts")
    .select(`
      id,
      user_id,
      content,
      created_at,
      author:profiles!posts_user_id_fkey (
        id,
        username,
        display_name,
        avatar_url,
        bio,
        created_at
      ),
      likes:likes (user_id),
      comments:comments (id)
    `)
    .eq("id", postId)
    .single();

  if (error || !p) {
    return null;
  }

  return {
    id: p.id,
    user_id: p.user_id,
    content: p.content,
    created_at: p.created_at,
    author: Array.isArray(p.author) ? p.author[0] : p.author,
    likes_count: p.likes?.length || 0,
    comments_count: p.comments?.length || 0,
    is_liked_by_user: user
      ? p.likes?.some((l: any) => l.user_id === user.id)
      : false,
  };
}
