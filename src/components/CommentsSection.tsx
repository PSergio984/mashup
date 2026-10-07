"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { AuthUser, CommentWithAuthor } from "@/lib/types";
import { UserAvatar } from "./UserAvatar";
import { formatRelativeTime } from "@/lib/utils";
import { getCommentsForPost, createComment, deleteComment } from "@/actions/engagement";
import { Trash2, Send } from "lucide-react";

interface CommentsSectionProps {
  postId: string;
  currentUser: AuthUser | null;
  onCommentCountChange?: (count: number) => void;
}

export function CommentsSection({
  postId,
  currentUser,
  onCommentCountChange,
}: CommentsSectionProps) {
  const [comments, setComments] = useState<CommentWithAuthor[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function loadComments() {
      setLoading(true);
      const data = await getCommentsForPost(postId);
      if (mounted) {
        setComments(data);
        setLoading(false);
      }
    }
    loadComments();
    return () => {
      mounted = false;
    };
  }, [postId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || submitting) return;

    if (!currentUser) {
      window.location.href = "/login";
      return;
    }

    setSubmitting(true);
    setError(null);

    const result = await createComment(postId, newComment);
    if (!result.success || !result.comment) {
      setError(result.error || "Failed to post comment");
      setSubmitting(false);
      return;
    }

    const createdWithAuthor: CommentWithAuthor = {
      ...result.comment,
      author: currentUser.profile || {
        id: currentUser.id,
        username: "me",
        display_name: "Me",
        avatar_url: "",
        bio: "",
        created_at: new Date().toISOString(),
      },
    };

    const updated = [...comments, createdWithAuthor];
    setComments(updated);
    setNewComment("");
    setSubmitting(false);
    if (onCommentCountChange) {
      onCommentCountChange(updated.length);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!confirm("Are you sure you want to delete this reply?")) return;

    const result = await deleteComment(commentId);
    if (result.success) {
      const updated = comments.filter((c) => c.id !== commentId);
      setComments(updated);
      if (onCommentCountChange) {
        onCommentCountChange(updated.length);
      }
    }
  };

  return (
    <div className="mt-3 pt-3 border-t border-neutral-800/80 space-y-4">
      {/* Add Comment Input */}
      {currentUser ? (
        <form onSubmit={handleSubmit} className="flex gap-2 items-center">
          <UserAvatar
            name={currentUser.profile?.display_name}
            avatarUrl={currentUser.profile?.avatar_url}
            size="sm"
          />
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Post your reply"
            className="flex-1 bg-neutral-900 border border-neutral-800 rounded-full px-4 py-1.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-sky-500 transition"
          />
          <button
            type="submit"
            disabled={!newComment.trim() || submitting}
            className="p-2 rounded-full bg-sky-500 hover:bg-sky-400 disabled:opacity-40 disabled:cursor-not-allowed text-white transition cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      ) : (
        <div className="text-center py-2 bg-neutral-900/50 rounded-lg">
          <p className="text-xs text-neutral-400">
            <Link href="/login" className="text-sky-400 hover:underline font-semibold">
              Log in
            </Link>{" "}
            to join the conversation and reply.
          </p>
        </div>
      )}

      {error && <p className="text-xs text-red-400">{error}</p>}

      {/* Comments List */}
      {loading ? (
        <p className="text-xs text-neutral-500 py-2 text-center">Loading replies...</p>
      ) : comments.length === 0 ? (
        <p className="text-xs text-neutral-500 py-2 text-center">No replies yet. Be the first!</p>
      ) : (
        <div className="space-y-3">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-3 group/comment">
              <Link href={`/profile/${comment.author?.username}`}>
                <UserAvatar
                  name={comment.author?.display_name}
                  avatarUrl={comment.author?.avatar_url}
                  size="sm"
                />
              </Link>
              <div className="flex-1 min-w-0 bg-neutral-900/70 rounded-2xl px-3.5 py-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Link
                      href={`/profile/${comment.author?.username}`}
                      className="font-bold text-xs text-white hover:underline truncate"
                    >
                      {comment.author?.display_name || "User"}
                    </Link>
                    <span className="text-xs text-neutral-500 truncate">
                      @{comment.author?.username}
                    </span>
                    <span className="text-neutral-600 text-xs">·</span>
                    <span className="text-xs text-neutral-500">
                      {formatRelativeTime(comment.created_at)}
                    </span>
                  </div>

                  {currentUser && currentUser.id === comment.user_id && (
                    <button
                      onClick={() => handleDelete(comment.id)}
                      title="Delete reply"
                      className="opacity-0 group-hover/comment:opacity-100 text-neutral-500 hover:text-red-400 transition p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <p className="text-sm text-neutral-200 mt-1 whitespace-pre-wrap break-words">
                  {comment.content}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
