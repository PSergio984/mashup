"use client";

import Link from "next/link";
import { AuthUser } from "@/lib/types";
import { UserAvatar } from "./UserAvatar";
import { signOut } from "@/actions/auth";
import { Home, User, LogOut, LogIn, MessageSquareQuote, Sparkles } from "lucide-react";
import { useState } from "react";

interface SidebarProps {
  currentUser: AuthUser | null;
}

export function Sidebar({ currentUser }: SidebarProps) {
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    await signOut();
    window.location.href = "/login";
  };

  return (
    <aside className="hidden md:flex flex-col justify-between w-64 lg:w-72 h-screen sticky top-0 px-4 py-6 border-r border-neutral-800 bg-black text-white select-none">
      <div className="space-y-6">
        {/* App Logo */}
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2 text-sky-400 hover:text-sky-300 font-bold text-2xl transition"
        >
          <div className="p-2 rounded-full bg-sky-500/10 hover:bg-sky-500/20">
            <MessageSquareQuote className="w-8 h-8 text-sky-400" />
          </div>
          <span className="tracking-tight text-white font-black text-xl">Mashup</span>
        </Link>

        {/* Navigation */}
        <nav className="space-y-1">
          <Link
            href="/"
            className="flex items-center gap-4 px-4 py-3 rounded-full hover:bg-neutral-900 transition text-lg font-medium text-neutral-200 hover:text-white"
          >
            <Home className="w-6 h-6" />
            <span>Home</span>
          </Link>

          {currentUser?.profile ? (
            <Link
              href={`/profile/${currentUser.profile.username}`}
              className="flex items-center gap-4 px-4 py-3 rounded-full hover:bg-neutral-900 transition text-lg font-medium text-neutral-200 hover:text-white"
            >
              <User className="w-6 h-6" />
              <span>Profile</span>
            </Link>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-4 px-4 py-3 rounded-full hover:bg-neutral-900 transition text-lg font-medium text-neutral-200 hover:text-white"
            >
              <LogIn className="w-6 h-6" />
              <span>Sign In</span>
            </Link>
          )}
        </nav>
      </div>

      {/* User Card / Auth Status */}
      <div className="pt-4 border-t border-neutral-800">
        {currentUser?.profile ? (
          <div className="flex items-center justify-between p-2 rounded-full hover:bg-neutral-900 transition">
            <Link
              href={`/profile/${currentUser.profile.username}`}
              className="flex items-center gap-3 flex-1 min-w-0"
            >
              <UserAvatar
                name={currentUser.profile.display_name}
                avatarUrl={currentUser.profile.avatar_url}
                size="md"
              />
              <div className="min-w-0 flex-1">
                <p className="font-bold text-sm text-white truncate">
                  {currentUser.profile.display_name}
                </p>
                <p className="text-xs text-neutral-500 truncate">
                  @{currentUser.profile.username}
                </p>
              </div>
            </Link>
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              title="Sign Out"
              className="p-2 text-neutral-400 hover:text-red-400 hover:bg-neutral-800 rounded-full transition"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <Link
              href="/login"
              className="block w-full py-2.5 px-4 text-center rounded-full bg-sky-500 hover:bg-sky-400 font-bold text-white transition shadow-sm"
            >
              Log In
            </Link>
            <Link
              href="/register"
              className="block w-full py-2 px-4 text-center rounded-full border border-neutral-700 hover:bg-neutral-900 text-sm font-semibold text-neutral-300 transition"
            >
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </aside>
  );
}
