export interface Profile {
  id: string;
  username: string;
  display_name: string;
  bio: string;
  avatar_url: string;
  created_at: string;
}

export interface Post {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
}

export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
}

export interface Like {
  id: string;
  post_id: string;
  user_id: string;
  created_at: string;
}

export interface PostWithDetails extends Post {
  author: Profile;
  likes_count: number;
  comments_count: number;
  is_liked_by_user?: boolean;
}

export interface CommentWithAuthor extends Comment {
  author: Profile;
}

export interface AuthUser {
  id: string;
  email?: string;
  profile?: Profile | null;
}
