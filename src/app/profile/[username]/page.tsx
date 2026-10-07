import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/actions/auth";
import { getProfileByUsername } from "@/actions/profile";
import { getUserPosts } from "@/actions/posts";
import { ProfileHeaderClient } from "@/components/ProfileHeaderClient";
import { PostFeedClient } from "@/components/PostFeedClient";
import { ArrowLeft } from "lucide-react";

export const revalidate = 0;

interface ProfilePageProps {
  params: Promise<{ username: string }>;
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { username } = await params;
  const decodedUsername = decodeURIComponent(username).toLowerCase();

  const [currentUser, profile] = await Promise.all([
    getCurrentUser(),
    getProfileByUsername(decodedUsername),
  ]);

  if (!profile) {
    notFound();
  }

  const posts = await getUserPosts(profile.id);

  return (
    <div>
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-black/80 backdrop-blur-md border-b border-neutral-800 px-4 py-2 flex items-center gap-6">
        <Link
          href="/"
          className="p-2 rounded-full hover:bg-neutral-900 text-neutral-300 hover:text-white transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-lg font-bold text-white tracking-tight leading-tight">
            {profile.display_name}
          </h1>
          <p className="text-xs text-neutral-500">
            {posts.length} {posts.length === 1 ? "post" : "posts"}
          </p>
        </div>
      </header>

      {/* Profile Header Details */}
      <ProfileHeaderClient
        initialProfile={profile}
        currentUser={currentUser}
        postCount={posts.length}
      />

      {/* Tabs */}
      <div className="flex border-b border-neutral-800 mt-2">
        <div className="flex-1 text-center py-3.5 border-b-2 border-sky-500 font-bold text-sm text-white">
          Posts
        </div>
      </div>

      {/* User's Posts Wall */}
      <PostFeedClient initialPosts={posts} currentUser={currentUser} />
    </div>
  );
}
