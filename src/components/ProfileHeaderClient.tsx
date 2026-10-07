"use client";

import { useState } from "react";
import { AuthUser, Profile } from "@/lib/types";
import { UserAvatar } from "./UserAvatar";
import { EditProfileModal } from "./EditProfileModal";
import { Calendar, Edit3 } from "lucide-react";

interface ProfileHeaderClientProps {
  initialProfile: Profile;
  currentUser: AuthUser | null;
  postCount: number;
}

export function ProfileHeaderClient({
  initialProfile,
  currentUser,
  postCount,
}: ProfileHeaderClientProps) {
  const [profile, setProfile] = useState<Profile>(initialProfile);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const isOwner = currentUser?.id === profile.id;

  const joinDate = new Date(profile.created_at).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <div>
      {/* Banner */}
      <div className="h-36 bg-gradient-to-r from-sky-900 via-neutral-900 to-sky-950 border-b border-neutral-800" />

      {/* Info Section */}
      <div className="px-5 pb-4">
        {/* Avatar & Edit Button */}
        <div className="flex items-end justify-between -mt-14 mb-4">
          <div className="rounded-full ring-4 ring-black">
            <UserAvatar
              name={profile.display_name}
              avatarUrl={profile.avatar_url}
              size="xl"
            />
          </div>

          {isOwner && (
            <button
              onClick={() => setIsEditOpen(true)}
              className="px-4 py-2 rounded-full border border-neutral-700 hover:bg-neutral-900 text-sm font-bold text-white flex items-center gap-2 transition cursor-pointer"
            >
              <Edit3 className="w-4 h-4" />
              <span>Edit profile</span>
            </button>
          )}
        </div>

        {/* Names */}
        <div>
          <h2 className="text-xl font-black text-white">{profile.display_name}</h2>
          <p className="text-sm text-neutral-500">@{profile.username}</p>
        </div>

        {/* Bio */}
        {profile.bio && (
          <p className="mt-3 text-sm text-neutral-200 whitespace-pre-wrap">
            {profile.bio}
          </p>
        )}

        {/* Joined Date & Stats */}
        <div className="flex items-center gap-6 mt-4 text-xs text-neutral-500">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4" />
            <span>Joined {joinDate}</span>
          </div>
          <div>
            <span className="font-bold text-white">{postCount}</span>{" "}
            <span>{postCount === 1 ? "Post" : "Posts"}</span>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isOwner && (
        <EditProfileModal
          profile={profile}
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          onProfileUpdated={(updated) => setProfile(updated)}
        />
      )}
    </div>
  );
}
