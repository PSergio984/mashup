import { describe, it, expect, vi } from "vitest";
import { validateRegistration } from "@/lib/validations";
import { signIn, signOut } from "@/actions/auth";

describe("Auth Service Seam", () => {
  describe("validateRegistration", () => {
    it("rejects invalid email formats", () => {
      const result = validateRegistration({
        email: "not-an-email",
        password: "password123",
        username: "alice",
        display_name: "Alice",
      });
      expect(result.valid).toBe(false);
      expect(result.error).toMatch(/email/i);
    });

    it("rejects short passwords (< 6 chars)", () => {
      const result = validateRegistration({
        email: "alice@example.com",
        password: "123",
        username: "alice",
        display_name: "Alice",
      });
      expect(result.valid).toBe(false);
      expect(result.error).toMatch(/password must be at least 6/i);
    });

    it("rejects invalid username", () => {
      const result = validateRegistration({
        email: "alice@example.com",
        password: "password123",
        username: "al",
        display_name: "Alice",
      });
      expect(result.valid).toBe(false);
      expect(result.error).toMatch(/username/i);
    });

    it("accepts valid registration payload", () => {
      const result = validateRegistration({
        email: "alice@example.com",
        password: "password123",
        username: "alice_w",
        display_name: "Alice Wonder",
      });
      expect(result.valid).toBe(true);
    });
  });

  describe("signIn", () => {
    it("handles invalid credentials", async () => {
      const mockSupabase = {
        auth: {
          signInWithPassword: vi.fn().mockResolvedValue({
            data: { user: null },
            error: { message: "Invalid login credentials" },
          }),
        },
      };

      const result = await signIn("alice@example.com", "wrongpass", mockSupabase as any);
      expect(result.success).toBe(false);
      expect(result.error).toBe("Invalid login credentials");
    });

    it("signs in successfully with valid credentials", async () => {
      const mockSupabase = {
        auth: {
          signInWithPassword: vi.fn().mockResolvedValue({
            data: { user: { id: "user-123", email: "alice@example.com" } },
            error: null,
          }),
        },
      };

      const result = await signIn("alice@example.com", "password123", mockSupabase as any);
      expect(result.success).toBe(true);
      expect(result.user?.id).toBe("user-123");
    });
  });

  describe("signOut", () => {
    it("signs out current user session", async () => {
      const mockSupabase = {
        auth: {
          signOut: vi.fn().mockResolvedValue({ error: null }),
        },
      };

      const result = await signOut(mockSupabase as any);
      expect(result.success).toBe(true);
    });
  });
});
