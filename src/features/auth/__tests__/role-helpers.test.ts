import { describe, it, expect, vi } from "vitest";
import { checkIsAdmin, checkIsEditor, hasRole } from "../lib/auth-helpers";

vi.mock("@/lib/supabase/server", () => ({
  createServerClient: vi.fn().mockResolvedValue({
    rpc: vi.fn().mockImplementation((fnName: string, args: { check_user_id?: string; requested_role?: string }) => {
      if (fnName === "is_admin") {
        return Promise.resolve({
          data: args.check_user_id === "admin-user-id" || args.check_user_id === "super-admin-user-id",
          error: null,
        });
      }
      if (fnName === "is_editor") {
        return Promise.resolve({
          data: ["editor-user-id", "admin-user-id", "super-admin-user-id"].includes(args.check_user_id || ""),
          error: null,
        });
      }
      if (fnName === "has_role") {
        const adminIds = ["admin-user-id", "super-admin-user-id"];
        const editorIds = ["editor-user-id", ...adminIds];
        const userIds: Record<string, string[]> = {
          "user": ["regular-user-id", ...editorIds],
          "editor": editorIds,
          "admin": adminIds,
          "super_admin": ["super-admin-user-id"],
        };
        const matches = userIds[args.requested_role || ""] ?? [];
        return Promise.resolve({ data: matches.includes(args.check_user_id || ""), error: null });
      }
      return Promise.resolve({ data: false, error: null });
    }),
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
    }),
  }),
}));

describe("Server-Side Role Checks", () => {
  it("returns true when user has admin role RPC response", async () => {
    expect(await checkIsAdmin("admin-user-id")).toBe(true);
    expect(await checkIsAdmin("super-admin-user-id")).toBe(true);
  });

  it("returns false for regular non-admin user IDs", async () => {
    expect(await checkIsAdmin("regular-user-id")).toBe(false);
  });

  it("returns false when user ID is empty or undefined", async () => {
    expect(await checkIsAdmin("")).toBe(false);
  });

  it("counts super_admin as admin tier", async () => {
    expect(await checkIsAdmin("super-admin-user-id")).toBe(true);
  });

  it("counts admin and super_admin as editors", async () => {
    expect(await checkIsEditor("admin-user-id")).toBe(true);
    expect(await checkIsEditor("super-admin-user-id")).toBe(true);
  });

  it("counts editor tier as editor but not admin", async () => {
    expect(await checkIsEditor("editor-user-id")).toBe(true);
    expect(await checkIsAdmin("editor-user-id")).toBe(false);
  });

  it("returns false for regular users on editor checks", async () => {
    expect(await checkIsEditor("regular-user-id")).toBe(false);
  });

  it("hasRole respects the hierarchy (admin implies editor and user)", async () => {
    expect(await hasRole("admin-user-id", "admin")).toBe(true);
    expect(await hasRole("admin-user-id", "editor")).toBe(true);
    expect(await hasRole("admin-user-id", "user")).toBe(true);
    expect(await hasRole("admin-user-id", "super_admin")).toBe(false);
  });

  it("hasRole returns false for unknown role codes", async () => {
    // @ts-expect-error deliberately passing an invalid role
    expect(await hasRole("admin-user-id", "root")).toBe(false);
  });
});