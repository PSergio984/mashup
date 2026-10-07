import { getCurrentUser } from "@/actions/auth";
import { getFeedPosts } from "@/actions/posts";
import { PostComposer } from "@/components/PostComposer";
import { PostFeedClient } from "@/components/PostFeedClient";

export const revalidate = 0; // dynamic

export default async function HomePage() {
  const currentUser = await getCurrentUser();
  const posts = await getFeedPosts();

  return (
    <div>
      {/* Header */}
      <header className="sticky top-0 z-30 bg-black/80 backdrop-blur-md border-b border-neutral-800 px-4 py-3">
        <h1 className="text-xl font-bold text-white tracking-tight">Home</h1>
      </header>

      {/* Post Composer */}
      <PostComposer currentUser={currentUser} />

      {/* Feed Timeline */}
      <PostFeedClient initialPosts={posts} currentUser={currentUser} />
    </div>
  );
}
