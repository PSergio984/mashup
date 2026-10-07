import { describe, it, expect, vi } from "vitest";
import { validatePostContent } from "@/lib/validations";
import { createPost, deletePost, getFeedPosts } from "@/actions/posts";

describe("Posts Service Seam", () => {
  describe("validatePostContent", () => {
    it("rejects empty post content", () => {
      expect(validatePostContent("")).toEqual({
        valid: false,
        error: "Post content cannot be empty",
      });
      expect(validatePostContent("   \n  ")).toEqual({
        valid: false,
        error: "Post content cannot be empty",
      });
    });

    it("rejects post content exceeding 280 characters", () => {
      const longText = "a".repeat(281);
      expect(validatePostContent(longText)).toEqual({
        valid: false,
        error: "Post content cannot exceed 280 characters",
      });
    });

    it("accepts valid post content within 280 characters", () => {
      const validText = "Hello world from our Twitter clone!";
      expect(validatePostContent(validText)).toEqual({
        valid: true,
        content: validText,
      });

      const maxText = "a".repeat(280);
      expect(validatePostContent(maxText)).toEqual({
        valid: true,
        content: maxText,
      });
    });
  });

  describe("createPost", () => {
    it("returns error when user is not authenticated", async () => {
      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
        },
      };

      const result = await createPost("Valid post", mockSupabase as any);
      expect(result.success).toBe(false);
      expect(result.error).toMatch(/logged in/i);
    });

    it("creates post when authenticated with valid content", async () => {
      const mockUser = { id: "user-123" };
      const mockInsertedPost = {
        id: "post-1",
        user_id: "user-123",
        content: "Great day for building!",
        created_at: new Date().toISOString(),
      };

      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: mockUser }, error: null }),
        },
        from: vi.fn().mockReturnValue({
          insert: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: mockInsertedPost, error: null }),
            }),
          }),
        }),
      };

      const result = await createPost("Great day for building!", mockSupabase as any);
      expect(result.success).toBe(true);
      expect(result.post?.content).toBe("Great day for building!");
      expect(result.post?.user_id).toBe("user-123");
    });
  });

  describe("deletePost", () => {
    it("prevents non-author from deleting a post", async () => {
      const mockUser = { id: "user-attacker" };
      const existingPost = { id: "post-1", user_id: "user-author" };

      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: mockUser }, error: null }),
        },
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: existingPost, error: null }),
            }),
          }),
        }),
      };

      const result = await deletePost("post-1", mockSupabase as any);
      expect(result.success).toBe(false);
      expect(result.error).toMatch(/unauthorized/i);
    });

    it("allows author to delete their own post", async () => {
      const mockUser = { id: "user-author" };
      const existingPost = { id: "post-1", user_id: "user-author" };

      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: mockUser }, error: null }),
        },
        from: vi.fn().mockImplementation((table: string) => {
          if (table === "posts") {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({ data: existingPost, error: null }),
                }),
              }),
              delete: vi.fn().mockReturnValue({
                eq: vi.fn().mockResolvedValue({ error: null }),
              }),
            };
          }
          return {};
        }),
      };

      const result = await deletePost("post-1", mockSupabase as any);
      expect(result.success).toBe(true);
    });
  });

  describe("getFeedPosts", () => {
    it("returns formatted feed posts in chronological order", async () => {
      const mockPostsData = [
        {
          id: "post-2",
          user_id: "user-1",
          content: "Second post",
          created_at: "2026-10-07T10:00:00Z",
          author: { id: "user-1", username: "alice", display_name: "Alice", avatar_url: "", bio: "", created_at: "" },
          likes: [{ user_id: "user-1" }],
          comments: [{ id: "c-1" }],
        },
        {
          id: "post-1",
          user_id: "user-2",
          content: "First post",
          created_at: "2026-10-07T09:00:00Z",
          author: { id: "user-2", username: "bob", display_name: "Bob", avatar_url: "", bio: "", created_at: "" },
          likes: [],
          comments: [],
        },
      ];

      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: { id: "user-1" } }, error: null }),
        },
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({ data: mockPostsData, error: null }),
          }),
        }),
      };

      const feed = await getFeedPosts(mockSupabase as any);
      expect(feed).toHaveLength(2);
      expect(feed[0].id).toBe("post-2");
      expect(feed[0].likes_count).toBe(1);
      expect(feed[0].is_liked_by_user).toBe(true);
      expect(feed[1].id).toBe("post-1");
      expect(feed[1].likes_count).toBe(0);
      expect(feed[1].is_liked_by_user).toBe(false);
    });
  });
});
