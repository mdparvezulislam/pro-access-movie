import { describe, it, expect, vi } from "vitest";
import { evaluateAd } from "@/lib/ads/ad-engine";

vi.mock("@/lib/supabase/server", () => ({
  createServerClient: vi.fn().mockResolvedValue({
    from: vi.fn().mockImplementation(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({
        data: [
          {
            id: "ad-1",
            title: "FLEX Banner Ad",
            type: "banner",
            media_url: "https://example.com/banner.jpg",
            destination_url: "https://flex.bd",
            cta_text: "Learn More",
          },
        ],
        error: null,
      }),
      maybeSingle: vi.fn().mockResolvedValue({
        data: { id: "p-1", key: "home_hero_banner", name: "Home Hero", type: "banner", frequency_cap_minutes: 0 },
        error: null,
      }),
    })),
  }),
}));

describe("AdEngine Service (ad-engine.ts)", () => {
  it("evaluates candidate ad for placement key", async () => {
    const result = await evaluateAd("home_hero_banner");
    expect(result.creative).not.toBeNull();
    expect(result.creative?.title).toBe("FLEX Banner Ad");
    expect(result.placement?.key).toBe("home_hero_banner");
  });
});
