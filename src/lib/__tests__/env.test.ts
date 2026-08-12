import { describe, it, expect } from "vitest";
import { env } from "@/lib/env";

describe("Environment Validation (env.ts)", () => {
  it("should provide default application name", () => {
    expect(env.NEXT_PUBLIC_APP_NAME).toBe("PRO ACCESS MOVIE");
  });

  it("should contain default placeholder Supabase public URL", () => {
    expect(env.NEXT_PUBLIC_SUPABASE_URL).toContain("supabase.co");
  });

  it("should validate server-only environment variables in node environment", () => {
    expect(env.OPENROUTER_MODEL).toBeDefined();
    expect(env.OPENROUTER_BASE_URL).toContain("openrouter.ai");
  });
});
