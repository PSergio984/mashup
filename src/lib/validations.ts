export interface RegisterInput {
  email: string;
  password: string;
  username: string;
  display_name: string;
}

export function validateUsername(username: string): {
  valid: boolean;
  username?: string;
  error?: string;
} {
  const trimmed = username.trim();
  if (!trimmed) {
    return {
      valid: false,
      error: "Username cannot be empty",
    };
  }

  if (trimmed.length < 3 || trimmed.length > 20) {
    return {
      valid: false,
      error: "Username must be between 3 and 20 characters",
    };
  }

  const validRegex = /^[a-zA-Z0-9_]+$/;
  if (!validRegex.test(trimmed)) {
    return {
      valid: false,
      error: "Username can only contain letters, numbers, and underscores",
    };
  }

  return {
    valid: true,
    username: trimmed,
  };
}

export function validateRegistration(data: RegisterInput): {
  valid: boolean;
  error?: string;
} {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(data.email?.trim() || "")) {
    return { valid: false, error: "Please provide a valid email address" };
  }

  if (!data.password || data.password.length < 6) {
    return { valid: false, error: "Password must be at least 6 characters" };
  }

  const usernameCheck = validateUsername(data.username || "");
  if (!usernameCheck.valid) {
    return { valid: false, error: usernameCheck.error };
  }

  if (!data.display_name?.trim()) {
    return { valid: false, error: "Display name cannot be empty" };
  }

  return { valid: true };
}

export function validatePostContent(content: string): {
  valid: boolean;
  content?: string;
  error?: string;
} {
  const trimmed = content.trim();
  if (!trimmed) {
    return {
      valid: false,
      error: "Post content cannot be empty",
    };
  }

  if (content.length > 280) {
    return {
      valid: false,
      error: "Post content cannot exceed 280 characters",
    };
  }

  return {
    valid: true,
    content,
  };
}

export function validateCommentContent(content: string): {
  valid: boolean;
  content?: string;
  error?: string;
} {
  const trimmed = content.trim();
  if (!trimmed) {
    return {
      valid: false,
      error: "Comment cannot be empty",
    };
  }

  return {
    valid: true,
    content: trimmed,
  };
}
