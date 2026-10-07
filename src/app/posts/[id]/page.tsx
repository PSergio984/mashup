import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/actions/auth";
import { getPostById } from "@/actions/posts";
import { PostDetailClient } from "@/components/PostDetailClient";
import { ArrowLeft } from "lucide-react";

export const revalidate = 0;

interface PostPageProps {
  params: Promise<{ id: string }>;
}

export default async function PostDetailPage({ params }: PostPageProps) {
  const { id } = await params;
  const [currentUser, post] = await Promise.all([
    getCurrentUser(),
    getPostById(id),
  ]);

  if (!post) {
    notFound();
  }

  return (
    <div>
      {/* Header */}
      <header className="sticky top-0 z-30 bg-black/80 backdrop-blur-md border-b border-neutral-800 px-4 py-3 flex items-center gap-6">
        <Link
          href="/"
          className="p-2 rounded-full hover:bg-neutral-900 text-neutral-300 hover:text-white transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Post</h1>
        </div>
      </header>

      {/* Post Details Card */}
      <PostDetailClient post={post} currentUser={currentUser} />
    </div>
  );
}
