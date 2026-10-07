"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthUser, PostWithDetails } from "@/lib/types";
import { UserAvatar } from "./UserAvatar";
import { formatRelativeTime } from "@/lib/utils";
import { toggleLike } from "@/actions/engagement";
import { deletePost } from "@/actions/posts";
import { CommentsSection } from "./CommentsSection";
import { Heart, MessageCircle, Trash2 } from "lucide-react";

interface PostCardProps {
  post: PostWithDetails;
  currentUser: AuthUser | null;
  onPostDeleted?: (postId: string) => void;
  defaultExpandComments?: boolean;
}

export function PostCard({
  post,
  currentUser,
  onPostDeleted,
  defaultExpandComments = false,
}: PostCardProps) {
  const router = useRouter();
  const [isLiked, setIsLiked] = useState(post.is_liked_by_user || false);
  const [likesCount, setLikesCount] = useState(post.likes_count || 0);
  const [commentsCount, setCommentsCount] = useState(post.comments_count || 0);
  const [showComments, setShowComments] = useState(defaultExpandComments);
  const [isDeleting, setIsDeleting] = useState(false);
  const [likePending, setLikePending] = useState(false);

  const isAuthor = currentUser?.id === post.user_id;

  const handleLikeToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUser) {
      router.push("/login");
      return;
    }
    if (likePending) return;

    // Optimistic update
    const previousLiked = isLiked;
    const previousCount = likesCount;
    setIsLiked(!previousLiked);
    setLikesCount(previousLiked ? previousCount - 1 : previousCount + 1);
    setLikePending(true);

    const result = await toggleLike(post.id);
    setLikePending(false);

    if (!result.success) {
      // Rollback on failure
      setIsLiked(previousLiked);
      setLikesCount(previousCount);
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthor || isDeleting) return;

    if (!confirm("Are you sure you want to delete this post? This cannot be undone.")) {
      return;
    }

    setIsDeleting(true);
    const result = await deletePost(post.id);
    if (result.success) {
      if (onPostDeleted) {
        onPostDeleted(post.id);
      } else {
        router.refresh();
      }
    } else {
      alert(result.error || "Failed to delete post");
      setIsDeleting(false);
    }
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Avoid redirect if clicking a button or link
    const target = e.target as HTMLElement;
    if (target.closest("button") || target.closest("a") || target.closest("input")) {
      return;
    }
    router.push(`/posts/${post.id}`);
  };

  return (
    <article
      onClick={handleCardClick}
      className="p-4 border-b border-neutral-800 hover:bg-neutral-950/40 transition duration-150 cursor-pointer"
    >
      <div className="flex gap-3">
        {/* Author Avatar */}
        <Link
          href={`/profile/${post.author?.username || ""}`}
          onClick={(e) => e.stopPropagation()}
          className="flex-shrink-0"
        >
          <UserAvatar
            name={post.author?.display_name}
            avatarUrl={post.author?.avatar_url}
            size="md"
          />
        </Link>

        {/* Content & Actions */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 min-w-0">
              <Link
                href={`/profile/${post.author?.username || ""}`}
                onClick={(e) => e.stopPropagation()}
                className="font-bold text-sm text-white hover:underline truncate"
              >
                {post.author?.display_name || "User"}
              </Link>
              <span className="text-xs text-neutral-500 truncate">
                @{post.author?.username}
              </span>
              <span className="text-neutral-600 text-xs">·</span>
              <Link
                href={`/posts/${post.id}`}
                onClick={(e) => e.stopPropagation()}
                className="text-xs text-neutral-500 hover:underline flex-shrink-0"
              >
                {formatRelativeTime(post.created_at)}
              </Link>
            </div>

            {/* Author Delete Action */}
            {isAuthor && (
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                title="Delete post"
                className="text-neutral-500 hover:text-red-400 p-1.5 rounded-full hover:bg-red-500/10 transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Post Text */}
          <p className="mt-2 text-[15px] text-neutral-100 whitespace-pre-wrap break-words leading-relaxed">
            {post.content}
          </p>

          {/* Engagement Footer */}
          <div className="flex items-center gap-8 mt-3 text-neutral-500 text-xs">
            {/* Comments Toggle */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowComments(!showComments);
              }}
              className="flex items-center gap-1.5 hover:text-sky-400 transition group"
            >
              <div className="p-1.5 rounded-full group-hover:bg-sky-500/10">
                <MessageCircle className="w-4 h-4" />
              </div>
              <span>{commentsCount}</span>
            </button>

            {/* Like Toggle */}
            <button
              type="button"
              onClick={handleLikeToggle}
              className={`flex items-center gap-1.5 transition group ${
                isLiked ? "text-rose-500 font-semibold" : "hover:text-rose-500"
              }`}
            >
              <div
                className={`p-1.5 rounded-full group-hover:bg-rose-500/10 ${
                  isLiked ? "text-rose-500" : ""
                }`}
              >
                <Heart
                  className={`w-4 h-4 transition ${
                    isLiked ? "fill-rose-500 text-rose-500" : ""
                  }`}
                />
              </div>
              <span>{likesCount}</span>
            </button>
          </div>

          {/* Inline Comments Section */}
          {showComments && (
            <div onClick={(e) => e.stopPropagation()}>
              <CommentsSection
                postId={post.id}
                currentUser={currentUser}
                onCommentCountChange={(count) => setCommentsCount(count)}
              />
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
