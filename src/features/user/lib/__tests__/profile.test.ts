import { describe, it, expect, vi, beforeEach } from "vitest";
import { getCurrentUserProfile, updateProfileAction } from "../profile";

vi.mock("@/features/auth/lib/auth-helpers", () => ({
  getCurrentUser: vi.fn().mockResolvedValue({ id: "user-1", email: "test@flex.bd" }),
}));

const profileRow = {
  display_name: "Test User",
  avatar_url: "https://example.com/a.png",
  language_preference: "en",
  theme_preference: "dark",
  created_at: "2026-08-12T00:00:00Z",
  updated_at: "2026-08-12T00:00:00Z",
};

const eqMock = vi.fn().mockResolvedValue({ error: null });
const updateMock = vi.fn().mockReturnValue({ eq: eqMock });

vi.mock("@/lib/supabase/server", () => ({
  createServerClient: vi.fn().mockResolvedValue({
    from: vi.fn().mockImplementation((table: string) => {
      if (table === "profiles") {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          maybeSingle: vi.fn().mockResolvedValue({ data: profileRow, error: null }),
          update: updateMock,
        };
      }
      return {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
      };
    }),
  }),
}));

beforeEach(() => {
  updateMock.mockClear();
});

describe("Profile Service", () => {
  it("fetches the current user profile with theme preference", async () => {
    const profile = await getCurrentUserProfile();
    expect(profile).toBeTruthy();
    expect(profile?.displayName).toBe("Test User");
    expect(profile?.themePreference).toBe("dark");
  });

  it("rejects invalid profile updates before touching the database", async () => {
    const result = await updateProfileAction({ displayName: "", themePreference: "dark" });
    expect(result.success).toBe(false);
    expect(updateMock).not.toHaveBeenCalled();
  });

  it("rejects unknown theme values", async () => {
    const result = await updateProfileAction({
      displayName: "Test",
      // @ts-expect-error deliberately invalid theme
      themePreference: "neon",
    });
    expect(result.success).toBe(false);
  });

  it("updates the profile with valid input and scopes to current user", async () => {
    eqMock.mockResolvedValue({ error: null });
    const result = await updateProfileAction({ displayName: "New Name", themePreference: "light" });
    expect(result.success).toBe(true);
    expect(updateMock).toHaveBeenCalledWith({
      display_name: "New Name",
      theme_preference: "light",
    });
    expect(eqMock).toHaveBeenCalledWith("id", "user-1");
  });
});