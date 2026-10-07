import { describe, it, expect, vi } from "vitest";
import { validateCommentContent } from "@/lib/validations";
import {
  toggleLike,
  createComment,
  deleteComment,
} from "@/actions/engagement";

describe("Engagement Service Seam", () => {
  describe("validateCommentContent", () => {
    it("rejects empty comments", () => {
      expect(validateCommentContent("")).toEqual({
        valid: false,
        error: "Comment cannot be empty",
      });
      expect(validateCommentContent("   ")).toEqual({
        valid: false,
        error: "Comment cannot be empty",
      });
    });

    it("accepts valid comments", () => {
      expect(validateCommentContent("Nice post!")).toEqual({
        valid: true,
        content: "Nice post!",
      });
    });
  });

  describe("toggleLike", () => {
    it("rejects unauthenticated user", async () => {
      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
        },
      };

      const result = await toggleLike("post-1", mockSupabase as any);
      expect(result.success).toBe(false);
      expect(result.error).toMatch(/logged in/i);
    });

    it("adds like when post is not yet liked by user", async () => {
      const mockUser = { id: "user-123" };
      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: mockUser }, error: null }),
        },
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
              }),
            }),
          }),
          insert: vi.fn().mockResolvedValue({ error: null }),
        }),
      };

      const result = await toggleLike("post-1", mockSupabase as any);
      expect(result.success).toBe(true);
      expect(result.liked).toBe(true);
    });

    it("removes like when post is already liked by user", async () => {
      const mockUser = { id: "user-123" };
      const existingLike = { id: "like-1", post_id: "post-1", user_id: "user-123" };

      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: mockUser }, error: null }),
        },
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                maybeSingle: vi.fn().mockResolvedValue({ data: existingLike, error: null }),
              }),
            }),
          }),
          delete: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({ error: null }),
            }),
          }),
        }),
      };

      const result = await toggleLike("post-1", mockSupabase as any);
      expect(result.success).toBe(true);
      expect(result.liked).toBe(false);
    });
  });

  describe("createComment", () => {
    it("rejects unauthenticated user", async () => {
      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
        },
      };

      const result = await createComment("post-1", "Hello!", mockSupabase as any);
      expect(result.success).toBe(false);
      expect(result.error).toMatch(/logged in/i);
    });

    it("creates comment when authenticated with valid content", async () => {
      const mockUser = { id: "user-123" };
      const mockCreatedComment = {
        id: "comm-1",
        post_id: "post-1",
        user_id: "user-123",
        content: "Awesome thought!",
        created_at: new Date().toISOString(),
      };

      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: mockUser }, error: null }),
        },
        from: vi.fn().mockReturnValue({
          insert: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: mockCreatedComment, error: null }),
            }),
          }),
        }),
      };

      const result = await createComment("post-1", "Awesome thought!", mockSupabase as any);
      expect(result.success).toBe(true);
      expect(result.comment?.content).toBe("Awesome thought!");
    });
  });

  describe("deleteComment", () => {
    it("prevents non-author from deleting comment", async () => {
      const mockUser = { id: "user-attacker" };
      const existingComment = { id: "comm-1", user_id: "user-author" };

      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: mockUser }, error: null }),
        },
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: existingComment, error: null }),
            }),
          }),
        }),
      };

      const result = await deleteComment("comm-1", mockSupabase as any);
      expect(result.success).toBe(false);
      expect(result.error).toMatch(/unauthorized/i);
    });

    it("allows comment author to delete their comment", async () => {
      const mockUser = { id: "user-author" };
      const existingComment = { id: "comm-1", user_id: "user-author" };

      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: mockUser }, error: null }),
        },
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: existingComment, error: null }),
            }),
          }),
          delete: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ error: null }),
          }),
        }),
      };

      const result = await deleteComment("comm-1", mockSupabase as any);
      expect(result.success).toBe(true);
    });
  });
});
