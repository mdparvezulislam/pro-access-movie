import { describe, it, expect, vi } from "vitest";
import { loginSchema, signupSchema } from "@/lib/validation/auth";
import { checkIsAdmin } from "../lib/auth-helpers";

// Mock Supabase server client
vi.mock("@/lib/supabase/server", () => ({
  createServerClient: vi.fn().mockResolvedValue({
    rpc: vi.fn().mockImplementation((fnName: string, args: { check_user_id: string }) => {
      if (fnName === "is_admin" && args.check_user_id === "admin-user-id") {
        return Promise.resolve({ data: true, error: null });
      }
      return Promise.resolve({ data: false, error: null });
    }),
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
          }),
        }),
      }),
    }),
  }),
}));

describe("Auth Validation Schemas", () => {
  it("validates correct login credentials", () => {
    const valid = loginSchema.safeParse({
      email: "user@flex.bd",
      password: "password123",
    });
    expect(valid.success).toBe(true);
  });

  it("rejects invalid email formats", () => {
    const invalid = loginSchema.safeParse({
      email: "not-an-email",
      password: "password123",
    });
    expect(invalid.success).toBe(false);
  });

  it("validates registration password matching", () => {
    const mismatch = signupSchema.safeParse({
      fullName: "Test User",
      email: "user@flex.bd",
      password: "password123",
      confirmPassword: "differentpassword",
    });
    expect(mismatch.success).toBe(false);
  });
});

describe("Server-Side Role Checks (checkIsAdmin)", () => {
  it("returns true when user has admin role RPC response", async () => {
    const result = await checkIsAdmin("admin-user-id");
    expect(result).toBe(true);
  });

  it("returns false for regular non-admin user IDs", async () => {
    const result = await checkIsAdmin("regular-user-id");
    expect(result).toBe(false);
  });

  it("returns false when user ID is empty or undefined", async () => {
    const result = await checkIsAdmin("");
    expect(result).toBe(false);
  });
});
