"use client";

import { useRouter } from "next/navigation";
import { AuthUser, PostWithDetails } from "@/lib/types";
import { PostCard } from "./PostCard";

interface PostDetailClientProps {
  post: PostWithDetails;
  currentUser: AuthUser | null;
}

export function PostDetailClient({ post, currentUser }: PostDetailClientProps) {
  const router = useRouter();

  const handlePostDeleted = () => {
    router.push("/");
  };

  return (
    <PostCard
      post={post}
      currentUser={currentUser}
      defaultExpandComments={true}
      onPostDeleted={handlePostDeleted}
    />
  );
}
