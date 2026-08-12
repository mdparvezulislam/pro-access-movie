import { describe, it, expect, vi } from "vitest";
import { getUserWatchlist, checkInWatchlist } from "@/features/user/lib/watchlist";
import { getUserWatchHistory, getContinueWatching } from "@/features/user/lib/history";

vi.mock("@/features/auth/lib/auth-helpers", () => ({
  getCurrentUser: vi.fn().mockResolvedValue({ id: "user-1", email: "test@flex.bd" }),
}));

vi.mock("@/lib/supabase/server", () => ({
  createServerClient: vi.fn().mockResolvedValue({
    from: vi.fn().mockImplementation((table: string) => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({
        data: table === "user_watchlist"
          ? [{ id: "w-1", movie_id: "m-1", movies: { id: "m-1", title: "Hawa", slug: "hawa-2022", status: "published" } }]
          : [{ id: "h-1", progress_seconds: 500, duration_seconds: 7200, completed: false, updated_at: "2026-08-12T00:00:00Z", movies: { id: "m-1", title: "Hawa", slug: "hawa-2022", status: "published" } }],
        error: null,
      }),
      maybeSingle: vi.fn().mockResolvedValue({ data: { id: "w-1" }, error: null }),
    })),
  }),
}));

describe("User Features (Watchlist & Watch History)", () => {
  it("fetches user watchlist", async () => {
    const list = await getUserWatchlist();
    expect(Array.isArray(list)).toBe(true);
    expect(list.length).toBe(1);
    expect(list[0].title).toBe("Hawa");
  });

  it("checks if item is in watchlist", async () => {
    const exists = await checkInWatchlist("m-1", "movie");
    expect(exists).toBe(true);
  });

  it("fetches user watch history and continue watching items", async () => {
    const history = await getUserWatchHistory();
    expect(history.length).toBe(1);
    expect(history[0].progressSeconds).toBe(500);

    const continueItems = await getContinueWatching();
    expect(continueItems.length).toBe(1);
  });
});
