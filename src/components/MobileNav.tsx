"use client";

import Link from "next/link";
import { AuthUser } from "@/lib/types";
import { Home, User, LogIn, LogOut } from "lucide-react";
import { signOut } from "@/actions/auth";

interface MobileNavProps {
  currentUser: AuthUser | null;
}

export function MobileNav({ currentUser }: MobileNavProps) {
  const handleLogout = async () => {
    await signOut();
    window.location.href = "/login";
  };

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-black/90 backdrop-blur-md border-t border-neutral-800 flex items-center justify-around z-50 px-4">
      <Link
        href="/"
        className="flex flex-col items-center justify-center p-2 text-neutral-400 hover:text-sky-400 transition"
      >
        <Home className="w-6 h-6" />
        <span className="text-[10px] mt-0.5">Home</span>
      </Link>

      {currentUser?.profile ? (
        <>
          <Link
            href={`/profile/${currentUser.profile.username}`}
            className="flex flex-col items-center justify-center p-2 text-neutral-400 hover:text-sky-400 transition"
          >
            <User className="w-6 h-6" />
            <span className="text-[10px] mt-0.5">Profile</span>
          </Link>
          <button
            onClick={handleLogout}
            className="flex flex-col items-center justify-center p-2 text-neutral-400 hover:text-red-400 transition"
          >
            <LogOut className="w-6 h-6" />
            <span className="text-[10px] mt-0.5">Logout</span>
          </button>
        </>
      ) : (
        <Link
          href="/login"
          className="flex flex-col items-center justify-center p-2 text-neutral-400 hover:text-sky-400 transition"
        >
          <LogIn className="w-6 h-6" />
          <span className="text-[10px] mt-0.5">Sign In</span>
        </Link>
      )}
    </div>
  );
}
