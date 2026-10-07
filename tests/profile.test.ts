import { describe, it, expect, vi } from "vitest";
import { validateUsername } from "@/lib/validations";
import { updateProfile } from "@/actions/profile";

describe("Profile Service Seam", () => {
  describe("validateUsername", () => {
    it("rejects empty usernames", () => {
      expect(validateUsername("")).toEqual({
        valid: false,
        error: "Username cannot be empty",
      });
      expect(validateUsername("   ")).toEqual({
        valid: false,
        error: "Username cannot be empty",
      });
    });

    it("rejects usernames that are too short or too long", () => {
      expect(validateUsername("ab")).toEqual({
        valid: false,
        error: "Username must be between 3 and 20 characters",
      });
      expect(validateUsername("a".repeat(21))).toEqual({
        valid: false,
        error: "Username must be between 3 and 20 characters",
      });
    });

    it("rejects usernames with invalid characters", () => {
      expect(validateUsername("user name")).toEqual({
        valid: false,
        error: "Username can only contain letters, numbers, and underscores",
      });
      expect(validateUsername("user@123")).toEqual({
        valid: false,
        error: "Username can only contain letters, numbers, and underscores",
      });
    });

    it("accepts valid alphanumeric usernames with underscores", () => {
      expect(validateUsername("tech_lead_99")).toEqual({
        valid: true,
        username: "tech_lead_99",
      });
      expect(validateUsername("Alice")).toEqual({
        valid: true,
        username: "Alice",
      });
    });
  });

  describe("updateProfile", () => {
    it("rejects unauthenticated user", async () => {
      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
        },
      };

      const result = await updateProfile(
        { display_name: "Alice", bio: "Software dev" },
        mockSupabase as any
      );
      expect(result.success).toBe(false);
      expect(result.error).toMatch(/logged in/i);
    });

    it("updates profile when authenticated", async () => {
      const mockUser = { id: "user-123" };
      const updatedProfile = {
        id: "user-123",
        username: "alice",
        display_name: "Alice W.",
        bio: "Next.js enthusiast",
        avatar_url: "",
        created_at: new Date().toISOString(),
      };

      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: mockUser }, error: null }),
        },
        from: vi.fn().mockReturnValue({
          update: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({ data: updatedProfile, error: null }),
              }),
            }),
          }),
        }),
      };

      const result = await updateProfile(
        { display_name: "Alice W.", bio: "Next.js enthusiast" },
        mockSupabase as any
      );
      expect(result.success).toBe(true);
      expect(result.profile?.display_name).toBe("Alice W.");
      expect(result.profile?.bio).toBe("Next.js enthusiast");
    });
  });

  describe("getProfileByUsername", () => {
    it("retrieves public profile by username handle", async () => {
      const mockProfile = {
        id: "user-123",
        username: "alice_w",
        display_name: "Alice Wonder",
        bio: "Explorer",
        avatar_url: "",
        created_at: new Date().toISOString(),
      };

      const mockSupabase = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: mockProfile, error: null }),
            }),
          }),
        }),
      };

      const { getProfileByUsername } = await import("@/actions/profile");
      const profile = await getProfileByUsername("alice_w", mockSupabase as any);
      expect(profile).not.toBeNull();
      expect(profile?.username).toBe("alice_w");
      expect(profile?.display_name).toBe("Alice Wonder");
    });
  });
});
