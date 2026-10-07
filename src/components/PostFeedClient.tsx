"use client";

import { useState, useEffect } from "react";
import { AuthUser, PostWithDetails } from "@/lib/types";
import { PostCard } from "./PostCard";
import { MessageSquareOff } from "lucide-react";

interface PostFeedClientProps {
  initialPosts: PostWithDetails[];
  currentUser: AuthUser | null;
}

export function PostFeedClient({ initialPosts, currentUser }: PostFeedClientProps) {
  const [posts, setPosts] = useState<PostWithDetails[]>(initialPosts);

  useEffect(() => {
    setPosts(initialPosts);
  }, [initialPosts]);

  const handlePostDeleted = (deletedId: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== deletedId));
  };

  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center text-neutral-500 space-y-3">
        <div className="p-4 rounded-full bg-neutral-900">
          <MessageSquareOff className="w-8 h-8 text-neutral-600" />
        </div>
        <p className="text-base font-semibold text-neutral-300">No posts yet</p>
        <p className="text-sm max-w-sm">
          Be the first to break the silence! Post an update above to kickstart the timeline.
        </p>
      </div>
    );
  }

  return (
    <div>
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          currentUser={currentUser}
          onPostDeleted={handlePostDeleted}
        />
      ))}
    </div>
  );
}
