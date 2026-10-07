"use client";

import { useState } from "react";
import { Profile } from "@/lib/types";
import { updateProfile } from "@/actions/profile";
import { X } from "lucide-react";

interface EditProfileModalProps {
  profile: Profile;
  isOpen: boolean;
  onClose: () => void;
  onProfileUpdated: (updated: Profile) => void;
}

export function EditProfileModal({
  profile,
  isOpen,
  onClose,
  onProfileUpdated,
}: EditProfileModalProps) {
  const [displayName, setDisplayName] = useState(profile.display_name);
  const [bio, setBio] = useState(profile.bio || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) {
      setError("Name cannot be empty");
      return;
    }

    setSaving(true);
    setError(null);

    const result = await updateProfile({
      display_name: displayName,
      bio,
    });

    setSaving(false);

    if (!result.success || !result.profile) {
      setError(result.error || "Failed to update profile");
      return;
    }

    onProfileUpdated(result.profile);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-neutral-900/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-black border border-neutral-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800">
          <div className="flex items-center gap-4">
            <button
              onClick={onClose}
              className="p-1 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-bold text-white">Edit Profile</h2>
          </div>
          <button
            onClick={handleSubmit}
            disabled={saving || !displayName.trim()}
            className="px-4 py-1.5 rounded-full bg-white text-black font-bold text-sm hover:bg-neutral-200 disabled:opacity-50 transition"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <p className="text-xs text-red-400">{error}</p>}

          <div>
            <label className="block text-xs font-semibold text-neutral-400 mb-1">
              Display Name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              maxLength={50}
              className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-sky-500 transition text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-400 mb-1">
              Bio
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              maxLength={160}
              placeholder="Tell the world about yourself"
              className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-sky-500 transition text-sm resize-none"
            />
            <span className="block text-right text-xs text-neutral-500 mt-1">
              {160 - bio.length} remaining
            </span>
          </div>
        </form>
      </div>
    </div>
  );
}
