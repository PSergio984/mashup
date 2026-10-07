import { getInitials } from "@/lib/utils";

interface UserAvatarProps {
  name?: string;
  avatarUrl?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export function UserAvatar({
  name,
  avatarUrl,
  size = "md",
  className = "",
}: UserAvatarProps) {
  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-14 h-14 text-base",
    xl: "w-24 h-24 text-2xl font-bold",
  };

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={name || "Avatar"}
        className={`rounded-full object-cover border border-neutral-800 ${sizeClasses[size]} ${className}`}
      />
    );
  }

  const initials = getInitials(name);

  return (
    <div
      className={`rounded-full bg-gradient-to-tr from-sky-600 to-blue-500 text-white font-semibold flex items-center justify-center select-none shadow-sm ${sizeClasses[size]} ${className}`}
    >
      {initials}
    </div>
  );
}
