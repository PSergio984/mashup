import type { Metadata } from "next";
import "./globals.css";
import { getCurrentUser } from "@/actions/auth";
import { Sidebar } from "@/components/Sidebar";
import { MobileNav } from "@/components/MobileNav";
import { Sparkles, TrendingUp } from "lucide-react";

export const metadata: Metadata = {
  title: "Mashup — What's happening",
  description: "A fast, lightweight social platform inspired by Twitter/X.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const currentUser = await getCurrentUser();

  return (
    <html lang="en">
      <body className="bg-black text-white antialiased">
        <div className="max-w-7xl mx-auto flex min-h-screen justify-center">
          {/* Left Navigation Sidebar */}
          <Sidebar currentUser={currentUser} />

          {/* Main Content Feed Area */}
          <main className="w-full max-w-2xl min-h-screen border-x border-neutral-800 pb-20 md:pb-10">
            {children}
          </main>

          {/* Right Sidebar Widget (Twitter Style) */}
          <aside className="hidden lg:block w-80 p-6 space-y-6 sticky top-0 h-screen">
            <div className="bg-neutral-900/60 border border-neutral-800/80 rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-2 text-sky-400 font-bold text-sm">
                <Sparkles className="w-4 h-4" />
                <span>What's happening</span>
              </div>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-xs text-neutral-500">Technology · Trending</p>
                  <p className="font-bold text-neutral-200">Next.js 15 App Router</p>
                  <p className="text-xs text-neutral-500">12.4K Posts</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500">Database · Trending</p>
                  <p className="font-bold text-neutral-200">Supabase Postgres</p>
                  <p className="text-xs text-neutral-500">8.9K Posts</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500">Design · Trending</p>
                  <p className="font-bold text-neutral-200">Tailwind CSS</p>
                  <p className="text-xs text-neutral-500">24.1K Posts</p>
                </div>
              </div>
            </div>

            <div className="text-xs text-neutral-600 space-x-2 px-2">
              <a href="https://github.com/PSergio984/mashup" target="_blank" rel="noreferrer" className="hover:underline">GitHub</a>
              <span>·</span>
              <span>Terms of Service</span>
              <span>·</span>
              <span>Privacy Policy</span>
              <span>·</span>
              <span>© 2026 Mashup</span>
            </div>
          </aside>

          {/* Mobile Bottom Navigation */}
          <MobileNav currentUser={currentUser} />
        </div>
      </body>
    </html>
  );
}
