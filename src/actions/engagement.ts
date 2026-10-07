"use server";

import { createClient as createServerClient } from "@/lib/supabase/server";
import { validateCommentContent } from "@/lib/validations";
import { Comment, CommentWithAuthor } from "@/lib/types";

export async function toggleLike(
  postId: string,
  client?: any
): Promise<{ success: boolean; liked?: boolean; error?: string }> {
  const supabase = client || (await createServerClient());
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Must be logged in to like posts" };
  }

  // Check if like exists
  const { data: existingLike } = await supabase
    .from("likes")
    .select("id")
    .eq("post_id", postId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existingLike) {
    // Unlike
    const { error } = await supabase
      .from("likes")
      .delete()
      .eq("post_id", postId)
      .eq("user_id", user.id);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, liked: false };
  } else {
    // Like
    const { error } = await supabase.from("likes").insert({
      post_id: postId,
      user_id: user.id,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, liked: true };
  }
}

export async function createComment(
  postId: string,
  content: string,
  client?: any
): Promise<{ success: boolean; comment?: Comment; error?: string }> {
  const validation = validateCommentContent(content);
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  const supabase = client || (await createServerClient());
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Must be logged in to comment" };
  }

  const { data, error } = await supabase
    .from("comments")
    .insert({
      post_id: postId,
      user_id: user.id,
      content: validation.content!,
    })
    .select()
    .single();

  if (error || !data) {
    return {
      success: false,
      error: error?.message || "Failed to create comment",
    };
  }

  return { success: true, comment: data };
}

export async function getCommentsForPost(
  postId: string,
  client?: any
): Promise<CommentWithAuthor[]> {
  const supabase = client || (await createServerClient());

  const { data, error } = await supabase
    .from("comments")
    .select(`
      id,
      post_id,
      user_id,
      content,
      created_at,
      author:profiles!comments_user_id_fkey (
        id,
        username,
        display_name,
        avatar_url,
        bio,
        created_at
      )
    `)
    .eq("post_id", postId)
    .order("created_at", { ascending: true });

  if (error || !data) {
    return [];
  }

  return data.map((c: any) => ({
    id: c.id,
    post_id: c.post_id,
    user_id: c.user_id,
    content: c.content,
    created_at: c.created_at,
    author: Array.isArray(c.author) ? c.author[0] : c.author,
  }));
}

export async function deleteComment(
  commentId: string,
  client?: any
): Promise<{ success: boolean; error?: string }> {
  const supabase = client || (await createServerClient());
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Must be logged in to delete comments" };
  }

  // Check ownership
  const { data: comment, error: fetchError } = await supabase
    .from("comments")
    .select("user_id")
    .eq("id", commentId)
    .single();

  if (fetchError || !comment) {
    return { success: false, error: "Comment not found" };
  }

  if (comment.user_id !== user.id) {
    return { success: false, error: "Unauthorized to delete this comment" };
  }

  const { error: deleteError } = await supabase
    .from("comments")
    .delete()
    .eq("id", commentId);

  if (deleteError) {
    return { success: false, error: deleteError.message };
  }

  return { success: true };
}
