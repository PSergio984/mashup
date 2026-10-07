"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthUser } from "@/lib/types";
import { UserAvatar } from "./UserAvatar";
import { createPost } from "@/actions/posts";
import Link from "next/link";

interface PostComposerProps {
  currentUser: AuthUser | null;
  onPostCreated?: () => void;
}

export function PostComposer({ currentUser, onPostCreated }: PostComposerProps) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const maxLength = 280;
  const remainingChars = maxLength - content.length;
  const isOverLimit = remainingChars < 0;
  const isValid = content.trim().length > 0 && !isOverLimit;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || loading) return;

    if (!currentUser) {
      router.push("/login");
      return;
    }

    setLoading(true);
    setError(null);

    const result = await createPost(content);
    if (!result.success) {
      setError(result.error || "Failed to publish post");
      setLoading(false);
      return;
    }

    setContent("");
    setLoading(false);
    if (onPostCreated) {
      onPostCreated();
    } else {
      router.refresh();
    }
  };

  if (!currentUser) {
    return (
      <div className="p-4 border-b border-neutral-800 bg-neutral-950/40 flex items-center justify-between">
        <div>
          <p className="font-semibold text-white">Join the conversation</p>
          <p className="text-xs text-neutral-400">Log in to post updates and interact with others.</p>
        </div>
        <Link
          href="/login"
          className="px-4 py-2 rounded-full bg-sky-500 hover:bg-sky-400 font-bold text-sm text-white transition"
        >
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="p-4 border-b border-neutral-800 bg-black">
      <div className="flex gap-3">
        <UserAvatar
          name={currentUser.profile?.display_name}
          avatarUrl={currentUser.profile?.avatar_url}
          size="md"
        />

        <form onSubmit={handleSubmit} className="flex-1 min-w-0">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What is happening?!"
            rows={3}
            className="w-full bg-transparent text-white placeholder-neutral-500 text-lg resize-none outline-none border-none p-0 focus:ring-0"
          />

          {error && <p className="text-xs text-red-400 mt-1">{error}</p>}

          <div className="flex items-center justify-between pt-3 border-t border-neutral-800/80 mt-2">
            {/* Character counter */}
            <div className="flex items-center gap-2">
              <span
                className={`text-xs font-mono font-medium ${
                  isOverLimit
                    ? "text-red-500 font-bold"
                    : remainingChars <= 20
                    ? "text-amber-400"
                    : "text-neutral-500"
                }`}
              >
                {remainingChars}
              </span>
            </div>

            <button
              type="submit"
              disabled={!isValid || loading}
              className={`px-5 py-2 rounded-full font-bold text-sm text-white transition shadow-sm ${
                isValid && !loading
                  ? "bg-sky-500 hover:bg-sky-400 cursor-pointer"
                  : "bg-sky-500/40 cursor-not-allowed opacity-60"
              }`}
            >
              {loading ? "Posting..." : "Post"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
